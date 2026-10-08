import type { Messages } from '../types'

export const es: Messages = {
  app: {
    quitTitle: 'Hay descargas en curso',
    quitMessage: 'Al salir se cancelarán las descargas en curso.',
    quitAnyway: 'Salir de todos modos',
    keepDownloading: 'Seguir descargando'
  },
  common: {
    ok: 'Aceptar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    retry: 'Reintentar',
    remove: 'Quitar',
    save: 'Guardar',
    browse: 'Examinar…',
    changeFolder: 'Cambiar carpeta de descargas…',
    reset: 'Restablecer valores predeterminados',
    copyDetails: 'Copiar detalles',
    copied: 'Copiado',
    loading: 'Cargando…',
    unknown: 'Desconocido'
  },
  contextMenu: {
    cut: 'Cortar',
    copy: 'Copiar',
    paste: 'Pegar',
    selectAll: 'Seleccionar todo'
  },
  nav: {
    changeLanguage: 'Cambiar idioma',
    download: 'Descargar',
    queue: 'Cola',
    history: 'Historial',
    settings: 'Ajustes'
  },
  input: {
    placeholder: 'Pega un enlace de YouTube (vídeo o lista de reproducción)',
    paste: 'Pegar',
    load: 'Cargar',
    invalid: 'Eso no parece un enlace de YouTube.',
    hint: 'Admite vídeos, Shorts, listas de reproducción y canales.'
  },
  preview: {
    by: 'de {channel}',
    duration: 'Duración',
    live: 'En directo',
    videos: { one: '{count} vídeo', many: '{count} de vídeos', other: '{count} vídeos' },
    selectAll: 'Seleccionar todo',
    selectNone: 'Deseleccionar todo',
    selected: '{selected} de {total} seleccionados',
    alreadyDownloaded: 'Ya descargado',
    hideDownloaded: 'Ocultar los ya descargados',
    partOfPlaylist: 'Este vídeo forma parte de una lista de reproducción.',
    thisVideoOnly: 'Solo este vídeo',
    wholePlaylist: 'Toda la lista',
    unavailableEntry: 'No disponible'
  },
  options: {
    downloadAs: 'Descargar como',
    video: 'Vídeo',
    audio: 'Solo audio',
    quality: 'Calidad',
    qualityBest: 'La mejor disponible',
    container: 'Tipo de archivo',
    containerMp4: 'MP4 – se reproduce en todas partes (hasta 1080p)',
    containerMkv: 'MKV – máxima calidad (requiere un reproductor moderno)',
    audioFormat: 'Formato de audio',
    subtitles: 'Subtítulos',
    subtitlesEnabled: 'Descargar subtítulos',
    subtitleLanguages: 'Idiomas',
    autoSubs: 'Usar subtítulos automáticos si hace falta',
    embedSubs: 'Incrustar en el archivo de vídeo',
    saveTo: 'Guardar en',
    download: 'Descargar',
    downloadMany: {
      one: 'Descargar {count} vídeo',
      many: 'Descargar {count} de vídeos',
      other: 'Descargar {count} vídeos'
    },
    added: {
      one: 'Se añadió {count} descarga a la cola',
      many: 'Se añadieron {count} de descargas a la cola',
      other: 'Se añadieron {count} descargas a la cola'
    },
    skippedExisting: {
      one: 'Se omitió {count} vídeo ya descargado',
      many: 'Se omitieron {count} de vídeos ya descargados',
      other: 'Se omitieron {count} vídeos ya descargados'
    }
  },
  queue: {
    empty: 'Aún no hay descargas. Pega un enlace para empezar.',
    status: {
      queued: 'En espera',
      downloading: 'Descargando',
      processing: 'Procesando',
      completed: 'Terminado',
      failed: 'Error',
      cancelled: 'Cancelado',
      skipped: 'Ya descargado'
    },
    progress: '{done} de {total}',
    speed: '{speed}',
    eta: 'quedan {time}',
    cancel: 'Cancelar',
    retry: 'Reintentar',
    openFile: 'Abrir archivo',
    showInFolder: 'Mostrar en la carpeta',
    clearFinished: 'Quitar terminados',
    cancelAll: 'Cancelar todo',
    active: { one: '{count} activa', many: '{count} de activas', other: '{count} activas' }
  },
  history: {
    empty: 'Las descargas terminadas aparecerán aquí.',
    search: 'Buscar en el historial',
    clear: 'Borrar historial',
    clearConfirm: '¿Quitar todas las entradas del historial? Los archivos descargados no se eliminan.',
    fileMissing: 'El archivo se movió o se eliminó',
    downloadAgain: 'Descargar de nuevo',
    noResults: 'No hay resultados.'
  },
  settings: {
    title: 'Ajustes',
    sections: {
      downloads: 'Descargas',
      defaults: 'Opciones predeterminadas',
      appearance: 'Apariencia',
      updates: 'Actualizaciones',
      about: 'Acerca de'
    },
    downloadFolder: 'Carpeta de descargas',
    maxConcurrent: 'Descargas simultáneas',
    skipDownloaded: 'Omitir los vídeos ya descargados',
    skipDownloadedHelp: 'Los vídeos de tu historial se omiten al añadir una lista de reproducción.',
    playlistSubfolder: 'Guardar las listas en su propia carpeta',
    filenameTemplate: 'Nombre de archivo',
    filenameTemplateHelp: 'Campos disponibles: {fields}',
    filenamePreview: 'Ejemplo: {example}',
    notifications: 'Mostrar una notificación al terminar una descarga',
    language: 'Idioma',
    systemLanguage: 'Idioma del sistema',
    theme: 'Tema',
    themeSystem: 'Según el sistema',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    appVersion: 'Versión de la aplicación',
    checkForUpdates: 'Buscar actualizaciones',
    checking: 'Comprobando…',
    upToDate: 'Tienes la versión más reciente.',
    updateAvailable: 'La versión {version} está disponible.',
    updateDownloading: 'Descargando actualización… {percent}',
    updateReady: 'La versión {version} está lista para instalarse.',
    restartToUpdate: 'Reiniciar y actualizar',
    manualUpdate: 'Descarga la nueva versión desde la página de versiones.',
    openReleases: 'Abrir página de versiones',
    updateFailed: 'No se pudieron buscar actualizaciones.',
    engine: 'Motor de descarga',
    engineHelp: 'YouTube cambia a menudo. El motor se actualiza por separado de la aplicación.',
    engineVersion: 'yt-dlp {version}',
    updateEngine: 'Actualizar motor',
    engineUpdated: 'Motor actualizado a {version}.',
    engineUpToDate: 'El motor está actualizado.',
    engineUpdateFailed: 'No se pudo actualizar el motor. Se sigue usando la versión actual.',
    useSystemFolder: 'Usar la carpeta Descargas del sistema',
    templateInvalid: 'El nombre de archivo debe incluir el título o el ID del vídeo.',
    lastChecked: 'Última comprobación: {date}',
    never: 'Nunca',
    disclaimer:
      'Eres responsable de cumplir las Condiciones de servicio de YouTube y las leyes de derechos de autor. Descarga solo contenido que tengas derecho a descargar.',
    licenses: 'Licencias de terceros',
    sourceCode: 'Código fuente'
  },
  notify: {
    finishedTitle: 'Descarga terminada',
    failedTitle: 'Error en la descarga',
    allFinished: {
      one: '{count} descarga terminada',
      many: '{count} de descargas terminadas',
      other: '{count} descargas terminadas'
    },
    failedMany: {
      one: '{count} descarga falló',
      many: '{count} de descargas fallaron',
      other: '{count} descargas fallaron'
    }
  },
  errors: {
    PRIVATE_VIDEO: 'Este vídeo es privado.',
    VIDEO_UNAVAILABLE: 'Este vídeo no está disponible. Puede que se haya eliminado o que nunca haya existido.',
    AGE_RESTRICTED: 'Este vídeo tiene restricción de edad y requiere iniciar sesión, algo que VidSnare no hace.',
    MEMBERS_ONLY: 'Este vídeo es solo para miembros de pago del canal.',
    PAID_CONTENT: 'Este vídeo hay que comprarlo o alquilarlo en YouTube.',
    REGION_BLOCKED: 'Este vídeo no está disponible en tu país.',
    COPYRIGHT_BLOCKED: 'Este vídeo se bloqueó por una reclamación de derechos de autor.',
    LIVE_NOT_STARTED: 'Esta emisión en directo o estreno aún no ha empezado. Inténtalo de nuevo cuando comience.',
    DRM_PROTECTED: 'Este vídeo está protegido contra copia (DRM) y no se puede descargar.',
    BOT_CHECK: 'YouTube pide confirmar que no eres un bot. Espera un rato y vuelve a intentarlo.',
    RATE_LIMITED: 'YouTube está limitando las solicitudes. Espera unos minutos y vuelve a intentarlo.',
    NO_INTERNET: 'No se puede conectar con YouTube. Comprueba tu conexión a internet.',
    DISK_FULL: 'No hay suficiente espacio libre en el disco.',
    PERMISSION_DENIED: 'VidSnare no tiene permiso para guardar archivos en esta carpeta. Elige otra carpeta.',
    FORMAT_UNAVAILABLE: 'La calidad o el formato elegido no está disponible para este vídeo.',
    ENGINE_OUTDATED: 'YouTube ha cambiado algo. Actualiza el motor de descarga en Ajustes y vuelve a intentarlo.',
    POSTPROCESSING_FAILED: 'El archivo se descargó, pero no se pudo convertir.',
    TOOL_MISSING: 'Falta un componente necesario. Reinstala VidSnare.',
    INVALID_URL: 'Eso no parece un enlace de YouTube.',
    UNSUPPORTED_URL: 'Este tipo de enlace no es compatible.',
    CANCELLED: 'Cancelado.',
    UNKNOWN: 'Algo salió mal.'
  }
}
