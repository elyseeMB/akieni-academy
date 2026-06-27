import { readFileSync, writeFileSync, readdirSync } from "fs";
import { parse } from "node-html-parser";

function getFolders() {
  return readdirSync(".").filter((dir) => /^tp\d+/.test(dir));
}

function readHTML(folder) {
  return readFileSync(`${folder}/index.html`, "utf-8");
}

function extractTitle(root) {
  return root.querySelector("title")?.text ?? "";
}

function extractStatus(root) {
  return (
    root.querySelector('meta[name="status"]')?.getAttribute("content") ??
    "online"
  );
}

function extractDescription(root) {
  return (
    root.querySelector('meta[name="description"]')?.getAttribute("content") ??
    ""
  );
}

function buildTP(folder) {
  const root = parse(readHTML(folder));
  return {
    name: folder,
    title: extractTitle(root),
    description: extractDescription(root),
    url: `https://${folder}.akieniacademy.eembouz.com`,
    status: extractStatus(root),
  };
}

const tps = getFolders().map(buildTP);

writeFileSync("listing.json", JSON.stringify({ tps }));
