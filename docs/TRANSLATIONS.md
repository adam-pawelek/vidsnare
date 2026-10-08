# Translations

Strings live in `src/shared/i18n/locales/`. `en.ts` is the source of truth; every
other file must have the same keys and `{placeholders}`. Tests enforce this, plus
the plural forms each language needs (Polish and Russian use `one`/`few`/`many`/`other`;
Spanish, Portuguese and French also need `many`, which is used for millions).

| Locale | Status |
|---|---|
| en | Source |
| pl | Written by the developer; review recommended |
| de, es, pt-BR, ru, ja, fr | Machine-assisted draft; **needs a native speaker's review before release** |

## Adding a language

1. Copy `en.ts` to `<code>.ts` and translate the values (keep `{placeholders}` as they are).
2. Register it in `LOCALES` in `src/shared/i18n/index.ts`, with its native name.
3. Run `npm test`. It lists any missing keys, placeholders or plural forms.
