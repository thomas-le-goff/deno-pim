export type UserId = string;

export interface User {
  id: UserId;
  username: string;
  password: string | undefined;
}

export interface UserStore {
  create(user: User): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByUsernameAndHash(username: string, hash: string): Promise<User | null>;
  update(id: UserId, user: User): Promise<User>;
  delete(id: UserId): Promise<void>;
}
