#!/usr/bin/env node
// Repository hygiene check. Fails if private, local or generated files are committed, or
// if a committed text file looks like it contains a credential.
//
//   node scripts/check-repo-hygiene.mjs                      files tracked by Git (CI)
//   node scripts/check-repo-hygiene.mjs --include-untracked  also files that `git add -A`
//                                                            would add (run before a commit)
//
// Findings name the file, the line and the rule. Matched values are never printed.

import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const includeUntracked = process.argv.includes("--include-untracked");

function gitFiles(args) {
    return execFileSync("git", [...args, "-z"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
        .split("\0")
        .filter(Boolean)
        .map((file) => file.replace(/\\/g, "/"));
}

const files = [
    ...gitFiles(["ls-files"]),
    ...(includeUntracked ? gitFiles(["ls-files", "--others", "--exclude-standard"]) : []),
];

// Paths that must never be in the repository. The safe .env.example template, the public
// CV in public/files/ and the other approved public assets match none of these.
const FORBIDDEN_PATHS = [
    { rule: "environment file (only .env.example may be committed)", test: (f) => /(^|\/)\.env(\.[^/]+)?$/.test(f) && !/(^|\/)\.env\.example$/.test(f) },
    { rule: "private content folder", test: (f) => /^private\//.test(f) },
    { rule: "private content checklist", test: (f) => /(^|\/)CONTENT_TO_CONFIRM\.md$/.test(f) },
    { rule: "installed dependencies", test: (f) => /(^|\/)node_modules\//.test(f) },
    { rule: "build output", test: (f) => /^(dist|dist-ssr)\//.test(f) },
    { rule: "local Netlify CLI state", test: (f) => /(^|\/)\.netlify\//.test(f) },
    { rule: "local Claude settings or scratchpad", test: (f) => /(^|\/)\.claude\/settings\.local\.json$/.test(f) || /(^|\/)scratchpad\//i.test(f) },
    { rule: "local screenshots", test: (f) => /(^|\/)[^/]*-screens\//i.test(f) || /(^|\/)screenshots?\//i.test(f) || /(^|\/)[^/]*screenshot[^/]*\.(png|jpe?g|webp|gif)$/i.test(f) },
    { rule: "key or certificate file", test: (f) => /\.(pem|key|p12|pfx|jks|keystore|ppk)$/i.test(f) || /(^|\/)id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$/.test(f) },
    { rule: "credentials file", test: (f) => /(^|\/)(credentials|secrets?|service-account)[^/]*\.json$/i.test(f) || /(^|\/)\.npmrc$/.test(f) },
    { rule: "log file", test: (f) => /\.log$/i.test(f) },
];

// Content patterns for common credential formats.
const SECRET_PATTERNS = [
    { rule: "private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
    { rule: "AWS access key ID", re: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/ },
    { rule: "GitHub token", re: /\b(gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{60,})\b/ },
    { rule: "Netlify access token", re: /\bnf[pcu]_[A-Za-z0-9]{30,}\b/ },
    { rule: "npm token", re: /\bnpm_[A-Za-z0-9]{36}\b/ },
    { rule: "Slack token", re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
    { rule: "Google API key", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
    { rule: "Stripe live key", re: /\b[rs]k_live_[0-9A-Za-z]{20,}\b/ },
    // An EmailJS variable given a value anywhere in a committed file. The values belong
    // in .env.local and in Netlify's environment settings only.
    { rule: "EmailJS variable with a value", re: /^[ \t]*(export[ \t]+)?VITE_EMAILJS_[A-Z_]+[ \t]*=[ \t]*["']?[A-Za-z0-9_-]{4,}/m },
    {
        rule: "hard-coded secret assignment",
        re: /\b(api[_-]?key|secret|access[_-]?token|auth[_-]?token|password|passwd)\b\s*[:=]\s*["'][^"'\s]{16,}["']/i,
    },
];

const BINARY = /\.(png|jpe?g|webp|gif|ico|pdf|woff2?|ttf|otf|eot|mp4|webm|zip|gz|glb|gltf|bin)$/i;
const MAX_SCAN_BYTES = 2 * 1024 * 1024;

const findings = [];

for (const file of files) {
    for (const { rule, test } of FORBIDDEN_PATHS) {
        if (test(file)) findings.push(`${file}: ${rule}`);
    }

    if (BINARY.test(file)) continue;
    let text;
    try {
        if (statSync(file).size > MAX_SCAN_BYTES) continue;
        text = readFileSync(file, "utf8");
    } catch {
        continue; // Deleted in the working tree but still in the index, or unreadable.
    }
    if (text.includes("\0")) continue;

    for (const { rule, re } of SECRET_PATTERNS) {
        const global = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
        for (const match of text.matchAll(global)) {
            const line = text.slice(0, match.index).split("\n").length;
            findings.push(`${file}:${line}: possible ${rule} (value not shown)`);
        }
    }
}

const scope = includeUntracked ? "tracked and to-be-added" : "tracked";
if (findings.length) {
    console.error(`Repository hygiene check FAILED: ${findings.length} finding(s) in ${files.length} ${scope} files.`);
    for (const finding of findings) console.error(`  - ${finding}`);
    console.error("Remove these from the commit (git rm --cached <file>) and rotate any credential that was pushed.");
    process.exit(1);
}
console.log(`Repository hygiene check passed: ${files.length} ${scope} files, no private, local or credential files.`);
