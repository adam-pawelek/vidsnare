# Architecture

```
Renderer (React, sandboxed)  ⇄  preload (window.vidsnare)  ⇄  Main process (Node)
                                                                 │ spawns
                                                    yt-dlp · ffmpeg · deno
```

## Processes

- **Main** (`src/main`): owns everything with side effects: the download queue,
  child processes, files, settings, history, updates and notifications.
- **Preload** (`src/preload`): exposes one object, `window.vidsnare`, with
  `invoke(channel, …args)` and `on(event, listener)`. It forwards only channels listed in
  `src/shared/ipc.ts` and never passes Electron event objects to the page.
- **Renderer** (`src/renderer`): React UI. It has no Node access; it talks to main only
  through `window.vidsnare`.
- **Shared** (`src/shared`): types and pure logic used by both sides. No Electron or Node imports.

## Security

- `contextIsolation`, `sandbox`, no `nodeIntegration`, no `<webview>`.
- Strict Content-Security-Policy: scripts only from the app bundle, images from YouTube's CDNs.
- IPC handlers reject requests from any frame that isn't the app's own page.
- The window can't navigate away. Links open in the system browser (http/https only).
- All permission requests (camera, microphone, …) are denied.

## Decisions

| Topic | Decision |
|---|---|
| Distribution | Public, GitHub Releases (`OWNER/vidsnare` placeholder until the repo exists) |
| Windows | NSIS installer, unsigned for now (signing can be added in CI later) |
| Linux | AppImage (updates itself) + .deb (shows a notice when an update is out) |
| Languages | en, pl, de, es, pt-BR, ru, ja, fr; follows the system language by default |
| File names | `Title [id].ext`, playlists in a subfolder named after the playlist |
| Engine | yt-dlp + ffmpeg (LGPL build) + Deno; each updated independently of the app |
