import fastifyPlugin from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { fastifyPostgres } from "@fastify/postgres";
import { PostgresUserStore } from "../data/postgres/postgres-user.store.ts";

async function dbConnector(app: FastifyInstance) {
  await app.register(fastifyPostgres, {
    name: "main",
    connectionString: Deno.env.get("DB_CONNECTION_STRING"),
  });

  app.decorate("userStore", new PostgresUserStore(app.pg.main));
}

export default fastifyPlugin(dbConnector, {
  name: "internal-database",
});
