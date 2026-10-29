# Forma — visual Astro website builder

A working visual workspace built with Astro and React. Node.js 24 recommended.

```sh
npm ci
npm run dev
```

Open the development server on port 4321. `npm run build` generates the static builder in `dist/`.

## Windows desktop app

Download the **Setup** installer or **Portable** executable from [GitHub Releases](https://github.com/TobisDeveloper/astro-web-builder/releases). The app includes its own runtime and the built editor: you do **not** need Node.js, npm, or a local server to use a download. Both downloads target Windows x64.

The app runs locally. Browser and desktop installations have separate storage profiles: use **Your projects → Backup / Import** to move projects between them. The desktop profile uses a stable `forma://app/` origin and persists across restarts and app updates. Uninstalling leaves project data intact. Keep JSON backups of important work.

The current downloads are unsigned, so Windows may show a SmartScreen notice. There is no automatic updater; install a newer release when available. Editor branding is project-specific; the executable and installer keep the Forma product name.

To build or develop the desktop app yourself on Windows (Node.js 24 recommended):

```powershell
npm ci
npm run desktop:install
npm run desktop
```

To create the installer and portable executable:

```powershell
npm run desktop:win
```

If a previous installation reports **`electron-builder` is not recognized**, repair the local dependency and check it:

```powershell
npm install --save-dev electron-builder@26.18.0
npm run desktop:doctor
npm run desktop:win
```

Desktop commands now launch installed JavaScript entry points with Node directly, so they work even when npm's Windows `.cmd` shortcuts are missing. The doctor command reports a missing dependency with its exact install command. `npm run test:desktop-tools` verifies the launcher without executable shortcuts, with spaces in the project path, and inside an ES-module project. The `electron-winstaller` install-script warning relates to Squirrel; Forma builds NSIS and portable targets.

Outputs are written to `release/Forma-Setup-0.2.0-x64.exe` and `release/Forma-Portable-0.2.0-x64.exe`. `npm run desktop:pack` creates an unpacked application for your current operating system. `npm run test:desktop` checks the built editor inside Electron (run `npm run build` first). The desktop smoke test checks isolation, bundled assets, font uploads, branding, native ZIP export, and project persistence across restart.

The **Windows desktop app** GitHub Actions workflow builds on a `v*` tag or a manual workflow run. It runs the browser tests, creates both Windows binaries, tests the packaged app on Windows, and uploads a downloadable artifact. Tag builds publish the executables to GitHub Releases. You can also open **Actions → Windows desktop app → Run workflow** on `main`, leave **Publish the tested Windows downloads** enabled, and run it to build and publish the current version. The workflow uses GitHub's scoped token; no personal token is stored in the app or repository.

Desktop windows have Node integration disabled, context isolation and sandboxing enabled, and no filesystem bridge exposed to project scripts. Only bundled files are served through the custom protocol. Custom libraries and hosted media still require Internet access; local fonts, demo media, and the editor work offline.

## Custom fonts & branding

Open **Brand** in the left rail, or **Project settings → Brand, fonts & identity**.

- Upload WOFF2, WOFF, TTF, or OTF files (up to 2 MB each). WOFF2 is recommended for smaller projects. Name the face and choose its weight/style; variable fonts support a 100–900 weight range. Invalid fonts are checked before saving.
- Click **Use on selection**, choose the uploaded face in the typography inspector, or use it as the brand heading/body font. Individual font choices override brand defaults; **Apply brand styles across page** resets those overrides.
- Set your brand name, tagline, primary/button colors, and page background. Upload a logo and favicon; the logo and name appear in navigation, and an optional footer carries your brand identity.
- Enable **Use my name, logo & color in the editor** to customize the editor header, accent, window title, and favicon for that project.
- Custom fonts and brand images are embedded in your project backup and HTML/Astro export. No separate font hosting is needed. Removing an uploaded font restores the affected elements to brand defaults.

Use fonts and logos you have permission to embed. Large fonts and images count toward local browser storage; export a backup if the editor reports that storage is full.

## What works

- Add sections, headings, paragraphs, buttons, images, looping videos, galleries, navigation, and custom HTML.
- Select elements on the canvas; edit text, colors, padding, radius, alignment, and animations in the inspector.
- Rearrange elements by dragging on the canvas or in Layers, or using move controls; duplicate and delete elements; undo and redo.
- Preview desktop, tablet, and mobile layouts with responsive CSS. The editor fits the canvas to available space.
- Edit page-body HTML in Code and apply to preview. Code mode overrides the visual structure; subsequent visual edits return to that structure.
- Save multiple projects automatically in browser localStorage, switch projects, and download/import JSON backups. There is no hosted database or account system.
- Upload images/videos up to 3 MB or supply hosted URLs. Media uploads are stored with the local project; use hosted URLs for large videos.
- Add browser-ready classic JavaScript, ES modules, and CSS from HTTPS URLs. GSAP has a bundled one-click preset and a working animation example. Dither Kit and Dither UI documentation is linked; copy browser-compatible markup into custom elements. Framework-only/npm packages require manual integration into the exported Astro project.
- Set SEO metadata, canonical and social image URLs, analytics snippets, and generate metadata suggestions from page content.
- The local writing assistant makes template-based suggestions. It is explicitly not a remote AI model. AI discovery is supported through an exported llms.txt.
- Export a complete static Astro project ZIP, HTML, or a single Astro file. ZIPs include SEO metadata, robots.txt, llms.txt, a sitemap when a canonical URL is set, and custom library URLs.

## Designer workflow

Use **Auto layout** for responsive section-based pages: drag sections on the canvas or reorder them in Layers. Switch **Canvas layout → Free canvas** for an artboard where elements can be placed anywhere.

- Drag elements directly; alignment guides snap edges and centers to the artboard and nearby elements. Hold **Alt** to bypass snapping or **Shift** to constrain movement to one axis.
- Drag the purple selection handles to resize. Edit desktop X/Y and width/height in the inspector, or use its alignment buttons.
- Double-click a heading or paragraph to edit text in place. The inspector also supports font family, weight, color, spacing, and dimensions.
- **V** selects, **H** activates hand panning, arrow keys nudge, **Shift + arrow** nudges by 10px, **Ctrl/Cmd + D** duplicates, **Delete** removes, and **Ctrl/Cmd + Z** undoes. Redo uses Ctrl/Cmd + Shift + Z or Ctrl + Y. These shortcuts also work with focus inside the canvas. Text fields retain normal typing shortcuts.
- Zoom in/out or fit the page; the hand tool pans a zoomed artboard. Toggle the layout grid and snapping independently.
- Lock layers to prevent canvas manipulation, or hide/show them. Layer order controls stacking on the free canvas.
- Free-canvas positions and sizes scale horizontally for desktop/tablet. At mobile widths (600px and below), elements stack in layer order and decorative rectangles are hidden. Review mobile order and preview before exporting. Freeform editing on mobile uses section reordering, not absolute positioning.
- Artboard height and background are editable. Switching back to Auto layout clears explicit element positions and sizes; Undo restores them.

**Templates** opens six real page designs: Studio North, Orbit, Form & Field, Sunday Club, Atelier, and Blank canvas. Search/filter them, preview desktop/mobile, then create a new project. Existing projects remain available in the project menu.

## Exporting and deploying

Click **Publish → Export Astro project**. Unzip, run `npm install`, then `npm run build`. Deploy the exported `dist/` directory to your preferred static host. The button exports files; it does not automatically deploy a website.

Demo images are embedded in the project for portable exports. Browser libraries and hosted media require Internet access. Do not include credentials in custom HTML or analytics snippets. Custom code runs in a sandboxed iframe without same-origin access to the builder. Exported scripts run on the deployed site; only use trusted code.

## Validation

Install the test browser once after installing dependencies (or after updating Playwright):

```sh
npm run test:install
npm test
npm run build
```

These commands work in Windows PowerShell, macOS, and Linux. Tests start the development server automatically, or reuse one already running on port 4321. Playwright uses its own downloaded Chromium; no system browser path is required. You can optionally set `CHROMIUM_PATH` to use a specific browser executable. Screenshots and exported test projects are written under `test-results/`. They exercise editing/persistence, responsive views, layers and undo, custom library connection, code preview, project creation, SEO, loop controls, and actual ZIP contents.

## Demo media

The interior demo images come from the [Frontend Mentor Room homepage starter](https://github.com/frontendmentorio/room-homepage). They are sample content for the template; replace with your own licensed media for production. The default sample video is MDN's CC0 flower video, converted to a compact WebM and embedded when added to a project so sandboxed previews can play it. Editor fonts are bundled from Fontsource (DM Sans and Manrope, SIL Open Font License).
