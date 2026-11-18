"use client";

/* eslint-disable react-hooks/set-state-in-effect, @next/next/no-img-element */

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export default function QRPage() {
  const [url, setUrl] = useState("");
  const [png, setPng] = useState("");
  const [svg, setSvg] = useState("");

  useEffect(() => {
    const production = process.env.NEXT_PUBLIC_PRODUCTION_URL;
    const target = production || window.location.origin;
    setUrl(target);
    QRCode.toDataURL(target, { width: 800, margin: 4, color: { dark: "#514878", light: "#fffaf5" }, errorCorrectionLevel: "H" }).then(setPng);
    QRCode.toString(target, { type: "svg", width: 800, margin: 4, color: { dark: "#514878", light: "#fffaf5" }, errorCorrectionLevel: "H" }).then(setSvg);
  }, []);

  const download = (content: string, name: string, type: string) => {
    const blob = content.startsWith("data:")
      ? (() => { const byte = atob(content.split(",")[1]); const bytes = new Uint8Array(byte.length); for (let i = 0; i < byte.length; i++) bytes[i] = byte.charCodeAt(i); return new Blob([bytes], { type }); })()
      : new Blob([content], { type });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = name; link.click(); URL.revokeObjectURL(link.href);
  };

  return (
    <main className="qr-page">
      <section className="qr-card">
        <p>♕</p><h1>Scan to enter Mera Bacha&apos;s Little Secret <span>👑</span></h1>
        {png && <img src={png} alt="QR code for Mera Bacha's Little Secret" />}
        <h2>A little surprise, made just for you.</h2><small>{url || "Production URL"}</small>
      </section>
      <div className="qr-actions"><button onClick={() => download(png, "mera-bacha-little-secret.png", "image/png")} disabled={!png}>Download PNG</button><button onClick={() => download(svg, "mera-bacha-little-secret.svg", "image/svg+xml")} disabled={!svg}>Download SVG</button><button onClick={() => window.print()}>Print A4 card</button></div>
      <style>{`
        .qr-page{min-height:100vh;background:radial-gradient(ellipse at 85% 85%,rgba(115,103,166,.18),transparent 40%),linear-gradient(135deg,#fffaf5,#e2e8f3 62%,#e9e3f2);color:#46466f;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;font-family:Arial,sans-serif}.qr-card{width:min(580px,100%);min-height:760px;background:linear-gradient(145deg,#fffaf5,#dce3f0 58%,#ddd8ec);border:10px solid rgba(255,255,255,.86);border-radius:30px;box-shadow:0 20px 60px rgba(70,70,111,.18);text-align:center;padding:40px 50px}.qr-card>p{font-size:58px;color:#6d5ca9;margin:0}.qr-card h1{font-family:Georgia,serif;font-size:36px}.qr-card img{width:min(390px,100%);display:block;margin:20px auto;border-radius:8px}.qr-card h2{font-family:Georgia,serif;font-size:24px}.qr-card small{overflow-wrap:anywhere}.qr-actions{display:flex;gap:10px;margin-top:18px}.qr-actions button{border:0;border-radius:999px;background:linear-gradient(110deg,#5f5a95,#5575a8);color:white;padding:12px 18px}@media print{@page{size:A4;margin:15mm}.qr-page{min-height:auto;padding:0}.qr-actions{display:none}.qr-card{margin:auto}}
      `}</style>
    </main>
  );
}
