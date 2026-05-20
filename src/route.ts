import { FastifyInstance, Request, Reply } from "fastify";

export default async function routes(app: FastifyInstance, options: any) {
  app.get("/", async (request: Request, reply: Reply) => {
    return { hello: "world" };
  });

  app.get("/products/:id", async (request: Reply, reply: Reply) => {
    const client = await app.pg.main.connect();
    try {
      const { rows } = await client.query("SELECT * FROM product WHERE id=$1", [
        request.params.id,
      ]);
      // Note: avoid doing expensive computation here, this will block releasing the client
      return rows;
    } finally {
      // Release the client immediately after query resolves, or upon error
      client.release();
    }
  });
}
