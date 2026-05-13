import type { ItemDefinition, Rarity } from '../types/game';

export const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

export const ITEMS: ItemDefinition[] = [
  {
    id: 'weapon_rusty_sword', type: 'weapon', rarity: 'common', icon: '⚔️', sellPrice: 12, tags: ['starter', 'blade'],
    name: { ru: 'Ржавый меч', en: 'Rusty Sword' },
    description: { ru: 'Старый клинок, который всё ещё умеет кусаться.', en: 'An old blade that can still bite.' },
    bonuses: { attack: 2 }
  },
  {
    id: 'weapon_apprentice_staff', type: 'weapon', rarity: 'common', icon: '🪄', sellPrice: 12, tags: ['starter', 'magic'],
    name: { ru: 'Посох ученика', en: 'Apprentice Staff' },
    description: { ru: 'Простой посох с тёплой искрой внутри.', en: 'A simple staff with a warm spark inside.' },
    bonuses: { attack: 2, critChance: 0.01 }
  },
  {
    id: 'weapon_hunter_bow', type: 'weapon', rarity: 'common', icon: '🏹', sellPrice: 12, tags: ['starter', 'bow'],
    name: { ru: 'Охотничий лук', en: 'Hunter Bow' },
    description: { ru: 'Надёжный лук для первых вылазок.', en: 'A reliable bow for first expeditions.' },
    bonuses: { attack: 2, speed: 1 }
  },
  {
    id: 'weapon_iron_axe', type: 'weapon', rarity: 'common', icon: '🪓', sellPrice: 18, tags: ['axe'],
    name: { ru: 'Железный топор', en: 'Iron Axe' },
    description: { ru: 'Тяжёлый инструмент, ставший оружием.', en: 'A heavy tool turned into a weapon.' },
    bonuses: { attack: 3, speed: -1 }
  },
  {
    id: 'weapon_scout_dagger', type: 'weapon', rarity: 'common', icon: '🗡️', sellPrice: 18, tags: ['dagger'],
    name: { ru: 'Кинжал разведчика', en: 'Scout Dagger' },
    description: { ru: 'Лёгкий клинок для быстрых ударов.', en: 'A light blade for quick strikes.' },
    bonuses: { attack: 2, speed: 2 }
  },
  {
    id: 'weapon_moon_spear', type: 'weapon', rarity: 'rare', icon: '🔱', sellPrice: 42, tags: ['spear'],
    name: { ru: 'Лунное копьё', en: 'Moon Spear' },
    description: { ru: 'Копьё мерцает холодным светом.', en: 'The spear shimmers with cold light.' },
    bonuses: { attack: 5, critChance: 0.02 }
  },
  {
    id: 'weapon_crystal_wand', type: 'weapon', rarity: 'rare', icon: '💎', sellPrice: 44, tags: ['magic'],
    name: { ru: 'Кристальная палочка', en: 'Crystal Wand' },
    description: { ru: 'Усиливает точность заклинаний.', en: 'Improves the focus of spells.' },
    bonuses: { attack: 5, speed: 1 }
  },
  {
    id: 'weapon_storm_bow', type: 'weapon', rarity: 'rare', icon: '🌩️', sellPrice: 46, tags: ['bow'],
    name: { ru: 'Грозовой лук', en: 'Storm Bow' },
    description: { ru: 'Тетива потрескивает статикой.', en: 'Its string crackles with static.' },
    bonuses: { attack: 4, speed: 2, critChance: 0.03 }
  },
  {
    id: 'weapon_bone_mace', type: 'weapon', rarity: 'rare', icon: '🦴', sellPrice: 40, tags: ['mace'],
    name: { ru: 'Костяная булава', en: 'Bone Mace' },
    description: { ru: 'Грубое оружие из тролльей кости.', en: 'A crude weapon carved from troll bone.' },
    bonuses: { attack: 6 }
  },
  {
    id: 'weapon_ember_blade', type: 'weapon', rarity: 'epic', icon: '🔥', sellPrice: 90, tags: ['blade', 'fire'],
    name: { ru: 'Угольный клинок', en: 'Ember Blade' },
    description: { ru: 'Оставляет на воздухе горячие следы.', en: 'Leaves hot trails in the air.' },
    bonuses: { attack: 8, critChance: 0.04 }
  },
  {
    id: 'weapon_arcane_tome', type: 'weapon', rarity: 'epic', icon: '📘', sellPrice: 92, tags: ['magic'],
    name: { ru: 'Тайный том', en: 'Arcane Tome' },
    description: { ru: 'Страницы сами подсказывают заклинания.', en: 'The pages whisper spells on their own.' },
    bonuses: { attack: 9, defense: 1 }
  },
  {
    id: 'weapon_shadow_crossbow', type: 'weapon', rarity: 'epic', icon: '🏹', sellPrice: 94, tags: ['bow', 'shadow'],
    name: { ru: 'Теневой арбалет', en: 'Shadow Crossbow' },
    description: { ru: 'Стреляет почти бесшумно.', en: 'Fires almost silently.' },
    bonuses: { attack: 7, speed: 3, critChance: 0.05 }
  },
  {
    id: 'weapon_sunbreaker', type: 'weapon', rarity: 'legendary', icon: '🌞', sellPrice: 180, tags: ['blade', 'holy'],
    name: { ru: 'Солнцелом', en: 'Sunbreaker' },
    description: { ru: 'Легендарный меч, рассеивающий тьму.', en: 'A legendary sword that scatters darkness.' },
    bonuses: { attack: 12, defense: 2, critChance: 0.05 }
  },
  {
    id: 'weapon_dragon_spine', type: 'weapon', rarity: 'legendary', icon: '🐉', sellPrice: 190, tags: ['spear', 'dragon'],
    name: { ru: 'Хребет дракона', en: 'Dragon Spine' },
    description: { ru: 'Копьё из кости древнего змея.', en: 'A spear carved from an ancient wyrm bone.' },
    bonuses: { attack: 13, hp: 4 }
  },
  {
    id: 'weapon_starfall_staff', type: 'weapon', rarity: 'mythic', icon: '☄️', sellPrice: 360, tags: ['magic', 'star'],
    name: { ru: 'Посох Звездопада', en: 'Starfall Staff' },
    description: { ru: 'Внутри него слышен гул далёких созвездий.', en: 'Distant constellations hum within it.' },
    bonuses: { attack: 18, speed: 2, critChance: 0.08 }
  },

  { id: 'armor_patched_coat', type: 'armor', rarity: 'common', icon: '🧥', sellPrice: 10, tags: ['cloth'], name: { ru: 'Заплатанный плащ', en: 'Patched Coat' }, description: { ru: 'Лучше, чем ничего.', en: 'Better than nothing.' }, bonuses: { hp: 3, defense: 1 } },
  { id: 'armor_leather_vest', type: 'armor', rarity: 'common', icon: '🥋', sellPrice: 16, tags: ['leather'], name: { ru: 'Кожаный жилет', en: 'Leather Vest' }, description: { ru: 'Лёгкая защита для дороги.', en: 'Light protection for the road.' }, bonuses: { hp: 4, defense: 2 } },
  { id: 'armor_chainmail', type: 'armor', rarity: 'rare', icon: '⛓️', sellPrice: 38, tags: ['metal'], name: { ru: 'Кольчуга', en: 'Chainmail' }, description: { ru: 'Звенит, зато держит удар.', en: 'Noisy, but it holds a hit.' }, bonuses: { hp: 7, defense: 4, speed: -1 } },
  { id: 'armor_mystic_robe', type: 'armor', rarity: 'rare', icon: '🧙', sellPrice: 40, tags: ['magic'], name: { ru: 'Мистическая мантия', en: 'Mystic Robe' }, description: { ru: 'Ткань защищает от злых чар.', en: 'The fabric wards off wicked magic.' }, bonuses: { hp: 5, defense: 2, attack: 2 } },
  { id: 'armor_ranger_cloak', type: 'armor', rarity: 'rare', icon: '🟢', sellPrice: 42, tags: ['ranger'], name: { ru: 'Плащ следопыта', en: 'Ranger Cloak' }, description: { ru: 'Помогает двигаться бесшумно.', en: 'Helps you move silently.' }, bonuses: { hp: 5, defense: 2, speed: 2 } },
  { id: 'armor_guardian_plate', type: 'armor', rarity: 'epic', icon: '🛡️', sellPrice: 88, tags: ['plate'], name: { ru: 'Панцирь стража', en: 'Guardian Plate' }, description: { ru: 'Тяжёлый доспех с древней печатью.', en: 'Heavy armor with an ancient seal.' }, bonuses: { hp: 12, defense: 7, speed: -2 } },
  { id: 'armor_phantom_silk', type: 'armor', rarity: 'epic', icon: '🕸️', sellPrice: 92, tags: ['silk'], name: { ru: 'Призрачный шёлк', en: 'Phantom Silk' }, description: { ru: 'Почти невесомая защита.', en: 'Almost weightless protection.' }, bonuses: { hp: 8, defense: 3, speed: 3 } },
  { id: 'armor_trollhide', type: 'armor', rarity: 'epic', icon: '🪨', sellPrice: 94, tags: ['hide'], name: { ru: 'Шкура тролля', en: 'Trollhide' }, description: { ru: 'Грубая, но невероятно прочная.', en: 'Rough, but incredibly tough.' }, bonuses: { hp: 15, defense: 5 } },
  { id: 'armor_royal_aegis', type: 'armor', rarity: 'legendary', icon: '👑', sellPrice: 175, tags: ['royal'], name: { ru: 'Королевская эгида', en: 'Royal Aegis' }, description: { ru: 'Доспех героев старого королевства.', en: 'Armor of heroes from the old kingdom.' }, bonuses: { hp: 18, defense: 8, critChance: 0.02 } },
  { id: 'armor_voidmantle', type: 'armor', rarity: 'mythic', icon: '🌌', sellPrice: 340, tags: ['void'], name: { ru: 'Мантия Бездны', en: 'Voidmantle' }, description: { ru: 'Она поглощает слабые удары и свет факелов.', en: 'It absorbs weak blows and torchlight.' }, bonuses: { hp: 16, defense: 7, attack: 5, speed: 2 } },

  { id: 'pet_field_mouse', type: 'pet', rarity: 'common', icon: '🐭', sellPrice: 8, tags: ['pet'], name: { ru: 'Полевая мышь', en: 'Field Mouse' }, description: { ru: 'Пищит при виде сокровищ.', en: 'Squeaks near treasure.' }, bonuses: { speed: 1 } },
  { id: 'pet_clever_raven', type: 'pet', rarity: 'rare', icon: '🐦‍⬛', sellPrice: 35, tags: ['pet'], name: { ru: 'Умный ворон', en: 'Clever Raven' }, description: { ru: 'Замечает слабые места врага.', en: 'Spots an enemy’s weak points.' }, bonuses: { critChance: 0.03, speed: 1 } },
  { id: 'pet_ember_fox', type: 'pet', rarity: 'rare', icon: '🦊', sellPrice: 40, tags: ['pet', 'fire'], name: { ru: 'Искристая лиса', en: 'Ember Fox' }, description: { ru: 'Согревает в холодных пещерах.', en: 'Keeps you warm in cold caves.' }, bonuses: { attack: 2, speed: 1 } },
  { id: 'pet_tiny_slime', type: 'pet', rarity: 'common', icon: '🫧', sellPrice: 12, tags: ['pet'], name: { ru: 'Маленький слизень', en: 'Tiny Slime' }, description: { ru: 'Мило прыгает рядом.', en: 'Bounces cutely nearby.' }, bonuses: { hp: 3 } },
  { id: 'pet_armor_beetle', type: 'pet', rarity: 'epic', icon: '🪲', sellPrice: 85, tags: ['pet'], name: { ru: 'Бронежук', en: 'Armor Beetle' }, description: { ru: 'Прячется под щитом и ворчит.', en: 'Hides under your shield and grumbles.' }, bonuses: { defense: 4, hp: 6 } },
  { id: 'pet_moon_cat', type: 'pet', rarity: 'epic', icon: '🐈‍⬛', sellPrice: 88, tags: ['pet', 'moon'], name: { ru: 'Лунный кот', en: 'Moon Cat' }, description: { ru: 'Приносит удачу ночью.', en: 'Brings luck at night.' }, bonuses: { critChance: 0.05, speed: 2 } },
  { id: 'pet_baby_dragon', type: 'pet', rarity: 'legendary', icon: '🐲', sellPrice: 170, tags: ['pet', 'dragon'], name: { ru: 'Дракончик', en: 'Baby Dragon' }, description: { ru: 'Пока маленький. Пока.', en: 'Small for now. For now.' }, bonuses: { attack: 5, hp: 8, critChance: 0.03 } },
  { id: 'pet_star_owl', type: 'pet', rarity: 'mythic', icon: '🦉', sellPrice: 330, tags: ['pet', 'star'], name: { ru: 'Звёздная сова', en: 'Star Owl' }, description: { ru: 'Видит маршруты, которых ещё нет.', en: 'Sees paths that do not exist yet.' }, bonuses: { attack: 4, defense: 3, speed: 4, critChance: 0.06 } },

  { id: 'artifact_lucky_coin', type: 'artifact', rarity: 'common', icon: '🪙', sellPrice: 14, tags: ['luck'], name: { ru: 'Счастливая монета', en: 'Lucky Coin' }, description: { ru: 'Всегда падает правильной стороной.', en: 'Always lands on the right side.' }, bonuses: { critChance: 0.02 } },
  { id: 'artifact_berserker_charm', type: 'artifact', rarity: 'rare', icon: '🧿', sellPrice: 45, tags: ['charm'], name: { ru: 'Оберег берсерка', en: 'Berserker Charm' }, description: { ru: 'Сердце бьётся громче перед боем.', en: 'Your heart beats louder before battle.' }, bonuses: { attack: 3, hp: 4 } },
  { id: 'artifact_sage_orb', type: 'artifact', rarity: 'rare', icon: '🔮', sellPrice: 48, tags: ['orb'], name: { ru: 'Сфера мудреца', en: 'Sage Orb' }, description: { ru: 'Помогает не выбирать явно плохую дверь.', en: 'Helps avoid obviously bad doors.' }, bonuses: { defense: 2, critChance: 0.02 } },
  { id: 'artifact_swift_boots', type: 'artifact', rarity: 'epic', icon: '🥾', sellPrice: 86, tags: ['speed'], name: { ru: 'Сапоги ветра', en: 'Swift Boots' }, description: { ru: 'Делают шаги короче, а путь быстрее.', en: 'Make steps shorter and journeys faster.' }, bonuses: { speed: 5 } },
  { id: 'artifact_blood_rune', type: 'artifact', rarity: 'epic', icon: '🩸', sellPrice: 92, tags: ['rune'], name: { ru: 'Кровавая руна', en: 'Blood Rune' }, description: { ru: 'Опасная сила в маленьком камне.', en: 'Dangerous power in a small stone.' }, bonuses: { attack: 5, hp: -2, critChance: 0.04 } },
  { id: 'artifact_king_seal', type: 'artifact', rarity: 'legendary', icon: '📜', sellPrice: 165, tags: ['royal'], name: { ru: 'Печать короля', en: 'King Seal' }, description: { ru: 'Приказ старого трона всё ещё звучит.', en: 'The command of the old throne still echoes.' }, bonuses: { hp: 10, attack: 4, defense: 4 } },
  { id: 'artifact_eternal_spark', type: 'artifact', rarity: 'mythic', icon: '✨', sellPrice: 320, tags: ['spark'], name: { ru: 'Вечная искра', en: 'Eternal Spark' }, description: { ru: 'Не гаснет даже под дождём из теней.', en: 'Does not fade even under shadow rain.' }, bonuses: { attack: 7, defense: 4, speed: 3, critChance: 0.05 } },

  { id: 'cosmetic_green_hat', type: 'cosmetic', rarity: 'common', icon: '🟩', sellPrice: 5, tags: ['cosmetic'], name: { ru: 'Зелёная шляпа', en: 'Green Hat' }, description: { ru: 'Сразу видно: герой с характером.', en: 'Clearly a hero with personality.' }, bonuses: {} },
  { id: 'cosmetic_gold_cape', type: 'cosmetic', rarity: 'rare', icon: '🟨', sellPrice: 20, tags: ['cosmetic'], name: { ru: 'Золотой плащ', en: 'Golden Cape' }, description: { ru: 'Развевается даже без ветра.', en: 'Flutters even without wind.' }, bonuses: {} },
  { id: 'cosmetic_goblin_mask', type: 'cosmetic', rarity: 'epic', icon: '👺', sellPrice: 50, tags: ['cosmetic'], name: { ru: 'Маска гоблина', en: 'Goblin Mask' }, description: { ru: 'Пугает слабых гоблинов и сильных друзей.', en: 'Scares weak goblins and strong friends.' }, bonuses: {} },
  { id: 'cosmetic_star_aura', type: 'cosmetic', rarity: 'legendary', icon: '🌟', sellPrice: 100, tags: ['cosmetic'], name: { ru: 'Звёздная аура', en: 'Star Aura' }, description: { ru: 'Профиль сияет как трофей.', en: 'Your profile shines like a trophy.' }, bonuses: {} },
  { id: 'cosmetic_void_crown', type: 'cosmetic', rarity: 'mythic', icon: '👑', sellPrice: 200, tags: ['cosmetic'], name: { ru: 'Корона Бездны', en: 'Void Crown' }, description: { ru: 'Тихая корона для громкой победы.', en: 'A quiet crown for a loud victory.' }, bonuses: {} }
];

export function getItem(id: string): ItemDefinition | undefined {
  return ITEMS.find((item) => item.id === id);
}

export function getItemsByRarity(rarity: Rarity): ItemDefinition[] {
  return ITEMS.filter((item) => item.rarity === rarity);
}
