import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { fastifyPostgres } from "@fastify/postgres";

async function dbConnector(app: FastifyInstance) {
  app.register(fastifyPostgres, {
    name: "main",
    connectionString: Deno.env.get("DB_CONNECTION_STRING"),
  });
}

export default fastifyPlugin(dbConnector);
