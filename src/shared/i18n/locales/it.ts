import type { Messages } from '../types'

export const it: Messages = {
  app: {
    quitTitle: 'Download in corso',
    quitMessage: 'Uscendo verranno annullati i download ancora in corso.',
    quitAnyway: 'Esci comunque',
    keepDownloading: 'Continua a scaricare'
  },
  common: {
    ok: 'OK',
    cancel: 'Annulla',
    close: 'Chiudi',
    retry: 'Riprova',
    remove: 'Rimuovi',
    save: 'Salva',
    browse: 'Sfoglia…',
    changeFolder: 'Cambia cartella di download…',
    reset: 'Ripristina predefiniti',
    copyDetails: 'Copia dettagli',
    copied: 'Copiato',
    loading: 'Caricamento…',
    unknown: 'Sconosciuto'
  },
  contextMenu: {
    cut: 'Taglia',
    copy: 'Copia',
    paste: 'Incolla',
    selectAll: 'Seleziona tutto'
  },
  nav: {
    changeLanguage: 'Cambia lingua',
    download: 'Scarica',
    queue: 'Coda',
    history: 'Cronologia',
    settings: 'Impostazioni'
  },
  input: {
    placeholder: 'Incolla un link di YouTube (video o playlist)',
    paste: 'Incolla',
    load: 'Carica',
    invalid: 'Non sembra un link di YouTube.',
    hint: 'Supporta video, Shorts, playlist e canali.'
  },
  preview: {
    by: 'di {channel}',
    duration: 'Durata',
    live: 'In diretta',
    videos: { one: '{count} video', many: '{count} di video', other: '{count} video' },
    selectAll: 'Seleziona tutti',
    selectNone: 'Deseleziona tutti',
    selected: '{selected} di {total} selezionati',
    alreadyDownloaded: 'Già scaricato',
    hideDownloaded: 'Nascondi quelli già scaricati',
    partOfPlaylist: 'Questo video fa parte di una playlist.',
    thisVideoOnly: 'Solo questo video',
    wholePlaylist: 'Tutta la playlist',
    unavailableEntry: 'Non disponibile'
  },
  options: {
    downloadAs: 'Scarica come',
    video: 'Video',
    audio: 'Solo audio',
    quality: 'Qualità',
    qualityBest: 'Migliore disponibile',
    container: 'Tipo di file',
    containerMp4: 'MP4 – si apre ovunque (fino a 1080p)',
    containerMkv: 'MKV – massima qualità (serve un lettore recente)',
    audioFormat: 'Formato audio',
    subtitles: 'Sottotitoli',
    subtitlesEnabled: 'Scarica i sottotitoli',
    subtitleLanguages: 'Lingue',
    autoSubs: 'Usa i sottotitoli automatici se necessario',
    embedSubs: 'Incorpora nel file video',
    saveTo: 'Salva in',
    download: 'Scarica',
    downloadMany: { one: 'Scarica {count} video', many: 'Scarica {count} di video', other: 'Scarica {count} video' },
    added: {
      one: '{count} download aggiunto alla coda',
      many: '{count} di download aggiunti alla coda',
      other: '{count} download aggiunti alla coda'
    },
    addedHint: 'Fai clic su “{queue}” a sinistra per vedere l’avanzamento e aprire il file quando è pronto.',
    skippedExisting: {
      one: 'Saltato {count} video già scaricato',
      many: 'Saltati {count} di video già scaricati',
      other: 'Saltati {count} video già scaricati'
    }
  },
  queue: {
    empty: 'Nessun download per ora. Incolla un link per iniziare.',
    status: {
      queued: 'In attesa',
      downloading: 'Download in corso',
      processing: 'Elaborazione',
      completed: 'Completato',
      failed: 'Non riuscito',
      cancelled: 'Annullato',
      skipped: 'Già scaricato'
    },
    progress: '{done} di {total}',
    speed: '{speed}',
    eta: 'ancora {time}',
    cancel: 'Annulla',
    retry: 'Riprova',
    openFile: 'Apri file',
    showInFolder: 'Mostra nella cartella',
    clearFinished: 'Rimuovi completati',
    cancelAll: 'Annulla tutto',
    active: { one: '{count} attivo', many: '{count} di attivi', other: '{count} attivi' }
  },
  history: {
    empty: 'Qui compariranno i download completati.',
    search: 'Cerca nella cronologia',
    clear: 'Cancella cronologia',
    clearConfirm: 'Rimuovere tutte le voci dalla cronologia? I file scaricati non vengono eliminati.',
    fileMissing: 'Il file è stato spostato o eliminato',
    downloadAgain: 'Scarica di nuovo',
    noResults: 'Nessun risultato.'
  },
  settings: {
    title: 'Impostazioni',
    sections: {
      downloads: 'Download',
      defaults: 'Opzioni predefinite',
      appearance: 'Aspetto',
      updates: 'Aggiornamenti',
      about: 'Informazioni'
    },
    downloadFolder: 'Cartella di download',
    maxConcurrent: 'Download simultanei',
    skipDownloaded: 'Salta i video già scaricati',
    skipDownloadedHelp: 'I video nella cronologia vengono esclusi quando aggiungi una playlist.',
    playlistSubfolder: 'Salva le playlist in una cartella propria',
    notifications: 'Mostra una notifica al termine di un download',
    language: 'Lingua',
    systemLanguage: 'Lingua di sistema',
    theme: 'Tema',
    themeSystem: 'Come il sistema',
    themeLight: 'Chiaro',
    themeDark: 'Scuro',
    appVersion: 'Versione dell’app',
    updateAvailable: 'È disponibile la versione {version}.',
    updateDownloading: 'Download dell’aggiornamento… {percent}',
    updateReady: 'La versione {version} è pronta per l’installazione.',
    restartToUpdate: 'Riavvia e aggiorna',
    manualUpdate: 'Scarica la nuova versione dalla pagina delle release.',
    openReleases: 'Apri la pagina delle release',
    engine: 'Motore di download',
    engineHelp: 'VidSnare aggiorna automaticamente sé stesso e il suo motore di download.',
    engineVersion: 'yt-dlp {version}',
    useSystemFolder: 'Usa la cartella Download di sistema',
    lastChecked: 'Ultimo controllo: {date}',
    never: 'Mai',
    disclaimer:
      'Sei responsabile del rispetto dei Termini di servizio di YouTube e delle leggi sul diritto d’autore. Scarica solo contenuti che hai il diritto di scaricare.',
    licenses: 'Licenze di terze parti',
    sourceCode: 'Codice sorgente'
  },
  notify: {
    finishedTitle: 'Download completato',
    failedTitle: 'Download non riuscito',
    allFinished: {
      one: '{count} download completato',
      many: '{count} di download completati',
      other: '{count} download completati'
    },
    failedMany: {
      one: '{count} download non riuscito',
      many: '{count} di download non riusciti',
      other: '{count} download non riusciti'
    }
  },
  errors: {
    PRIVATE_VIDEO: 'Questo video è privato.',
    VIDEO_UNAVAILABLE: 'Questo video non è disponibile. Potrebbe essere stato rimosso o non essere mai esistito.',
    AGE_RESTRICTED: 'Questo video ha limiti di età e richiede l’accesso, che VidSnare non usa.',
    MEMBERS_ONLY: 'Questo video è riservato agli abbonati paganti del canale.',
    PAID_CONTENT: 'Questo video va acquistato o noleggiato su YouTube.',
    REGION_BLOCKED: 'Questo video non è disponibile nel tuo paese.',
    COPYRIGHT_BLOCKED: 'Questo video è stato bloccato per una rivendicazione di copyright.',
    LIVE_NOT_STARTED: 'Questa diretta o première non è ancora iniziata. Riprova quando sarà cominciata.',
    DRM_PROTECTED: 'Questo video è protetto da copia (DRM) e non può essere scaricato.',
    BOT_CHECK: 'YouTube chiede di confermare che non sei un bot. Attendi un po’ e riprova.',
    RATE_LIMITED: 'YouTube sta limitando le richieste. Attendi qualche minuto e riprova.',
    NO_INTERNET: 'Impossibile raggiungere YouTube. Controlla la connessione a internet.',
    DISK_FULL: 'Non c’è abbastanza spazio libero sul disco.',
    PERMISSION_DENIED: 'VidSnare non può salvare file in questa cartella. Scegline un’altra.',
    FORMAT_UNAVAILABLE: 'La qualità o il formato scelto non è disponibile per questo video.',
    ENGINE_OUTDATED: 'YouTube ha cambiato qualcosa. VidSnare sta aggiornando il motore di download – riprova tra qualche minuto.',
    POSTPROCESSING_FAILED: 'Il file è stato scaricato ma non è stato possibile convertirlo.',
    TOOL_MISSING: 'Manca un componente necessario. Reinstalla VidSnare.',
    INVALID_URL: 'Non sembra un link di YouTube.',
    UNSUPPORTED_URL: 'Questo tipo di link non è supportato.',
    CANCELLED: 'Annullato.',
    UNKNOWN: 'Qualcosa è andato storto.'
  }
}
