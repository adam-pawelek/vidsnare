import type { Messages } from '../types'

export const cs: Messages = {
  app: {
    quitTitle: 'Probíhá stahování',
    quitMessage: 'Ukončením se zruší stahování, která ještě běží.',
    quitAnyway: 'Přesto ukončit',
    keepDownloading: 'Pokračovat ve stahování'
  },
  common: {
    ok: 'OK',
    cancel: 'Zrušit',
    close: 'Zavřít',
    retry: 'Zkusit znovu',
    remove: 'Odebrat',
    save: 'Uložit',
    browse: 'Procházet…',
    changeFolder: 'Změnit složku pro stahování…',
    reset: 'Obnovit výchozí',
    copyDetails: 'Kopírovat podrobnosti',
    copied: 'Zkopírováno',
    loading: 'Načítání…',
    unknown: 'Neznámé'
  },
  contextMenu: {
    cut: 'Vyjmout',
    copy: 'Kopírovat',
    paste: 'Vložit',
    selectAll: 'Vybrat vše'
  },
  nav: {
    changeLanguage: 'Změnit jazyk',
    download: 'Stáhnout',
    queue: 'Fronta',
    history: 'Historie',
    settings: 'Nastavení'
  },
  input: {
    placeholder: 'Vložte odkaz na YouTube (video nebo playlist)',
    paste: 'Vložit',
    load: 'Načíst',
    invalid: 'Tohle nevypadá jako odkaz na YouTube.',
    hint: 'Podporuje videa, Shorts, playlisty a kanály.'
  },
  preview: {
    by: 'kanál {channel}',
    duration: 'Délka',
    live: 'Živě',
    videos: { one: '{count} video', few: '{count} videa', many: '{count} videa', other: '{count} videí' },
    selectAll: 'Vybrat vše',
    selectNone: 'Zrušit výběr',
    selected: 'Vybráno {selected} z {total}',
    alreadyDownloaded: 'Už staženo',
    hideDownloaded: 'Skrýt už stažená',
    partOfPlaylist: 'Toto video je součástí playlistu.',
    thisVideoOnly: 'Jen toto video',
    wholePlaylist: 'Celý playlist',
    unavailableEntry: 'Nedostupné'
  },
  options: {
    downloadAs: 'Stáhnout jako',
    video: 'Video',
    audio: 'Jen zvuk',
    quality: 'Kvalita',
    qualityBest: 'Nejlepší dostupná',
    container: 'Typ souboru',
    containerMp4: 'MP4 – přehraje se všude (až 1080p)',
    containerMkv: 'MKV – nejvyšší kvalita (vyžaduje moderní přehrávač)',
    audioFormat: 'Formát zvuku',
    subtitles: 'Titulky',
    subtitlesEnabled: 'Stáhnout titulky',
    subtitleLanguages: 'Jazyky',
    autoSubs: 'V případě potřeby použít automatické titulky',
    embedSubs: 'Vložit do souboru videa',
    saveTo: 'Uložit do',
    download: 'Stáhnout',
    downloadMany: {
      one: 'Stáhnout {count} video',
      few: 'Stáhnout {count} videa',
      many: 'Stáhnout {count} videa',
      other: 'Stáhnout {count} videí'
    },
    added: {
      one: 'Do fronty přidáno {count} stahování',
      few: 'Do fronty přidána {count} stahování',
      many: 'Do fronty přidáno {count} stahování',
      other: 'Do fronty přidáno {count} stahování'
    },
    addedHint: 'Klikněte vlevo na „{queue}“, uvidíte průběh a po dokončení otevřete soubor.',
    skippedExisting: {
      one: 'Přeskočeno {count} už stažené video',
      few: 'Přeskočena {count} už stažená videa',
      many: 'Přeskočeno {count} už staženého videa',
      other: 'Přeskočeno {count} už stažených videí'
    }
  },
  queue: {
    empty: 'Zatím žádná stahování. Začněte vložením odkazu.',
    status: {
      queued: 'Čeká',
      downloading: 'Stahuje se',
      processing: 'Zpracovává se',
      completed: 'Hotovo',
      failed: 'Selhalo',
      cancelled: 'Zrušeno',
      skipped: 'Už staženo'
    },
    progress: '{done} z {total}',
    speed: '{speed}',
    eta: 'zbývá {time}',
    cancel: 'Zrušit',
    retry: 'Zkusit znovu',
    openFile: 'Otevřít soubor',
    showInFolder: 'Zobrazit ve složce',
    clearFinished: 'Vymazat dokončená',
    cancelAll: 'Zrušit vše',
    active: { one: '{count} aktivní', few: '{count} aktivní', many: '{count} aktivního', other: '{count} aktivních' }
  },
  history: {
    empty: 'Zde se zobrazí dokončená stahování.',
    search: 'Hledat v historii',
    clear: 'Vymazat historii',
    clearConfirm: 'Odebrat z historie všechny položky? Stažené soubory se nesmažou.',
    fileMissing: 'Soubor byl přesunut nebo smazán',
    downloadAgain: 'Stáhnout znovu',
    noResults: 'Nic nenalezeno.'
  },
  settings: {
    title: 'Nastavení',
    sections: {
      downloads: 'Stahování',
      defaults: 'Výchozí možnosti',
      appearance: 'Vzhled',
      updates: 'Aktualizace',
      about: 'O aplikaci'
    },
    downloadFolder: 'Složka pro stahování',
    maxConcurrent: 'Souběžná stahování',
    skipDownloaded: 'Přeskakovat už stažená videa',
    skipDownloadedHelp: 'Videa z historie stahování se při přidání playlistu vynechají.',
    playlistSubfolder: 'Ukládat playlisty do vlastní složky',
    notifications: 'Po dokončení stahování zobrazit oznámení',
    language: 'Jazyk',
    systemLanguage: 'Jazyk systému',
    theme: 'Motiv',
    themeSystem: 'Podle systému',
    themeLight: 'Světlý',
    themeDark: 'Tmavý',
    appVersion: 'Verze aplikace',
    updateAvailable: 'Je k dispozici verze {version}.',
    updateDownloading: 'Stahuje se aktualizace… {percent}',
    updateReady: 'Verze {version} je připravena k instalaci.',
    restartToUpdate: 'Restartovat a aktualizovat',
    manualUpdate: 'Stáhněte novou verzi ze stránky vydání.',
    openReleases: 'Otevřít stránku vydání',
    engine: 'Stahovací jádro',
    engineHelp: 'VidSnare automaticky aktualizuje sebe i své stahovací jádro.',
    engineVersion: 'yt-dlp {version}',
    useSystemFolder: 'Použít systémovou složku Stažené soubory',
    lastChecked: 'Naposledy zkontrolováno: {date}',
    never: 'Nikdy',
    disclaimer:
      'Odpovídáte za dodržování smluvních podmínek YouTube a autorského práva. Stahujte jen obsah, ke kterému máte právo.',
    licenses: 'Licence třetích stran',
    sourceCode: 'Zdrojový kód'
  },
  notify: {
    finishedTitle: 'Stahování dokončeno',
    failedTitle: 'Stahování selhalo',
    allFinished: {
      one: 'Dokončeno {count} stahování',
      few: 'Dokončena {count} stahování',
      many: 'Dokončeno {count} stahování',
      other: 'Dokončeno {count} stahování'
    },
    failedMany: {
      one: 'Selhalo {count} stahování',
      few: 'Selhala {count} stahování',
      many: 'Selhalo {count} stahování',
      other: 'Selhalo {count} stahování'
    }
  },
  errors: {
    PRIVATE_VIDEO: 'Toto video je soukromé.',
    VIDEO_UNAVAILABLE: 'Toto video není dostupné. Mohlo být odstraněno nebo nikdy neexistovalo.',
    AGE_RESTRICTED: 'Toto video má věkové omezení a vyžaduje přihlášení, které VidSnare nepoužívá.',
    MEMBERS_ONLY: 'Toto video je jen pro platící členy kanálu.',
    PAID_CONTENT: 'Toto video je nutné na YouTube koupit nebo si ho půjčit.',
    REGION_BLOCKED: 'Toto video není ve vaší zemi dostupné.',
    COPYRIGHT_BLOCKED: 'Toto video bylo zablokováno kvůli nároku na autorská práva.',
    LIVE_NOT_STARTED: 'Tento přímý přenos nebo premiéra ještě nezačaly. Zkuste to znovu po začátku.',
    DRM_PROTECTED: 'Toto video je chráněné proti kopírování (DRM) a nelze ho stáhnout.',
    BOT_CHECK: 'YouTube žádá o potvrzení, že nejste robot. Chvíli počkejte a zkuste to znovu.',
    RATE_LIMITED: 'YouTube teď omezuje počet požadavků. Počkejte několik minut a zkuste to znovu.',
    NO_INTERNET: 'Nelze se připojit k YouTube. Zkontrolujte připojení k internetu.',
    DISK_FULL: 'Na disku není dost volného místa.',
    PERMISSION_DENIED: 'VidSnare nemůže ukládat soubory do této složky. Vyberte jinou složku.',
    FORMAT_UNAVAILABLE: 'Zvolená kvalita nebo formát pro toto video nejsou dostupné.',
    ENGINE_OUTDATED: 'YouTube něco změnil. VidSnare aktualizuje stahovací jádro – zkuste to znovu za pár minut.',
    POSTPROCESSING_FAILED: 'Soubor se stáhl, ale nepodařilo se ho převést.',
    TOOL_MISSING: 'Chybí potřebná součást. Přeinstalujte VidSnare.',
    INVALID_URL: 'Tohle nevypadá jako odkaz na YouTube.',
    UNSUPPORTED_URL: 'Tento druh odkazu není podporován.',
    CANCELLED: 'Zrušeno.',
    UNKNOWN: 'Něco se pokazilo.'
  }
}
