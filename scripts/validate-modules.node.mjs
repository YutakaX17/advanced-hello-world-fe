import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { loadManifest } from "./validate-modules.mjs";

test("repository manifest is valid", async () => {
  const manifest = await loadManifest("modules.json");
  assert.equal(manifest.core.id, "platform-core");
  assert.deepEqual(manifest.modules, []);
});

test("duplicate module ids are rejected", async () => {
  const directory = await mkdtemp(join(tmpdir(), "frontend-manifest-"));
  const raw = JSON.parse(await readFile("modules.json", "utf8"));
  raw.modules = [{ ...raw.core, package: "@yutakax17/another-package" }];
  const path = join(directory, "modules.json");
  await writeFile(path, JSON.stringify(raw));

  await assert.rejects(loadManifest(path), /module ids must be unique/);
});
