// DragonSword: Awakening — категории меток (названия, описания и значки — dragonswordawakening.th.gl; сгенерировано tools/build_data.py).
// key — ключ категории (тип th.gl); icon — [x, y] цветного значка 64×64 в ../icons.webp; color — цвет значка (для меню и окна метки);
// track: false — метка не входит в общий прогресс; hidden — скрыта при первом открытии.

const CATEGORIES = [
    { title: "Сюжетные задания", items: [
        {"key": "story_quests", "name": "Сюжетные задания", "icon": [0, 0], "color": "#f8d253"}
    ] },
    { title: "Динамические задания", items: [
        {"key": "area_quests", "name": "Задания области", "icon": [64, 0], "color": "#969696"},
        {"key": "area_quests_step", "name": "Поручения заданий области", "icon": [128, 0], "color": "#6eb071"},
        {"key": "area_quests_objective", "name": "Цели заданий области", "icon": [192, 0], "color": "#e1876a"}
    ] },
    { title: "Торговцы", items: [
        {"key": "svc_cooking_ingredient_merchant", "name": "Торговец кулинарными ингредиентами", "icon": [256, 0], "color": "#969696", "track": false},
        {"key": "svc_blacksmith", "name": "Кузнец", "icon": [320, 0], "color": "#969696", "track": false},
        {"key": "svc_alchemist", "name": "Алхимик", "icon": [384, 0], "color": "#969696", "track": false},
        {"key": "svc_general_merchant", "name": "Обычный торговец", "icon": [448, 0], "color": "#969696", "track": false}
    ] },
    { title: "Услуги", items: [
        {"key": "svc_steelheart_fortress_gatekeeper", "name": "Страж ворот крепости Стального сердца", "icon": [512, 0], "color": "#969696", "track": false},
        {"key": "svc_guardian_of_the_orbis_kingdom", "name": "Страж королевства Орбис", "icon": [576, 0], "color": "#969696", "track": false},
        {"key": "svc_training_ground_keeper", "name": "Смотритель тренировочной площадки", "icon": [640, 0], "color": "#969696", "track": false},
        {"key": "svc_vicar_of_the_saintess", "name": "Заместитель Святой", "icon": [704, 0], "color": "#baa998", "track": false},
        {"key": "svc_guild_quest_receptionist", "name": "Приёмщик заданий гильдии", "icon": [768, 0], "color": "#969696", "track": false},
        {"key": "svc_king_of_orbis", "name": "Король Орбиса", "icon": [832, 0], "color": "#c4a58b", "track": false},
        {"key": "svc_culinary_researcher", "name": "Исследователь кулинарии", "icon": [896, 0], "color": "#969696", "track": false}
    ] },
    { title: "Перемещение", items: [
        {"key": "warp_statues", "name": "Статуя телепортации", "icon": [960, 0], "color": "#969696", "track": false},
        {"key": "warp_waypoints", "name": "Путевая точка", "icon": [0, 64], "color": "#969696", "track": false},
        {"key": "warp_eona", "name": "Наследие Эоны", "icon": [64, 64], "color": "#969696", "track": false}
    ] },
    { title: "Подземелья", items: [
        {"key": "warp_dungeons", "name": "Вход в подземелье", "icon": [128, 64], "color": "#969696"},
        {"key": "dungeon_hidden", "name": "Скрытое подземелье", "icon": [192, 64], "color": "#969696"},
        {"key": "trial_tower", "name": "Башня испытаний", "icon": [256, 64], "color": "#969696"},
        {"key": "world_crack", "name": "Подземелье разлома", "icon": [320, 64], "color": "#bd6aef"}
    ] },
    { title: "Достопримечательности", items: [
        {"key": "poi_fieldbosses", "name": "Полевой босс", "icon": [384, 64], "color": "#969696"},
        {"key": "poi_lorebooks", "name": "Книги", "icon": [448, 64], "color": "#cea573"},
        {"key": "poi_bounties", "name": "Награды за головы", "icon": [512, 64], "color": "#eb8c64"}
    ] },
    { title: "Сундуки с сокровищами", items: [
        {"key": "chests_grade3", "name": "Редкий ящик", "icon": [576, 64], "color": "#4799dd"},
        {"key": "chests_grade2", "name": "Улучшенный ящик", "icon": [640, 64], "color": "#6bb56e"},
        {"key": "chests_grade1", "name": "Обычный ящик", "icon": [704, 64], "color": "#969696"},
        {"key": "chests_key", "name": "Сундук с ключом", "icon": [768, 64], "color": "#e7c047"},
        {"key": "chests_grade4", "name": "Ящик героя", "icon": [832, 64], "color": "#a049ae"},
        {"key": "chests_grade5", "name": "Легендарный ящик", "icon": [896, 64], "color": "#eea234"},
        {"key": "chests_puzzle", "name": "Сундук-головоломка", "icon": [960, 64], "color": "#55cad8"},
        {"key": "chests_map", "name": "Сундук с карты сокровищ", "icon": [0, 128], "color": "#f5d153"}
    ] },
    { title: "Разрушаемые объекты", items: [
        {"key": "breakable_explosive", "name": "Взрывная бочка", "icon": [64, 128], "color": "#c7504f", "hidden": true},
        {"key": "breakable_crate", "name": "Ящики и горшки", "icon": [128, 128], "color": "#a4867a", "hidden": true},
        {"key": "breakable_rock", "name": "Разрушаемая скала", "icon": [192, 128], "color": "#969696", "hidden": true},
        {"key": "breakable_barrel", "name": "Бочка", "icon": [256, 128], "color": "#8d6d62", "hidden": true},
        {"key": "breakable_pumpkin", "name": "Тыква", "icon": [320, 128], "color": "#ec9312", "hidden": true}
    ] },
    { title: "Король Сурков", items: [
        {"key": "minigame_mole", "name": "Крот", "icon": [384, 128], "color": "#c19e71"},
        {"key": "minigame_fly", "name": "Полёт", "icon": [448, 128], "color": "#86cdf1"},
        {"key": "minigame_wave", "name": "Волна", "icon": [512, 128], "color": "#5e8fda"}
    ] },
    { title: "Головоломки", items: [
        {"key": "puzzle_set_pressure", "name": "Головоломка с нажимными плитами", "icon": [576, 128], "color": "#eaac17", "hidden": true},
        {"key": "puzzle_set_pillar", "name": "Головоломка с колоннами", "icon": [640, 128], "color": "#d86289", "hidden": true},
        {"key": "puzzle_switch", "name": "Переключатель", "icon": [704, 128], "color": "#a885e8", "hidden": true},
        {"key": "puzzle_rock", "name": "Переносной камень", "icon": [768, 128], "color": "#a6857c", "hidden": true},
        {"key": "puzzle_object", "name": "Объект головоломки", "icon": [832, 128], "color": "#6bb46e", "hidden": true},
        {"key": "puzzle_plate", "name": "Нажимная плита", "icon": [896, 128], "color": "#f2c53c", "hidden": true}
    ] },
    { title: "Кулинарные ингредиенты", items: [
        {"key": "ingredients_aged_game_meat", "name": "Выдержанное мясо зверя", "icon": [960, 128], "color": "#a05545", "track": false, "hidden": true},
        {"key": "ingredients_rice", "name": "Рис", "icon": [0, 192], "color": "#9d9644", "track": false, "hidden": true},
        {"key": "ingredients_wheat", "name": "Пшеница", "icon": [64, 192], "color": "#c8924a", "track": false, "hidden": true},
        {"key": "ingredients_dried_maneflower", "name": "Сухой гривоцвет", "icon": [128, 192], "color": "#95674b", "track": false, "hidden": true},
        {"key": "ingredients_bellonea", "name": "Беллонея", "icon": [192, 192], "color": "#7b9dc1", "track": false, "hidden": true},
        {"key": "ingredients_salmon_fillet", "name": "Филе лосося", "icon": [256, 192], "color": "#de6c58", "track": false, "hidden": true},
        {"key": "ingredients_cave_mushroom", "name": "Пещерный гриб", "icon": [320, 192], "color": "#9978ab", "track": false, "hidden": true},
        {"key": "ingredients_aqualily", "name": "Голубая лилия", "icon": [384, 192], "color": "#57ad70", "track": false, "hidden": true},
        {"key": "ingredients_silverwing_fillet", "name": "Мясо Сильверуинга", "icon": [448, 192], "color": "#b49fba", "track": false, "hidden": true},
        {"key": "ingredients_grave_bellherb", "name": "Кладбищенский колокольчик", "icon": [512, 192], "color": "#4c9ca9", "track": false, "hidden": true},
        {"key": "ingredients_dwarf_potato", "name": "Карликовый картофель", "icon": [576, 192], "color": "#b48d55", "track": false, "hidden": true},
        {"key": "ingredients_bird_eggs", "name": "Птичье яйцо", "icon": [640, 192], "color": "#969696", "track": false, "hidden": true},
        {"key": "ingredients_leaf_of_vigor", "name": "Лист жизненной силы", "icon": [704, 192], "color": "#6d6bd2", "track": false, "hidden": true},
        {"key": "ingredients_conch", "name": "Рапана", "icon": [768, 192], "color": "#d8907d", "track": false, "hidden": true},
        {"key": "ingredients_shellfish", "name": "Ракушка", "icon": [832, 192], "color": "#e8c7a1", "track": false, "hidden": true},
        {"key": "ingredients_sand_crab", "name": "Песчаный краб", "icon": [896, 192], "color": "#e7c294", "track": false, "hidden": true},
        {"key": "ingredients_trout_fillet", "name": "Филе форели", "icon": [960, 192], "color": "#de7a56", "track": false, "hidden": true},
        {"key": "ingredients_white_dewblossom", "name": "Белый росоцвет", "icon": [0, 256], "color": "#a09dc7", "track": false, "hidden": true},
        {"key": "ingredients_rock_mushroom", "name": "Каменный гриб", "icon": [64, 256], "color": "#969696", "track": false, "hidden": true},
        {"key": "ingredients_tree_sap_mushroom", "name": "Гриб древесной смолы", "icon": [128, 256], "color": "#d16055", "track": false, "hidden": true},
        {"key": "ingredients_goose_eggs", "name": "Гусиное яйцо", "icon": [192, 256], "color": "#969696", "track": false, "hidden": true},
        {"key": "ingredients_honey", "name": "Мёд", "icon": [256, 256], "color": "#e5b359", "track": false, "hidden": true},
        {"key": "ingredients_drop_of_purity", "name": "Капля чистоты", "icon": [320, 256], "color": "#9ea37b", "track": false, "hidden": true},
        {"key": "ingredients_fruit_of_vitality", "name": "Плод жизненной силы", "icon": [384, 256], "color": "#ab6b69", "track": false, "hidden": true},
        {"key": "ingredients_primordial_seed", "name": "Семя древности", "icon": [448, 256], "color": "#9fc289", "track": false, "hidden": true},
        {"key": "ingredients_lantern_gourd", "name": "Фонарная тыква", "icon": [512, 256], "color": "#5f833f", "track": false, "hidden": true},
        {"key": "ingredients_whitebloom_carrot", "name": "Морковь с белыми цветами", "icon": [576, 256], "color": "#a67234", "track": false, "hidden": true},
        {"key": "ingredients_dawn_lanternleaf", "name": "Рассветный фонарик", "icon": [640, 256], "color": "#6aa667", "track": false, "hidden": true},
        {"key": "ingredients_waveleaf_cabbage", "name": "Волнистая капуста", "icon": [704, 256], "color": "#629963", "track": false, "hidden": true},
        {"key": "ingredients_round_eggplant", "name": "Круглый баклажан", "icon": [768, 256], "color": "#644c87", "track": false, "hidden": true},
        {"key": "ingredients_leaflet_tomato", "name": "Листовой томат", "icon": [832, 256], "color": "#8a4815", "track": false, "hidden": true},
        {"key": "ingredients_blue_lotus_mushroom", "name": "Синий лотосовый гриб", "icon": [896, 256], "color": "#72b1c6", "track": false, "hidden": true},
        {"key": "ingredients_shrimp_flesh", "name": "Мясо креветки", "icon": [960, 256], "color": "#eb9880", "track": false, "hidden": true},
        {"key": "ingredients_wild_onion", "name": "Черемшовый лук", "icon": [0, 320], "color": "#b16736", "track": false, "hidden": true},
        {"key": "ingredients_radish", "name": "Редис", "icon": [64, 320], "color": "#9eb981", "track": false, "hidden": true},
        {"key": "ingredients_fermented_gnoll_berry", "name": "Забродивший плод гноллов", "icon": [128, 320], "color": "#b3443f", "track": false, "hidden": true},
        {"key": "ingredients_shining_dawn_lanternleaf", "name": "Сияющий рассветный фонарик", "icon": [192, 320], "color": "#6aa667", "track": false, "hidden": true},
        {"key": "ingredients_shining_blue_lotus_mushroom", "name": "Светящийся синий лотосовый гриб", "icon": [256, 320], "color": "#72b1c6", "track": false, "hidden": true},
        {"key": "ingredients_fragrant_herbs", "name": "Ароматная трава", "icon": [320, 320], "color": "#7f9850", "track": false, "hidden": true},
        {"key": "ingredients_well_grown_waveleaf_cabbage", "name": "Отборная волнистая капуста", "icon": [384, 320], "color": "#629963", "track": false, "hidden": true},
        {"key": "ingredients_well_grown_mildwild_onion", "name": "Отборный черемшовый лук", "icon": [448, 320], "color": "#b16736", "track": false, "hidden": true},
        {"key": "ingredients_useful_iron_ore", "name": "Приличная железная руда", "icon": [512, 320], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Материалы для крафта", items: [
        {"key": "materials_gold", "name": "Золото", "icon": [576, 320], "color": "#caa680", "track": false, "hidden": true},
        {"key": "materials_crystal_of_reverie", "name": "Кристалл воспоминания", "icon": [640, 320], "color": "#c57d41", "track": false, "hidden": true},
        {"key": "materials_new_rice", "name": "Свежий рис", "icon": [704, 320], "color": "#9d9644", "track": false, "hidden": true},
        {"key": "materials_basic_combat_text", "name": "Учебник основ боя", "icon": [768, 320], "color": "#a57357", "track": false, "hidden": true},
        {"key": "materials_mana_shard", "name": "Осколок магии", "icon": [832, 320], "color": "#4938be", "track": false, "hidden": true},
        {"key": "materials_piercing_crystal", "name": "Клиновидный кристалл", "icon": [896, 320], "color": "#a65db1", "track": false, "hidden": true},
        {"key": "materials_binding_crystal", "name": "Кристалл единства", "icon": [960, 320], "color": "#51b65b", "track": false, "hidden": true},
        {"key": "materials_crystal_of_recollection", "name": "Кристалл воспоминаний", "icon": [0, 384], "color": "#91354e", "track": false, "hidden": true},
        {"key": "materials_crystal_of_oblivion", "name": "Кристалл забвения", "icon": [64, 384], "color": "#3d3376", "track": false, "hidden": true},
        {"key": "materials_vein_crystal", "name": "Кристалл лей-линии", "icon": [128, 384], "color": "#5da1d9", "track": false, "hidden": true},
        {"key": "materials_crystal_of_remembrance", "name": "Кристалл памяти", "icon": [192, 384], "color": "#445394", "track": false, "hidden": true},
        {"key": "materials_well_grown_wheat", "name": "Отборная пшеница", "icon": [256, 384], "color": "#c8924a", "track": false, "hidden": true},
        {"key": "materials_undergrown_dawn_lanternleaf", "name": "Недоросший рассветный фонарик", "icon": [320, 384], "color": "#6aa667", "track": false, "hidden": true},
        {"key": "materials_nutrient_deficient_wheat_sprouts", "name": "Ростки пшеницы с дефицитом питательных веществ", "icon": [384, 384], "color": "#c8924a", "track": false, "hidden": true}
    ] },
    { title: "Статуя Органы", items: [
        {"key": "organa_right_leg", "name": "Правая нога", "icon": [448, 384], "color": "#c0a3ee"},
        {"key": "organa_left_wing", "name": "Левое крыло", "icon": [512, 384], "color": "#c0a3ee"},
        {"key": "organa_right_wing", "name": "Правое крыло", "icon": [576, 384], "color": "#c0a3ee"},
        {"key": "organa_left_arm", "name": "Левая рука", "icon": [640, 384], "color": "#c0a3ee"},
        {"key": "organa_head", "name": "Голова", "icon": [704, 384], "color": "#c0a3ee"},
        {"key": "organa_right_arm", "name": "Правая рука", "icon": [768, 384], "color": "#c0a3ee"},
        {"key": "organa_statue", "name": "Статуя Органы", "icon": [832, 384], "color": "#f0d060"}
    ] },
    { title: "Боссы и элита", items: [
        {"key": "elites", "name": "Элита", "icon": [896, 384], "color": "#edc23d", "hidden": true},
        {"key": "boss_named", "name": "Боссы и именные", "icon": [960, 384], "color": "#e66d47"},
        {"key": "raid_bosses", "name": "Рейдовые боссы", "icon": [0, 448], "color": "#ba3131"},
        {"key": "big_bosses", "name": "Большие боссы", "icon": [64, 448], "color": "#9e4aab"}
    ] },
    { title: "Гоблины", items: [
        {"key": "monster_goblin_warrior", "name": "Гоблин-воин", "icon": [128, 448], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_goblin", "name": "Гоблин", "icon": [192, 448], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_goblin_berserker", "name": "Гоблин-берсерк", "icon": [256, 448], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_kuaku_the_mad", "name": "Безумный Куаку", "icon": [320, 448], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_goblin_barbarian", "name": "Гоблин-варвар", "icon": [384, 448], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_goblin_tribal_hero", "name": "Гоблин — герой племени", "icon": [448, 448], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Гноллы", items: [
        {"key": "monster_gnoll_warrior", "name": "Гнолл-воин", "icon": [512, 448], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_gnoll_spearman", "name": "Гнолл-метатель дротиков", "icon": [576, 448], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_gnoll_chief", "name": "Гнолл-вожак", "icon": [640, 448], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Гончие", items: [
        {"key": "monster_hound", "name": "Варг", "icon": [704, 448], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_armored_warg", "name": "Железнобокий Варг", "icon": [768, 448], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Орки", items: [
        {"key": "monster_orc_warrior", "name": "Орк-воин", "icon": [832, 448], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_orc_rock_thrower_warrior", "name": "Орк-метатель камней", "icon": [896, 448], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_orc_barbarian", "name": "Орк-варвар", "icon": [960, 448], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_vash_the_tribal_warrior", "name": "Баш — племенной герой", "icon": [0, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_heavy_armored_orc", "name": "Орк в тяжёлой броне", "icon": [64, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_orc_assault_captain", "name": "Орк-капитан штурмовиков", "icon": [128, 512], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Скелеты", items: [
        {"key": "monster_skeleton_soldier", "name": "Скелет-солдат", "icon": [192, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_skeleton_axe_soldier", "name": "Скелет-метатель топоров", "icon": [256, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_ordered_skeleton_axesoldier", "name": "Ordered Skeleton Axesoldier", "icon": [320, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_wave_skeleton_soldier", "name": "Wave Skeleton Soldier", "icon": [384, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_skeleton_commander", "name": "Скелет-центурион", "icon": [448, 512], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Гарпии", items: [
        {"key": "monster_harpy", "name": "Гарпия", "icon": [512, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_spray_harpy", "name": "Гарпия водяных брызг", "icon": [576, 512], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Жуки", items: [
        {"key": "monster_mantius_of_amplitude", "name": "Мантиас Вибрации", "icon": [640, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_ghagaroach_of_frostbite", "name": "Гагарочи Хладолёда", "icon": [704, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_mantius_of_crushing", "name": "Мантиас Сокрушения", "icon": [768, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_drosophia_of_breaker", "name": "Драсофир Ударной волны", "icon": [832, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_mantius_of_gale", "name": "Мантиас Шквала", "icon": [896, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_drosophia_of_bloodburst", "name": "Драсофир Ярости", "icon": [960, 512], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_ghagaroach_of_blazeflame", "name": "Гагарочи Алого Пламени", "icon": [0, 576], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_ghagaroach_of_thunderbolt", "name": "Гагарочи Молнии", "icon": [64, 576], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_ghagaroach_of_venom", "name": "Гагарочи Мутности", "icon": [128, 576], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Пчёлы", items: [
        {"key": "monster_killer_hornet", "name": "Шершень-убийца", "icon": [192, 576], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_killer_honeybee", "name": "Пчела-убийца", "icon": [256, 576], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_killer_mosquito_small", "name": "Killer Mosquito Small", "icon": [320, 576], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Слизни", items: [
        {"key": "monster_slime", "name": "Слизень", "icon": [384, 576], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_giant_slime", "name": "Гигантский слизень", "icon": [448, 576], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Черви", items: [
        {"key": "monster_baby_worm", "name": "Baby Worm", "icon": [512, 576], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_earthlander_of_the_ravenous_earth", "name": "Землянин Голодной Земли", "icon": [576, 576], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_fierce_saw_teeth_baby_worm", "name": "Fierce Saw Teeth Baby Worm", "icon": [640, 576], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Гули", items: [
        {"key": "monster_ghoul", "name": "Ghoul", "icon": [704, 576], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Пауки", items: [
        {"key": "monster_spider_hunter", "name": "Паук-охотник", "icon": [768, 576], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Големы", items: [
        {"key": "monster_rock_golem", "name": "Rock Golem", "icon": [832, 576], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_vanak_the_bloody_hook", "name": "Банак Кровавый Крюк", "icon": [896, 576], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Тролли", items: [
        {"key": "monster_troll", "name": "Troll", "icon": [960, 576], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Энты", items: [
        {"key": "monster_ent_no_bird", "name": "Ent No Bird", "icon": [0, 640], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Ламии", items: [
        {"key": "monster_lamia_blood_blade", "name": "Lamia Blood Blade", "icon": [64, 640], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_lamia_warrior", "name": "Lamia Warrior", "icon": [128, 640], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Призраки", items: [
        {"key": "monster_sargon_the_scream_devourer", "name": "Саргон, Пожиратель криков", "icon": [192, 640], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Личи", items: [
        {"key": "monster_lich_orb", "name": "Lich Orb", "icon": [256, 640], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Драконы", items: [
        {"key": "monster_grassland_lesser_dragon", "name": "Луговой дракон низшего ранга", "icon": [320, 640], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_furcas_the_starving_ghost_of_corrosion", "name": "Голодный дух коррозии Фуркас", "icon": [384, 640], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Фанатики дракона", items: [
        {"key": "monster_dragon_worshipper", "name": "Поклонник дракона", "icon": [448, 640], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_leman", "name": "Леман", "icon": [512, 640], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Пугала", items: [
        {"key": "monster_training_dummy", "name": "Тренировочное пугало", "icon": [576, 640], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_gallore_the_collapse", "name": "Галор Распада", "icon": [640, 640], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Янтарные рыцари", items: [
        {"key": "monster_amber_trading_company_bodyguard", "name": "Охранник Торгового дома «Амбер»", "icon": [704, 640], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Солдаты Орбиса", items: [
        {"key": "monster_orbis_soldier", "name": "Солдат Орбиса", "icon": [768, 640], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_orbis_crossbow_soldier", "name": "Orbis Crossbow Soldier", "icon": [832, 640], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_wounded_orvis_crossbowman", "name": "Раненый арбалетчик Орбиса", "icon": [896, 640], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Наёмники", items: [
        {"key": "monster_mercenary_thief_crossbow", "name": "Mercenary Thief Crossbow", "icon": [960, 640], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_mercenary_thief_halberd", "name": "Mercenary Thief Halberd", "icon": [0, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_mercenary_hunter", "name": "Mercenary Hunter", "icon": [64, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_mercenary", "name": "Наёмник", "icon": [128, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_corruption_mercenary", "name": "Corruption Mercenary", "icon": [192, 704], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Орден Органы", items: [
        {"key": "monster_organa_soldier", "name": "Organa Soldier", "icon": [256, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_organa_priest", "name": "Organa Priest", "icon": [320, 704], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Существа разлома", items: [
        {"key": "monster_crack_creep", "name": "Crack Creep", "icon": [384, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_crack_walker", "name": "Crack Walker", "icon": [448, 704], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Особые монстры", items: [
        {"key": "monster_astria", "name": "Астрия", "icon": [512, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_ornette", "name": "Онет", "icon": [576, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_roxy", "name": "Рокси", "icon": [640, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_alex", "name": "Алекс", "icon": [704, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_dana", "name": "Дана", "icon": [768, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_kalien", "name": "Калиен", "icon": [832, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_kalsion", "name": "Калсион", "icon": [896, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_eileen", "name": "Эйлин", "icon": [960, 704], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_johnny", "name": "Джонни", "icon": [0, 768], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_ysera", "name": "Исера", "icon": [64, 768], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_tarte", "name": "Тарте", "icon": [128, 768], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_reina", "name": "Рейна", "icon": [192, 768], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_theresia", "name": "Терезия", "icon": [256, 768], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Другие монстры", items: [
        {"key": "monster_unknown", "name": "Монстр", "icon": [320, 768], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_flameling_fox", "name": "Flameling Fox", "icon": [384, 768], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_largo", "name": "Ларго", "icon": [448, 768], "color": "#969696", "track": false, "hidden": true},
        {"key": "monster_aria", "name": "Ария", "icon": [512, 768], "color": "#969696", "track": false, "hidden": true}
    ] },
    { title: "Дикие животные", items: [
        {"key": "animal_boar", "name": "Кабан", "icon": [576, 768], "color": "#a4847a", "track": false, "hidden": true},
        {"key": "animal_fox", "name": "Лиса", "icon": [640, 768], "color": "#a4847a", "track": false, "hidden": true},
        {"key": "animal_rabbit", "name": "Кролик", "icon": [704, 768], "color": "#a4847a", "track": false, "hidden": true},
        {"key": "animal_squirrel", "name": "Белка", "icon": [768, 768], "color": "#a4847a", "track": false, "hidden": true},
        {"key": "animal_sheep", "name": "Овца", "icon": [832, 768], "color": "#a4847a", "track": false, "hidden": true},
        {"key": "animal_goose", "name": "Гусь", "icon": [896, 768], "color": "#a4847a", "track": false, "hidden": true},
        {"key": "animal_thunder_squirrel", "name": "Громовая белка", "icon": [960, 768], "color": "#a4847a", "track": false, "hidden": true}
    ] }
];

const CAT_BY_KEY = {};
CATEGORIES.forEach(g => g.items.forEach(c => { CAT_BY_KEY[c.key] = c; }));

// Спрайт цветных значков th.gl: для меню и поиска — фон CSS, для меток — canvas (app.js, drawIcon)
const ICON_SHEET = { url: "icons.webp?v=1", w: 1024, h: 832, cell: 64 };
const ICON_IMG = new Image();
ICON_IMG.src = ICON_SHEET.url;
function iconSvg(icon) {
    if (!Array.isArray(icon)) return "";
    const px = icon[0] / (ICON_SHEET.w - ICON_SHEET.cell) * 100, py = ICON_SHEET.h > ICON_SHEET.cell ? icon[1] / (ICON_SHEET.h - ICON_SHEET.cell) * 100 : 0;
    return `<span class="ds-glyph" aria-hidden="true" style="--gx:${px.toFixed(3)}%;--gy:${py.toFixed(3)}%;--gw:${(ICON_SHEET.w / ICON_SHEET.cell * 100).toFixed(0)}%;--gh:${(ICON_SHEET.h / ICON_SHEET.cell * 100).toFixed(0)}%"></span>`;
}
