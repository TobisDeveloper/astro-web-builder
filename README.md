# Forma — visual Astro website builder

A working visual workspace built with Astro and React. Node.js 24 recommended.

```sh
npm ci
npm run dev
```

Open the development server on port 4321. `npm run build` generates the static builder in `dist/`.

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
