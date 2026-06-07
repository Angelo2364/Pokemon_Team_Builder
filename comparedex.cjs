const fs = require("fs");

function cleanList(text) {
  return [
    ...new Set(
      text
        .toLowerCase()
        .replaceAll('"', "")
        .replaceAll(",", "")
        .split(/\s+/)
        .map((p) => p.trim())
        .filter(Boolean)
    ),
  ];
}

const site = cleanList(
  fs.readFileSync(
    "site.txt",
    "utf8"
  )
);

const base = cleanList(
  fs.readFileSync(
    "base.txt",
    "utf8"
  )
);

const faltando = base.filter(
  (pokemon) =>
    !site.includes(pokemon)
);

const sobrando = site.filter(
  (pokemon) =>
    !base.includes(pokemon)
);

console.log(
  "\n=== FALTANDO ==="
);

console.log(faltando);

console.log(
  "\n=== SOBRANDO ==="
);

console.log(sobrando);

console.log(
  "\nBase:",
  base.length
);

console.log(
  "Site:",
  site.length
);