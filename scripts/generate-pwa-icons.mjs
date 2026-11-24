import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const folder = path.join(process.cwd(), "public", "brand", "icons");
const source = path.join(folder, "sas-logo-512.png");
const input = await readFile(source);
await mkdir(folder, { recursive: true });
const variant = async (size, name) => {
  const image = await sharp(input).resize(size, size, {
    fit: "contain", background: { r: 247, g: 250, b: 248, alpha: 1 }
  }).png().toBuffer();
  await writeFile(path.join(folder, name), image);
};
await variant(192, "sas-pwa-192.png");
await variant(512, "sas-pwa-512.png");
await variant(180, "sas-pwa-apple-180.png");
// Maskable icon: 20% safety padding on every edge so launchers may crop circles.
const foreground = await sharp(input).resize(300, 300, {
  fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }
}).png().toBuffer();
const maskable = await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#f7faf8" }
}).composite([{ input: foreground, left: 106, top: 106 }]).png().toBuffer();
await writeFile(path.join(folder, "sas-pwa-maskable-512.png"), maskable);
console.log("SAS PWA icons generated from approved sas-logo-512.png");
