import { readFileSync } from "fs";

const name = process.argv[2];
const { tps } = JSON.parse(readFileSync("./listing.json", "utf-8"));
const tp = tps.find((t) => t.name === name);
console.log(tp?.status ?? "online");
