import type { Messages } from '../types'

export const ro: Messages = {
  app: {
    quitTitle: 'Descărcări în curs',
    quitMessage: 'Dacă închizi aplicația, descărcările în curs vor fi anulate.',
    quitAnyway: 'Închide oricum',
    keepDownloading: 'Continuă descărcarea'
  },
  common: {
    ok: 'OK',
    cancel: 'Anulează',
    close: 'Închide',
    retry: 'Reîncearcă',
    remove: 'Elimină',
    save: 'Salvează',
    browse: 'Răsfoiește…',
    changeFolder: 'Schimbă dosarul de descărcare…',
    reset: 'Revino la valorile implicite',
    copyDetails: 'Copiază detaliile',
    copied: 'Copiat',
    loading: 'Se încarcă…',
    unknown: 'Necunoscut'
  },
  contextMenu: {
    cut: 'Decupează',
    copy: 'Copiază',
    paste: 'Lipește',
    selectAll: 'Selectează tot'
  },
  nav: {
    changeLanguage: 'Schimbă limba',
    download: 'Descarcă',
    queue: 'Coadă',
    history: 'Istoric',
    settings: 'Setări'
  },
  input: {
    placeholder: 'Lipește un link YouTube (videoclip sau playlist)',
    paste: 'Lipește',
    load: 'Încarcă',
    invalid: 'Nu pare a fi un link YouTube.',
    hint: 'Sunt acceptate videoclipuri, Shorts, playlisturi și canale.'
  },
  preview: {
    by: 'de {channel}',
    duration: 'Durată',
    live: 'Live',
    videos: { one: '{count} videoclip', few: '{count} videoclipuri', other: '{count} de videoclipuri' },
    selectAll: 'Selectează tot',
    selectNone: 'Deselectează tot',
    selected: '{selected} din {total} selectate',
    alreadyDownloaded: 'Deja descărcat',
    hideDownloaded: 'Ascunde ce e deja descărcat',
    partOfPlaylist: 'Acest videoclip face parte dintr-un playlist.',
    thisVideoOnly: 'Doar acest videoclip',
    wholePlaylist: 'Tot playlistul',
    unavailableEntry: 'Indisponibil'
  },
  options: {
    downloadAs: 'Descarcă ca',
    video: 'Video',
    audio: 'Doar audio',
    quality: 'Calitate',
    qualityBest: 'Cea mai bună disponibilă',
    container: 'Tip de fișier',
    containerMp4: 'MP4 – merge oriunde (până la 1080p)',
    containerMkv: 'MKV – calitate maximă (necesită un player modern)',
    audioFormat: 'Format audio',
    subtitles: 'Subtitrări',
    subtitlesEnabled: 'Descarcă subtitrările',
    subtitleLanguages: 'Limbi',
    autoSubs: 'Folosește subtitrări automate dacă e nevoie',
    embedSubs: 'Include în fișierul video',
    saveTo: 'Salvează în',
    download: 'Descarcă',
    downloadMany: {
      one: 'Descarcă {count} videoclip',
      few: 'Descarcă {count} videoclipuri',
      other: 'Descarcă {count} de videoclipuri'
    },
    added: {
      one: 'S-a adăugat {count} descărcare în coadă',
      few: 'S-au adăugat {count} descărcări în coadă',
      other: 'S-au adăugat {count} de descărcări în coadă'
    },
    addedHint: 'Apasă pe „{queue}” în stânga ca să vezi progresul și să deschizi fișierul când e gata.',
    skippedExisting: {
      one: 'S-a sărit peste {count} videoclip deja descărcat',
      few: 'S-a sărit peste {count} videoclipuri deja descărcate',
      other: 'S-a sărit peste {count} de videoclipuri deja descărcate'
    }
  },
  queue: {
    empty: 'Încă nu există descărcări. Lipește un link ca să începi.',
    status: {
      queued: 'În așteptare',
      downloading: 'Se descarcă',
      processing: 'Se procesează',
      completed: 'Gata',
      failed: 'Eșuat',
      cancelled: 'Anulat',
      skipped: 'Deja descărcat'
    },
    progress: '{done} din {total}',
    speed: '{speed}',
    eta: 'au mai rămas {time}',
    cancel: 'Anulează',
    retry: 'Reîncearcă',
    openFile: 'Deschide fișierul',
    showInFolder: 'Arată în dosar',
    clearFinished: 'Șterge ce s-a terminat',
    cancelAll: 'Anulează tot',
    active: { one: '{count} activă', few: '{count} active', other: '{count} de active' }
  },
  history: {
    empty: 'Descărcările terminate vor apărea aici.',
    search: 'Caută în istoric',
    clear: 'Șterge istoricul',
    clearConfirm: 'Elimini toate intrările din istoric? Fișierele descărcate nu sunt șterse.',
    fileMissing: 'Fișierul a fost mutat sau șters',
    downloadAgain: 'Descarcă din nou',
    noResults: 'Niciun rezultat.'
  },
  settings: {
    title: 'Setări',
    sections: {
      downloads: 'Descărcări',
      defaults: 'Opțiuni implicite',
      appearance: 'Aspect',
      updates: 'Actualizări',
      about: 'Despre'
    },
    downloadFolder: 'Dosar de descărcare',
    maxConcurrent: 'Descărcări simultane',
    skipDownloaded: 'Sari peste videoclipurile deja descărcate',
    skipDownloadedHelp: 'Videoclipurile din istoricul descărcărilor sunt omise când adaugi un playlist.',
    playlistSubfolder: 'Salvează playlisturile într-un dosar separat',
    notifications: 'Arată o notificare când se termină o descărcare',
    language: 'Limbă',
    systemLanguage: 'Limba sistemului',
    theme: 'Temă',
    themeSystem: 'Ca sistemul',
    themeLight: 'Luminoasă',
    themeDark: 'Întunecată',
    appVersion: 'Versiunea aplicației',
    updateAvailable: 'Versiunea {version} este disponibilă.',
    updateDownloading: 'Se descarcă actualizarea… {percent}',
    updateReady: 'Versiunea {version} este gata de instalare.',
    restartToUpdate: 'Repornește și actualizează',
    manualUpdate: 'Descarcă noua versiune de pe pagina de lansări.',
    openReleases: 'Deschide pagina de lansări',
    engine: 'Motor de descărcare',
    engineHelp: 'VidSnare se actualizează automat, împreună cu motorul de descărcare.',
    engineVersion: 'yt-dlp {version}',
    useSystemFolder: 'Folosește dosarul Descărcări al sistemului',
    lastChecked: 'Ultima verificare: {date}',
    never: 'Niciodată',
    disclaimer:
      'Ești responsabil să respecți Termenii și condițiile YouTube și legea drepturilor de autor. Descarcă doar conținut pe care ai dreptul să-l descarci.',
    licenses: 'Licențe terțe',
    sourceCode: 'Cod sursă'
  },
  notify: {
    finishedTitle: 'Descărcare terminată',
    failedTitle: 'Descărcare eșuată',
    allFinished: {
      one: '{count} descărcare terminată',
      few: '{count} descărcări terminate',
      other: '{count} de descărcări terminate'
    },
    failedMany: {
      one: '{count} descărcare a eșuat',
      few: '{count} descărcări au eșuat',
      other: '{count} de descărcări au eșuat'
    }
  },
  errors: {
    PRIVATE_VIDEO: 'Acest videoclip este privat.',
    VIDEO_UNAVAILABLE: 'Acest videoclip nu este disponibil. Poate a fost eliminat sau nu a existat niciodată.',
    AGE_RESTRICTED: 'Acest videoclip are restricție de vârstă și necesită autentificare, pe care VidSnare nu o folosește.',
    MEMBERS_ONLY: 'Acest videoclip este doar pentru membrii plătitori ai canalului.',
    PAID_CONTENT: 'Acest videoclip trebuie cumpărat sau închiriat pe YouTube.',
    REGION_BLOCKED: 'Acest videoclip nu este disponibil în țara ta.',
    COPYRIGHT_BLOCKED: 'Acest videoclip a fost blocat din cauza unei revendicări privind drepturile de autor.',
    LIVE_NOT_STARTED: 'Această transmisiune live sau premieră nu a început încă. Încearcă din nou după ce începe.',
    DRM_PROTECTED: 'Acest videoclip este protejat la copiere (DRM) și nu poate fi descărcat.',
    BOT_CHECK: 'YouTube cere să confirmi că nu ești un robot. Așteaptă puțin, apoi încearcă din nou.',
    RATE_LIMITED: 'YouTube limitează acum cererile. Așteaptă câteva minute, apoi încearcă din nou.',
    NO_INTERNET: 'Nu se poate ajunge la YouTube. Verifică conexiunea la internet.',
    DISK_FULL: 'Nu există suficient spațiu liber pe disc.',
    PERMISSION_DENIED: 'VidSnare nu are voie să salveze fișiere în acest dosar. Alege alt dosar.',
    FORMAT_UNAVAILABLE: 'Calitatea sau formatul ales nu este disponibil pentru acest videoclip.',
    ENGINE_OUTDATED: 'YouTube a schimbat ceva. VidSnare își actualizează motorul de descărcare – încearcă din nou peste câteva minute.',
    POSTPROCESSING_FAILED: 'Fișierul a fost descărcat, dar nu a putut fi convertit.',
    TOOL_MISSING: 'Lipsește o componentă necesară. Reinstalează VidSnare.',
    INVALID_URL: 'Nu pare a fi un link YouTube.',
    UNSUPPORTED_URL: 'Acest tip de link nu este acceptat.',
    CANCELLED: 'Anulat.',
    UNKNOWN: 'Ceva n-a mers bine.'
  }
}
