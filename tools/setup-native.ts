import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const revision = "53426cf02bf986a5e781abc4f953d79989c6dc05";
const repository = "https://github.com/expo/exact";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sdk = resolve(root, process.env.EXACT ?? "../.tooling/exact");

function fail(message: string): never {
  console.error(`native:setup: ${message}`);
  process.exit(1);
}

function run(command: string[], cwd: string): void {
  const result = Bun.spawnSync(command, { cwd, stdin: "inherit", stdout: "inherit", stderr: "inherit" });
  if (result.exitCode !== 0) {
    fail(`${command.join(" ")} failed in ${cwd} (exit ${result.exitCode}).`);
  }
}

function head(): string {
  const result = Bun.spawnSync(["git", "-C", sdk, "rev-parse", "HEAD"], {
    stdout: "pipe", stderr: "pipe",
  });
  if (result.exitCode !== 0) fail(`${sdk} exists but is not a readable Git checkout. Choose another EXACT path.`);
  return result.stdout.toString().trim();
}

if (Bun.version !== "1.4.2") fail(`Bun 1.4.2 is required; found ${Bun.version}.`);

const created = !existsSync(sdk);
if (created) {
  mkdirSync(dirname(sdk), { recursive: true });
  run(["git", "clone", "--no-checkout", repository, sdk], root);
  run(["git", "checkout", "--detach", revision], sdk);
}

const actual = head();
if (actual !== revision) {
  fail(`Exact at ${sdk} is ${actual}; required ${revision}. Existing checkouts are never changed. Set EXACT to a separate checkout at the required revision.`);
}
if (!existsSync(resolve(sdk, "scripts/app-cli.mjs"))) fail(`Exact at ${sdk} is missing scripts/app-cli.mjs.`);

if (created) run([process.execPath, "install", "--frozen-lockfile"], sdk);
run([process.execPath, "link"], root);
run([process.execPath, "install"], root);
run([process.execPath, "install"], resolve(root, "examples/native"));

for (const directory of ["avatars", "card"]) {
  cpSync(resolve(root, "examples/native/node_modules/@rightui/ui/assets", directory),
    resolve(root, "examples/native/assets", directory), { recursive: true });
}

console.log(`Native demo dependencies ready. Exact: ${sdk} (${revision}).`);
console.log("No native build or device launch was performed.");
console.log("Next: read docs/NATIVE.md for platform setup checks and build commands.");
