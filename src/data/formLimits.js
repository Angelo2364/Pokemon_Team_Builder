// ── Limitador de formas por jogo ─────────────────────────────────────────────
//
// Cada entrada tem o ID do jogo (igual ao GAME_GROUPS) e duas listas opcionais:
//
//   excludeKeywords: exclui qualquer forma cujo nome contenha a palavra-chave
//   excludeForms:    exclui formas individuais pelo nome exato da PokéAPI
//
// As duas listas se combinam — uma forma é excluída se bater em qualquer uma.
// Formas não listadas continuam aparecendo normalmente.
//
// Nomes das formas seguem o padrão da PokéAPI:
//   "charizard-mega-x", "greninja-ash", "pikachu-original-cap", etc.
// ─────────────────────────────────────────────────────────────────────────────

const ZA_MEGAS = [
     "meganium-mega",
      "emboar-mega",
      "feraligatr-mega",
      "barbaracle-mega",
      "starmie-mega",
      "floette-mega",
      "floette-eternal",
      "pyroar-mega",
      "clefable-mega",
      "scolipede-mega",
      "victreebel-mega",
      "excadrill-mega",
      "eelektross-mega",
      "dragonite-mega",
      "malamar-mega",
      "dragalge-mega",
      "froslass-mega",
      "hawlucha-mega",
      "scrafty-mega",
      "chandelure-mega",
      "falinks-mega",
      "skarmory-mega",
      "drampa-mega",
      "zygarde-mega",
      "chesnaught-mega",
      "delphox-mega",
      "greninja-mega",
      "baxcalibur-mega",
      "absol-mega-z",
      "raichu-mega-x",
      "raichu-mega-y",
      "zeraora-mega",
      "staraptor-mega",
      "scovillain-mega",
      "golisopod-mega",
      "meowstic-mega",
      "golurk-mega",
      "crabominable-mega",
      "glimmora-mega",
      "tatsugiri-mega",
      "darkrai-mega",
      "magearna-mega",
      "chimecho-mega",
      "lucario-mega-z",
      "baxcalibur-mega",
  ];

