// Resolve installed JavaScript entry points directly: no .bin/.cmd shortcut or global PATH lookup.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const TOOLS = {
  install: { name: 'electron', version: '45.0.0', file: 'install.js' },
  start: { name: 'electron', version: '45.0.0', file: 'cli.js' },
  pack: { name: 'electron-builder', version: '26.18.0', file: 'cli.js' },
};
function resolveTool(command, root = ROOT) {
  const tool = TOOLS[command];
  if (!tool) throw new Error(`Unknown desktop command: ${command}`);
  const fromProject = createRequire(path.join(root, 'package.json'));
  let manifest;
  try { manifest = fromProject.resolve(`${tool.name}/package.json`); }
  catch { throw new Error(`${tool.name} is not installed in this project.\nRun: npm install --save-dev ${tool.name}@${tool.version}`); }
  const entry = path.join(path.dirname(manifest), tool.file);
  if (!fs.existsSync(entry)) throw new Error(`${tool.name} is incomplete (${tool.file} is missing).\nRun: npm ci --include=dev`);
  return { entry, directory: path.dirname(manifest), version: JSON.parse(fs.readFileSync(manifest, 'utf8')).version };
}
function runTool(command, args = [], { root = ROOT, stdio = 'inherit' } = {}) {
  const { entry } = resolveTool(command, root);
  const result = spawnSync(process.execPath, [entry, ...(command === 'start' ? ['.'] : []), ...args], {
    cwd: root, stdio, shell: false, windowsHide: false,
  });
  if (result.error) throw new Error(`Could not start ${TOOLS[command].name}: ${result.error.message}`);
  return result;
}
function doctor() {
  console.log(`Desktop tools · Node ${process.versions.node} · ${process.platform}/${process.arch}`);
  let missing = false;
  for (const command of ['start', 'pack']) {
    try { const tool = resolveTool(command);console.log(`OK ${TOOLS[command].name} ${tool.version} (${tool.entry})`); }
    catch (error) { console.error(error.message);missing = true; }
  }
  console.log('Desktop commands use Node directly; npm .cmd shortcuts are not required.');
  return missing ? 1 : 0;
}
if (require.main === module) {
  try {
    const [command, ...args] = process.argv.slice(2);
    process.exitCode = command === 'doctor' ? doctor() : (runTool(command, args).status ?? 1);
  } catch (error) { console.error(`\nForma desktop: ${error.message}\n`);process.exitCode = 1; }
}
module.exports = { resolveTool, runTool };
