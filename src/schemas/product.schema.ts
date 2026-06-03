import { Type } from "@fastify/type-provider-typebox";
import { IdSchema } from "./common.schema.ts";

export const ProductParamsSchema = Type.Object({
  id: IdSchema,
});
