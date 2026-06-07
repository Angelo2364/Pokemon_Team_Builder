const fs = require("fs");

const input = fs.readFileSync(
  "input.txt",
  "utf8"
);

const names = input
  .split("\n")
  .map(name => name.trim())
  .filter(Boolean)
  .map(name => {
  let pokemon = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace("♀", "-f")
    .replace("♂", "-m")
    .replace(":", "")
    .replace(".", "")
    .replaceAll("'", "")
    .replaceAll(" ", "-");

  const fixes = {
    "wormadam": "wormadam-plant",
    "pyroar": "pyroar-male",
    "meowstic": "meowstic-male",
    "pumpkaboo": "pumpkaboo-average",
    "gourgeist": "gourgeist-average",
    "basculin": "basculin-red-striped",
    "zygarde": "zygarde-50",
    "deoxys": "deoxys-normal",
    "giratina": "giratina-altered",
    "shaymin": "shaymin-land",
    "darmanitan": "darmanitan-standard",
    "frillish": "frillish-male",
    "jellicent": "jellicent-male",
    "aegislash": "aegislash-shield",
    "tornadus": "tornadus-incarnate",
    "thundurus": "thundurus-incarnate",
    "landorus": "landorus-incarnate",
    "keldeo": "keldeo-ordinary",
    "meloetta": "meloetta-aria",
    "oricorio": "oricorio-baile",
    "lycanroc": "lycanroc-midday",
    "wishiwashi": "wishiwashi-solo",
    "minior": "minior-red-meteor",
    "mimikyu": "mimikyu-disguised",
    "toxtricity": "toxtricity-amped",
    "indeedee": "indeedee-male",
    "morpeko": "morpeko-full-belly",
    "eiscue": "eiscue-ice",
    "urshifu": "urshifu-single-strike",
    "basculegion": "basculegion-male",
    "enamorus": "enamorus-incarnate",
    "oinkologne": "oinkologne-male",
    "maushold": "maushold-family-of-four",
    "squawkabilly": "squawkabilly-green-plumage",
    "palafin": "palafin-zero",
    "tatsugiri": "tatsugiri-curly",

  };

  return fixes[pokemon] || pokemon;
});

const uniqueNames = [
  ...new Set(names)
];

console.log(
  `Originais: ${names.length}`
);

console.log(
  `Únicos: ${uniqueNames.length}`
);

console.log(
  `Removidos: ${
    names.length -
    uniqueNames.length
  }\n`
);

console.log(
  uniqueNames
    .map(name => `"${name}"`)
    .join(", ")
);