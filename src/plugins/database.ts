import fastifyPlugin from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { fastifyPostgres } from '@fastify/postgres';
import { PostgresUserStore } from '../data/postgres/postgres-user.store.ts';
import { PostgresRefreshTokenStore } from '../data/postgres/postgres-refresh-token.store.ts';

export default fastifyPlugin(async function (app: FastifyInstance) {
    await app.register(fastifyPostgres, {
        name: 'main',
        connectionString: app.config.DB_CONNECTION_STRING,
    });

    app.decorate('userStore', new PostgresUserStore(app.pg.main));
    app.decorate(
        'refreshTokenStore',
        new PostgresRefreshTokenStore(app.pg.main),
    );
}, {
    name: 'internal-database',
});
