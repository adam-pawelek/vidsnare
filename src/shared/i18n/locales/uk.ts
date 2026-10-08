import type { Messages } from '../types'

export const uk: Messages = {
  app: {
    quitTitle: 'Триває завантаження',
    quitMessage: 'Якщо вийти, незавершені завантаження буде скасовано.',
    quitAnyway: 'Все одно вийти',
    keepDownloading: 'Продовжити завантаження'
  },
  common: {
    ok: 'Гаразд',
    cancel: 'Скасувати',
    close: 'Закрити',
    retry: 'Повторити',
    remove: 'Видалити',
    save: 'Зберегти',
    browse: 'Огляд…',
    changeFolder: 'Змінити папку завантажень…',
    reset: 'Скинути налаштування',
    copyDetails: 'Копіювати подробиці',
    copied: 'Скопійовано',
    loading: 'Завантаження…',
    unknown: 'Невідомо'
  },
  contextMenu: {
    cut: 'Вирізати',
    copy: 'Копіювати',
    paste: 'Вставити',
    selectAll: 'Виділити все'
  },
  nav: {
    changeLanguage: 'Змінити мову',
    download: 'Завантажити',
    queue: 'Черга',
    history: 'Історія',
    settings: 'Налаштування'
  },
  input: {
    placeholder: 'Вставте посилання на YouTube (відео або плейлист)',
    paste: 'Вставити',
    load: 'Відкрити',
    invalid: 'Це не схоже на посилання на YouTube.',
    hint: 'Підтримуються відео, Shorts, плейлисти й канали.'
  },
  preview: {
    by: 'канал {channel}',
    duration: 'Тривалість',
    live: 'Наживо',
    videos: { one: '{count} відео', few: '{count} відео', many: '{count} відео', other: '{count} відео' },
    selectAll: 'Вибрати всі',
    selectNone: 'Зняти вибір',
    selected: 'Вибрано {selected} з {total}',
    alreadyDownloaded: 'Уже завантажено',
    hideDownloaded: 'Приховати вже завантажені',
    partOfPlaylist: 'Це відео входить до плейлиста.',
    thisVideoOnly: 'Лише це відео',
    wholePlaylist: 'Увесь плейлист',
    unavailableEntry: 'Недоступне'
  },
  options: {
    downloadAs: 'Завантажити як',
    video: 'Відео',
    audio: 'Лише аудіо',
    quality: 'Якість',
    qualityBest: 'Найкраща доступна',
    container: 'Тип файлу',
    containerMp4: 'MP4 – відтворюється всюди (до 1080p)',
    containerMkv: 'MKV – найвища якість (потрібен сучасний програвач)',
    audioFormat: 'Формат аудіо',
    subtitles: 'Субтитри',
    subtitlesEnabled: 'Завантажити субтитри',
    subtitleLanguages: 'Мови',
    autoSubs: 'За потреби використовувати автоматичні субтитри',
    embedSubs: 'Вбудувати у відеофайл',
    saveTo: 'Зберегти в',
    download: 'Завантажити',
    downloadMany: {
      one: 'Завантажити {count} відео',
      few: 'Завантажити {count} відео',
      many: 'Завантажити {count} відео',
      other: 'Завантажити {count} відео'
    },
    added: {
      one: 'До черги додано {count} завантаження',
      few: 'До черги додано {count} завантаження',
      many: 'До черги додано {count} завантажень',
      other: 'До черги додано {count} завантаження'
    },
    addedHint: 'Натисніть «{queue}» ліворуч, щоб стежити за прогресом і відкрити файл, коли він буде готовий.',
    skippedExisting: {
      one: 'Пропущено {count} уже завантажене відео',
      few: 'Пропущено {count} уже завантажені відео',
      many: 'Пропущено {count} уже завантажених відео',
      other: 'Пропущено {count} уже завантаженого відео'
    }
  },
  queue: {
    empty: 'Завантажень поки немає. Вставте посилання, щоб почати.',
    status: {
      queued: 'У черзі',
      downloading: 'Завантаження',
      processing: 'Обробка',
      completed: 'Готово',
      failed: 'Помилка',
      cancelled: 'Скасовано',
      skipped: 'Уже завантажено'
    },
    progress: '{done} з {total}',
    speed: '{speed}',
    eta: 'залишилось {time}',
    cancel: 'Скасувати',
    retry: 'Повторити',
    openFile: 'Відкрити файл',
    showInFolder: 'Показати в папці',
    clearFinished: 'Прибрати завершені',
    cancelAll: 'Скасувати всі',
    active: { one: '{count} активне', few: '{count} активні', many: '{count} активних', other: '{count} активного' }
  },
  history: {
    empty: 'Тут з’являться завершені завантаження.',
    search: 'Пошук в історії',
    clear: 'Очистити історію',
    clearConfirm: 'Видалити всі записи з історії? Завантажені файли не буде видалено.',
    fileMissing: 'Файл переміщено або видалено',
    downloadAgain: 'Завантажити знову',
    noResults: 'Нічого не знайдено.'
  },
  settings: {
    title: 'Налаштування',
    sections: {
      downloads: 'Завантаження',
      defaults: 'Параметри за замовчуванням',
      appearance: 'Вигляд',
      updates: 'Оновлення',
      about: 'Про програму'
    },
    downloadFolder: 'Папка завантажень',
    maxConcurrent: 'Одночасних завантажень',
    skipDownloaded: 'Пропускати вже завантажені відео',
    skipDownloadedHelp: 'Відео з історії завантажень не додаються, коли ви додаєте плейлист.',
    playlistSubfolder: 'Зберігати плейлисти в окрему папку',
    notifications: 'Показувати сповіщення після завершення завантаження',
    language: 'Мова',
    systemLanguage: 'Мова системи',
    theme: 'Тема',
    themeSystem: 'Як у системі',
    themeLight: 'Світла',
    themeDark: 'Темна',
    appVersion: 'Версія програми',
    updateAvailable: 'Доступна версія {version}.',
    updateDownloading: 'Завантаження оновлення… {percent}',
    updateReady: 'Версія {version} готова до встановлення.',
    restartToUpdate: 'Перезапустити й оновити',
    manualUpdate: 'Завантажте нову версію зі сторінки випусків.',
    openReleases: 'Відкрити сторінку випусків',
    engine: 'Рушій завантаження',
    engineHelp: 'VidSnare автоматично оновлює себе та свій рушій завантаження.',
    engineVersion: 'yt-dlp {version}',
    useSystemFolder: 'Використовувати системну папку «Завантаження»',
    lastChecked: 'Остання перевірка: {date}',
    never: 'Ніколи',
    disclaimer:
      'Ви відповідаєте за дотримання Умов використання YouTube та авторського права. Завантажуйте лише те, на що маєте право.',
    licenses: 'Ліцензії сторонніх компонентів',
    sourceCode: 'Вихідний код'
  },
  notify: {
    finishedTitle: 'Завантаження завершено',
    failedTitle: 'Помилка завантаження',
    allFinished: {
      one: 'Завершено {count} завантаження',
      few: 'Завершено {count} завантаження',
      many: 'Завершено {count} завантажень',
      other: 'Завершено {count} завантаження'
    },
    failedMany: {
      one: 'Не вдалося {count} завантаження',
      few: 'Не вдалися {count} завантаження',
      many: 'Не вдалося {count} завантажень',
      other: 'Не вдалося {count} завантаження'
    }
  },
  errors: {
    PRIVATE_VIDEO: 'Це відео приватне.',
    VIDEO_UNAVAILABLE: 'Це відео недоступне. Можливо, його видалено або його ніколи не існувало.',
    AGE_RESTRICTED: 'Це відео має вікові обмеження й потребує входу в обліковий запис, якого VidSnare не використовує.',
    MEMBERS_ONLY: 'Це відео доступне лише платним спонсорам каналу.',
    PAID_CONTENT: 'Це відео треба купити або взяти напрокат на YouTube.',
    REGION_BLOCKED: 'Це відео недоступне у вашій країні.',
    COPYRIGHT_BLOCKED: 'Це відео заблоковано через скаргу правовласника.',
    LIVE_NOT_STARTED: 'Ця трансляція або прем’єра ще не почалася. Спробуйте знову, коли вона розпочнеться.',
    DRM_PROTECTED: 'Це відео захищене від копіювання (DRM), тому його не можна завантажити.',
    BOT_CHECK: 'YouTube просить підтвердити, що ви не робот. Зачекайте трохи й спробуйте знову.',
    RATE_LIMITED: 'YouTube зараз обмежує кількість запитів. Зачекайте кілька хвилин і спробуйте знову.',
    NO_INTERNET: 'Не вдається з’єднатися з YouTube. Перевірте підключення до інтернету.',
    DISK_FULL: 'На диску недостатньо вільного місця.',
    PERMISSION_DENIED: 'VidSnare не має права зберігати файли в цій папці. Виберіть іншу папку.',
    FORMAT_UNAVAILABLE: 'Вибрана якість або формат недоступні для цього відео.',
    ENGINE_OUTDATED: 'На YouTube щось змінилося. VidSnare оновлює рушій завантаження – спробуйте знову за кілька хвилин.',
    POSTPROCESSING_FAILED: 'Файл завантажено, але його не вдалося перетворити.',
    TOOL_MISSING: 'Бракує потрібного компонента. Перевстановіть VidSnare.',
    INVALID_URL: 'Це не схоже на посилання на YouTube.',
    UNSUPPORTED_URL: 'Такі посилання не підтримуються.',
    CANCELLED: 'Скасовано.',
    UNKNOWN: 'Щось пішло не так.'
  }
}
