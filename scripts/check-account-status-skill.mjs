import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const FORBIDDEN = ["account", "org", "meter", "email", "balance"];

const AUDITED_RETURN_LIST =
  "`get_account_status` returns only `success`, `account`, `org`, `meter`, and `message`. It is not the skills version.";

const AUDITED_METER_SOURCE =
  "Production queued card: app job-setup labels, `mailPieceCount`, postage, grant remaining just above the prepaid meter from `get_account_status`, a blank line, then **Open job** last: `https://app.usmail.ai/?job={id}`.";

const ALLOWED_WORDING =
  "`get_account_status` reports whether payment is ready (`payment_ready`) and the build id. It is not the skills version.";

const EMAIL_AND_BALANCE =
  "`get_account_status` returns email and balances.";

const APPROVED_PAY_PER_MAILING =
  "A human approves and pays for each mailing on the app; a meter balance is optional.";

const BESIDE_ACCOUNT_STATUS =
  "`get_account_status` reports whether payment is ready (`payment_ready`) and the build id. " +
  APPROVED_PAY_PER_MAILING;

const FUNDS_THE_PREPAID_METER = "A human registers and funds the prepaid meter.";

const FUNDS_THE_METER = "A human funds the meter.";

// Phrase only. "meter balance is optional" is pay-per-mailing copy and must pass.
const FUNDS_THE_METER_PHRASE = /funds the (?:prepaid )?meter\b/i;

const COPY_FILES = ["README.md", ".cursor-plugin/plugin.json", "skills/usmail-mcp/SKILL.md"];

const TEST_NAME = "g1-plugin-text-get-account-status-fields";

function sentencesOf(text) {
  const sentences = [];
  for (const line of text.split(/\n/)) {
    for (const bit of line.split(/(?<=[.!?])\s+/)) {
      const sentence = bit.trim();
      if (sentence) sentences.push(sentence);
    }
  }
  return sentences;
}

function forbiddenReturnedFields(sentence) {
  if (!sentence.includes("get_account_status")) return [];
  const returnClaim = /\b(returns?|returning|returned|includes?|reports?)\b/i.test(sentence);
  const found = [];
  for (const word of FORBIDDEN) {
    const wordRe = new RegExp(`\\b${word}s?\\b`, "i");
    if (!wordRe.test(sentence)) continue;
    const ticked = new RegExp("`[^`]*\\b" + word + "s?\\b[^`]*`", "i").test(sentence);
    const sourcedFromTool = new RegExp(
      `\\b${word}s?\\b[\\s\\S]{0,80}\\bfrom\\b[\\s\\S]{0,40}get_account_status`,
      "i",
    ).test(sentence);
    if (ticked || sourcedFromTool || returnClaim) found.push(word);
  }
  return found;
}

function hasFundsTheMeter(text) {
  return FUNDS_THE_METER_PHRASE.test(text);
}

function hitsInText(text) {
  const hits = [];
  for (const sentence of sentencesOf(text)) {
    const fields = forbiddenReturnedFields(sentence);
    if (fields.length > 0) hits.push({ fields, sentence });
  }
  if (hasFundsTheMeter(text)) {
    hits.push({ fields: ["funds the meter"], sentence: "funds the meter" });
  }
  return hits;
}

function skillFiles(root) {
  const found = [];
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        walk(path);
      } else if (name.endsWith(".md")) {
        found.push(path);
      }
    }
  }
  walk(root);
  return found.sort();
}

function scanSkills(root) {
  const hits = [];
  for (const path of skillFiles(root)) {
    const text = readFileSync(path, "utf8");
    for (const hit of hitsInText(text)) {
      hits.push({ file: relative(root, path), ...hit });
    }
  }
  return hits;
}

function check(name, ok, detail) {
  return { name, ok, detail };
}

