import type { Messages } from '../types'

export const he: Messages = {
  app: {
    quitTitle: 'הורדות מתבצעות',
    quitMessage: 'יציאה תבטל את ההורדות שעדיין פעילות.',
    quitAnyway: 'לצאת בכל זאת',
    keepDownloading: 'להמשיך להוריד'
  },
  common: {
    ok: 'אישור',
    cancel: 'ביטול',
    close: 'סגירה',
    retry: 'ניסיון חוזר',
    remove: 'הסרה',
    save: 'שמירה',
    browse: 'עיון…',
    changeFolder: 'שינוי תיקיית ההורדות…',
    reset: 'שחזור ברירות המחדל',
    copyDetails: 'העתקת פרטים',
    copied: 'הועתק',
    loading: 'טוען…',
    unknown: 'לא ידוע'
  },
  contextMenu: {
    cut: 'גזירה',
    copy: 'העתקה',
    paste: 'הדבקה',
    selectAll: 'בחירת הכול'
  },
  nav: {
    changeLanguage: 'שינוי שפה',
    download: 'הורדה',
    queue: 'תור',
    history: 'היסטוריה',
    settings: 'הגדרות'
  },
  input: {
    placeholder: 'הדביקו קישור ל-YouTube (סרטון או פלייליסט)',
    paste: 'הדבקה',
    load: 'טעינה',
    invalid: 'זה לא נראה כמו קישור ל-YouTube.',
    hint: 'תומך בסרטונים, Shorts, פלייליסטים וערוצים.'
  },
  preview: {
    by: 'מאת {channel}',
    duration: 'משך',
    live: 'שידור חי',
    videos: { one: 'סרטון אחד', two: 'שני סרטונים', other: '{count} סרטונים' },
    selectAll: 'בחירת הכול',
    selectNone: 'ביטול הבחירה',
    selected: 'נבחרו {selected} מתוך {total}',
    alreadyDownloaded: 'כבר הורד',
    hideDownloaded: 'הסתרת מה שכבר הורד',
    partOfPlaylist: 'הסרטון הזה הוא חלק מפלייליסט.',
    thisVideoOnly: 'רק הסרטון הזה',
    wholePlaylist: 'כל הפלייליסט',
    unavailableEntry: 'לא זמין'
  },
  options: {
    downloadAs: 'הורדה בתור',
    video: 'וידאו',
    audio: 'שמע בלבד',
    quality: 'איכות',
    qualityBest: 'האיכות הטובה ביותר',
    container: 'סוג קובץ',
    containerMp4: 'MP4 – מתנגן בכל מקום (עד 1080p)',
    containerMkv: 'MKV – האיכות הגבוהה ביותר (דורש נגן עדכני)',
    audioFormat: 'פורמט שמע',
    subtitles: 'כתוביות',
    subtitlesEnabled: 'הורדת כתוביות',
    subtitleLanguages: 'שפות',
    autoSubs: 'שימוש בכתוביות אוטומטיות במקרה הצורך',
    embedSubs: 'הטמעה בקובץ הווידאו',
    saveTo: 'שמירה אל',
    download: 'הורדה',
    downloadMany: { one: 'הורדת סרטון אחד', two: 'הורדת שני סרטונים', other: 'הורדת {count} סרטונים' },
    added: {
      one: 'הורדה אחת נוספה לתור',
      two: 'שתי הורדות נוספו לתור',
      other: '{count} הורדות נוספו לתור'
    },
    addedHint: 'לחצו על „{queue}” בסרגל הצד כדי לראות את ההתקדמות ולפתוח את הקובץ כשהוא מוכן.',
    skippedExisting: {
      one: 'דילגנו על סרטון אחד שכבר הורדתם',
      two: 'דילגנו על שני סרטונים שכבר הורדתם',
      other: 'דילגנו על {count} סרטונים שכבר הורדתם'
    }
  },
  queue: {
    empty: 'אין עדיין הורדות. הדביקו קישור כדי להתחיל.',
    status: {
      queued: 'ממתין',
      downloading: 'מוריד',
      processing: 'מעבד',
      completed: 'הסתיים',
      failed: 'נכשל',
      cancelled: 'בוטל',
      skipped: 'כבר הורד'
    },
    progress: '{done} מתוך {total}',
    speed: '{speed}',
    eta: 'נותרו {time}',
    cancel: 'ביטול',
    retry: 'ניסיון חוזר',
    openFile: 'פתיחת הקובץ',
    showInFolder: 'הצגה בתיקייה',
    clearFinished: 'ניקוי ההורדות שהסתיימו',
    cancelAll: 'ביטול הכול',
    active: { one: 'הורדה פעילה אחת', two: 'שתי הורדות פעילות', other: '{count} הורדות פעילות' }
  },
  history: {
    empty: 'הורדות שהסתיימו יופיעו כאן.',
    search: 'חיפוש בהיסטוריה',
    clear: 'ניקוי ההיסטוריה',
    clearConfirm: 'להסיר את כל הרשומות מההיסטוריה? הקבצים שהורדו לא יימחקו.',
    fileMissing: 'הקובץ הועבר או נמחק',
    downloadAgain: 'הורדה מחדש',
    noResults: 'לא נמצאו תוצאות.'
  },
  settings: {
    title: 'הגדרות',
    sections: {
      downloads: 'הורדות',
      defaults: 'אפשרויות ברירת מחדל',
      appearance: 'מראה',
      updates: 'עדכונים',
      about: 'אודות'
    },
    downloadFolder: 'תיקיית הורדות',
    maxConcurrent: 'הורדות במקביל',
    skipDownloaded: 'דילוג על סרטונים שכבר הורדתי',
    skipDownloadedHelp: 'סרטונים מהיסטוריית ההורדות מושמטים כשמוסיפים פלייליסט.',
    playlistSubfolder: 'שמירת פלייליסטים בתיקייה נפרדת',
    notifications: 'הצגת התראה כשהורדה מסתיימת',
    language: 'שפה',
    systemLanguage: 'שפת המערכת',
    theme: 'ערכת נושא',
    themeSystem: 'לפי המערכת',
    themeLight: 'בהירה',
    themeDark: 'כהה',
    appVersion: 'גרסת האפליקציה',
    updateAvailable: 'גרסה {version} זמינה.',
    updateDownloading: 'מוריד עדכון… {percent}',
    updateReady: 'גרסה {version} מוכנה להתקנה.',
    restartToUpdate: 'הפעלה מחדש ועדכון',
    manualUpdate: 'הורידו את הגרסה החדשה מדף הגרסאות.',
    openReleases: 'פתיחת דף הגרסאות',
    engine: 'מנוע ההורדה',
    engineHelp: 'VidSnare מעדכן את עצמו ואת מנוע ההורדה באופן אוטומטי.',
    engineVersion: 'yt-dlp {version}',
    useSystemFolder: 'שימוש בתיקיית ההורדות של המערכת',
    lastChecked: 'בדיקה אחרונה: {date}',
    never: 'אף פעם',
    disclaimer:
      'האחריות לעמוד בתנאים וההגבלות של YouTube ובדיני זכויות היוצרים היא שלכם. הורידו רק תוכן שיש לכם זכות להוריד.',
    licenses: 'רישיונות של צד שלישי',
    sourceCode: 'קוד מקור'
  },
  notify: {
    finishedTitle: 'ההורדה הסתיימה',
    failedTitle: 'ההורדה נכשלה',
    allFinished: { one: 'הורדה אחת הסתיימה', two: 'שתי הורדות הסתיימו', other: '{count} הורדות הסתיימו' },
    failedMany: { one: 'הורדה אחת נכשלה', two: 'שתי הורדות נכשלו', other: '{count} הורדות נכשלו' }
  },
  errors: {
    PRIVATE_VIDEO: 'הסרטון הזה פרטי.',
    VIDEO_UNAVAILABLE: 'הסרטון הזה לא זמין. ייתכן שהוסר או שמעולם לא היה קיים.',
    AGE_RESTRICTED: 'לסרטון הזה יש הגבלת גיל והוא דורש התחברות, ו-VidSnare לא מתחבר לחשבונות.',
    MEMBERS_ONLY: 'הסרטון הזה זמין רק לחברים משלמים בערוץ.',
    PAID_CONTENT: 'צריך לקנות או לשכור את הסרטון הזה ב-YouTube.',
    REGION_BLOCKED: 'הסרטון הזה לא זמין במדינה שלכם.',
    COPYRIGHT_BLOCKED: 'הסרטון הזה נחסם בעקבות תביעת זכויות יוצרים.',
    LIVE_NOT_STARTED: 'השידור החי או הבכורה עוד לא התחילו. נסו שוב אחרי שיתחילו.',
    DRM_PROTECTED: 'הסרטון הזה מוגן מפני העתקה (DRM) ולא ניתן להוריד אותו.',
    BOT_CHECK: 'YouTube מבקש לאשר שאתם לא רובוט. המתינו קצת ונסו שוב.',
    RATE_LIMITED: 'YouTube מגביל כרגע את מספר הבקשות. המתינו כמה דקות ונסו שוב.',
    NO_INTERNET: 'אין גישה ל-YouTube. בדקו את החיבור לאינטרנט.',
    DISK_FULL: 'אין מספיק מקום פנוי בדיסק.',
    PERMISSION_DENIED: 'ל-VidSnare אין הרשאה לשמור קבצים בתיקייה הזו. בחרו תיקייה אחרת.',
    FORMAT_UNAVAILABLE: 'האיכות או הפורמט שנבחרו לא זמינים לסרטון הזה.',
    ENGINE_OUTDATED: 'משהו השתנה ב-YouTube. VidSnare מעדכן את מנוע ההורדה – נסו שוב בעוד כמה דקות.',
    POSTPROCESSING_FAILED: 'הקובץ הורד אבל לא ניתן היה להמיר אותו.',
    TOOL_MISSING: 'חסר רכיב נדרש. התקינו את VidSnare מחדש.',
    INVALID_URL: 'זה לא נראה כמו קישור ל-YouTube.',
    UNSUPPORTED_URL: 'סוג הקישור הזה לא נתמך.',
    CANCELLED: 'בוטל.',
    UNKNOWN: 'משהו השתבש.'
  }
}
