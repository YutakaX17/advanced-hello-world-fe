import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleId = /^[a-z][a-z0-9-]*$/;
const packageName = /^(@[a-z0-9-]+\/)?[a-z][a-z0-9-]*$/;
const exactVersion = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const rootFields = new Set(["$schema", "schemaVersion", "core", "modules"]);
const packageFields = new Set(["id", "package", "version"]);

function exactFields(value, fields, location) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${location} must be an object`);
  }
  const keys = Object.keys(value);
  if (
    keys.some((key) => !fields.has(key)) ||
    [...fields].some((key) => !(key in value))
  ) {
    throw new Error(`${location} has missing or unsupported fields`);
  }
}

function selection(value, location) {
  exactFields(value, packageFields, location);
  if (!moduleId.test(value.id)) throw new Error(`${location}.id is invalid`);
  if (!packageName.test(value.package))
    throw new Error(`${location}.package is invalid`);
  if (!exactVersion.test(value.version)) {
    throw new Error(`${location}.version must be an exact semantic version`);
  }
  return Object.freeze({ ...value });
}

export async function loadManifest(path, { checkInstalled = false } = {}) {
  const raw = JSON.parse(await readFile(path, "utf8"));
  const keys = Object.keys(raw);
  if (keys.some((key) => !rootFields.has(key))) {
    throw new Error("manifest contains unsupported root fields");
  }
  if (raw.schemaVersion !== 1)
    throw new Error(`unsupported manifest schema: ${raw.schemaVersion}`);
  if (!Array.isArray(raw.modules)) throw new Error("modules must be an array");

  const manifest = {
    core: selection(raw.core, "core"),
    modules: raw.modules.map((item, index) =>
      selection(item, `modules[${index}]`),
    ),
  };
  const selections = [manifest.core, ...manifest.modules];
  if (new Set(selections.map(({ id }) => id)).size !== selections.length) {
    throw new Error("module ids must be unique");
  }
  if (
    new Set(selections.map(({ package: name }) => name)).size !==
    selections.length
  ) {
    throw new Error("module packages must be unique");
  }

  if (checkInstalled) {
    for (const item of selections) {
      const entrypoint = fileURLToPath(import.meta.resolve(item.package));
      const metadata = JSON.parse(
        await readFile(resolve(dirname(entrypoint), "../package.json"), "utf8"),
      );
      if (metadata.version !== item.version) {
        throw new Error(
          `${item.package} ${metadata.version} does not match ${item.version}`,
        );
      }
    }
  }
  return Object.freeze(manifest);
}

async function main() {
  const arguments_ = process.argv.slice(2);
  const checkInstalled = arguments_.includes("--check-installed");
  const pathArgument =
    arguments_.find((argument) => !argument.startsWith("--")) ?? "modules.json";
  const manifest = await loadManifest(resolve(pathArgument), {
    checkInstalled,
  });
  console.log(
    `Validated ${1 + manifest.modules.length} frontend package selection(s)`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
