import type { Messages } from '../types'

export const pl: Messages = {
  app: {
    quitTitle: 'Trwa pobieranie',
    quitMessage: 'Zamknięcie programu anuluje trwające pobierania.',
    quitAnyway: 'Zamknij mimo to',
    keepDownloading: 'Kontynuuj pobieranie'
  },
  common: {
    ok: 'OK',
    cancel: 'Anuluj',
    close: 'Zamknij',
    retry: 'Ponów',
    remove: 'Usuń',
    save: 'Zapisz',
    browse: 'Przeglądaj…',
    changeFolder: 'Zmień folder pobierania…',
    reset: 'Przywróć domyślne',
    copyDetails: 'Kopiuj szczegóły',
    copied: 'Skopiowano',
    loading: 'Wczytywanie…',
    unknown: 'Nieznane'
  },
  contextMenu: {
    cut: 'Wytnij',
    copy: 'Kopiuj',
    paste: 'Wklej',
    selectAll: 'Zaznacz wszystko'
  },
  nav: {
    changeLanguage: 'Zmień język',
    download: 'Pobierz',
    queue: 'Kolejka',
    history: 'Historia',
    settings: 'Ustawienia'
  },
  input: {
    placeholder: 'Wklej link do YouTube (film lub playlista)',
    paste: 'Wklej',
    load: 'Wczytaj',
    invalid: 'To nie wygląda na link do YouTube.',
    hint: 'Obsługiwane są filmy, Shorts, playlisty i kanały.'
  },
  preview: {
    by: 'kanał {channel}',
    duration: 'Czas trwania',
    live: 'Na żywo',
    videos: { one: '{count} film', few: '{count} filmy', many: '{count} filmów', other: '{count} filmu' },
    selectAll: 'Zaznacz wszystkie',
    selectNone: 'Odznacz wszystkie',
    selected: 'Zaznaczono {selected} z {total}',
    alreadyDownloaded: 'Już pobrany',
    hideDownloaded: 'Ukryj już pobrane',
    partOfPlaylist: 'Ten film jest częścią playlisty.',
    thisVideoOnly: 'Tylko ten film',
    wholePlaylist: 'Cała playlista',
    unavailableEntry: 'Niedostępny'
  },
  options: {
    downloadAs: 'Pobierz jako',
    video: 'Wideo',
    audio: 'Tylko dźwięk',
    quality: 'Jakość',
    qualityBest: 'Najlepsza dostępna',
    container: 'Typ pliku',
    containerMp4: 'MP4 – działa wszędzie (do 1080p)',
    containerMkv: 'MKV – najwyższa jakość (wymaga nowoczesnego odtwarzacza)',
    audioFormat: 'Format dźwięku',
    subtitles: 'Napisy',
    subtitlesEnabled: 'Pobierz napisy',
    subtitleLanguages: 'Języki',
    autoSubs: 'W razie potrzeby użyj napisów automatycznych',
    embedSubs: 'Osadź w pliku wideo',
    saveTo: 'Zapisz w',
    download: 'Pobierz',
    downloadMany: {
      one: 'Pobierz {count} film',
      few: 'Pobierz {count} filmy',
      many: 'Pobierz {count} filmów',
      other: 'Pobierz {count} filmu'
    },
    added: {
      one: 'Dodano {count} pobieranie do kolejki',
      few: 'Dodano {count} pobierania do kolejki',
      many: 'Dodano {count} pobierań do kolejki',
      other: 'Dodano {count} pobierania do kolejki'
    },
    skippedExisting: {
      one: 'Pominięto {count} już pobrany film',
      few: 'Pominięto {count} już pobrane filmy',
      many: 'Pominięto {count} już pobranych filmów',
      other: 'Pominięto {count} już pobranego filmu'
    }
  },
  queue: {
    empty: 'Brak pobrań. Wklej link, aby zacząć.',
    status: {
      queued: 'Oczekuje',
      downloading: 'Pobieranie',
      processing: 'Przetwarzanie',
      completed: 'Gotowe',
      failed: 'Błąd',
      cancelled: 'Anulowano',
      skipped: 'Już pobrany'
    },
    progress: '{done} z {total}',
    speed: '{speed}',
    eta: 'Pozostało {time}',
    cancel: 'Anuluj',
    retry: 'Ponów',
    openFile: 'Otwórz plik',
    showInFolder: 'Pokaż w folderze',
    clearFinished: 'Wyczyść zakończone',
    cancelAll: 'Anuluj wszystkie',
    active: { one: '{count} aktywne', few: '{count} aktywne', many: '{count} aktywnych', other: '{count} aktywnego' }
  },
  history: {
    empty: 'Tutaj pojawią się zakończone pobrania.',
    search: 'Szukaj w historii',
    clear: 'Wyczyść historię',
    clearConfirm: 'Usunąć wszystkie wpisy z historii? Pobrane pliki nie zostaną usunięte.',
    fileMissing: 'Plik został przeniesiony lub usunięty',
    downloadAgain: 'Pobierz ponownie',
    noResults: 'Brak wyników wyszukiwania.'
  },
  settings: {
    title: 'Ustawienia',
    sections: {
      downloads: 'Pobieranie',
      defaults: 'Opcje domyślne',
      appearance: 'Wygląd',
      updates: 'Aktualizacje',
      about: 'O programie'
    },
    downloadFolder: 'Folder pobierania',
    maxConcurrent: 'Jednoczesne pobierania',
    skipDownloaded: 'Pomijaj już pobrane filmy',
    skipDownloadedHelp: 'Filmy z historii pobierania są pomijane przy dodawaniu playlisty.',
    playlistSubfolder: 'Zapisuj playlisty w osobnym folderze',
    filenameTemplate: 'Nazwa pliku',
    filenameTemplateHelp: 'Dostępne pola: {fields}',
    filenamePreview: 'Przykład: {example}',
    notifications: 'Pokazuj powiadomienie po zakończeniu pobierania',
    language: 'Język',
    systemLanguage: 'Język systemu',
    theme: 'Motyw',
    themeSystem: 'Zgodny z systemem',
    themeLight: 'Jasny',
    themeDark: 'Ciemny',
    appVersion: 'Wersja aplikacji',
    checkForUpdates: 'Sprawdź aktualizacje',
    checking: 'Sprawdzanie…',
    upToDate: 'Masz najnowszą wersję.',
    updateAvailable: 'Dostępna jest wersja {version}.',
    updateDownloading: 'Pobieranie aktualizacji… {percent}',
    updateReady: 'Wersja {version} jest gotowa do instalacji.',
    restartToUpdate: 'Uruchom ponownie i zaktualizuj',
    manualUpdate: 'Pobierz nową wersję ze strony wydań.',
    openReleases: 'Otwórz stronę wydań',
    updateFailed: 'Nie udało się sprawdzić aktualizacji.',
    engine: 'Silnik pobierania',
    engineHelp: 'YouTube często się zmienia. Silnik aktualizuje się niezależnie od aplikacji.',
    engineVersion: 'yt-dlp {version}',
    updateEngine: 'Zaktualizuj silnik',
    engineUpdated: 'Silnik zaktualizowano do wersji {version}.',
    engineUpToDate: 'Silnik jest aktualny.',
    engineUpdateFailed: 'Nie udało się zaktualizować silnika. Nadal używana jest obecna wersja.',
    useSystemFolder: 'Używaj systemowego folderu Pobrane',
    templateInvalid: 'Nazwa pliku musi zawierać tytuł lub identyfikator filmu.',
    lastChecked: 'Ostatnie sprawdzenie: {date}',
    never: 'Nigdy',
    disclaimer:
      'Odpowiadasz za przestrzeganie Warunków korzystania z YouTube i prawa autorskiego. Pobieraj tylko treści, do których masz prawo.',
    licenses: 'Licencje zewnętrzne',
    sourceCode: 'Kod źródłowy'
  },
  notify: {
    finishedTitle: 'Pobieranie zakończone',
    failedTitle: 'Pobieranie nie powiodło się',
    allFinished: {
      one: 'Zakończono {count} pobieranie',
      few: 'Zakończono {count} pobierania',
      many: 'Zakończono {count} pobierań',
      other: 'Zakończono {count} pobierania'
    },
    failedMany: {
      one: '{count} pobieranie nie powiodło się',
      few: '{count} pobierania nie powiodły się',
      many: '{count} pobierań nie powiodło się',
      other: '{count} pobierania nie powiodło się'
    }
  },
  errors: {
    PRIVATE_VIDEO: 'Ten film jest prywatny.',
    VIDEO_UNAVAILABLE: 'Ten film jest niedostępny. Mógł zostać usunięty lub nigdy nie istniał.',
    AGE_RESTRICTED: 'Ten film ma ograniczenie wiekowe i wymaga zalogowania, a VidSnare nie loguje się do YouTube.',
    MEMBERS_ONLY: 'Ten film jest dostępny tylko dla płacących członków kanału.',
    PAID_CONTENT: 'Ten film trzeba kupić lub wypożyczyć w YouTube.',
    REGION_BLOCKED: 'Ten film jest niedostępny w Twoim kraju.',
    COPYRIGHT_BLOCKED: 'Ten film zablokowano z powodu roszczenia dotyczącego praw autorskich.',
    LIVE_NOT_STARTED: 'Ta transmisja lub premiera jeszcze się nie rozpoczęła. Spróbuj ponownie, gdy się zacznie.',
    DRM_PROTECTED: 'Ten film jest chroniony przed kopiowaniem (DRM) i nie można go pobrać.',
    BOT_CHECK: 'YouTube prosi o potwierdzenie, że nie jesteś botem. Odczekaj chwilę i spróbuj ponownie.',
    RATE_LIMITED: 'YouTube ogranicza teraz liczbę zapytań. Odczekaj kilka minut i spróbuj ponownie.',
    NO_INTERNET: 'Nie można połączyć się z YouTube. Sprawdź połączenie z internetem.',
    DISK_FULL: 'Na dysku brakuje wolnego miejsca.',
    PERMISSION_DENIED: 'VidSnare nie ma uprawnień do zapisu w tym folderze. Wybierz inny folder.',
    FORMAT_UNAVAILABLE: 'Wybrana jakość lub format nie jest dostępny dla tego filmu.',
    ENGINE_OUTDATED: 'YouTube coś zmienił. Zaktualizuj silnik pobierania w Ustawieniach i spróbuj ponownie.',
    POSTPROCESSING_FAILED: 'Plik został pobrany, ale nie udało się go przekonwertować.',
    TOOL_MISSING: 'Brakuje wymaganego składnika. Zainstaluj VidSnare ponownie.',
    INVALID_URL: 'To nie wygląda na link do YouTube.',
    UNSUPPORTED_URL: 'Ten rodzaj linku nie jest obsługiwany.',
    CANCELLED: 'Anulowano.',
    UNKNOWN: 'Coś poszło nie tak.'
  }
}
