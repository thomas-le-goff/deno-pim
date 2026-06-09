import * as Pg from "pg";
import { SearchUserQuery, User, UserId, UserStore } from "../user.store.ts";

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
      role: string;
    }>(
      'INSERT INTO "user" ("username", "password", "role") VALUES ($1, $2, $3) RETURNING "id", "username", "role"',
      [user.username, user.password, user.role],
    );

    return this.#toUser(rows[0])!;
  }

  async findById(id: UserId): Promise<User | null> {
    const { rows } = await this._client.query<{
      id: number;
      username: string;
      role: string;
    }>(
      'SELECT "id", "username", "role" FROM "user" WHERE "id" = $1',
      [id],
    );

    return this.#toUser(rows[0]);
  }

  async findByUsername(username: string): Promise<User | null> {
    const { rows } = await this._client.query<{
      id: number;
      username: string;
      role: string;
    }>(
      'SELECT "id", "username", "role" FROM "user" WHERE "username" = $1',
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
      role: string;
    }>(
      'SELECT "id", "username", "role" FROM "user" WHERE "username" = $1 AND "password" = $2',
      [username, hash],
    );

    return this.#toUser(rows[0]);
  }

  async findBySearchQuery(_searchQuery: SearchUserQuery): Promise<User[]> {
    //TODO: find a lightway query builder
    const { rows } = await this._client.query<{
      id: number;
      username: string;
      role: string;
    }>(
      'SELECT "id", "username", "role" FROM "user"',
      [],
    );

    return rows.map(this.#toUser);
  }

  async update(id: UserId, user: User): Promise<User> {
    const { rows } = await this._client.query<{
      id: number;
      username: string;
      role: string;
    }>(
      'UPDATE "user" SET "username" = $1 WHERE id = $2 RETURNING "id", "username", "role"',
      [user.username, id],
    );

    return this.#toUser(rows[0])!;
  }

  async delete(id: UserId): Promise<boolean> {
    const result = await this._client.query(
      'DELETE FROM "user" WHERE "id" = $1',
      [id],
    );

    return result.rowCount !== 0;
  }

  #toUser(
    row: { id: number; username: string; role: string } | undefined,
  ): User | null {
    if (!row) {
      return null;
    }

    return {
      id: String(row.id),
      username: row.username,
      password: undefined,
      role: row.role,
    };
  }
}
