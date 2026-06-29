import fastifyPlugin from "fastify-plugin";
import type { FastifyRequest } from "fastify";
import { resolveLocale, translate } from "../localization/fluent.ts";

import type {
  SupportedLocale,
  TranslationArguments,
  TranslationKey,
  Translator,
} from "../localization/fluent.ts";

declare module "fastify" {
  interface FastifyRequest {
    locale: SupportedLocale;
    t: Translator;
  }
}

function translateRequest(
  this: FastifyRequest,
  key: TranslationKey,
  args?: TranslationArguments,
): string {
  return translate(this.locale, key, args);
}

export default fastifyPlugin(
  function (app) {
    app.decorateRequest("locale", "en" satisfies SupportedLocale);
    app.decorateRequest("t", translateRequest);

    app.addHook("onRequest", (request, _reply, done) => {
      request.locale = resolveLocale(request.headers["accept-language"]);
      done();
    });
  },
  {
    name: "internal-i18n",
  },
);