function runSelfChecks(skillsRoot) {
  const checks = [];
  const auditedList = hitsInText(AUDITED_RETURN_LIST);
  checks.push(
    check(
      "rejects-audited-01796aab-return-field-list",
      auditedList.some((hit) => ["account", "org", "meter"].every((word) => hit.fields.includes(word))),
      auditedList.map((hit) => hit.fields.join(", ")).join("; ") || "no hit",
    ),
  );

  const auditedMeter = hitsInText(AUDITED_METER_SOURCE);
  checks.push(
    check(
      "rejects-meter-from-get-account-status",
      auditedMeter.some((hit) => hit.fields.includes("meter")),
      auditedMeter.map((hit) => hit.fields.join(", ")).join("; ") || "no hit",
    ),
  );

  const emailAndBalance = hitsInText(EMAIL_AND_BALANCE);
  checks.push(
    check(
      "rejects-email-and-balance",
      emailAndBalance.some(
        (hit) => hit.fields.includes("email") && hit.fields.includes("balance"),
      ),
      emailAndBalance.map((hit) => hit.fields.join(", ")).join("; ") || "no hit",
    ),
  );

  const allowed = hitsInText(ALLOWED_WORDING);
  checks.push(
    check(
      "allows-payment-ready-and-build-id",
      allowed.length === 0,
      allowed.map((hit) => hit.fields.join(", ")).join("; ") || "no hit",
    ),
  );

  const approved = hitsInText(APPROVED_PAY_PER_MAILING);
  const beside = hitsInText(BESIDE_ACCOUNT_STATUS);
  checks.push(
    check(
      "allows-meter-balance-is-optional",
      approved.length === 0 && beside.length === 0,
      [approved, beside].flat().map((hit) => hit.fields.join(", ")).join("; ") || "no hit",
    ),
  );

  const fundsPrepaid = hitsInText(FUNDS_THE_PREPAID_METER);
  const fundsMeter = hitsInText(FUNDS_THE_METER);
  checks.push(
    check(
      "rejects-funds-the-meter",
      fundsPrepaid.some((hit) => hit.fields.includes("funds the meter")) &&
        fundsMeter.some((hit) => hit.fields.includes("funds the meter")),
      [fundsPrepaid, fundsMeter].flat().map((hit) => hit.fields.join(", ")).join("; ") || "no hit",
    ),
  );

  const treeHits = scanSkills(skillsRoot);
  checks.push(
    check(
      "skills-tree-omits-returned-pii-fields",
      treeHits.length === 0,
      treeHits.map((hit) => `${hit.file}: ${hit.fields.join(", ")}`).join("; ") || "no hit",
    ),
  );

  const repoRoot = fileURLToPath(new URL("..", import.meta.url));
  const copyHits = [];
  for (const rel of COPY_FILES) {
    const text = readFileSync(join(repoRoot, rel), "utf8");
    if (!text.includes(APPROVED_PAY_PER_MAILING) || hasFundsTheMeter(text)) {
      copyHits.push(rel);
    }
  }
  checks.push(
    check(
      "copy-uses-pay-per-mailing-sentence",
      copyHits.length === 0,
      copyHits.join(", ") || "no hit",
    ),
  );
  return checks;
}

function printChecks(checks) {
  for (const item of checks) {
    const status = item.ok ? "PASS" : "FAIL";
    console.log(`${status} ${TEST_NAME} ${item.name}`);
    if (!item.ok) console.log(`  ${item.detail}`);
  }
  const passed = checks.filter((item) => item.ok).length;
  const failed = checks.length - passed;
  console.log(`${passed} passed, ${failed} failed`);
  return failed === 0;
}

function printScan(label, hits) {
  if (hits.length === 0) {
    console.log(`PASS ${label}`);
    console.log("1 passed, 0 failed");
    return true;
  }
  console.log(`FAIL ${label}`);
  for (const hit of hits) {
    const where = hit.file ? `${hit.file}: ` : "";
    console.log(`  ${where}${hit.fields.join(", ")}`);
  }
  console.log(`0 passed, ${hits.length} failed`);
  return false;
}

const scanFlag = process.argv.indexOf("--scan");
if (scanFlag !== -1) {
  const target = process.argv[scanFlag + 1];
  if (!target) {
    console.error("usage: node scripts/check-account-status-skill.mjs --scan <file-or-skills-dir>");
    process.exit(2);
  }
  const isDir = statSync(target).isDirectory();
  const hits = isDir ? scanSkills(target) : hitsInText(readFileSync(target, "utf8"));
  process.exit(printScan(target, hits) ? 0 : 1);
}

const skillsRoot = fileURLToPath(new URL("../skills/", import.meta.url));
const ok = printChecks(runSelfChecks(skillsRoot));
process.exit(ok ? 0 : 1);
