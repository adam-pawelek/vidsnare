# VidSnare

A desktop app for Windows and Linux that downloads videos and audio from YouTube.

> **Disclaimer:** VidSnare is a front end for [yt-dlp](https://github.com/yt-dlp/yt-dlp).
> You are responsible for complying with YouTube's Terms of Service and the copyright
> laws of your country. Only download content you have the right to download.
> VidSnare does not circumvent DRM and does not sign in to YouTube.

## Development

Requirements: Node.js 22+ and npm 11 (`npx npm@11 …` works if your global npm is older;
npm 10.9 has a resolver bug that crashes when adding some dev dependencies).

```sh
npm install
npm run dev        # run the app with hot reload
npm test           # unit tests
npm run typecheck
npm run lint
npm run build      # compile to out/
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the app is put together.

## License

MIT. Bundled third-party tools keep their own licenses (see `docs/THIRD_PARTY.md` once packaging is set up).
