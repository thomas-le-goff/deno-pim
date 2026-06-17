import {
    FastifyPluginCallbackTypebox,
    Type,
} from '@fastify/type-provider-typebox';

import fastifyPlugin from 'fastify-plugin';

import { User } from '../../../data/user.store.ts';
import { LoginBodySchema } from '../../../schemas/auth.schema.ts';
import { StatusCodes } from 'http-status-codes';
import { InvalidCredentialsError } from '../../auth.ts';

const baseSchema = {
    tags: ['Authentication'],
};

const routes: FastifyPluginCallbackTypebox = (app, _opts, done) => {
    app.route({
        method: 'POST',
        url: '/auth/login',
        schema: {
            ...baseSchema,
            body: LoginBodySchema,
            response: {
                200: Type.Object({
                    access_token: Type.String(),
                    token_type: Type.String({ default: 'Bearer' }),
                    expires_in: Type.Integer(),
                }),
                400: Type.Object({
                    message: Type.String(),
                }),
            },
        },
        handler: async (
            req,
            reply,
        ) => {
            let user: User;

            try {
                user = await app.verifyUserAndPassword(req.body);
            } catch (err) {
                if (err instanceof InvalidCredentialsError) {
                    return reply.code(StatusCodes.BAD_REQUEST).send({
                        message: req.t('auth.invalid-credentials'),
                    });
                }

                throw err;
            }

            return reply.code(StatusCodes.OK).send(
                await app.generateTokenResponse(user),
            );
        },
    });

    done();
};

export default fastifyPlugin(routes, {
    dependencies: [
        'internal-auth',
        'internal-i18n',
    ],
    encapsulate: true,
});
