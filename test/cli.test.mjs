import { execFile as execFileCallback } from 'node:child_process';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import assert from 'node:assert/strict';

import { getLockFilePathForTests, getRulesDirForTests } from '../lib/installer.mjs';

const execFile = promisify(execFileCallback);
const cliPath = path.resolve('bin/cli.mjs');
const fixtureSourceRepo = path.resolve('test/fixtures/source-repo');

async function makeTempDir(prefix) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

async function createProjectDir() {
  const projectDir = await makeTempDir('jetbrains-rules-project-');
  await mkdir(projectDir, { recursive: true });
  return projectDir;
}

async function createSourceRepo() {
  const sourceDir = await makeTempDir('jetbrains-rules-source-');
  await cp(fixtureSourceRepo, sourceDir, { recursive: true });
  return sourceDir;
}

async function runCli(args, cwd) {
  return execFile(process.execPath, [cliPath, ...args], { cwd });
}

test('add installs rules into .aiassistant/rules and writes a lock file', async () => {
  const projectDir = await createProjectDir();
  const sourceDir = await createSourceRepo();

  try {
    const { stdout } = await runCli(['add', sourceDir], projectDir);
    assert.match(stdout, /Installed 2 rule file\(s\)/u);

    const installedRule = await readFile(path.join(getRulesDirForTests(projectDir), 'alpha.md'), 'utf8');
    assert.equal(installedRule.trim(), 'alpha rule');

    const nestedRule = await readFile(path.join(getRulesDirForTests(projectDir), 'nested', 'beta.md'), 'utf8');
    assert.equal(nestedRule.trim(), 'beta rule');

    const lock = JSON.parse(await readFile(getLockFilePathForTests(projectDir), 'utf8'));
    assert.equal(lock.sources.length, 1);
    assert.deepEqual(lock.sources[0].installedFiles, ['alpha.md', 'nested/beta.md']);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
    await rm(sourceDir, { recursive: true, force: true });
  }
});

test('add fails when the source repository does not contain a jetbrains-rules directory', async () => {
  const projectDir = await createProjectDir();
  const sourceDir = await makeTempDir('jetbrains-rules-empty-');

  try {
    await assert.rejects(
      runCli(['add', sourceDir], projectDir),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /Directory not found: .*jetbrains-rules/u);
        return true;
      },
    );
  } finally {
    await rm(projectDir, { recursive: true, force: true });
    await rm(sourceDir, { recursive: true, force: true });
  }
});

test('update refreshes files from the lock file and removes stale files from the same source', async () => {
  const projectDir = await createProjectDir();
  const sourceDir = await createSourceRepo();

  try {
    await runCli(['add', sourceDir], projectDir);

    await writeFile(path.join(sourceDir, 'jetbrains-rules', 'alpha.md'), 'alpha rule updated\n', 'utf8');
    await rm(path.join(sourceDir, 'jetbrains-rules', 'nested', 'beta.md'));
    await writeFile(path.join(sourceDir, 'jetbrains-rules', 'gamma.md'), 'gamma rule\n', 'utf8');

    const { stdout } = await runCli(['update'], projectDir);
    assert.match(stdout, /Updated 2 rule file\(s\)/u);

    const updatedAlpha = await readFile(path.join(getRulesDirForTests(projectDir), 'alpha.md'), 'utf8');
    assert.equal(updatedAlpha.trim(), 'alpha rule updated');

    const gammaRule = await readFile(path.join(getRulesDirForTests(projectDir), 'gamma.md'), 'utf8');
    assert.equal(gammaRule.trim(), 'gamma rule');

    await assert.rejects(
      readFile(path.join(getRulesDirForTests(projectDir), 'nested', 'beta.md'), 'utf8'),
      { code: 'ENOENT' },
    );

    const lock = JSON.parse(await readFile(getLockFilePathForTests(projectDir), 'utf8'));
    assert.deepEqual(lock.sources[0].installedFiles, ['alpha.md', 'gamma.md']);
  } finally {
    await rm(projectDir, { recursive: true, force: true });
    await rm(sourceDir, { recursive: true, force: true });
  }
});
