// Firebase compat SDK (~240 КБ) грузится по требованию: человек уже входил или собирается войти.
// Гостям он не скачивается вовсе — так было и на старой главной (js/script.js).

const SDK = "https://www.gstatic.com/firebasejs/10.8.0/";
const CONFIG = {
  apiKey: "AIzaSyBZ29h18Z1k0gE4dAEca5JH8yePQgxhaII",
  authDomain: "broskiplaymaps.firebaseapp.com",
  projectId: "broskiplaymaps",
  storageBucket: "broskiplaymaps.firebasestorage.app",
  messagingSenderId: "418362476965",
  appId: "1:418362476965:web:59ce4e677b1a0a84d7404c",
  measurementId: "G-D5PQJQ7HZG",
};

export interface FbUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface FbDocSnap {
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}
interface FbQuerySnap {
  size: number;
}
interface FbQuery {
  where(field: string, op: "==", value: string): FbQuery;
  limit(n: number): FbQuery;
  get(): Promise<FbQuerySnap>;
}
interface FbDocRef {
  get(): Promise<FbDocSnap>;
  collection(name: string): FbCollection;
}
interface FbCollection extends FbQuery {
  doc(id: string): FbDocRef;
}
export interface FbFirestore {
  collection(name: string): FbCollection;
}
export interface FbAuth {
  currentUser: FbUser | null;
  onAuthStateChanged(cb: (user: FbUser | null) => void): () => void;
  signInWithPopup(provider: unknown): Promise<unknown>;
  signOut(): Promise<void>;
}
interface FirebaseNamespace {
  apps: unknown[];
  initializeApp(config: typeof CONFIG): unknown;
  auth: (() => FbAuth) & { GoogleAuthProvider: new () => unknown };
  firestore(): FbFirestore;
}

declare global {
  interface Window {
    firebase?: FirebaseNamespace;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Не загрузился ${src}`));
    document.head.appendChild(el);
  });
}

let pending: Promise<FirebaseNamespace | null> | null = null;

export function loadFirebase(): Promise<FirebaseNamespace | null> {
  if (pending) return pending;
  pending = loadScript(`${SDK}firebase-app-compat.js`)
    .then(() => Promise.all([loadScript(`${SDK}firebase-auth-compat.js`), loadScript(`${SDK}firebase-firestore-compat.js`)]))
    .then(() => {
      const fb = window.firebase;
      if (!fb) throw new Error("firebase не появился");
      if (!fb.apps.length) fb.initializeApp(CONFIG);
      return fb;
    })
    .catch((error: unknown) => {
      console.warn("Firebase не загружен — вход через Google недоступен, остальной сайт работает.", error);
      pending = null; // следующая попытка загрузит заново
      return null;
    });
  return pending;
}

export const SIGNED_IN_KEY = "bp_signed_in";

/** Есть ли сохранённая сессия Firebase (вход мог быть и на странице карты). Пустую базу IndexedDB не создаём. */
export async function hasSavedSession(): Promise<boolean> {
  try {
    if (localStorage.getItem(SIGNED_IN_KEY) === "1") return true;
  } catch {
    /* нет доступа */
  }
  try {
    if (!window.indexedDB || typeof indexedDB.databases !== "function") return false;
    const dbs = await indexedDB.databases();
    if (!dbs.some((d) => d.name === "firebaseLocalStorageDb")) return false;
    return await new Promise<boolean>((resolve) => {
      const req = indexedDB.open("firebaseLocalStorageDb");
      req.onerror = () => resolve(false);
      req.onsuccess = () => {
        const db = req.result;
        try {
          if (!db.objectStoreNames.contains("firebaseLocalStorage")) {
            db.close();
            resolve(false);
            return;
          }
          const count = db.transaction("firebaseLocalStorage", "readonly").objectStore("firebaseLocalStorage").count();
          count.onsuccess = () => {
            db.close();
            resolve(count.result > 0);
          };
          count.onerror = () => {
            db.close();
            resolve(false);
          };
        } catch {
          db.close();
          resolve(false);
        }
      };
    });
  } catch {
    return false;
  }
}

/** Найденные метки карты в облаке: users/{uid}/mapProgress/{docId} → foundIds | found */
export async function cloudFound(uid: string, docId: string): Promise<string[]> {
  const fb = window.firebase;
  if (!fb) return [];
  try {
    const snap = await fb.firestore().collection("users").doc(uid).collection("mapProgress").doc(docId).get();
    const data = snap.exists ? snap.data() : undefined;
    const list = data?.foundIds ?? data?.found;
    return Array.isArray(list) ? list.map(String) : [];
  } catch {
    return [];
  }
}

/** Новые сообщения об ошибках. Правила Firestore разрешают чтение только аккаунту автора — у остальных запрос отклоняется. */
export async function adminReportsCount(): Promise<number | null> {
  const fb = window.firebase;
  if (!fb) return null;
  try {
    const snap = await fb.firestore().collection("reports").where("status", "==", "new").limit(99).get();
    return snap.size;
  } catch {
    return null;
  }
}
