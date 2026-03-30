import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { addRules, listRules, updateRules } from './installer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(__dirname, '..', 'package.json');

function helpText() {
  return `Usage: jetbrains-rules <command> [options]
Install JetBrains AI Assistant rules from a repository's jetbrains-rules directory.

Commands:
  add <repo>        Install rules from a repo into .aiassistant/rules
  update [repo]     Update installed rules from the lock file or a specific repo
  list              List installed rule sources from the lock file

Supported repo formats:
  owner/repo
  owner/repo#ref
  https://github.com/owner/repo
  https://github.com/owner/repo/tree/ref
  /local/path/to/repo

Examples:
  jetbrains-rules add dwaynemac/padma-agents
  jetbrains-rules add dwaynemac/padma-agents#main
  jetbrains-rules update
  jetbrains-rules update dwaynemac/padma-agents
  jetbrains-rules list`;
}

async function readVersion() {
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  return packageJson.version;
}

function writeLine(stream, message = '') {
  stream.write(`${message}\n`);
}

export async function runCli(argv, { cwd, stdout, stderr }) {
  const [command, ...rest] = argv;

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    writeLine(stdout, helpText());
    return;
  }

  if (command === '--version' || command === '-v') {
    writeLine(stdout, await readVersion());
    return;
  }

  try {
    if (command === 'add') {
      const repo = rest[0];
      if (!repo) {
        throw new Error('Missing repository argument for `add`.');
      }

      const result = await addRules(repo, { projectRoot: cwd });
      writeLine(stdout, `Installed ${result.fileCount} rule file(s) from ${result.source.displayName} into ${result.targetDir}.`);
      return;
    }

    if (command === 'update') {
      const repo = rest[0] ?? null;
      const results = await updateRules(repo, { projectRoot: cwd });

      for (const result of results) {
        writeLine(stdout, `Updated ${result.fileCount} rule file(s) from ${result.source.displayName}.`);
      }

      return;
    }

    if (command === 'list') {
      const sources = await listRules({ projectRoot: cwd });
      if (sources.length === 0) {
        writeLine(stdout, 'No installed JetBrains rule sources found.');
        return;
      }

      for (const source of sources) {
        writeLine(stdout, `${source.displayName} (${source.installedFiles.length} file(s))`);
      }

      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    writeLine(stderr, error.message);
    process.exitCode = 1;
  }
}
