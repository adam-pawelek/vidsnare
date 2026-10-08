# VidSnare

A desktop app for Windows and Linux that downloads videos and audio from YouTube.

- Paste a link to a video, Short, playlist or channel and see a preview; pick which playlist videos to get.
- Video in best / 1080p / 720p / 480p / 360p (MP4 or MKV), or audio only as MP3, M4A or Opus.
- Subtitles in the languages you choose, saved next to the file or embedded in the video.
- A download queue with progress, speed and time left; cancel, retry, open the file or its folder.
- Several downloads at once (configurable), a searchable history, and skipping videos you already have.
- Notifications, light/dark theme following the system, and clear error messages.
- English, Polski, Deutsch, Español, Português (Brasil), Русский, 日本語, Français.

> **Disclaimer:** VidSnare is a front end for [yt-dlp](https://github.com/yt-dlp/yt-dlp).
> You are responsible for complying with YouTube's Terms of Service and the copyright
> laws of your country. Only download content you have the right to download.
> VidSnare does not circumvent DRM and does not sign in to YouTube. It is not affiliated with YouTube or Google.

## Installing

Get it from the website, **https://adam-pawelek.github.io/vidsnare/**, or from the
[releases page](https://github.com/adam-pawelek/vidsnare/releases/latest):

| System | File | Updates |
|---|---|---|
| Windows 10/11 | `VidSnare-Setup.exe` | Automatic |
| Linux (any distribution) | `VidSnare-x86_64.AppImage`, then make it executable | Automatic |
| Debian / Ubuntu | `VidSnare_amd64.deb` | The app tells you when a new version is out |

Everything VidSnare needs (yt-dlp, ffmpeg, Deno) is included; nothing else has to be installed.

**Windows "unknown publisher" warning:** the installer is not code-signed yet, so Windows
SmartScreen may warn the first time. Choose *More info → Run anyway*.

## Staying up to date

- **The download engine** (yt-dlp) updates itself, separately from the app, because YouTube
  changes often. It checks daily, and again whenever a download fails in a way that suggests
  YouTube changed something; the failed downloads are then retried automatically.
  Every update is verified against its published SHA-256 and must start successfully before
  it is used; if a new version breaks, VidSnare falls back to the version it shipped with.
- **The app** checks GitHub Releases shortly after starting and every six hours.

Both can be turned off in Settings → Updates.

## Development

Requirements: Node.js 22+ and npm 11 (`npx npm@11 …` works if your global npm is older;
npm 10.9 has a resolver bug that crashes when adding some dev dependencies).

```sh
npm install
npm run fetch-binaries   # yt-dlp, deno and ffmpeg for this machine, into resources/bin
npm run dev              # run with hot reload
```

| Command | What it does |
|---|---|
| `npm test` | Unit and component tests (no network) |
| `npm run test:e2e` | Builds the app and drives it with Playwright (no network) |
| `VIDSNARE_YTDLP=… VIDSNARE_FFMPEG=… npm test` | Also runs real downloads through yt-dlp |
| `VIDSNARE_NETWORK=1 npm test` | Also checks the live GitHub release lookups |
| `npm run typecheck` / `npm run lint` | Static checks |
| `npm run dist:linux` / `npm run dist:win` | Build installers into `release/` |

The website lives in `website/` (plain HTML, CSS and JavaScript; text for all languages in
`website/strings.js`) and is published to GitHub Pages by the *Website* workflow. Screenshots
come from the real UI with example data: `npm run build && node scripts/screenshots/take.mjs`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the app is put together and
[docs/TRANSLATIONS.md](docs/TRANSLATIONS.md) for adding or reviewing languages.

## Releasing

The release repository is `adam-pawelek/vidsnare`, set in `electron-builder.yml` (`publish`),
`src/shared/release.ts` and `package.json`; a test keeps the first two in sync.

1. Bump `version` in `package.json` and commit.
2. Tag and push: `git tag v0.2.0 && git push origin v0.2.0`.

The *Release* workflow builds the Windows installer and the Linux packages on their own
runners and publishes them to a GitHub release, where installed copies find the update.

## License

VidSnare is **source-available**, not open source. It is licensed under the
[PolyForm Strict License 1.0.0](LICENSE): you may download and use it for non-commercial
purposes, but you may not modify it, build on it, or redistribute it.
For any other use, contact the author.

Versions published before this change (up to commit `c72750c`) were released under the MIT license.

Bundled third-party programs keep their own licenses; see [docs/THIRD_PARTY.md](docs/THIRD_PARTY.md).
