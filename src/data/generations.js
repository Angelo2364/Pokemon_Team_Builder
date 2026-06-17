export const ALL_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic",
  "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export const TYPE_ABBR = {
  normal: "NRM", fire: "FIR", water: "WAT", electric: "ELC",
  grass: "GRS", ice: "ICE", fighting: "FGT", poison: "PSN",
  ground: "GRD", flying: "FLY", psychic: "PSY", bug: "BUG",
  rock: "RCK", ghost: "GHT", dragon: "DRG", dark: "DRK",
  steel: "STL", fairy: "FAY",
};

export const TYPE_COLORS = {
  fire: "#EE8130", water: "#6390F0", grass: "#7AC74C", electric: "#F7D02C",
  ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1", ground: "#E2BF65",
  flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A", rock: "#B6A136",
  ghost: "#735797", dragon: "#6F35FC", dark: "#705746", steel: "#B7B7CE",
  fairy: "#D685AD", normal: "#A8A77A",
};

export const DARK_TEXT_TYPES = new Set(["electric", "ice", "ground", "steel", "normal"]);

export const TYPE_CHART = {
  normal: { weakTo: ["fighting"], immuneTo: ["ghost"], resistantTo: [] },
  fire: { weakTo: ["water", "ground", "rock"], immuneTo: [], resistantTo: ["fire", "grass", "ice", "bug", "steel", "fairy"] },
  water: { weakTo: ["electric", "grass"], immuneTo: [], resistantTo: ["fire", "water", "ice", "steel"] },
  electric: { weakTo: ["ground"], immuneTo: [], resistantTo: ["electric", "flying", "steel"] },
  grass: { weakTo: ["fire", "ice", "poison", "flying", "bug"], immuneTo: [], resistantTo: ["water", "electric", "grass", "ground"] },
  ice: { weakTo: ["fire", "fighting", "rock", "steel"], immuneTo: [], resistantTo: ["ice"] },
  fighting: { weakTo: ["flying", "psychic", "fairy"], immuneTo: [], resistantTo: ["bug", "rock", "dark"] },
  poison: { weakTo: ["ground", "psychic"], immuneTo: [], resistantTo: ["grass", "fighting", "poison", "bug", "fairy"] },
  ground: { weakTo: ["water", "grass", "ice"], immuneTo: ["electric"], resistantTo: ["poison", "rock"] },
  flying: { weakTo: ["electric", "ice", "rock"], immuneTo: ["ground"], resistantTo: ["grass", "fighting", "bug"] },
  psychic: { weakTo: ["bug", "ghost", "dark"], immuneTo: [], resistantTo: ["fighting", "psychic"] },
  bug: { weakTo: ["fire", "flying", "rock"], immuneTo: [], resistantTo: ["grass", "fighting", "ground"] },
  rock: { weakTo: ["water", "grass", "fighting", "ground", "steel"], immuneTo: [], resistantTo: ["normal", "fire", "poison", "flying"] },
  ghost: { weakTo: ["ghost", "dark"], immuneTo: ["normal", "fighting"], resistantTo: ["poison", "bug"] },
  dragon: { weakTo: ["ice", "dragon", "fairy"], immuneTo: [], resistantTo: ["fire", "water", "electric", "grass"] },
  dark: { weakTo: ["fighting", "bug", "fairy"], immuneTo: ["psychic"], resistantTo: ["ghost", "dark"] },
  steel: { weakTo: ["fire", "fighting", "ground"], immuneTo: ["poison"], resistantTo: ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"] },
  fairy: { weakTo: ["poison", "steel"], immuneTo: ["dragon"], resistantTo: ["fighting", "bug", "dark"] },
};

// Maps each GAME_GROUPS id to the PokeAPI version-group slug(s) used in
// pokemon.moves[].version_group_details[].version_group.name
export const GAME_VERSION_GROUPS = {
  rby: ["red-blue", "yellow"],
  gsc: ["gold-silver", "crystal"],
  rse: ["ruby-sapphire", "emerald"],
  frlg: ["firered-leafgreen"],
  dpp: ["diamond-pearl", "platinum"],
  hgss: ["heartgold-soulsilver"],
  bw: ["black-white"],
  bw2: ["black-2-white-2"],
  xy: ["x-y"],
  oras: ["omega-ruby-alpha-sapphire"],
  sm: ["sun-moon"],
  usum: ["ultra-sun-ultra-moon"],
  lgpe: ["lets-go-pikachu-eevee"],
  swsh: ["sword-shield"],
  bdsp: ["brilliant-diamond-and-shining-pearl", "scarlet-violet", "sword-shield", "diamond-pearl", "platinum"],
  la: ["legends-arceus"],
  sv: ["scarlet-violet"],
  za: ["legends-z-a"],
  letsgo: ["lets-go-pikachu-lets-go-eevee"],
};

export const generations = [
  { id: 1, name: "Gen I — Kanto", limit: 151, offset: 0 },
  { id: 2, name: "Gen II — Johto", limit: 100, offset: 151 },
  { id: 3, name: "Gen III — Hoenn", limit: 135, offset: 251 },
  { id: 4, name: "Gen IV — Sinnoh", limit: 107, offset: 386 },
  { id: 5, name: "Gen V — Unova", limit: 156, offset: 493 },
  { id: 6, name: "Gen VI — Kalos", limit: 72, offset: 649 },
  { id: 7, name: "Gen VII — Alola", limit: 88, offset: 721 },
  { id: 8, name: "Gen VIII — Galar", limit: 96, offset: 809 },
  { id: 9, name: "Gen IX — Paldea", limit: 120, offset: 905 },
];

// Each game maps to genId(s) for Pokémon pool + optional version-exclusive split
// ============================================================
// GAME_GROUPS
// ============================================================
// genIds: quais gerações de Pokémon aparecem quando o jogo é selecionado.
//         Quando o gamedex.js tiver a dex completa do jogo preenchida,
//         o genIds deixa de importar — a lista de nomes substitui ele.
//
// exclusives: opcional, só pra jogos com duas versões.
//   a:       nome da versão A  (aparece no filtro como "Exclusivo X")
//   b:       nome da versão B
//   aNames:  array com os nomes (slug da PokeAPI) dos Pokémon exclusivos de A
//   bNames:  array com os nomes (slug da PokeAPI) dos Pokémon exclusivos de B
//
// Pokémon que não estão em nenhum dos dois arrays = disponível nas duas versões.
// Jogos de versão única (Crystal, Emerald, Platinum…) não precisam de exclusives.
//
// ── COMO PREENCHER ──────────────────────────────────────────
// Use o slug exato da PokeAPI (minúsculo, hífens no lugar de espaços).
// Exemplos: "bulbasaur", "mr-mime", "wormadam-plant", "meowstic-male"
// Dica: é o mesmo formato que você já usa no gamedex.js
// ============================================================

export const GAME_GROUPS = [
  {
    id: "rby", name: "Red / Blue / Yellow", genIds: [1],
    exclusives: {
      a: "Red", b: "Blue",
      aNames: [
        "ekans", "arbok",
        "oddish", "gloom", "vileplume",
        "mankey", "primeape",
        "growlithe", "arcanine",
        "scyther",
        "electabuzz",
      ],
      bNames: [
        "sandshrew", "sandslash",
        "vulpix", "ninetales",
        "meowth", "persian",
        "bellsprout", "weepinbell", "victreebel",
        "magmar",
        "pinsir",
      ],
    },
  },


  {
    id: "gsc", name: "Gold / Silver / Crystal", genIds: [1, 2],
    exclusives: {
      a: "Gold", b: "Silver",
      aNames: [
        "mankey", "primeape",
        "growlithe", "arcanine",
        "spinarak", "ariados",
        "gligar",
        "teddiursa", "ursaring",
        "mantine",
      ],
      bNames: [
        "vulpix", "ninetales",
        "meowth", "persian",
        "ledyba", "ledian",
        "delibird",
        "skarmory",
        "phanpy", "donphan",
      ],
    },
  },


  {
    id: "rse", name: "Ruby / Sapphire / Emerald", genIds: [1, 2, 3],
    exclusives: {
      a: "Ruby", b: "Sapphire",
      aNames: [
        "seedot", "nuzleaf", "shiftry", "mawile", "zangoose", "solrock", "groudon",
      ],
      bNames: [
        "lotad", "lombre", "ludicolo", "sableye", "seviper", "lunatone", "kyogre",
      ],
    },
  },


  {
    id: "frlg", name: "FireRed / LeafGreen", genIds: [1],
    exclusives: {
      a: "FireRed", b: "LeafGreen",
      aNames: [
        "ekans", "arbok",
        "oddish", "gloom", "vileplume",
        "psyduck", "golduck",
        "growlithe", "arcanine",
        "shellder", "cloyster",
        "scyther",
        "electabuzz",
        "bellossom",
        "wooper", "quagsire",
        "murkrow",
        "qwilfish",
        "scizor",
        "delibird",
        "skarmory",
        "elekid",
        "deoxys-normal",

      ],
      bNames: [
        "sandshrew", "sandslash",
        "vulpix", "ninetales",
        "bellsprout", "weepinbell", "victreebel",
        "slowpoke", "slowbro",
        "staryu", "starmie",
        "magmar",
        "pinsir",
        "marill", "azumarill",
        "slowking",
        "misdreavus",
        "sneasel",
        "remoraid", "octillery",
        "mantine",
        "magby",
        "azurill",
        "deoxys-normal",
      ],
    },
  },

  {
    id: "dpp", name: "Diamond / Pearl / Platinum", genIds: [1, 2, 3, 4],
    exclusives: {
      a: "Diamond", b: "Pearl",
      aNames: [
        "murkrow", "honchkrow",
        "scyther", "scizor",
        "larvitar", "pupitar", "tyranitar",
        "cranidos", "rampardos",
        "stunky", "skuntank",
        "poochyena", "mightyena",
        "aron", "lairon", "aggron",
        "kecleon",
        "seel", "dewgong",
        "dialga",
      ],
      bNames: [
        "misdreavus", "mismagius",
        "pinsir",
        "shieldon", "bastiodon",
        "glameow", "purugly",
        "houndour", "houndoom",
        "stantler",
        "spheal", "sealeo", "walrein",
        "bagon", "shelgon", "salamence",
        "slowpoke", "slowbro", "slowking",
        "palkia",
      ],
    },
  },

  {
    id: "hgss", name: "HeartGold / SoulSilver", genIds: [1, 2, 3, 4],
    exclusives: {
      a: "HeartGold", b: "SoulSilver",
      aNames: [
        "mankey", "primeape",
        "growlithe", "arcanine",
        "omanyte", "omastar",
        "spinarak", "ariados",
        "gligar", "gliscor",
        "mantyke", "mantine",
        "phanpy", "donphan",
        "sableye",
        "baltoy", "claydol",
        "anorith", "armaldo",
        "kyogre",
      ],
      bNames: [
        "vulpix", "ninetales",
        "meowth", "persian",
        "kabuto", "kabutops",
        "ledyba", "ledian",
        "mawile",
        "gulpin", "swalot",
        "lileep", "cradily",
        "groudon",
        "delibird",
        "skarmory",
        "teddiursa", "ursaring",
      ],
    },
  },

  {
    id: "bw", name: "Black / White", genIds: [1, 2, 3, 4, 5],
    exclusives: {
      a: "Black", b: "White",
      aNames: [
        "cottonee", "whimsicott",
        "murkrow", "honchkrow",
        "shroomish", "breloom",
        "volbeat",
        "weedle", "kakuna", "beedrill",
        "murkrow", "honchkrow",
        "plusle",
        "houndour", "houndoom",
        "gothita", "gothorita", "gothitelle",
        "vullaby", "mandibuzz",
        "tornadus-incarnate",
        "reshiram",
      ],
      bNames: [
        "rufflet", "braviary",
        "paras", "parasect",
        "poochyena", "mightyena",
        "illumise",
        "caterpie", "metapod", "butterfree",
        "misdreavus", "mismagius",
        "minun",
        "solosis", "duosion", "reuniclus",
        "petilil", "lilligant",
        "thundurus-incarnate",
        "zekrom",
        //White forest
        "pidgey", "pidgeotto", "pidgeot", "nidoran-f", "nidorina", "nidoqueen", "nidoran-m", "nidorino", "nidoking", "oddish", "gloom", "vileplume", "abra", "kadabra", "alakazam", "machop", "machoke", "machamp", "bellsprout", "weepinbell", "victreebel", "magnemite", "magneton", "gastly", "haunter", "gengar", "rhyhorn", "rhydon", "chansey", "electabuzz", "magmar", "porygon", "togepi", "togetic", "mareep", "flaaffy", "ampharos", "bellossom", "marill", "azumarill", "hoppip", "skiploom", "jumpluff", "wooper", "quagsire", "porygon2", "elekid", "magby", "blissey", "wurmple", "silcoon", "beautifly", "cascoon", "dustox", "lotad", "lombre", "ludicolo", "seedot", "nuzleaf", "shiftry", "ralts", "kirlia", "gardevoir", "surskit", "masquerain", "slakoth", "vigoroth", "slaking", "whismur", "loudred", "exploud", "azurill", "aron", "lairon", "aggron", "roselia", "trapinch", "vibrava", "flygon", "corphish", "crawdaunt", "bagon", "shelgon", "salamence", "starly", "staravia", "staraptor", "shinx", "luxio", "luxray", "budew", "roserade", "happiny", "magnezone", "rhyperior", "electivire", "magmortar", "togekiss", "porygon-z", "gallade"
      ],
    },
  },

  {
    id: "bw2", name: "Black 2 / White 2", genIds: [1, 2, 3, 4, 5],
    exclusives: {
      a: "Black 2", b: "White 2",
      aNames: [
        "cottonee", "whimsicott",
        "gothita", "gothorita", "gothitelle",
        "vullaby", "mandibuzz",
        "magby", "magmar", "magmortar",
        "sudowoodo",
        "heracross",
        "plusle",
        "volbeat",
        "spoink", "grumpig",
        "registeel",
        "latios",
        "buneary", "lopunny",
        "bonsly",
        "zekrom",
      ],
      bNames: [
        "petilil", "lilligant",
        "solosis", "duosion", "reuniclus",
        "rufflet", "braviary",
        "reshiram",
        "mr-mime", "mime-jr",
        "elekid", "electabuzz", "electivire",
        "pinsir",
        "skitty", "delcatty",
        "minun",
        "illumise",
        "numel", "camerupt",
        "regice",
        "latias",
      ],
    },
  },

  {
    id: "xy", name: "X / Y", genIds: [1, 2, 3, 4, 5, 6],
    exclusives: {
      a: "X", b: "Y",
      aNames: [
        "swirlix", "slurpuff",
        "clauncher", "clawitzer",
        "xerneas",
        "staryu", "starmie",
        "pinsir",
        "houndour", "houndoom",
        "poochyena", "mightyena",
        "aron", "lairon", "aggron",
        "lileep", "cradily",
        "anorith", "armaldo",
        "sawk",
      ],
      bNames: [
        "spritzee", "aromatisse",
        "skrelp", "dragalge",
        "yveltal",
        "shellder", "cloyster",
        "omanyte", "omastar",
        "kabuto", "kabutops",
        "heracross",
        "larvitar", "pupitar", "tyranitar",
        "electrike", "manectric",
        "purrloin", "liepard",
        "throh",
      ],
    },
  },

  {
    id: "oras", name: "Omega Ruby / Alpha Sapphire", genIds: [1, 2, 3, 4, 5, 6],
    exclusives: {
      a: "Omega Ruby", b: "Alpha Sapphire",
      aNames: [
        "seedot", "nuzleaf", "shiftry",
        "mawile",
        "zangoose",
        "solrock",
        "groudon",
        "kabuto", "kabutops",
        "ho-oh",
        "shieldon", "bastiodon",
        "palkia",
        "throh",
        "archen", "archeops",
        "tornadus-incarnate",
        "reshiram",
        "skrelp", "dragalge",
      ],
      bNames: [
        "lotad", "lombre", "ludicolo",
        "sableye",
        "seviper",
        "lunatone",
        "kyogre",
        "omanyte", "omastar",
        "lugia",
        "cranidos", "rampardos",
        "dialga",
        "sawk",
        "tirtouga", "carracosta",
        "thundurus-incarnate",
        "zekrom",
        "clauncher", "clawitzer",
      ],
    },
  },

  {
    id: "sm", name: "Sun / Moon", genIds: [1, 2, 3, 4, 5, 6, 7],
    exclusives: {
      a: "Sun", b: "Moon",
      aNames: [
        "vulpix", "ninetales",
        "passimian",
        "turtonator",
        "cranidos", "rampardos",
        "cottonee", "whimsicott",
        "tirtouga", "carracosta",
        "rufflet", "braviary",
        "kartana",
        "buzzwole",
        "solgaleo",
      ],
      bNames: [
        "sandshrew", "sandslash",
        "oranguru",
        "drampa",
        "shieldon", "bastiodon",
        "petilil", "lilligant",
        "archen", "archeops",
        "vullaby", "mandibuzz",
        "celesteela",
        "pheromosa",
        "lunala",
      ],
    },
  },

  {
    id: "usum", name: "Ultra Sun / Ultra Moon", genIds: [1, 2, 3, 4, 5, 6, 7],
    exclusives: {
      a: "Ultra Sun", b: "Ultra Moon",
      aNames: [
        "vulpix", "ninetales",
        "passimian",
        "turtonator",
        "buzzwole",
        "kartana",
        "solgaleo",
        "blacephalon",
        "omanyte", "omastar",
        "houndour", "houndoom",
        "raikou",
        "ho-oh",
        "anorith", "armaldo",
        "latios",
        "groudon",
        "cranidos", "rampardos",
        "dialga",
        "heatran",
        "cottonee", "whimsicott",
        "tirtouga", "carracosta",
        "golett", "golurk",
        "rufflet", "braviary",
        "tornadus-incarnate",
        "reshiram",
        "clauncher", "clawitzer",
        "tyrunt", "tyrantrum",
        "xerneas",
      ],
      bNames: [
        "sandshrew", "sandslash",
        "oranguru",
        "drampa",
        "pheromosa",
        "celesteela",
        "lunala",
        "stakataka",
        "kabuto", "kabutops",
        "entei",
        "lugia",
        "electrike", "manectric",
        "baltoy", "claydol",
        "lileep", "cradily",
        "latias",
        "kyogre",
        "shieldon", "bastiodon",
        "palkia",
        "regigigas",
        "petilil", "lilligant",
        "archen", "archeops",
        "vullaby", "mandibuzz",
        "thundurus-incarnate",
        "zekrom",
        "skrelp", "dragalge",
        "amaura", "aurorus",
        "yveltal",
      ],
    },
  },

  { id: "letsgo", name: "Let's Go Pikachu / Let's Go Eevee", genIds: [1] },

  {
    id: "swsh", name: "Sword / Shield", genIds: [1, 2, 3, 4, 5, 6, 7, 8],
    exclusives: {
      a: "Sword", b: "Shield",
      aNames: [
        "seedot", "nuzleaf", "shiftry", "basculin-red-striped", "flapple", "swirlix", "slurpuff", "farfetchd", "sirfetchd", "scraggy", "scrafty", "gothita", "gothorita", "gothitelle", "rufflet", "braviary", "mawile", "passimian", "turtonator", "solrock", "darumaka", "darmanitan-standard", "stonjourner", "deino", "zweilous", "hydreigon", "jangmo-o", "hakamo-o", "kommo-o", "zacian", "isle-of-armor-pokedex", "pinsir", "clauncher", "clawitzer", "crown-tundra-pokedex", "bagon", "shelgon", "salamence", "omanyte", "omastar", "other-pokemon", "ho-oh", "latios", "groudon", "dialga", "tornadus-incarnate", "reshiram", "xerneas", "solgaleo"
      ],
      bNames: [
        "lotad", "lombre", "ludicolo", "basculin-red-striped", "appletun", "spritzee", "aromatisse", "croagunk", "toxicroak", "corsola", "cursola", "solosis", "duosion", "reuniclus", "vullaby", "mandibuzz", "sableye", "ponyta", "rapidash", "oranguru", "drampa", "lunatone", "eiscue-ice", "larvitar", "pupitar", "tyranitar", "goomy", "sliggoo", "goodra", "zamazenta", "isle-of-armor-pokedex", "heracross", "skrelp", "dragalge", "crown-tundra-pokedex", "gible", "gabite", "garchomp", "kabuto", "kabutops", "other-pokemon", "lugia", "latias", "kyogre", "palkia", "thundurus-incarnate", "zekrom", "yveltal", "lunala"
      ],
    },
  },

  {
    id: "bdsp", name: "Brilliant Diamond / Shining Pearl", genIds: [1, 2, 3, 4],
    exclusives: {
      a: "Brilliant Diamond", b: "Shining Pearl",
      aNames: [
        "murkrow", "honchkrow",
        "scyther", "scizor",
        "larvitar", "pupitar", "tyranitar",
        "cranidos", "rampardos",
        "stunky", "skuntank",
        "poochyena", "mightyena",
        "aron", "lairon", "aggron",
        "kecleon",
        "seel", "dewgong",
        "dialga",
        "raikou", "entei", "suicune",
        "ho-oh",
      ],
      bNames: [
        "misdreavus", "mismagius",
        "pinsir",
        "shieldon", "bastiodon",
        "glameow", "purugly",
        "houndour", "houndoom",
        "stantler",
        "spheal", "sealeo", "walrein",
        "bagon", "shelgon", "salamence",
        "slowpoke", "slowbro", "slowking",
        "palkia",
        "articuno", "zapdos", "moltres",
        "lugia",
      ],
    },
  },

  { id: "la", name: "Legends: Arceus", genIds: [1, 2, 3, 4] },

  

  {
    id: "sv", name: "Scarlet / Violet", genIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    exclusives: {
      a: "Scarlet", b: "Violet",
      aNames: [
        "drifloon", "drifblim", "armarouge", "tauros", "stunky", "skuntank", "oranguru", "larvitar", "pupitar", "tyranitar", "stonjourner", "skrelp", "dragalge", "deino", "zweilous", "hydreigon", "great-tusk", "scream-tail", "brute-bonnet", "flutter-mane", "slither-wing", "sandy-shocks", "roaring-moon", "koraidon", "kitakami-pokedex", "gligar", "gliscor", "cramorant", "blueberry-pokedex", "cranidos", "rampardos", "vulpix", "ninetales", "gouging-fire", "raging-bolt", "other-pokemon", "raikou", "entei", "suicune", "ho-oh", "latios", "groudon", "reshiram", "solgaleo", "glastrier"
      ],
      bNames: [
        "misdreavus", "mismagius", "gulpin", "swalot", "ceruledge", "tauros", "bagon", "shelgon", "salamence", "dreepy", "drakloak", "dragapult", "passimian", "eiscue-ice", "clauncher", "clawitzer", "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis", "iron-moth", "iron-thorns", "iron-valiant", "miraidon", "kitakami-pokedex", "aipom", "ambipom", "morpeko-full-belly", "blueberry-pokedex", "shieldon", "bastiodon", "sandshrew", "sandslash", "iron-crown", "iron-boulder", "other-pokemon", "lugia", "latias", "kyogre", "cobalion", "terrakion", "virizion", "zekrom", "lunala", "spectrier"
      ],
    },
  },

  { id: "za", name: "Legends: Z-A", genIds: [1, 2, 3, 4, 5, 6] },
];
