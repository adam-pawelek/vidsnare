import type { Messages } from '../types'

export const ar: Messages = {
  app: {
    quitTitle: 'تنزيلات قيد التشغيل',
    quitMessage: 'سيؤدي الخروج إلى إلغاء التنزيلات التي لا تزال قيد التشغيل.',
    quitAnyway: 'الخروج على أي حال',
    keepDownloading: 'متابعة التنزيل'
  },
  common: {
    ok: 'موافق',
    cancel: 'إلغاء',
    close: 'إغلاق',
    retry: 'إعادة المحاولة',
    remove: 'إزالة',
    save: 'حفظ',
    browse: 'استعراض…',
    changeFolder: 'تغيير مجلد التنزيلات…',
    reset: 'استعادة الإعدادات الافتراضية',
    copyDetails: 'نسخ التفاصيل',
    copied: 'تم النسخ',
    loading: 'جارٍ التحميل…',
    unknown: 'غير معروف'
  },
  contextMenu: {
    cut: 'قص',
    copy: 'نسخ',
    paste: 'لصق',
    selectAll: 'تحديد الكل'
  },
  nav: {
    changeLanguage: 'تغيير اللغة',
    download: 'تنزيل',
    queue: 'قائمة الانتظار',
    history: 'السجل',
    settings: 'الإعدادات'
  },
  input: {
    placeholder: 'الصق رابط YouTube (فيديو أو قائمة تشغيل)',
    paste: 'لصق',
    load: 'تحميل',
    invalid: 'لا يبدو هذا رابط YouTube.',
    hint: 'يدعم الفيديوهات وShorts وقوائم التشغيل والقنوات.'
  },
  preview: {
    by: 'بواسطة {channel}',
    duration: 'المدة',
    live: 'بث مباشر',
    videos: {
      zero: 'لا توجد فيديوهات',
      one: 'فيديو واحد',
      two: 'فيديوهان',
      few: '{count} فيديوهات',
      many: '{count} فيديو',
      other: '{count} فيديو'
    },
    selectAll: 'تحديد الكل',
    selectNone: 'إلغاء التحديد',
    selected: 'تم تحديد {selected} من {total}',
    alreadyDownloaded: 'تم تنزيله سابقًا',
    hideDownloaded: 'إخفاء ما تم تنزيله',
    partOfPlaylist: 'هذا الفيديو جزء من قائمة تشغيل.',
    thisVideoOnly: 'هذا الفيديو فقط',
    wholePlaylist: 'قائمة التشغيل كاملة',
    unavailableEntry: 'غير متاح'
  },
  options: {
    downloadAs: 'التنزيل بصيغة',
    video: 'فيديو',
    audio: 'صوت فقط',
    quality: 'الجودة',
    qualityBest: 'أفضل جودة متاحة',
    container: 'نوع الملف',
    containerMp4: 'MP4 – يعمل في كل مكان (حتى 1080p)',
    containerMkv: 'MKV – أعلى جودة (يتطلب مشغلًا حديثًا)',
    audioFormat: 'صيغة الصوت',
    subtitles: 'الترجمة',
    subtitlesEnabled: 'تنزيل الترجمة',
    subtitleLanguages: 'اللغات',
    autoSubs: 'استخدام الترجمة التلقائية عند الحاجة',
    embedSubs: 'تضمينها في ملف الفيديو',
    saveTo: 'الحفظ في',
    download: 'تنزيل',
    downloadMany: {
      zero: 'تنزيل {count} فيديو',
      one: 'تنزيل فيديو واحد',
      two: 'تنزيل فيديوهين',
      few: 'تنزيل {count} فيديوهات',
      many: 'تنزيل {count} فيديو',
      other: 'تنزيل {count} فيديو'
    },
    added: {
      zero: 'لم تتم إضافة أي تنزيل',
      one: 'تمت إضافة تنزيل واحد إلى قائمة الانتظار',
      two: 'تمت إضافة تنزيلين إلى قائمة الانتظار',
      few: 'تمت إضافة {count} تنزيلات إلى قائمة الانتظار',
      many: 'تمت إضافة {count} تنزيلًا إلى قائمة الانتظار',
      other: 'تمت إضافة {count} تنزيل إلى قائمة الانتظار'
    },
    addedHint: 'انقر على «{queue}» في الشريط الجانبي لمتابعة التقدم وفتح الملف عندما يصبح جاهزًا.',
    skippedExisting: {
      zero: 'لم يتم تخطي أي فيديو',
      one: 'تم تخطي فيديو واحد سبق تنزيله',
      two: 'تم تخطي فيديوهين سبق تنزيلهما',
      few: 'تم تخطي {count} فيديوهات سبق تنزيلها',
      many: 'تم تخطي {count} فيديو سبق تنزيلها',
      other: 'تم تخطي {count} فيديو سبق تنزيلها'
    }
  },
  queue: {
    empty: 'لا توجد تنزيلات بعد. الصق رابطًا للبدء.',
    status: {
      queued: 'في الانتظار',
      downloading: 'جارٍ التنزيل',
      processing: 'جارٍ المعالجة',
      completed: 'اكتمل',
      failed: 'فشل',
      cancelled: 'أُلغي',
      skipped: 'تم تنزيله سابقًا'
    },
    progress: '{done} من {total}',
    speed: '{speed}',
    eta: 'متبقٍ {time}',
    cancel: 'إلغاء',
    retry: 'إعادة المحاولة',
    openFile: 'فتح الملف',
    showInFolder: 'إظهار في المجلد',
    clearFinished: 'مسح المكتملة',
    cancelAll: 'إلغاء الكل',
    active: {
      zero: 'لا يوجد نشط',
      one: 'تنزيل واحد نشط',
      two: 'تنزيلان نشطان',
      few: '{count} تنزيلات نشطة',
      many: '{count} تنزيلًا نشطًا',
      other: '{count} تنزيل نشط'
    }
  },
  history: {
    empty: 'ستظهر التنزيلات المكتملة هنا.',
    search: 'البحث في السجل',
    clear: 'مسح السجل',
    clearConfirm: 'هل تريد إزالة كل الإدخالات من السجل؟ لن تُحذف الملفات التي تم تنزيلها.',
    fileMissing: 'تم نقل الملف أو حذفه',
    downloadAgain: 'التنزيل مرة أخرى',
    noResults: 'لا توجد نتائج مطابقة.'
  },
  settings: {
    title: 'الإعدادات',
    sections: {
      downloads: 'التنزيلات',
      defaults: 'الخيارات الافتراضية',
      appearance: 'المظهر',
      updates: 'التحديثات',
      about: 'حول'
    },
    downloadFolder: 'مجلد التنزيلات',
    maxConcurrent: 'التنزيلات المتزامنة',
    skipDownloaded: 'تخطي الفيديوهات التي سبق تنزيلها',
    skipDownloadedHelp: 'يتم تخطي الفيديوهات الموجودة في سجل التنزيلات عند إضافة قائمة تشغيل.',
    playlistSubfolder: 'حفظ قوائم التشغيل في مجلد خاص بها',
    notifications: 'إظهار إشعار عند اكتمال التنزيل',
    language: 'اللغة',
    systemLanguage: 'لغة النظام',
    theme: 'السمة',
    themeSystem: 'حسب النظام',
    themeLight: 'فاتحة',
    themeDark: 'داكنة',
    appVersion: 'إصدار التطبيق',
    updateAvailable: 'الإصدار {version} متاح.',
    updateDownloading: 'جارٍ تنزيل التحديث… {percent}',
    updateReady: 'الإصدار {version} جاهز للتثبيت.',
    restartToUpdate: 'إعادة التشغيل والتحديث',
    manualUpdate: 'نزّل الإصدار الجديد من صفحة الإصدارات.',
    openReleases: 'فتح صفحة الإصدارات',
    engine: 'محرك التنزيل',
    engineHelp: 'يحدّث VidSnare نفسه ومحرك التنزيل تلقائيًا.',
    engineVersion: 'yt-dlp {version}',
    useSystemFolder: 'استخدام مجلد التنزيلات في النظام',
    lastChecked: 'آخر فحص: {date}',
    never: 'أبدًا',
    disclaimer:
      'أنت مسؤول عن الالتزام بشروط خدمة YouTube وقوانين حقوق النشر. لا تنزّل إلا المحتوى الذي يحق لك تنزيله.',
    licenses: 'تراخيص الجهات الخارجية',
    sourceCode: 'الشيفرة المصدرية'
  },
  notify: {
    finishedTitle: 'اكتمل التنزيل',
    failedTitle: 'فشل التنزيل',
    allFinished: {
      zero: 'لم يكتمل أي تنزيل',
      one: 'اكتمل تنزيل واحد',
      two: 'اكتمل تنزيلان',
      few: 'اكتملت {count} تنزيلات',
      many: 'اكتمل {count} تنزيلًا',
      other: 'اكتمل {count} تنزيل'
    },
    failedMany: {
      zero: 'لم يفشل أي تنزيل',
      one: 'فشل تنزيل واحد',
      two: 'فشل تنزيلان',
      few: 'فشلت {count} تنزيلات',
      many: 'فشل {count} تنزيلًا',
      other: 'فشل {count} تنزيل'
    }
  },
  errors: {
    PRIVATE_VIDEO: 'هذا الفيديو خاص.',
    VIDEO_UNAVAILABLE: 'هذا الفيديو غير متاح. ربما أُزيل أو لم يكن موجودًا أصلًا.',
    AGE_RESTRICTED: 'هذا الفيديو مقيّد بالعمر ويتطلب تسجيل الدخول، وهو ما لا يستخدمه VidSnare.',
    MEMBERS_ONLY: 'هذا الفيديو مخصص للأعضاء المشتركين في القناة فقط.',
    PAID_CONTENT: 'يجب شراء هذا الفيديو أو استئجاره على YouTube.',
    REGION_BLOCKED: 'هذا الفيديو غير متاح في بلدك.',
    COPYRIGHT_BLOCKED: 'تم حظر هذا الفيديو بسبب مطالبة بحقوق النشر.',
    LIVE_NOT_STARTED: 'لم يبدأ هذا البث المباشر أو العرض الأول بعد. حاول مرة أخرى بعد أن يبدأ.',
    DRM_PROTECTED: 'هذا الفيديو محمي ضد النسخ (DRM) ولا يمكن تنزيله.',
    BOT_CHECK: 'يطلب YouTube التأكد من أنك لست روبوتًا. انتظر قليلًا ثم حاول مرة أخرى.',
    RATE_LIMITED: 'يحدّ YouTube من الطلبات حاليًا. انتظر بضع دقائق ثم حاول مرة أخرى.',
    NO_INTERNET: 'تعذر الوصول إلى YouTube. تحقق من اتصالك بالإنترنت.',
    DISK_FULL: 'لا توجد مساحة كافية على القرص.',
    PERMISSION_DENIED: 'لا يُسمح لـ VidSnare بحفظ الملفات في هذا المجلد. اختر مجلدًا آخر.',
    FORMAT_UNAVAILABLE: 'الجودة أو الصيغة المختارة غير متاحة لهذا الفيديو.',
    ENGINE_OUTDATED: 'غيّر YouTube شيئًا ما. يقوم VidSnare بتحديث محرك التنزيل – حاول مرة أخرى بعد بضع دقائق.',
    POSTPROCESSING_FAILED: 'تم تنزيل الملف لكن تعذر تحويله.',
    TOOL_MISSING: 'أحد المكونات المطلوبة مفقود. أعد تثبيت VidSnare.',
    INVALID_URL: 'لا يبدو هذا رابط YouTube.',
    UNSUPPORTED_URL: 'هذا النوع من الروابط غير مدعوم.',
    CANCELLED: 'أُلغي.',
    UNKNOWN: 'حدث خطأ ما.'
  }
}
