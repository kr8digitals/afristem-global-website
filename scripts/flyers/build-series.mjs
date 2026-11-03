import fs from "node:fs";
import { execSync } from "node:child_process";
import opentype from "opentype.js";
import { Resvg } from "@resvg/resvg-js";
import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";

const ROOT = "/home/user/afristem-global-website";
const BASE = `${ROOT}/scripts/flyers`;
const FD = `${BASE}/node_modules/@expo-google-fonts/montserrat`;
const PD = `${BASE}/node_modules/@expo-google-fonts/playfair-display`;
const files = {
  black: `${FD}/900Black/Montserrat_900Black.ttf`,
  extra: `${FD}/800ExtraBold/Montserrat_800ExtraBold.ttf`,
  bold: `${FD}/700Bold/Montserrat_700Bold.ttf`,
  semi: `${FD}/600SemiBold/Montserrat_600SemiBold.ttf`,
  med: `${FD}/500Medium/Montserrat_500Medium.ttf`,
  pf900: `${PD}/900Black/PlayfairDisplay_900Black.ttf`,
  pf900i: `${PD}/900Black_Italic/PlayfairDisplay_900Black_Italic.ttf`,
  pf700i: `${PD}/700Bold_Italic/PlayfairDisplay_700Bold_Italic.ttf`,
};
const fonts = Object.fromEntries(Object.entries(files).map(([k, v]) => [k, opentype.parse(fs.readFileSync(v).buffer)]));
const weight = { black: 900, extra: 800, bold: 700, semi: 600, med: 500, pf900: 900, pf900i: 900, pf700i: 700 };
const familyOf = (f) => (f.startsWith("pf") ? "Playfair Display" : "Montserrat");
const styleOf = (f) => (f.endsWith("i") ? "italic" : "normal");

const W = 1240, H = 1240, M = 56;
const C = {
  cream: "#FFFCF3", ink: "#0B1B3A", navy: "#0A1730",
  blue: "#1740C8", magenta: "#B000B0", red: "#E23A2E",
  gold: "#FFC42D", muted: "#6B6558",
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const adv = (str, f, size, ls = 0) => {
  const font = fonts[f];
  const chars = [...str];
  const width = chars.reduce((a, ch) => a + (font.charToGlyph(ch).advanceWidth || 0), 0);
  return (width * size) / font.unitsPerEm + Math.max(0, chars.length - 1) * ls;
};
let out = [];
const add = (s) => out.push(s);
const text = (str, x, y, o = {}) => {
  const { f = "semi", size = 18, fill = C.ink, anchor = "start", ls = 0, opacity = 1 } = o;
  add(`<text x="${x}" y="${y}" font-family="${familyOf(f)}" font-weight="${weight[f]}" font-style="${styleOf(f)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${opacity}">${esc(str)}</text>`);
};
const rect = (x, y, w, h, r, fill, extra = "") => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`);
const line = (x1, y1, x2, y2, stroke, width = 1, extra = "") => add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`);
const uri = (p, mime) => `data:${mime};base64,${fs.readFileSync(p).toString("base64")}`;
const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");

await QRCode.toFile(`${BASE}/qr-brand.png`, "https://afristemglobal.org/register", { width: 440, margin: 2, color: { dark: C.ink, light: "#FFFFFF" } });
await QRCode.toFile(`${BASE}/qr-closed.png`, "https://afristemglobal.org/programmes/stem-kids-championship", { width: 440, margin: 2, color: { dark: C.ink, light: "#FFFFFF" } });
fs.mkdirSync(`${BASE}/out/png`, { recursive: true });
fs.mkdirSync(`${BASE}/out/social`, { recursive: true });

