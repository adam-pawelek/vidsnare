import type { Messages } from '../types'

export const ru: Messages = {
  app: {
    quitTitle: 'Идут загрузки',
    quitMessage: 'При выходе незавершённые загрузки будут отменены.',
    quitAnyway: 'Всё равно выйти',
    keepDownloading: 'Продолжить загрузку'
  },
  common: {
    ok: 'ОК',
    cancel: 'Отмена',
    close: 'Закрыть',
    retry: 'Повторить',
    remove: 'Удалить',
    save: 'Сохранить',
    browse: 'Обзор…',
    changeFolder: 'Изменить папку загрузок…',
    reset: 'Сбросить настройки',
    copyDetails: 'Скопировать подробности',
    copied: 'Скопировано',
    loading: 'Загрузка…',
    unknown: 'Неизвестно'
  },
  contextMenu: {
    cut: 'Вырезать',
    copy: 'Копировать',
    paste: 'Вставить',
    selectAll: 'Выделить всё'
  },
  nav: {
    changeLanguage: 'Сменить язык',
    download: 'Скачать',
    queue: 'Очередь',
    history: 'История',
    settings: 'Настройки'
  },
  input: {
    placeholder: 'Вставьте ссылку на YouTube (видео или плейлист)',
    paste: 'Вставить',
    load: 'Загрузить',
    invalid: 'Это не похоже на ссылку на YouTube.',
    hint: 'Поддерживаются видео, Shorts, плейлисты и каналы.'
  },
  preview: {
    by: 'канал {channel}',
    duration: 'Длительность',
    live: 'Прямой эфир',
    videos: { one: '{count} видео', few: '{count} видео', many: '{count} видео', other: '{count} видео' },
    selectAll: 'Выбрать все',
    selectNone: 'Снять выбор',
    selected: 'Выбрано {selected} из {total}',
    alreadyDownloaded: 'Уже скачано',
    hideDownloaded: 'Скрыть уже скачанные',
    partOfPlaylist: 'Это видео входит в плейлист.',
    thisVideoOnly: 'Только это видео',
    wholePlaylist: 'Весь плейлист',
    unavailableEntry: 'Недоступно'
  },
  options: {
    downloadAs: 'Скачать как',
    video: 'Видео',
    audio: 'Только аудио',
    quality: 'Качество',
    qualityBest: 'Наилучшее доступное',
    container: 'Тип файла',
    containerMp4: 'MP4 – открывается везде (до 1080p)',
    containerMkv: 'MKV – наилучшее качество (нужен современный плеер)',
    audioFormat: 'Формат аудио',
    subtitles: 'Субтитры',
    subtitlesEnabled: 'Скачать субтитры',
    subtitleLanguages: 'Языки',
    autoSubs: 'При необходимости использовать автоматические субтитры',
    embedSubs: 'Встроить в видеофайл',
    saveTo: 'Сохранить в',
    download: 'Скачать',
    downloadMany: {
      one: 'Скачать {count} видео',
      few: 'Скачать {count} видео',
      many: 'Скачать {count} видео',
      other: 'Скачать {count} видео'
    },
    added: {
      one: 'В очередь добавлена {count} загрузка',
      few: 'В очередь добавлены {count} загрузки',
      many: 'В очередь добавлено {count} загрузок',
      other: 'В очередь добавлено {count} загрузки'
    },
    addedHint: 'Нажмите «{queue}» слева, чтобы следить за загрузкой и открыть файл, когда он будет готов.',
    skippedExisting: {
      one: 'Пропущено {count} уже скачанное видео',
      few: 'Пропущено {count} уже скачанных видео',
      many: 'Пропущено {count} уже скачанных видео',
      other: 'Пропущено {count} уже скачанного видео'
    }
  },
  queue: {
    empty: 'Загрузок пока нет. Вставьте ссылку, чтобы начать.',
    status: {
      queued: 'В очереди',
      downloading: 'Скачивание',
      processing: 'Обработка',
      completed: 'Готово',
      failed: 'Ошибка',
      cancelled: 'Отменено',
      skipped: 'Уже скачано'
    },
    progress: '{done} из {total}',
    speed: '{speed}',
    eta: 'осталось {time}',
    cancel: 'Отменить',
    retry: 'Повторить',
    openFile: 'Открыть файл',
    showInFolder: 'Показать в папке',
    clearFinished: 'Убрать завершённые',
    cancelAll: 'Отменить все',
    active: { one: '{count} активная', few: '{count} активные', many: '{count} активных', other: '{count} активной' }
  },
  history: {
    empty: 'Здесь появятся завершённые загрузки.',
    search: 'Поиск по истории',
    clear: 'Очистить историю',
    clearConfirm: 'Удалить все записи из истории? Скачанные файлы не будут удалены.',
    fileMissing: 'Файл перемещён или удалён',
    downloadAgain: 'Скачать снова',
    noResults: 'Ничего не найдено.'
  },
  settings: {
    title: 'Настройки',
    sections: {
      downloads: 'Загрузки',
      defaults: 'Параметры по умолчанию',
      appearance: 'Внешний вид',
      updates: 'Обновления',
      about: 'О программе'
    },
    downloadFolder: 'Папка для загрузок',
    maxConcurrent: 'Одновременных загрузок',
    skipDownloaded: 'Пропускать уже скачанные видео',
    skipDownloadedHelp: 'Видео из истории загрузок не добавляются при добавлении плейлиста.',
    playlistSubfolder: 'Сохранять плейлисты в отдельную папку',
    notifications: 'Показывать уведомление по завершении загрузки',
    language: 'Язык',
    systemLanguage: 'Язык системы',
    theme: 'Тема',
    themeSystem: 'Как в системе',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    appVersion: 'Версия приложения',
    updateAvailable: 'Доступна версия {version}.',
    updateDownloading: 'Загрузка обновления… {percent}',
    updateReady: 'Версия {version} готова к установке.',
    restartToUpdate: 'Перезапустить и обновить',
    manualUpdate: 'Скачайте новую версию со страницы релизов.',
    openReleases: 'Открыть страницу релизов',
    engine: 'Движок загрузки',
    engineHelp: 'VidSnare автоматически обновляет себя и движок загрузки.',
    engineVersion: 'yt-dlp {version}',
    useSystemFolder: 'Использовать системную папку «Загрузки»',
    lastChecked: 'Последняя проверка: {date}',
    never: 'Никогда',
    disclaimer:
      'Вы несёте ответственность за соблюдение Условий использования YouTube и авторского права. Скачивайте только то, на что у вас есть права.',
    licenses: 'Лицензии сторонних компонентов',
    sourceCode: 'Исходный код'
  },
  notify: {
    finishedTitle: 'Загрузка завершена',
    failedTitle: 'Ошибка загрузки',
    allFinished: {
      one: 'Завершена {count} загрузка',
      few: 'Завершены {count} загрузки',
      many: 'Завершено {count} загрузок',
      other: 'Завершено {count} загрузки'
    },
    failedMany: {
      one: 'Не удалась {count} загрузка',
      few: 'Не удались {count} загрузки',
      many: 'Не удалось {count} загрузок',
      other: 'Не удалось {count} загрузки'
    }
  },
  errors: {
    PRIVATE_VIDEO: 'Это видео закрыто владельцем.',
    VIDEO_UNAVAILABLE: 'Это видео недоступно. Возможно, оно удалено или никогда не существовало.',
    AGE_RESTRICTED: 'У этого видео есть возрастное ограничение, и для просмотра нужен вход в аккаунт, который VidSnare не использует.',
    MEMBERS_ONLY: 'Это видео доступно только платным спонсорам канала.',
    PAID_CONTENT: 'Это видео нужно купить или взять напрокат на YouTube.',
    REGION_BLOCKED: 'Это видео недоступно в вашей стране.',
    COPYRIGHT_BLOCKED: 'Это видео заблокировано из-за жалобы правообладателя.',
    LIVE_NOT_STARTED: 'Эта трансляция или премьера ещё не началась. Повторите попытку после её начала.',
    DRM_PROTECTED: 'Это видео защищено от копирования (DRM), скачать его нельзя.',
    BOT_CHECK: 'YouTube просит подтвердить, что вы не робот. Подождите немного и повторите попытку.',
    RATE_LIMITED: 'YouTube сейчас ограничивает число запросов. Подождите несколько минут и повторите попытку.',
    NO_INTERNET: 'Не удаётся подключиться к YouTube. Проверьте подключение к интернету.',
    DISK_FULL: 'На диске недостаточно свободного места.',
    PERMISSION_DENIED: 'У VidSnare нет прав на сохранение файлов в эту папку. Выберите другую папку.',
    FORMAT_UNAVAILABLE: 'Выбранное качество или формат недоступны для этого видео.',
    ENGINE_OUTDATED: 'На YouTube что-то изменилось. Обновите движок загрузки в настройках и повторите попытку.',
    POSTPROCESSING_FAILED: 'Файл скачан, но его не удалось преобразовать.',
    TOOL_MISSING: 'Отсутствует необходимый компонент. Переустановите VidSnare.',
    INVALID_URL: 'Это не похоже на ссылку на YouTube.',
    UNSUPPORTED_URL: 'Такие ссылки не поддерживаются.',
    CANCELLED: 'Отменено.',
    UNKNOWN: 'Что-то пошло не так.'
  }
}
