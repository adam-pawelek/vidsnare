# Translations

Strings live in `src/shared/i18n/locales/`. `en.ts` is the source of truth; every
other file must have the same keys and `{placeholders}`. Tests enforce this, plus
the plural forms each language needs (Polish and Russian use `one`/`few`/`many`/`other`;
Spanish, Portuguese and French also need `many`, which is used for millions).

| Locale | Status |
|---|---|
| en | Source |
| pl | Written by the developer; review recommended |
| de, es, pt-BR, ru, ja, fr, tr, it, uk, id, vi, ko, zh-TW, hi, nl, cs, ro, hu, sv, el, th, ar, fa, he | Machine-assisted draft; **needs a native speaker's review before release** |

Arabic, Persian and Hebrew are right-to-left: the app and the website set `dir="rtl"`
and the layout mirrors through CSS logical properties (`margin-inline-start` etc.).
Traditional Chinese (`zh-TW`) is chosen automatically only for Traditional-script
regions (Taiwan, Hong Kong, Macau); Simplified Chinese systems fall back to English.

The website keeps its own, shorter text in `website/strings.js`; a test checks that the
site offers exactly the same languages as the app.

## Adding a language

1. Copy `en.ts` to `<code>.ts` and translate the values (keep `{placeholders}` as they are).
2. Register it in `LOCALES` in `src/shared/i18n/index.ts`, with its native name
   (and in `RTL_LOCALES` if it is written right to left).
3. Add the same language to `website/strings.js` (`STRINGS` and `LANGUAGE_NAMES`).
4. Run `npm test`. It lists any missing keys, placeholders or plural forms.
