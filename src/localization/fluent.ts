import { FluentBundle, FluentResource, FluentVariable } from "@fluent/bundle";

export const supportedLocales = ["en", "fr"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export type TranslationKey =
  | "errors.internal-server-error"
  | "auth.invalid-credentials"
  | "authorization.forbidden"
  | "user.not-found"
  | "user.username-already-taken"
  | "product.not-found";

export type TranslationArguments = Record<string, FluentVariable>;
export type Translator = (
  key: TranslationKey,
  args?: TranslationArguments,
) => string;

const DEFAULT_LOCALE: SupportedLocale = "en";

const localeResources: Record<SupportedLocale, URL> = {
  en: new URL("./locales/en.ftl", import.meta.url),
  fr: new URL("./locales/fr.ftl", import.meta.url),
};

const bundles = new Map(
  supportedLocales.map((locale) => [locale, createBundle(locale)]),
);

function createBundle(locale: SupportedLocale): FluentBundle {
  const resource = new FluentResource(
    Deno.readTextFileSync(localeResources[locale]),
  );
  const bundle = new FluentBundle(locale, { useIsolating: false });
  bundle.addResource(resource);
  return bundle;
}

function parseAcceptedLanguages(
  headerValue: string | string[] | undefined,
): string[] {
  const header = Array.isArray(headerValue)
    ? headerValue.join(",")
    : headerValue;

  if (header == null || header.trim() === "") {
    return [];
  }

  return header
    .split(",")
    .map((entry) => {
      const [tag = "", ...parameters] = entry.trim().split(";");
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q=")
      );
      const quality = Number(qualityParameter?.trim().slice(2) ?? "1");

      return {
        tag: tag.toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter(({ tag }) => tag !== "")
    .sort((left, right) => right.quality - left.quality)
    .map(({ tag }) => tag);
}

export function resolveLocale(
  headerValue: string | string[] | undefined,
): SupportedLocale {
  for (const requestedLocale of parseAcceptedLanguages(headerValue)) {
    const exactMatch = supportedLocales.find((locale) =>
      locale.toLowerCase() === requestedLocale
    );

    if (exactMatch != null) {
      return exactMatch;
    }

    const partialMatch = supportedLocales.find((locale) =>
      requestedLocale.startsWith(`${locale.toLowerCase()}-`) ||
      locale.toLowerCase().startsWith(`${requestedLocale}-`)
    );

    if (partialMatch != null) {
      return partialMatch;
    }
  }

  return DEFAULT_LOCALE;
}

export function translate(
  locale: SupportedLocale,
  key: TranslationKey,
  args?: TranslationArguments,
): string {
  const messageId = key.replaceAll(".", "-");
  const bundle = bundles.get(locale) ?? bundles.get(DEFAULT_LOCALE);

  if (bundle == null) {
    throw new Error(`Locale bundle "${locale}" is not available.`);
  }

  const message = bundle.getMessage(messageId);

  if (message?.value == null) {
    throw new Error(
      `Translation "${key}" is not available for locale "${locale}".`,
    );
  }

  const errors: Error[] = [];
  const translatedMessage = bundle.formatPattern(message.value, args, errors);

  if (errors.length > 0) {
    throw errors[0];
  }

  return translatedMessage;
}
