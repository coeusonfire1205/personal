# A little thing, for you 🌻

A personal, mobile-friendly love story: your photographs → your proposal video on **25th October 2026** → a sunflower that blooms → your complete love letter. The full supplied message is in `index.html`, ending with **I LOVE YOU, BABYYYYY. ❤️🫶🏻😘**.

This is a complete static website with no dependencies, no build, no analytics, no third-party fonts, and no accounts. Your five supplied photographs are included and configured. Your complete proposal video (about 1 minute 47 seconds, with its original audio) is also included. The site is ready to preview and deploy.

## 1. Add your photos and video (no coding)

1. Extract this ZIP.
2. Open a terminal in the extracted folder (the folder containing `index.html`). Run:

   ```bash
   python -m http.server 8000
   ```

   On Windows, `py -m http.server 8000` may work instead. If you use VS Code, its Live Server extension also works.
3. Open `http://localhost:8000/setup.html`.
4. Your five photos and proposal video load automatically. Change their order/captions or replace the video if desired.
5. Click **Preview our story**. Keep the setup tab open while previewing. Nothing uploads to a server during setup. File selections reset if you reload/close the setup tab.
6. Click **Download Vercel-ready ZIP**. It contains the site plus your actual media files. Extract this new ZIP and deploy that folder.

Use JPG/PNG/WebP/AVIF photos and preferably an **MP4 with H.264 video and AAC audio**. Some MOV/HEVC videos from phones do not play in every browser; convert them to H.264 MP4 first. The setup exporter supports up to 250 MB of media. For larger media, add it manually or use a direct HTTPS video URL. Opening `setup.html` via `file://` may prevent export; use the local server above.

## 2. Deploy on Vercel

### With GitHub

1. Create a repository, then add the contents of the final extracted folder. Put `index.html` at the root, alongside `app.js`, `styles.css`, `config.js`, and the `assets/` directory.
2. Sign in to Vercel and choose **Add New → Project**. Import that repository.
3. Select **Other** as the framework preset. Leave the Build Command blank and set Output Directory to **.** (the project root). No install command is needed.
4. Deploy. Open the live URL on your phone, test the photos, video, sunflower and letter, then send her the link.

GitHub's browser upload has file-size limits. If your video is too large, use local Git, compress the video, or the Vercel CLI route below. Large MP4s can also be hosted elsewhere with a direct HTTPS file URL in `config.js` (a normal YouTube/Drive sharing page is not a direct video URL).

### With the Vercel CLI

If Node.js is installed, open a terminal in the final extracted folder:

```bash
npx vercel
```

Log in, choose a new project, use this folder, and use **Other** / no build / root output. To publish the production link:

```bash
npx vercel --prod
```

Vercel's current project and upload limits apply. This package has not been deployed to your Vercel account.

## Manual media setup (optional)

Put your media in `assets/`, then edit `config.js`:

```js
window.LOVE_CONFIG = {
  photos: [
    { src: 'assets/photo-1.jpg', caption: 'My favourite place is next to you.' },
    { src: 'assets/photo-2.jpg', caption: 'Our little beginning.' },
    { src: 'assets/photo-3.jpg', caption: 'You + me.' }
  ],
  video: 'assets/proposal.mp4',
  videoPoster: ''
};
```

Use the exact filename and capitalisation. Any number of photographs works; with more than three, the gallery arrows reveal the rest. Tap a photograph to enlarge it. The video uses native controls, plays inline on phones, and stops when you leave its chapter. It does not autoplay. Back/forward browser navigation also works between chapters.

## Edit the wording and design

- Letter and headings: `index.html`.
- Colours, spacing, layouts: `styles.css` (see the variables at the top).
- Navigation, gallery, sunflower animation: `app.js`.
- Media paths and captions: `config.js`.
- Setup screen and ZIP export: `setup.html`, `setup.css`, `setup.js`, `zip.js`.

The date is written as **Remembering the date / 25th October 2026**. Your original letter is included without shortening. The final sentence is visually split over lines but retains its wording and emojis.

The site follows reduced-motion preferences, supports keyboard navigation, and works without external assets or services. There is no background music; the proposal video's own sound plays when she starts it.

## Sharing

The site asks search engines not to index it using a robots tag, robots.txt and a Vercel response header. This is **not password protection**: anyone with the deployed URL can view/download its media and read the letter. If you need access control, enable an appropriate Vercel protection option before sharing.

The setup page is only a local/browser editor: it does not modify an already deployed site or save selections on a server. To change media later, export again and redeploy. It is not linked from the final guest flow when valid media is configured.

Enjoy your little beginning. 🌻
