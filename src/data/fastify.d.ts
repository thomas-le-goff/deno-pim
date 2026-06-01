import { UserStore } from "./user.store.ts";

declare module "fastify" {
  interface FastifyInstance {
    userStore: UserStore;
  }
}
