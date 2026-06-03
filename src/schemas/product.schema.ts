import { Type } from "@fastify/type-provider-typebox";

export const ProductParamsSchema = Type.Object({
  id: Type.String,
});
