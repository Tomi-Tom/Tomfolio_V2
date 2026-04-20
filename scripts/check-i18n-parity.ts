import * as fs from "fs";
import * as path from "path";

const LOCALES = ["en", "fr", "es", "de", "zh", "ko"] as const;
const MESSAGES_DIR = path.join(__dirname, "..", "src", "i18n", "messages");

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const en = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, "en.json"), "utf8"));
const enKeys = new Set(flattenKeys(en));

let hasError = false;
for (const locale of LOCALES) {
  if (locale === "en") continue;
  const data = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), "utf8"));
  const keys = new Set(flattenKeys(data));

  const missing = [...enKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !enKeys.has(k));

  if (missing.length || extra.length) {
    hasError = true;
    console.error(`\n[${locale}.json]`);
    if (missing.length) {
      console.error(`  MISSING (${missing.length}):`);
      for (const k of missing.slice(0, 30)) console.error(`    - ${k}`);
      if (missing.length > 30) console.error(`    ... and ${missing.length - 30} more`);
    }
    if (extra.length) {
      console.error(`  EXTRA (${extra.length}):`);
      for (const k of extra.slice(0, 30)) console.error(`    + ${k}`);
      if (extra.length > 30) console.error(`    ... and ${extra.length - 30} more`);
    }
  }
}

if (hasError) {
  console.error("\nKey parity check failed.");
  process.exit(1);
}
console.log(`All locale files match en.json key set (${enKeys.size} keys).`);
