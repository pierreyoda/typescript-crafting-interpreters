import { readFileSync } from "fs";

export const readFile = (filepath: string): string => readFileSync(filepath, { encoding: "utf-8" });
