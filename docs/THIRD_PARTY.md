# Third-party software

VidSnare itself is released under the MIT license (see `LICENSE`). It ships with,
or depends on, the following components, each under its own license.

## Bundled programs

These are included unmodified in the installers, under `resources/bin`. Exact versions
and checksums are recorded in `resources/bin/VERSIONS.json` of each build.

| Component | What it does | License | Source |
|---|---|---|---|
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | Reads video information and downloads from YouTube | The Unlicense (public domain) | https://github.com/yt-dlp/yt-dlp |
| [Deno](https://deno.com) | JavaScript runtime yt-dlp uses for YouTube | MIT | https://github.com/denoland/deno |
| [FFmpeg](https://ffmpeg.org) | Merges video and audio, converts audio, embeds subtitles and metadata | **LGPL v3** (LGPL build) | see below |

### FFmpeg (LGPL)

VidSnare uses the **LGPL** "shared" builds of FFmpeg made by
[BtbN/FFmpeg-Builds](https://github.com/BtbN/FFmpeg-Builds) (`*-lgpl-shared-*`). They contain
no GPL-only components (no x264/x265). FFmpeg runs as a separate program and its libraries
are separate files, so you can replace them with your own build.

- License text: `resources/bin/ffmpeg/LICENSE.txt` in the installed app.
- FFmpeg source code: https://git.ffmpeg.org/ffmpeg.git (the release branch named in
  `ffmpeg -version`, e.g. `n9.0`), also mirrored at https://github.com/FFmpeg/FFmpeg.
- Build scripts and configuration: https://github.com/BtbN/FFmpeg-Builds.

FFmpeg is a trademark of Fabrice Bellard, originator of the FFmpeg project.

## Libraries in the app

| Component | License |
|---|---|
| [Electron](https://www.electronjs.org) (includes Chromium and Node.js) | MIT; Chromium's licenses are listed in `LICENSES.chromium.html` next to the app |
| [React](https://react.dev) | MIT |
| [electron-updater](https://github.com/electron-userland/electron-builder) | MIT |
| [fflate](https://github.com/101arrowz/fflate) | MIT |

## Not affiliated

VidSnare is not affiliated with, endorsed by, or sponsored by YouTube or Google.
YouTube is a trademark of Google LLC.
