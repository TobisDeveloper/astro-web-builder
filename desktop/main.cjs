const { app, BrowserWindow, Menu, protocol, net, shell, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const { pathToFileURL } = require('node:url');

const APP_ORIGIN = 'forma://app';
const ROOT = path.resolve(__dirname, '..', 'dist');
protocol.registerSchemesAsPrivileged([{
  scheme: 'forma',
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true },
}]);
// Only the automated smoke runner supplies this; production uses Electron's persistent userData directory.
const profile = process.env.FORMA_TEST_USER_DATA || path.join(app.getPath('appData'), 'Forma');
fsSync.mkdirSync(profile, { recursive: true });
app.setPath('userData', profile);
app.setName('Forma');
app.setAppUserModelId('com.forma.builder');
let mainWindow;

function openExternal(url) {
  try { if (new URL(url).protocol === 'https:') void shell.openExternal(url); } catch { /* Ignore invalid links. */ }
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500, height: 980, minWidth: 900, minHeight: 650,
    title: 'Forma — Visual Astro Builder', backgroundColor: '#f8f9f8', show: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true, webviewTag: false },
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { openExternal(url); return { action: 'deny' }; });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const target = new URL(url);
    if (target.protocol !== 'forma:' || target.hostname !== 'app' || target.port) event.preventDefault();
  });
  mainWindow.webContents.on('will-attach-webview', event => event.preventDefault());
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
  void mainWindow.loadURL(APP_ORIGIN + '/');
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); } });
  app.whenReady().then(() => {
    protocol.handle('forma', async request => {
      try {
        const url = new URL(request.url);
        if (url.hostname !== 'app' || !['GET', 'HEAD'].includes(request.method)) return new Response('Not found', { status: 404 });
        const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
        const file = path.resolve(ROOT, relative);
        if (!file.startsWith(ROOT + path.sep) || !(await fs.stat(file)).isFile()) return new Response('Not found', { status: 404 });
        const response = await net.fetch(pathToFileURL(file).href);
        const headers = new Headers(response.headers);
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('Content-Security-Policy', "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:; font-src 'self' https: data:; media-src 'self' https: data: blob:; frame-src 'self' about: data: blob:; connect-src 'self' https: data: blob:; object-src 'none'; base-uri 'self'");
        return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, headers });
      } catch { return new Response('Not found', { status: 404 }); }
    });
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    session.defaultSession.on('will-download', (_event, item) => {
      item.setSaveDialogOptions({ title: 'Save your Forma export', defaultPath: path.join(app.getPath('downloads'), path.basename(item.getFilename())) });
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { label: 'File', submenu: [{ role: 'close' }, { type: 'separator' }, { role: 'quit' }] },
      { label: 'Edit', submenu: [{ role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
      { label: 'View', submenu: [{ role: 'reload' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }] },
      { label: 'Help', submenu: [{ label: 'Forma documentation', click: () => openExternal('https://github.com/TobisDeveloper/astro-web-builder#readme') }] },
    ]));
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  }).catch(error => { console.error('Could not start Forma:', error); app.quit(); });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
