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

## Main-process services

| Module | Job |
|---|---|
| `tools/tool-manager.ts` | Finds the newest working yt-dlp/ffmpeg/deno (downloaded update → bundled → PATH in dev); installs verified updates atomically; falls back if one breaks |
| `tools/engine-service.ts` | Engine status, manual updates, daily check, check after "engine outdated" errors |
| `media-service.ts` | Link preview: runs `yt-dlp --dump-single-json --flat-playlist`, parses it |
| `queue/download-queue.ts` | The queue: concurrency, progress, cancel (process-tree kill), retry, unique file names |
| `queue/queue-service.ts` | Validates requests from the UI (IDs, options, folders) and adds jobs |
| `history/history-store.ts` | Finished downloads; decides what counts as "already downloaded" |
| `settings-store.ts` | Validated settings in `settings.json` |
| `notifier.ts` | Grouped desktop notifications |
| `update/update-controller.ts` | App self-update through electron-updater |

All state files live in the app's data folder (`~/.config/VidSnare` on Linux,
`%APPDATA%\VidSnare` on Windows) and are written atomically.

## Downloads

1. The UI sends video IDs and options; never file paths.
2. When a job starts, its file name is rendered from the template, made safe for both
   Windows and Linux, and claimed so no other job can take it.
3. yt-dlp runs with `--ignore-config`, the bundled ffmpeg/deno, a per-job temporary folder,
   and machine-readable progress markers. The URL always comes after `--`.
4. Progress from both the video and audio streams is merged into one bar.
5. On success the real file size is recorded and the history updated; on failure the error
   output is mapped to a code the UI explains in the user's language.

## Decisions

| Topic | Decision |
|---|---|
| Distribution | Public, GitHub Releases (`adam-pawelek/vidsnare`) |
| Windows | NSIS installer, unsigned for now (signing can be added in CI later) |
| Linux | AppImage (updates itself) + .deb (shows a notice when an update is out) |
| Languages | en, pl, de, es, pt-BR, ru, ja, fr; follows the system language by default |
| File names | `Title [id].ext`, playlists in a subfolder named after the playlist |
| Engine | yt-dlp + ffmpeg (LGPL build) + Deno; each updated independently of the app |
| ffmpeg build | BtbN LGPL *shared* build (~170 MB instead of ~285 MB static); updated with app releases |
| Skip downloaded | Based on VidSnare's history, not yt-dlp's archive, so a single video can always be downloaded again |
| Self-update | Windows installer and AppImage install updates; .deb shows a notice linking to the release |
