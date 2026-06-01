import * as Pg from "pg";
import { User, UserId, UserStore } from "../user.store.ts";

export class PostgresUserStore implements UserStore {
  private readonly _client: Pg.Client;

  constructor(client: Pg.Client) {
    this._client = client;
  }

  async create(user: User): Promise<User> {
    // TODO: password validation is required in domain layer
    if (user.password == undefined) {
      throw new Error(`User password is missing.`);
    }

    const { rows } = await this._client.query<{
      id: number;
      username: string;
    }>(
      'INSERT INTO "user" ("username", "password") VALUES ($1, $2) RETURNING "id", "username"',
      [user.username, user.password],
    );

    return this.#toUser(rows[0])!;
  }

  async findById(id: UserId): Promise<User | null> {
    const { rows } = await this._client.query<{
      id: number;
      username: string;
    }>(
      'SELECT "id", "username" FROM "user" WHERE "id" = $1',
      [id],
    );

    return this.#toUser(rows[0]);
  }

  async findByUsername(username: string): Promise<User | null> {
    const { rows } = await this._client.query<{
      id: number;
      username: string;
    }>(
      'SELECT "id", "username" FROM "user" WHERE "username" = $1',
      [username],
    );

    return this.#toUser(rows[0]);
  }

  async findByUsernameAndHash(
    username: string,
    hash: string,
  ): Promise<User | null> {
    const { rows } = await this._client.query<{
      id: number;
      username: string;
    }>(
      'SELECT "id", "username" FROM "user" WHERE "username" = $1 AND "password" = $2',
      [username, hash],
    );

    return this.#toUser(rows[0]);
  }

  async update(id: UserId, user: User): Promise<User> {
    const { rows } = await this._client.query<{
      id: number;
      username: string;
    }>(
      'UPDATE "user" SET "username" = $1 WHERE id = $2 RETURNING "id", "username"',
      [user.username, id],
    );

    return this.#toUser(rows[0])!;
  }

  async delete(id: UserId): Promise<void> {
    const result = await this._client.query(
      'DELETE FROM "user" WHERE "id" = $1',
      [id],
    );

    if (result.rowCount === 0) {
      throw new Error(`User ${id} not found`);
    }
  }

  #toUser(
    row: { id: number; username: string } | undefined,
  ): User | null {
    if (!row) {
      return null;
    }

    return {
      id: String(row.id),
      username: row.username,
      password: undefined,
    };
  }
}
