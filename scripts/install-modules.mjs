import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadManifest } from "./validate-modules.mjs";

function repositoryName(repository) {
  return repository
    .slice(repository.lastIndexOf("/") + 1)
    .replace(/\.git$/, "");
}

function run(command, arguments_, cwd) {
  execFileSync(command, arguments_, { cwd, stdio: "inherit" });
}

export function packageDirectories(manifest, root) {
  return manifest.selections.map((selection) => ({
    selection,
    path: resolve(root, repositoryName(selection.repository)),
  }));
}

async function main() {
  const arguments_ = process.argv.slice(2);
  const localIndex = arguments_.indexOf("--local-root");
  const useLocal = localIndex >= 0;
  const root = resolve(
    useLocal ? arguments_[localIndex + 1] : dirname(process.cwd()),
  );
  const manifest = await loadManifest(resolve("modules.json"));
  const selections = [manifest.core, ...manifest.modules];
  const packages = packageDirectories({ selections }, root);

  for (const { selection, path } of packages) {
    if (!existsSync(path)) {
      if (useLocal) {
        throw new Error(`local module repository is missing: ${path}`);
      }
      run("git", ["clone", selection.repository, path], process.cwd());
      run("git", ["checkout", "--detach", selection.ref], path);
    } else if (!useLocal) {
      const head = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: path,
        encoding: "utf8",
      }).trim();
      if (head !== selection.ref) {
        throw new Error(
          `${path} is not at ${selection.ref}; use --local-root for editable overrides`,
        );
      }
    }
    run("npm", ["ci"], path);
  }

  run("npm", ["ci"], process.cwd());
  run("node", ["scripts/generate-modules.mjs"], process.cwd());
  run(
    "node",
    ["scripts/validate-modules.mjs", "--check-installed"],
    process.cwd(),
  );
}

const invokedPath = process.argv[1]
  ? fileURLToPath(new URL(import.meta.url)) === resolve(process.argv[1])
  : false;
if (invokedPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
