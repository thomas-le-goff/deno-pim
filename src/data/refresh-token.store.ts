import { UserId } from './user.store.ts';

export type RefreshTokenId = string;

declare module 'fastify' {
    interface FastifyInstance {
        refreshTokenStore: RefreshTokenStore;
    }
}

export type RefreshToken = {
    id: RefreshTokenId;
    user_id: UserId;
    value: string;
    created_at: number | undefined;
};

export interface RefreshTokenStore {
    insert(refreshToken: RefreshToken): Promise<RefreshToken>;
    findByValue(value: string): Promise<RefreshToken | null>;
    delete(id: RefreshTokenId): Promise<boolean>;
}
