import { useState, useEffect, useRef } from "react";

// ── Suas informações — edite aqui ────────────────────────────────────────────
const PIX_PAYLOAD  = "00020126410014BR.GOV.BCB.PIX0119Sayaokaua@gmail.com5204000053039865802BR5909Sayaokaua6006Brasil62070503***6304652C";
const PIX_KEY      = "Sayaokaua@gmail.com";
const GITHUB_ISSUE_LINK = "https://github.com/Angelo2364/Pokemon_Team_Builder";
const EMAIL        = "Sayaokaua@gmail.com";
const AUTHOR       = "Kauã Sayão";
const START_YEAR   = 2026;
// ─────────────────────────────────────────────────────────────────────────────

function useQRCanvas(text, size = 180) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !text) return;

    function drawQR() {
      if (!window.qrcode) return;
      const qr = window.qrcode(0, "M");
      qr.addData(text);
      qr.make();
      const modules = qr.getModuleCount();
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const cellSize = size / modules;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#000000";
      for (let r = 0; r < modules; r++) {
        for (let c = 0; c < modules; c++) {
          if (qr.isDark(r, c)) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    const scriptId = "qrcode-generator-script";
    if (window.qrcode) {
      drawQR();
    } else if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
      script.onload = drawQR;
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.qrcode) { clearInterval(interval); drawQR(); }
      }, 50);
    }
  }, [text, size]);

  return canvasRef;
}

function PixModal({ onClose }) {
  const canvasRef = useQRCanvas(PIX_PAYLOAD, 180);
  const [copied, setCopied] = useState(false);

  function copyKey() {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="pix-modal-overlay" onClick={onClose}>
      <div className="pix-modal" onClick={e => e.stopPropagation()}>
        <button className="pix-modal-close" onClick={onClose}>✕</button>
        <p className="pix-modal-title">Doe via Pix</p>
        <canvas ref={canvasRef} className="pix-modal-canvas" />
        <p className="pix-modal-hint">Escaneie o QR Code ou copie a chave:</p>
        <div className="pix-modal-key-row">
          <span className="pix-modal-key">{PIX_KEY}</span>
          <button className="pix-modal-copy" onClick={copyKey}>
            {copied ? "✓ Copiado!" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [showPix, setShowPix] = useState(false);
  const currentYear = new Date().getFullYear();
  const yearRange = currentYear > START_YEAR ? `${START_YEAR}-${currentYear}` : `${START_YEAR}`;

  return (
    <>
      <footer className="site-footer">
        <p>
          Por favor, reporte bugs ou deixe feedback em{" "}
          <a href={GITHUB_ISSUE_LINK} target="_blank" rel="noopener noreferrer" className="footer-link">
            abrir uma issue no GitHub
          </a>{" "}
        </p>
        <p>
          ou contate o administrador por e-mail:{" "}
          <a href={`mailto:${EMAIL}`} className="footer-link">{EMAIL}</a>.
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

      {showPix && <PixModal onClose={() => setShowPix(false)} />}
    </>
  );
}
