// ── Footer ───────────────────────────────────────────────────────────────────
// Substitua as variáveis abaixo com seus dados:

const DONATION_LINK = "https://SEU_LINK_DE_DOACAO_AQUI";   // ex: paypal.me/voce, ko-fi.com/voce
const DONATION_LABEL = "Pix";                             // ex: "PayPal", "Ko-fi", "Pix"
const GITHUB_ISSUE_LINK = "https://github.com/Angelo2364/Pokemon_Team_Builder";
const EMAIL = "sayaokaua@gmail.com";
const AUTHOR = "Kauã Sayão";
const START_YEAR = 2026;

// ─────────────────────────────────────────────────────────────────────────────

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const yearRange = currentYear > START_YEAR ? `${START_YEAR}-${currentYear}` : `${START_YEAR}`;

  return (
    <footer className="site-footer">
      <p>
        Se você achar este projeto útil, considere fazer uma{" "}
        <a href={DONATION_LINK} target="_blank" rel="noopener noreferrer" className="footer-donation-btn">
          doação via {DONATION_LABEL}
        </a>{" "}
        para mantê-lo ativo.
      </p>
      <p>
        Por favor, reporte bugs ou deixe feedback em{" "}
        <a href={GITHUB_ISSUE_LINK} target="_blank" rel="noopener noreferrer" className="footer-link">
          abrir uma issue no GitHub
        </a>{" "}
        ou contate o administrador por e-mail:{" "}
        <a href={`mailto:${EMAIL}`} className="footer-link">&lt;{EMAIL}&gt;</a>.
      </p>
      <p className="footer-copy">
        © de {AUTHOR}, {yearRange}
        <br />
        Pokémon é © de Nintendo, 1995-{currentYear}
      </p>
      <p className="footer-copy">
        Projeto inspirado no team planner de richi3f
      </p>
    </footer>
  );
}
