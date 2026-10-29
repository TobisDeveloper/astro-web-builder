const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runTool, resolveTool } = require('./tools.cjs');
function fixture(t, exit = 0) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'Forma project with spaces '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ type: 'module' }));
  const directory = path.join(root, 'node_modules', 'electron-builder');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ name: 'electron-builder', version: '26.18.0', bin: { 'electron-builder': './cli.js' } }));
  fs.writeFileSync(path.join(directory, 'cli.js'), `const fs=require('node:fs');fs.writeFileSync('invocation.json',JSON.stringify({args:process.argv.slice(2),cwd:process.cwd()}));process.exit(${exit});`);
  return root;
}
test('packaging runs with no npm executable shortcut, an ESM project, and spaces in the path', t => {
  const root = fixture(t);
  assert.equal(fs.existsSync(path.join(root, 'node_modules', '.bin')), false);
  const args = ['--win', '--x64', '--publish', 'never', '--config.productName=My Studio'];
  const result = runTool('pack', args, { root, stdio: 'pipe' });
  assert.equal(result.status, 0, String(result.stderr));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'invocation.json'), 'utf8')), { args, cwd: root });
});
test('packaging failures preserve the builder exit code', t => {
  const root = fixture(t, 7);
  assert.equal(runTool('pack', [], { root, stdio: 'pipe' }).status, 7);
});
test('missing dependency gives an explicit local install command', t => {
  const root = fixture(t);
  fs.rmSync(path.join(root, 'node_modules'), { recursive: true });
  assert.throws(() => resolveTool('pack', root), /npm install --save-dev electron-builder@26\.18\.0/);
});
