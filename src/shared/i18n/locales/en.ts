/**
 * English source strings. Every other locale must have exactly these keys and
 * the same {placeholders}. Objects with an `other` key are plurals selected by
 * the `count` variable using the language's plural rules.
 */
export const en = {
  app: {
    quitTitle: 'Downloads in progress',
    quitMessage: 'Quitting will cancel the downloads that are still running.',
    quitAnyway: 'Quit anyway',
    keepDownloading: 'Keep downloading'
  },
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    close: 'Close',
    retry: 'Retry',
    remove: 'Remove',
    save: 'Save',
    browse: 'Browse…',
    changeFolder: 'Change download folder…',
    reset: 'Reset to defaults',
    copyDetails: 'Copy details',
    copied: 'Copied',
    loading: 'Loading…',
    unknown: 'Unknown'
  },
  contextMenu: {
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select all'
  },
  nav: {
    changeLanguage: 'Change language',
    download: 'Download',
    queue: 'Queue',
    history: 'History',
    settings: 'Settings'
  },
  input: {
    placeholder: 'Paste a YouTube link (video or playlist)',
    paste: 'Paste',
    load: 'Load',
    invalid: "That doesn't look like a YouTube link.",
    hint: 'Supports videos, Shorts, playlists and channels.'
  },
  preview: {
    by: 'by {channel}',
    duration: 'Duration',
    live: 'Live',
    videos: { one: '{count} video', other: '{count} videos' },
    selectAll: 'Select all',
    selectNone: 'Select none',
    selected: '{selected} of {total} selected',
    alreadyDownloaded: 'Already downloaded',
    hideDownloaded: 'Hide already downloaded',
    partOfPlaylist: 'This video is part of a playlist.',
    thisVideoOnly: 'Just this video',
    wholePlaylist: 'Whole playlist',
    unavailableEntry: 'Unavailable'
  },
  options: {
    downloadAs: 'Download as',
    video: 'Video',
    audio: 'Audio only',
    quality: 'Quality',
    qualityBest: 'Best available',
    container: 'File type',
    containerMp4: 'MP4 – plays everywhere (up to 1080p)',
    containerMkv: 'MKV – highest quality (needs a modern player)',
    audioFormat: 'Audio format',
    subtitles: 'Subtitles',
    subtitlesEnabled: 'Download subtitles',
    subtitleLanguages: 'Languages',
    autoSubs: 'Use automatic captions if needed',
    embedSubs: 'Embed in the video file',
    saveTo: 'Save to',
    download: 'Download',
    downloadMany: { one: 'Download {count} video', other: 'Download {count} videos' },
    added: { one: 'Added {count} download to the queue', other: 'Added {count} downloads to the queue' },
    addedHint: 'Click “{queue}” on the left to see the progress and open your file when it’s ready.',
    skippedExisting: {
      one: 'Skipped {count} video you already downloaded',
      other: 'Skipped {count} videos you already downloaded'
    }
  },
  queue: {
    empty: 'No downloads yet. Paste a link to get started.',
    status: {
      queued: 'Waiting',
      downloading: 'Downloading',
      processing: 'Processing',
      completed: 'Finished',
      failed: 'Failed',
      cancelled: 'Cancelled',
      skipped: 'Already downloaded'
    },
    progress: '{done} of {total}',
    speed: '{speed}',
    eta: '{time} left',
    cancel: 'Cancel',
    retry: 'Retry',
    openFile: 'Open file',
    showInFolder: 'Show in folder',
    clearFinished: 'Clear finished',
    cancelAll: 'Cancel all',
    active: { one: '{count} active', other: '{count} active' }
  },
  history: {
    empty: 'Finished downloads will appear here.',
    search: 'Search history',
    clear: 'Clear history',
    clearConfirm: 'Remove all entries from the history? Downloaded files are not deleted.',
    fileMissing: 'File was moved or deleted',
    downloadAgain: 'Download again',
    noResults: 'Nothing matches your search.'
  },
  settings: {
    title: 'Settings',
    sections: {
      downloads: 'Downloads',
      defaults: 'Default options',
      appearance: 'Appearance',
      updates: 'Updates',
      about: 'About'
    },
    downloadFolder: 'Download folder',
    maxConcurrent: 'Simultaneous downloads',
    skipDownloaded: 'Skip videos I have already downloaded',
    skipDownloadedHelp: 'Videos in your download history are left out when you add a playlist.',
    playlistSubfolder: 'Save playlists in their own folder',
    notifications: 'Show a notification when a download finishes',
    language: 'Language',
    systemLanguage: 'System default',
    theme: 'Theme',
    themeSystem: 'Follow system',
    themeLight: 'Light',
    themeDark: 'Dark',
    appVersion: 'App version',
    updateAvailable: 'Version {version} is available.',
    updateDownloading: 'Downloading update… {percent}',
    updateReady: 'Version {version} is ready to install.',
    restartToUpdate: 'Restart and update',
    manualUpdate: 'Download the new version from the releases page.',
    openReleases: 'Open releases page',
    engine: 'Download engine',
    engineHelp: 'VidSnare keeps itself and its download engine up to date automatically.',
    engineVersion: 'yt-dlp {version}',
    useSystemFolder: 'Use the system Downloads folder',
    lastChecked: 'Last checked: {date}',
    never: 'Never',
    disclaimer:
      "You are responsible for complying with YouTube's Terms of Service and copyright law. Only download content you have the right to download.",
    licenses: 'Third-party licenses',
    sourceCode: 'Source code'
  },
  notify: {
    finishedTitle: 'Download finished',
    failedTitle: 'Download failed',
    allFinished: { one: '{count} download finished', other: '{count} downloads finished' },
    failedMany: { one: '{count} download failed', other: '{count} downloads failed' }
  },
  errors: {
    PRIVATE_VIDEO: 'This video is private.',
    VIDEO_UNAVAILABLE: 'This video is unavailable. It may have been removed or never existed.',
    AGE_RESTRICTED: 'This video is age-restricted and needs a signed-in account, which VidSnare does not use.',
    MEMBERS_ONLY: "This video is only for the channel's paying members.",
    PAID_CONTENT: 'This video must be bought or rented on YouTube.',
    REGION_BLOCKED: 'This video is not available in your country.',
    COPYRIGHT_BLOCKED: 'This video was blocked because of a copyright claim.',
    LIVE_NOT_STARTED: 'This live stream or premiere has not started yet. Try again after it begins.',
    DRM_PROTECTED: 'This video is copy-protected (DRM) and cannot be downloaded.',
    BOT_CHECK: 'YouTube is asking to confirm you are not a bot. Wait a while, then try again.',
    RATE_LIMITED: 'YouTube is limiting requests right now. Wait a few minutes, then try again.',
    NO_INTERNET: "Can't reach YouTube. Check your internet connection.",
    DISK_FULL: 'There is not enough free space on the disk.',
    PERMISSION_DENIED: "VidSnare isn't allowed to save files in this folder. Choose a different folder.",
    FORMAT_UNAVAILABLE: 'The chosen quality or format is not available for this video.',
    ENGINE_OUTDATED: 'YouTube changed something. Update the download engine in Settings, then try again.',
    POSTPROCESSING_FAILED: 'The file was downloaded but could not be converted.',
    TOOL_MISSING: 'A required component is missing. Reinstall VidSnare.',
    INVALID_URL: "That doesn't look like a YouTube link.",
    UNSUPPORTED_URL: 'This kind of link is not supported.',
    CANCELLED: 'Cancelled.',
    UNKNOWN: 'Something went wrong.'
  }
}
