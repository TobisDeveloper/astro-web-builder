# Forma — visual Astro website builder

A working visual workspace built with Astro and React. Node.js 24 recommended.

```sh
npm ci --cache /workspace/.npm
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

## Exporting and deploying

Click **Publish → Export Astro project**. Unzip, run `npm install`, then `npm run build`. Deploy the exported `dist/` directory to your preferred static host. The button exports files; it does not automatically deploy a website.

Demo images are embedded in the project for portable exports. Browser libraries and hosted media require Internet access. Do not include credentials in custom HTML or analytics snippets. Custom code runs in a sandboxed iframe without same-origin access to the builder. Exported scripts run on the deployed site; only use trusted code.

## Validation

With the development server running:

```sh
npm test
npm run build
```

Browser tests use `/usr/bin/chromium` by default; set `CHROMIUM_PATH` to another Chromium executable when needed. They exercise editing/persistence, responsive views, layers and undo, custom library connection, code preview, project creation, SEO, loop controls, and actual ZIP contents.

## Demo media

The interior demo images come from the [Frontend Mentor Room homepage starter](https://github.com/frontendmentorio/room-homepage). They are sample content for the template; replace with your own licensed media for production. The default sample video is MDN's CC0 flower video, converted to a compact WebM and embedded when added to a project so sandboxed previews can play it. Editor fonts are bundled from Fontsource (DM Sans and Manrope, SIL Open Font License).
