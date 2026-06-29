import * as Pg from "pg";
import type {
  RefreshToken,
  RefreshTokenId,
  RefreshTokenStore,
} from "../refresh-token.store.ts";

export class PostgresRefreshTokenStore implements RefreshTokenStore {
  private readonly _client: Pg.Client;

  constructor(client: Pg.Client) {
    this._client = client;
  }

  async insert(refreshToken: RefreshToken): Promise<RefreshToken> {
    const { rows } = await this._client.query<{
      id: number;
      user_id: string;
      value: string;
      create_at: number;
    }>(
      'INSERT INTO "refresh_token" ("user_id", "value") VALUES ($1, $2) RETURNING "id", "user_id", "value", "created_at"',
      [refreshToken.user_id, refreshToken.value],
    );

    return this.toRefreshToken(rows[0])!;
  }

  async findByValue(value: string): Promise<RefreshToken | null> {
    const { rows } = await this._client.query<{
      id: number;
      user_id: string;
      value: string;
      create_at: number;
    }>(
      'SELECT "id", "user_id", "value", "created_at" FROM "refresh_token" WHERE "value" = $1',
      [value],
    );

    return this.toRefreshToken(rows[0]);
  }

  async delete(id: RefreshTokenId): Promise<boolean> {
    const result = await this._client.query(
      'DELETE FROM "refresh_token" WHERE "id" = $1',
      [id],
    );

    return result.rowCount !== 0;
  }

  toRefreshToken(
    row: {
      id: number;
      user_id: string;
      value: string;
      created_at: number;
    } | undefined,
  ): RefreshToken | null {
    if (!row) {
      return null;
    }

    return {
      id: String(row.id),
      user_id: row.user_id,
      value: row.value,
      created_at: row.created_at,
    };
  }
}
