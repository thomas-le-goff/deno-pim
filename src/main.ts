import Fastify from "fastify";
import routes from "./route.ts";
import dbConnector from "./database.ts";

const app = Fastify({
  logger: true,
});

app.register(dbConnector);
app.register(routes);

const start = async () => {
  try {
    await app.listen({ port: 3000, host: "localhost" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
