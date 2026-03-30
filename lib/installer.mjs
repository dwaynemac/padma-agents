import { copyFile, mkdtemp, mkdir, readFile, readdir, rm, rmdir, stat, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import * as tar from 'tar';

const LOCK_FILE_VERSION = 1;
const LOCK_FILE_NAME = 'jetbrains-rules-lock.json';

function normalizeRepoName(repo) {
  return repo.replace(/\.git$/u, '');
}

export function parseSourceSpec(spec, cwd = process.cwd()) {
  if (!spec || !spec.trim()) {
    throw new Error('A repository reference is required.');
  }

  if (/^(https?:)?\/\//u.test(spec)) {
    const url = new URL(spec);
    if (url.hostname !== 'github.com') {
      throw new Error('Only GitHub repository URLs are supported for remote installs.');
    }

    const segments = url.pathname.replace(/^\/+|\/+$/gu, '').split('/').filter(Boolean);
    if (segments.length < 2) {
      throw new Error(`Invalid GitHub repository URL: ${spec}`);
    }

    const owner = segments[0];
    const repo = normalizeRepoName(segments[1]);
    let ref = url.hash ? decodeURIComponent(url.hash.slice(1)) : null;

    if (segments[2] === 'tree' && segments.length >= 4) {
      ref = decodeURIComponent(segments.slice(3).join('/'));
    }

    const displayName = ref ? `${owner}/${repo}#${ref}` : `${owner}/${repo}`;
    return {
      kind: 'github',
      spec,
      sourceKey: `github:${displayName}`,
      owner,
      repo,
      ref,
      displayName,
    };
  }

  const githubMatch = spec.match(/^([\w.-]+)\/([\w.-]+)(?:#(.+))?$/u);
  if (githubMatch) {
    const [, owner, rawRepo, ref = null] = githubMatch;
    const repo = normalizeRepoName(rawRepo);
    const displayName = ref ? `${owner}/${repo}#${ref}` : `${owner}/${repo}`;

    return {
      kind: 'github',
      spec,
      sourceKey: `github:${displayName}`,
      owner,
      repo,
      ref,
      displayName,
    };
  }

  const absolutePath = path.resolve(cwd, spec);
  return {
    kind: 'local',
    spec,
    sourceKey: `local:${absolutePath}`,
    localPath: absolutePath,
    displayName: absolutePath,
  };
}

function getAssistantDir(projectRoot) {
  return path.join(projectRoot, '.aiassistant');
}

function getRulesDir(projectRoot) {
  return path.join(getAssistantDir(projectRoot), 'rules');
}

function getLockFilePath(projectRoot) {
  return path.join(getAssistantDir(projectRoot), LOCK_FILE_NAME);
}

async function loadLockFile(projectRoot) {
  const lockFilePath = getLockFilePath(projectRoot);

  try {
    const raw = await readFile(lockFilePath, 'utf8');
    const data = JSON.parse(raw);

    return {
      version: data.version ?? LOCK_FILE_VERSION,
      sources: Array.isArray(data.sources) ? data.sources : [],
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { version: LOCK_FILE_VERSION, sources: [] };
    }

    throw new Error(`Unable to read lock file: ${error.message}`);
  }
}

async function saveLockFile(projectRoot, lock) {
  await mkdir(getAssistantDir(projectRoot), { recursive: true });
  await writeFile(getLockFilePath(projectRoot), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
}

async function ensureDirectoryExists(directory) {
  let details;

  try {
    details = await stat(directory);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Directory not found: ${directory}`);
    }

    throw error;
  }

  if (!details.isDirectory()) {
    throw new Error(`Expected a directory but found a file: ${directory}`);
  }
}

async function downloadGithubSource(source) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'jetbrains-rules-'));
  const archivePath = path.join(tempDir, 'repo.tar.gz');
  const ref = source.ref ?? 'HEAD';
  const url = `https://api.github.com/repos/${source.owner}/${source.repo}/tarball/${encodeURIComponent(ref)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'jetbrains-rules-cli',
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${source.displayName}: ${response.status} ${response.statusText}`);
  }

  const archive = Buffer.from(await response.arrayBuffer());
  await writeFile(archivePath, archive);
  await tar.x({
    file: archivePath,
    cwd: tempDir,
    strip: 1,
  });

  return {
    rootDir: tempDir,
    cleanup: async () => rm(tempDir, { recursive: true, force: true }),
  };
}

async function prepareSource(spec, cwd = process.cwd()) {
  const source = parseSourceSpec(spec, cwd);

  if (source.kind === 'local') {
    await ensureDirectoryExists(source.localPath);
    return {
      source,
      rootDir: source.localPath,
      cleanup: async () => {},
    };
  }

  const downloaded = await downloadGithubSource(source);
  return {
    source,
    rootDir: downloaded.rootDir,
    cleanup: downloaded.cleanup,
  };
}

async function collectFiles(rootDir, currentDir = rootDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(rootDir, absolutePath));
    } else if (entry.isFile()) {
      files.push(path.relative(rootDir, absolutePath));
    }
  }

  return files.sort();
}

async function removeEmptyParents(startDir, stopDir) {
  let currentDir = startDir;

  while (currentDir.startsWith(stopDir) && currentDir !== stopDir) {
    const entries = await readdir(currentDir);
    if (entries.length > 0) {
      return;
    }

    await rmdir(currentDir);
    currentDir = path.dirname(currentDir);
  }
}

async function removeInstalledFiles(targetRoot, files) {
  for (const relativeFile of files) {
    const absoluteFile = path.join(targetRoot, relativeFile);

    try {
      await unlink(absoluteFile);
      await removeEmptyParents(path.dirname(absoluteFile), targetRoot);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

function detectConflicts(lock, currentSourceKey, files) {
  const conflicts = [];

  for (const source of lock.sources) {
    if (source.sourceKey === currentSourceKey) {
      continue;
    }

    const existingFiles = new Set(source.installedFiles ?? []);
    for (const file of files) {
      if (existingFiles.has(file)) {
        conflicts.push(`${file} (already installed from ${source.displayName})`);
      }
    }
  }

  return conflicts;
}

async function copyRuleFiles(sourceRulesDir, targetRulesDir, files) {
  for (const relativeFile of files) {
    const sourceFile = path.join(sourceRulesDir, relativeFile);
    const targetFile = path.join(targetRulesDir, relativeFile);
    await mkdir(path.dirname(targetFile), { recursive: true });
    await copyFile(sourceFile, targetFile);
  }
}

async function installFromSpec(spec, { projectRoot }) {
  const prepared = await prepareSource(spec, projectRoot);

  try {
    const sourceRulesDir = path.join(prepared.rootDir, 'jetbrains-rules');
    await ensureDirectoryExists(sourceRulesDir);
    const files = await collectFiles(sourceRulesDir);
    if (files.length === 0) {
      throw new Error(`${prepared.source.displayName} does not contain any rule files in jetbrains-rules/.`);
    }

    const lock = await loadLockFile(projectRoot);
    const conflicts = detectConflicts(lock, prepared.source.sourceKey, files);
    if (conflicts.length > 0) {
      throw new Error(`Rule name conflict detected: ${conflicts.join(', ')}`);
    }

    const targetRulesDir = getRulesDir(projectRoot);
    await mkdir(targetRulesDir, { recursive: true });

    const existingIndex = lock.sources.findIndex((entry) => entry.sourceKey === prepared.source.sourceKey);
    if (existingIndex >= 0) {
      await removeInstalledFiles(targetRulesDir, lock.sources[existingIndex].installedFiles ?? []);
    }

    await copyRuleFiles(sourceRulesDir, targetRulesDir, files);

    const entry = {
      sourceKey: prepared.source.sourceKey,
      spec: prepared.source.spec,
      kind: prepared.source.kind,
      displayName: prepared.source.displayName,
      owner: prepared.source.owner ?? null,
      repo: prepared.source.repo ?? null,
      ref: prepared.source.ref ?? null,
      installedFiles: files,
      installedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      lock.sources.splice(existingIndex, 1, entry);
    } else {
      lock.sources.push(entry);
    }

    await saveLockFile(projectRoot, lock);

    return {
      source: prepared.source,
      fileCount: files.length,
      targetDir: targetRulesDir,
    };
  } finally {
    await prepared.cleanup();
  }
}

export async function addRules(spec, { projectRoot = process.cwd() } = {}) {
  return installFromSpec(spec, { projectRoot });
}

export async function updateRules(spec = null, { projectRoot = process.cwd() } = {}) {
  if (spec) {
    return [await installFromSpec(spec, { projectRoot })];
  }

  const lock = await loadLockFile(projectRoot);
  if (lock.sources.length === 0) {
    throw new Error('No installed rule sources found. Run `jetbrains-rules add <repo>` first.');
  }

  const results = [];
  for (const source of lock.sources) {
    results.push(await installFromSpec(source.spec, { projectRoot }));
  }

  return results;
}

export async function listRules({ projectRoot = process.cwd() } = {}) {
  const lock = await loadLockFile(projectRoot);
  return lock.sources;
}

export function getLockFilePathForTests(projectRoot) {
  return getLockFilePath(projectRoot);
}

export function getRulesDirForTests(projectRoot) {
  return getRulesDir(projectRoot);
}