export const FORM_LIMITS = {

  // ── Geração I ──────────────────────────────────────────────────────────────
  rby: {
    excludeKeywords: ["mega", "gmax", "alola", "galar", "hisui", "paldea", "battle"],
    excludeForms: [],
  },

  // ── Geração II ─────────────────────────────────────────────────────────────
  gsc: {
    excludeKeywords: ["mega", "gmax", "alola", "galar", "hisui", "paldea", "battle"],
    excludeForms: [],
  },

  // ── Geração III ────────────────────────────────────────────────────────────
  rse: {
    excludeKeywords: ["mega", "gmax", "alola", "galar", "hisui", "paldea", "battle"],
    excludeForms: [],
  },
  frlg: {
    excludeKeywords: ["mega", "gmax", "alola", "galar", "hisui", "paldea", "battle"],
    excludeForms: [],
  },

  // ── Geração IV ─────────────────────────────────────────────────────────────
  dpp: {
    excludeKeywords: ["mega", "gmax", "alola", "galar", "hisui", "paldea", "battle"],
    excludeForms: [],
  },
  hgss: {
    excludeKeywords: ["mega", "gmax", "alola", "galar", "hisui", "paldea", "battle"],
    excludeForms: [],
  },

  // ── Geração V ──────────────────────────────────────────────────────────────
  bw: {
    excludeKeywords: ["mega", "gmax", "alola", "galar", "hisui", "paldea", "battle"],
    excludeForms: [],
  },
  bw2: {
    excludeKeywords: ["mega", "gmax", "alola", "galar", "hisui", "paldea", "battle"],
    excludeForms: [],
  },

  // ── Geração VI — megas existem, mas não todas ──────────────────────────────
  // X/Y tem megas, mas NÃO tem as megas exclusivas de ORAS (Latios, Latias, etc.)
  xy: {
    excludeKeywords: ["gmax", "alola", "galar", "hisui", "paldea", "battle"],
    excludeForms: [
      // Megas exclusivas de ORAS
      "greninja-ash",
      "sceptile-mega",
      "swampert-mega",
      "pidgeot-mega",
      "beedrill-mega",
      "slowbro-mega",
      "steelix-mega",
      "sceptile-mega",
      "swampert-mega",
      "sableye-mega",
      "sharpedo-mega",
      "camerupt-mega",
      "altaria-mega",
      "glalie-mega",
      "salamence-mega",
      "metagross-mega",
      "rayquaza-mega",
      "lopunny-mega",
      "gallade-mega",
      "audino-mega",
      "diancie-mega",
      ...ZA_MEGAS,
    ],
  },
  // ORAS tem todas as megas de X/Y + as próprias
  oras: {
    excludeKeywords: ["gmax", "alola", "galar", "hisui", "paldea", "battle"],
    excludeForms: [
      "greninja-ash", ...ZA_MEGAS,
    ],
  },

  // ── Geração VII ────────────────────────────────────────────────────────────
  // Sun/Moon tem formas alolan mas não tem gmax, galar, etc.
  // Ash-Greninja só existe em Sun/Moon — nos outros jogos pode excluir
  sm: {
    excludeKeywords: ["gmax", "galar", "hisui", "paldea", "battle"],
    excludeForms: [
      , ...ZA_MEGAS,
    ],
    // Ash-Greninja EXISTE em SM — não exclui
  },
  usum: {
    excludeKeywords: ["gmax", "galar", "hisui", "paldea", "battle"],
    excludeForms: [
      "greninja-ash", ...ZA_MEGAS, // Ash-Greninja não disponível em USUM
    ],
  },
  letsgo: {
    // Let's Go só tem formas alolan e mega de Mewtwo — exclui todo o resto
    excludeKeywords: ["gmax", "galar", "hisui", "paldea", "battle"],
    excludeForms: [
      "greninja-ash", ...ZA_MEGAS,
    ],
  },

  // ── Geração VIII ───────────────────────────────────────────────────────────
  swsh: {
    excludeKeywords: ["mega", "alola", "hisui", "paldea", "battle"],
    excludeForms: [
      "greninja-ash", ...ZA_MEGAS,
    ],
  },
  bdsp: {
    excludeKeywords: ["mega", "gmax", "galar", "hisui", "paldea", "battle"],
    excludeForms: [
      "greninja-ash", ...ZA_MEGAS,
    ],
  },
  la: {
    // Legends: Arceus tem formas hisuias — mantém essas, exclui o resto
    excludeKeywords: ["mega", "gmax", "galar", "paldea", "battle"],
    excludeForms: [
      "greninja-ash", ...ZA_MEGAS,
    ],
  },

  // ── Geração IX ─────────────────────────────────────────────────────────────
  sv: {
    excludeKeywords: ["mega", "gmax", "alola", "hisui", "battle"],
    excludeForms: [
      "greninja-ash", ...ZA_MEGAS,
    ],
  },
  za: {
    // Legends: Z-A — megas voltam! Exclui formas regionais que não aparecem
    excludeKeywords: ["gmax", "hisui", "paldea", "battle"],
    excludeForms: [
      "greninja-ash",
    ],
  },
};

// ── Helper — filtra a lista de formas de um Pokémon pelo jogo atual ───────────
// Uso no TeamSlot.jsx:
//   import { filterForms } from "../data/formLimits";
//   const filtered = filterForms(forms, filterGame);
//
export function filterForms(forms, gameId) {
  const limits = FORM_LIMITS[gameId];
  if (!limits) return forms; // jogo sem restrições — mostra tudo

  return forms.filter(form => {
    const name = form.pokemon.name.toLowerCase();

    // Verifica palavras-chave
    const blockedByKeyword = limits.excludeKeywords?.some(kw => name.includes(kw));
    if (blockedByKeyword) return false;

    // Verifica exclusões individuais
    const blockedIndividually = limits.excludeForms?.includes(name);
    if (blockedIndividually) return false;

    return true;
  });
}