const build = (n) => {
  out = [];
  add(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  add(`<defs>
  <radialGradient id="paper" cx="62%" cy="38%" r="78%">
    <stop offset="0" stop-color="#FFFEF8"/><stop offset="0.6" stop-color="#FFFCF3"/><stop offset="1" stop-color="#F5EBD6"/>
  </radialGradient>
  <radialGradient id="cool" cx="1180" cy="40" r="620" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#2B55D8" stop-opacity="0.16"/>
    <stop offset="0.55" stop-color="#2B55D8" stop-opacity="0.05"/>
    <stop offset="1" stop-color="#2B55D8" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="bluearc" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#1740C8"/><stop offset="0.55" stop-color="#B000B0"/><stop offset="1" stop-color="#E23A2E"/>
  </linearGradient>
  <linearGradient id="goldbar" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#FFC42D"/><stop offset="0.55" stop-color="#FFE18A"/><stop offset="1" stop-color="#E9A800"/>
  </linearGradient>
</defs>`);

  rect(0, 0, W, H, 0, "url(#paper)");
  add(`<ellipse cx="1190" cy="20" rx="700" ry="620" fill="url(#cool)"/>`);
  add(`<circle cx="1240" cy="0" r="390" fill="none" stroke="url(#bluearc)" stroke-width="1.8" opacity="0.45"/>`);
  add(`<circle cx="1240" cy="0" r="505" fill="none" stroke="url(#bluearc)" stroke-width="1.1" opacity="0.22"/>`);
  add(`<circle cx="1240" cy="0" r="620" fill="none" stroke="#1740C8" stroke-width="0.8" opacity="0.09"/>`);

  /* halftone sun */
  const cx = 322, cy = 715, R = 292;
  const gold = [255, 196, 45], coral = [255, 107, 91], magenta = [176, 0, 176];
  const step = 12, ang = Math.PI / 6, cosA = Math.cos(ang), sinA = Math.sin(ang), span = 340;
  for (let u = -span; u <= span; u += step) {
    for (let v = -span; v <= span; v += step) {
      const x = cx + u * cosA - v * sinA;
      const y = cy + u * sinA + v * cosA;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist > R) continue;
      const t = dist / R;
      const base = Math.max(0.6, 6.3 * (1 - t) + 0.5);
      const j = ((Math.sin(u * 12.9898 + v * 78.233) * 43758.5453) % 1 + 1) % 1;
      const dr = base * (0.86 + 0.28 * j);
      const col = t < 0.55 ? lerp(gold, coral, t / 0.55) : lerp(coral, magenta, (t - 0.55) / 0.45);
      const fade = Math.min(1, Math.max(0, (0.96 - t) / 0.14));
      if (fade <= 0.02) continue;
      add(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(dr * fade).toFixed(2)}" fill="${hex(col)}" opacity="${(0.95 * fade).toFixed(3)}"/>`);
    }
  }

  const cm = (x, y, dx, dy) => {
    line(x, y, x + dx, y, "#C98F12", 1, 'opacity="0.55"');
    line(x, y, x, y + dy, "#C98F12", 1, 'opacity="0.55"');
  };
  cm(24, 24, 16, 16); cm(1216, 24, -16, 16); cm(24, 1216, 16, -16); cm(1216, 1216, -16, -16);

  /* header */
  add(`<image x="${M}" y="44" width="86" height="50" preserveAspectRatio="xMinYMid meet" xlink:href="${uri(`${ROOT}/public/images/brand/logo.png`, "image/png")}"/>`);
  text("×", 152, 82, { f: "med", size: 15, fill: C.muted });
  add(`<image x="172" y="47" width="80" height="45" preserveAspectRatio="xMinYMid meet" xlink:href="${uri(`${ROOT}/public/images/partners/prime-stem-nigeria.png`, "image/png")}"/>`);
  text("IN PARTNERSHIP", M, 112, { f: "bold", size: 8.2, ls: 2.4, fill: C.muted });
  text("5TH EDITION", 1184, 76, { f: "extra", size: 12, ls: 4.2, fill: C.blue, anchor: "end" });
  text("INTERNATIONAL  ·  2026", 1184, 94, { f: "semi", size: 9.2, ls: 2.6, fill: C.muted, anchor: "end" });
  line(M, 124, 1184, 124, C.ink, 0.8, 'opacity="0.25"');

  /* title */
  text("STEM KIDS", M, 200, { f: "black", size: 56, ls: 9, fill: C.blue });
  text("Championship", M - 4, 308, { f: "pf900i", size: 112, fill: C.magenta, ls: -1 });
  rect(M, 342, 88, 4, 0, "url(#goldbar)");
  text("BASIC 3 – 6   ·   JSS 1 – 3   ·   PRIMARY & SECONDARY", M, 380, { f: "semi", size: 10.2, ls: 2.4, fill: C.muted });

  /* countdown */
  const w100 = adv(String(n), "black", 100);
  const numSize = Math.min(470, 420 / (w100 / 100));
  const numBase = 715 + (0.7 * numSize) / 2;
  text(String(n), cx, numBase, { f: "black", size: numSize, fill: C.ink, anchor: "middle", ls: -3 });
  text(n === 1 ? "DAY TO GO" : "DAYS TO GO", cx, 1040, { f: "black", size: 27, ls: 9, fill: C.ink, anchor: "middle" });

  /* right column */
  const X = 640;
  text("EXAM DAY", X, 452, { f: "bold", size: 10, ls: 3.2, fill: C.blue });
  line(X + 98, 449, 1184, 449, "#C98F12", 0.9, 'opacity="0.55"');
  text("SATURDAY, 14 NOVEMBER 2026", X, 494, { f: "extra", size: 23, fill: C.ink });
  text("11:00 AM", X, 542, { f: "black", size: 40, fill: C.blue });
  text("SELECTED CENTRES ACROSS AFRICA", X, 572, { f: "semi", size: 9.6, ls: 2.3, fill: C.muted });
  line(X, 604, 1184, 604, C.ink, 0.8, 'opacity="0.15"');
  text("IN PRIZES", X, 642, { f: "bold", size: 10, ls: 3.2, fill: C.blue });
  text("₦1,000,000", X - 2, 704, { f: "black", size: 52, ls: -1, fill: C.magenta });
  text("Trophies, medals and free tutorials", X, 732, { f: "med", size: 12.5, fill: C.muted });
  line(X, 762, 1184, 762, C.ink, 0.8, 'opacity="0.15"');
  text("FIRST ROUND  ·  CUT-OFF MARK", X, 800, { f: "bold", size: 10, ls: 2.8, fill: C.blue });
  text("50%", X - 2, 848, { f: "black", size: 44, fill: C.red });
  text("to qualify", X + 106, 846, { f: "semi", size: 16, fill: C.ink });

  /* registration block */
  const by = 884, bh = 160, bx = 628, bw = 556, regDays = n - 8;
  if (n <= 7) {
    add(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" fill="#0B1B3A"/>`);
    add(`<rect x="${bx + 2}" y="${by + 2}" width="${bw - 4}" height="${bh - 4}" rx="2" fill="none" stroke="#FFC42D" stroke-width="1" opacity="0.55"/>`);
    text("REGISTRATION", bx + 26, by + 34, { f: "extra", size: 10, ls: 3.2, fill: C.gold });
    text("CLOSED", bx + 22, by + 104, { f: "black", size: 54, fill: "#FFFFFF" });
    text("FOR ENQUIRIES CALL 0810 554 1242", bx + 26, by + 138, { f: "bold", size: 10, ls: 1.2, fill: "#F3EFE4" });
    line(bx + 330, by + 26, bx + 330, by + bh - 26, "#FFFFFF", 0.9, 'opacity="0.25"');
    text("PRIME STEM", bx + bw - 26, by + 78, { f: "extra", size: 16, fill: "#FFFFFF", anchor: "end" });
    text("NIGERIA", bx + bw - 26, by + 98, { f: "extra", size: 16, fill: "#FFFFFF", anchor: "end" });
    text("RC 9452641", bx + bw - 26, by + 126, { f: "semi", size: 8.6, ls: 1, fill: "#93A3C4", anchor: "end" });
  } else {
    add(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" fill="url(#goldbar)"/>`);
    text(n === 8 ? "REGISTRATION CLOSES" : "REGISTRATION CLOSES IN", bx + 26, by + 34, { f: "extra", size: 10, ls: 3.2, fill: "#6A4A00" });
    if (n === 8) {
      text("TODAY", bx + 22, by + 108, { f: "black", size: 54, fill: C.ink });
    } else {
      text(String(regDays), bx + 22, by + 110, { f: "black", size: 88, fill: C.ink });
      text(regDays === 1 ? "DAY" : "DAYS", bx + 82, by + 100, { f: "black", size: 23, ls: 6, fill: C.ink });
    }
    text("FRIDAY, 6 NOVEMBER 2026", bx + 26, by + 138, { f: "bold", size: 10.6, ls: 1.4, fill: "#6A4A00" });
    line(bx + 300, by + 26, bx + 300, by + bh - 26, "#0B1B3A", 0.9, 'opacity="0.25"');
    text("₦4,000", bx + bw - 26, by + 98, { f: "black", size: 34, fill: C.ink, anchor: "end" });
    text("PER CANDIDATE", bx + bw - 26, by + 120, { f: "bold", size: 8.8, ls: 2.2, fill: "#6A4A00", anchor: "end" });
  }

  /* footer */
  const fy = 1064;
  rect(0, fy, W, H - fy, 0, C.navy);
  rect(0, fy, W, 4, 0, "url(#goldbar)");
  text(n <= 7 ? "FOR ENQUIRIES & SPONSORSHIP" : "HOW TO REGISTER", M, fy + 32, { f: "bold", size: 9, ls: 2.8, fill: C.gold });
  text(
    n <= 7 ? "Sam 0810 554 1242  ·  Vera 0703 462 3460  ·  Sorochi 0701 868 4358" : "Pay to PRIME STEM NIGERIA  ·  UBA 1025357212  ·  send payment evidence and location to",
    M, fy + 54, { f: "med", size: 12.2, fill: "#F3EFE4" }
  );
  text(
    n <= 7 ? "primestemnigeria@gmail.com  ·  afristemglobal.org  ·  selected centres across Africa" : "primestemnigeria@gmail.com or 0810 554 1242 for your code  ·  register at afristemglobal.org/register",
    M, fy + 74, { f: "med", size: 12.2, fill: "#F3EFE4" }
  );
  line(M, fy + 92, 1050, fy + 92, "#FFFFFF", 0.8, 'opacity="0.18"');
  text(n <= 7 ? "PROGRAMME" : "ENQUIRIES", M, fy + 113, { f: "bold", size: 8.6, ls: 2.4, fill: C.gold });
  text(n <= 7 ? "STEM Kids Championship  ·  5th Edition  ·  2026" : "Sam 0810 554 1242   ·   Vera 0703 462 3460   ·   Sorochi 0701 868 4358", M + (n <= 7 ? 112 : 82), fy + 113, { f: "semi", size: n <= 7 ? 10.6 : 11, fill: "#DCD8CD" });
  text("AFRISTEM GLOBAL  ·  RC 9452641", M, fy + 137, { f: "semi", size: 9.4, ls: 0.6, fill: "#93A3C4" });
  text("Inspiring the Next Generation of African Innovators", 1050, fy + 137, { f: "pf700i", size: 11, fill: "#93A3C4", anchor: "end" });
  rect(1086, fy + 20, 106, 106, 2, "#FFFFFF");
  add(`<image x="1093" y="${fy + 27}" width="92" height="92" xlink:href="${uri(`${BASE}/${n <= 7 ? "qr-closed" : "qr-brand"}.png`, "image/png")}"/>`);
  text(n <= 7 ? "SCAN FOR DETAILS" : "SCAN TO REGISTER", 1140, fy + 146, { f: "extra", size: 7.4, ls: 1.7, fill: C.gold, anchor: "middle" });

  add("</svg>");
  fs.writeFileSync(`${BASE}/out/countdown-${n}-days.svg`, out.join("\n"));
  const png = new Resvg(out.join("\n"), {
    fitTo: { mode: "width", value: 2400 },
    font: { fontFiles: Object.values(files), loadSystemFonts: false, defaultFontFamily: "Montserrat" },
    background: C.cream,
  }).render().asPng();
  fs.writeFileSync(`${BASE}/out/png/SKC-countdown-${n}-days.png`, png);
  return png;
};

const pdf = await PDFDocument.create();
pdf.setTitle("STEM Kids Championship 2026 — countdown series (11 to 1 day)");
pdf.setAuthor("AFRISTEM Global / Prime STEM Nigeria");
for (let n = 11; n >= 1; n--) {
  const png = build(n);
  const img = await pdf.embedPng(png);
  const page = pdf.addPage([595.28, 595.28]);
  page.drawImage(img, { x: 0, y: 0, width: 595.28, height: 595.28 });
  execSync(`convert ${BASE}/out/png/SKC-countdown-${n}-days.png -resize 1800x1800 ${BASE}/out/social/SKC-countdown-${n}-days.png`);
  console.log("built", n);
}
fs.writeFileSync(`${BASE}/out/SKC-2026-Countdown-Series.pdf`, await pdf.save());
console.log("pdf done");
