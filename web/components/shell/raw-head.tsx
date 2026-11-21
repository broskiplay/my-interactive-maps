import type { Tag } from "@/lib/maps";

// HTML-атрибуты → свойства React
const PROP: Record<string, string> = {
  class: "className",
  crossorigin: "crossOrigin",
  fetchpriority: "fetchPriority",
  "http-equiv": "httpEquiv",
  charset: "charSet",
  referrerpolicy: "referrerPolicy",
  imagesrcset: "imageSrcSet",
  imagesizes: "imageSizes",
  nomodule: "noModule",
};

export function props(a: Record<string, string | true>) {
  const out: Record<string, string | boolean> = {};
  for (const [k, v] of Object.entries(a)) {
    const p = PROP[k] ?? k;
    out[p] = v === true ? (p === "crossOrigin" ? "" : true) : v;
  }
  return out;
}

/** Теги <head> исходной страницы как есть (мета, ссылки, JSON-LD и встроенные скрипты — в прежнем порядке). */
export function RawHead({ tags }: { tags: Tag[] }) {
  return (
    <>
      {tags.map((t, i) => {
        const p = props(t.attrs);
        if (t.tag === "title") return <title key={i}>{t.inner}</title>;
        if (t.tag === "script" && t.attrs.src) return <script key={i} {...p} />;
        if (t.tag === "script") return <script key={i} {...p} dangerouslySetInnerHTML={{ __html: t.inner ?? "" }} />;
        if (t.tag === "style") return <style key={i} {...p} dangerouslySetInnerHTML={{ __html: t.inner ?? "" }} />;
        if (t.tag === "meta") return <meta key={i} {...p} />;
        if (t.tag === "base") return <base key={i} {...p} />;
        return <link key={i} {...p} />;
      })}
    </>
  );
}
