// Настройки карт Stellar Blade (из MapGenie). tileMin/tileMax — уровни тайлов в stellar-blade-assets/tiles/<id>/, bounds — область карты с метками [[юг, запад], [север, восток]],
// center/zoom — стартовый вид (как на MapGenie). Последний уровень тайлов можно увеличивать ещё на 2 уровня (maxZoom). Верхний уровень (самый детальный) удалён ради размера репозитория.
const MAPS = [
    {
        "id": "eidos7",
        "slug": "eidos-7",
        "name": "Эйдос-7",
        "legacyFile": "eidos7.html",
        "markersFile": "data/stellar_blade_eidos-7_markers.json",
        "tileMin": 8,
        "tileMax": 13,
        "minZoom": 10,
        "maxZoom": 15,
        "focusZoom": 13,
        "bounds": [
            [
                0.32485,
                -0.96639
            ],
            [
                1.06517,
                -0.39326
            ]
        ],
        "center": [
            0.74669,
            -0.76018
        ],
        "zoom": 11
    },
    {
        "id": "xion",
        "slug": "xion-city",
        "name": "Ксион",
        "legacyFile": "xion.html",
        "markersFile": "data/stellar_blade_xion-city_markers.json",
        "tileMin": 9,
        "tileMax": 13,
        "minZoom": 10,
        "maxZoom": 15,
        "focusZoom": 13,
        "bounds": [
            [
                0.40224,
                -1.28107
            ],
            [
                1.0075,
                -0.45205
            ]
        ],
        "center": [
            0.65508,
            -0.79147
        ],
        "zoom": 11
    },
    {
        "id": "wasteland",
        "slug": "wasteland",
        "name": "Пустошь",
        "legacyFile": "wasteland.html",
        "markersFile": "data/stellar_blade_wasteland_markers.json",
        "tileMin": 9,
        "tileMax": 13,
        "minZoom": 10,
        "maxZoom": 15,
        "focusZoom": 13,
        "bounds": [
            [
                0.24787,
                -0.97446
            ],
            [
                0.98681,
                -0.45194
            ]
        ],
        "center": [
            0.69868,
            -0.77536
        ],
        "zoom": 11
    },
    {
        "id": "altess-levoire",
        "slug": "altess-levoire",
        "name": "Левуар «Высь»",
        "legacyFile": "altess_levoire.html",
        "markersFile": "data/stellar_blade_altess-levoire_markers.json",
        "tileMin": 8,
        "tileMax": 12,
        "minZoom": 10,
        "maxZoom": 14,
        "focusZoom": 12,
        "bounds": [
            [
                0.3561,
                -1.0311
            ],
            [
                1.04614,
                -0.38078
            ]
        ],
        "center": [
            0.73163,
            -0.85602
        ],
        "zoom": 11
    },
    {
        "id": "matrix-11",
        "slug": "matrix-11",
        "name": "Матрица-11",
        "legacyFile": "matrix11.html",
        "markersFile": "data/stellar_blade_matrix-11_markers.json",
        "tileMin": 8,
        "tileMax": 13,
        "minZoom": 10,
        "maxZoom": 15,
        "focusZoom": 13,
        "bounds": [
            [
                0.40489,
                -0.9807
            ],
            [
                0.99782,
                -0.42938
            ]
        ],
        "center": [
            0.67137,
            -0.83103
        ],
        "zoom": 11
    },
    {
        "id": "great-desert",
        "slug": "great-desert",
        "name": "Великая пустыня",
        "legacyFile": "great_desert.html",
        "markersFile": "data/stellar_blade_great-desert_markers.json",
        "tileMin": 9,
        "tileMax": 13,
        "minZoom": 10,
        "maxZoom": 15,
        "focusZoom": 13,
        "bounds": [
            [
                0.4108,
                -0.97034
            ],
            [
                0.94612,
                -0.44843
            ]
        ],
        "center": [
            0.68283,
            -0.80782
        ],
        "zoom": 11
    },
    {
        "id": "abyss-levoire",
        "slug": "abyss-levoire",
        "name": "Левуар «Бездна»",
        "legacyFile": "abyss_levoire.html",
        "markersFile": "data/stellar_blade_abyss-levoire_markers.json",
        "tileMin": 8,
        "tileMax": 12,
        "minZoom": 10,
        "maxZoom": 14,
        "focusZoom": 12,
        "bounds": [
            [
                0.31848,
                -0.96535
            ],
            [
                1.10755,
                -0.41305
            ]
        ],
        "center": [
            0.77756,
            -0.77004
        ],
        "zoom": 11
    },
    {
        "id": "spire-4",
        "slug": "spire-4",
        "name": "Шпиль-4",
        "legacyFile": "spire4.html",
        "markersFile": "data/stellar_blade_spire-4_markers.json",
        "tileMin": 8,
        "tileMax": 12,
        "minZoom": 10,
        "maxZoom": 14,
        "focusZoom": 12,
        "bounds": [
            [
                0.23502,
                -1.18508
            ],
            [
                1.15253,
                -0.22689
            ]
        ],
        "center": [
            0.67782,
            -0.85647
        ],
        "zoom": 11
    },
    {
        "id": "eidos-9",
        "slug": "eidos-9",
        "name": "Эйдос-9",
        "legacyFile": "eidos9.html",
        "markersFile": "data/stellar_blade_eidos-9_markers.json",
        "tileMin": 9,
        "tileMax": 12,
        "minZoom": 10,
        "maxZoom": 14,
        "focusZoom": 12,
        "bounds": [
            [
                0.20406,
                -1.22
            ],
            [
                1.18021,
                -0.19556
            ]
        ],
        "center": [
            0.7256,
            -0.88199
        ],
        "zoom": 10
    }
];
