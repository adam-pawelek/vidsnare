import type { Messages } from '../types'

export const fr: Messages = {
  app: {
    quitTitle: 'Téléchargements en cours',
    quitMessage: 'Quitter annulera les téléchargements en cours.',
    quitAnyway: 'Quitter quand même',
    keepDownloading: 'Continuer à télécharger'
  },
  common: {
    ok: 'OK',
    cancel: 'Annuler',
    close: 'Fermer',
    retry: 'Réessayer',
    remove: 'Retirer',
    save: 'Enregistrer',
    browse: 'Parcourir…',
    changeFolder: 'Changer le dossier de téléchargement…',
    reset: 'Rétablir les valeurs par défaut',
    copyDetails: 'Copier les détails',
    copied: 'Copié',
    loading: 'Chargement…',
    unknown: 'Inconnu'
  },
  contextMenu: {
    cut: 'Couper',
    copy: 'Copier',
    paste: 'Coller',
    selectAll: 'Tout sélectionner'
  },
  nav: {
    download: 'Télécharger',
    queue: 'File d’attente',
    history: 'Historique',
    settings: 'Paramètres'
  },
  input: {
    placeholder: 'Collez un lien YouTube (vidéo ou playlist)',
    paste: 'Coller',
    load: 'Charger',
    invalid: 'Cela ne ressemble pas à un lien YouTube.',
    hint: 'Vidéos, Shorts, playlists et chaînes sont pris en charge.'
  },
  preview: {
    by: 'par {channel}',
    duration: 'Durée',
    live: 'En direct',
    videos: { one: '{count} vidéo', many: '{count} de vidéos', other: '{count} vidéos' },
    selectAll: 'Tout sélectionner',
    selectNone: 'Tout désélectionner',
    selected: '{selected} sur {total} sélectionnées',
    alreadyDownloaded: 'Déjà téléchargée',
    hideDownloaded: 'Masquer celles déjà téléchargées',
    partOfPlaylist: 'Cette vidéo fait partie d’une playlist.',
    thisVideoOnly: 'Cette vidéo seulement',
    wholePlaylist: 'Toute la playlist',
    unavailableEntry: 'Indisponible'
  },
  options: {
    downloadAs: 'Télécharger en',
    video: 'Vidéo',
    audio: 'Audio seulement',
    quality: 'Qualité',
    qualityBest: 'Meilleure disponible',
    container: 'Type de fichier',
    containerMp4: 'MP4 – se lit partout (jusqu’à 1080p)',
    containerMkv: 'MKV – qualité maximale (lecteur récent requis)',
    audioFormat: 'Format audio',
    subtitles: 'Sous-titres',
    subtitlesEnabled: 'Télécharger les sous-titres',
    subtitleLanguages: 'Langues',
    autoSubs: 'Utiliser les sous-titres automatiques si nécessaire',
    embedSubs: 'Intégrer au fichier vidéo',
    saveTo: 'Enregistrer dans',
    download: 'Télécharger',
    downloadMany: {
      one: 'Télécharger {count} vidéo',
      many: 'Télécharger {count} de vidéos',
      other: 'Télécharger {count} vidéos'
    },
    added: {
      one: '{count} téléchargement ajouté à la file',
      many: '{count} de téléchargements ajoutés à la file',
      other: '{count} téléchargements ajoutés à la file'
    },
    skippedExisting: {
      one: '{count} vidéo déjà téléchargée ignorée',
      many: '{count} de vidéos déjà téléchargées ignorées',
      other: '{count} vidéos déjà téléchargées ignorées'
    }
  },
  queue: {
    empty: 'Aucun téléchargement pour l’instant. Collez un lien pour commencer.',
    status: {
      queued: 'En attente',
      downloading: 'Téléchargement',
      processing: 'Traitement',
      completed: 'Terminé',
      failed: 'Échec',
      cancelled: 'Annulé',
      skipped: 'Déjà téléchargée'
    },
    progress: '{done} sur {total}',
    speed: '{speed}',
    eta: 'encore {time}',
    cancel: 'Annuler',
    retry: 'Réessayer',
    openFile: 'Ouvrir le fichier',
    showInFolder: 'Afficher dans le dossier',
    clearFinished: 'Effacer les terminés',
    cancelAll: 'Tout annuler',
    active: { one: '{count} en cours', many: '{count} en cours', other: '{count} en cours' }
  },
  history: {
    empty: 'Les téléchargements terminés apparaîtront ici.',
    search: 'Rechercher dans l’historique',
    clear: 'Effacer l’historique',
    clearConfirm: 'Supprimer toutes les entrées de l’historique ? Les fichiers téléchargés ne sont pas supprimés.',
    fileMissing: 'Le fichier a été déplacé ou supprimé',
    downloadAgain: 'Télécharger à nouveau',
    noResults: 'Aucun résultat.'
  },
  settings: {
    title: 'Paramètres',
    sections: {
      downloads: 'Téléchargements',
      defaults: 'Options par défaut',
      appearance: 'Apparence',
      updates: 'Mises à jour',
      about: 'À propos'
    },
    downloadFolder: 'Dossier de téléchargement',
    maxConcurrent: 'Téléchargements simultanés',
    skipDownloaded: 'Ignorer les vidéos déjà téléchargées',
    skipDownloadedHelp: 'Les vidéos de votre historique sont exclues lors de l’ajout d’une playlist.',
    playlistSubfolder: 'Enregistrer les playlists dans leur propre dossier',
    filenameTemplate: 'Nom de fichier',
    filenameTemplateHelp: 'Champs disponibles : {fields}',
    filenamePreview: 'Exemple : {example}',
    notifications: 'Afficher une notification à la fin d’un téléchargement',
    language: 'Langue',
    systemLanguage: 'Langue du système',
    theme: 'Thème',
    themeSystem: 'Comme le système',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    appVersion: 'Version de l’application',
    autoUpdate: 'Installer automatiquement les mises à jour de l’application',
    checkForUpdates: 'Rechercher des mises à jour',
    checking: 'Vérification…',
    upToDate: 'Vous avez la dernière version.',
    updateAvailable: 'La version {version} est disponible.',
    updateDownloading: 'Téléchargement de la mise à jour… {percent}',
    updateReady: 'La version {version} est prête à être installée.',
    restartToUpdate: 'Redémarrer et mettre à jour',
    manualUpdate: 'Téléchargez la nouvelle version depuis la page des versions.',
    openReleases: 'Ouvrir la page des versions',
    updateFailed: 'Impossible de rechercher des mises à jour.',
    engine: 'Moteur de téléchargement',
    engineHelp: 'YouTube change souvent. Le moteur se met à jour indépendamment de l’application.',
    engineVersion: 'yt-dlp {version}',
    updateEngine: 'Mettre à jour le moteur',
    engineUpdated: 'Moteur mis à jour vers {version}.',
    engineUpToDate: 'Le moteur est à jour.',
    engineUpdateFailed: 'Impossible de mettre à jour le moteur. La version actuelle reste utilisée.',
    autoUpdateEngine: 'Maintenir le moteur à jour automatiquement',
    useSystemFolder: 'Utiliser le dossier Téléchargements du système',
    templateInvalid: 'Le nom de fichier doit contenir le titre ou l’identifiant de la vidéo.',
    lastChecked: 'Dernière vérification : {date}',
    never: 'Jamais',
    disclaimer:
      'Vous êtes responsable du respect des Conditions d’utilisation de YouTube et du droit d’auteur. Ne téléchargez que des contenus que vous avez le droit de télécharger.',
    licenses: 'Licences tierces',
    sourceCode: 'Code source'
  },
  notify: {
    finishedTitle: 'Téléchargement terminé',
    failedTitle: 'Échec du téléchargement',
    allFinished: {
      one: '{count} téléchargement terminé',
      many: '{count} de téléchargements terminés',
      other: '{count} téléchargements terminés'
    },
    failedMany: {
      one: '{count} téléchargement a échoué',
      many: '{count} de téléchargements ont échoué',
      other: '{count} téléchargements ont échoué'
    }
  },
  errors: {
    PRIVATE_VIDEO: 'Cette vidéo est privée.',
    VIDEO_UNAVAILABLE: 'Cette vidéo est indisponible. Elle a peut-être été supprimée ou n’a jamais existé.',
    AGE_RESTRICTED: 'Cette vidéo est soumise à une limite d’âge et nécessite une connexion, ce que VidSnare n’utilise pas.',
    MEMBERS_ONLY: 'Cette vidéo est réservée aux membres payants de la chaîne.',
    PAID_CONTENT: 'Cette vidéo doit être achetée ou louée sur YouTube.',
    REGION_BLOCKED: 'Cette vidéo n’est pas disponible dans votre pays.',
    COPYRIGHT_BLOCKED: 'Cette vidéo a été bloquée suite à une réclamation pour droits d’auteur.',
    LIVE_NOT_STARTED: 'Ce direct ou cette première n’a pas encore commencé. Réessayez une fois qu’il aura débuté.',
    DRM_PROTECTED: 'Cette vidéo est protégée contre la copie (DRM) et ne peut pas être téléchargée.',
    BOT_CHECK: 'YouTube demande de confirmer que vous n’êtes pas un robot. Patientez un moment, puis réessayez.',
    RATE_LIMITED: 'YouTube limite actuellement les requêtes. Patientez quelques minutes, puis réessayez.',
    NO_INTERNET: 'Impossible de joindre YouTube. Vérifiez votre connexion Internet.',
    DISK_FULL: 'Il n’y a pas assez d’espace libre sur le disque.',
    PERMISSION_DENIED: 'VidSnare n’a pas le droit d’enregistrer des fichiers dans ce dossier. Choisissez un autre dossier.',
    FORMAT_UNAVAILABLE: 'La qualité ou le format choisi n’est pas disponible pour cette vidéo.',
    ENGINE_OUTDATED: 'YouTube a changé quelque chose. Mettez à jour le moteur de téléchargement dans les Paramètres, puis réessayez.',
    POSTPROCESSING_FAILED: 'Le fichier a été téléchargé, mais n’a pas pu être converti.',
    TOOL_MISSING: 'Un composant nécessaire est manquant. Réinstallez VidSnare.',
    INVALID_URL: 'Cela ne ressemble pas à un lien YouTube.',
    UNSUPPORTED_URL: 'Ce type de lien n’est pas pris en charge.',
    CANCELLED: 'Annulé.',
    UNKNOWN: 'Une erreur s’est produite.'
  }
}
