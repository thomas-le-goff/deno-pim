export type UserId = string;

declare module "fastify" {
  interface FastifyInstance {
    userStore: UserStore;
  }
}

export type User = {
  id: UserId;
  username: string;
  password: string | undefined;
  role: string;
};

export function createEmptyUser(): User {
  return {
    id: "",
    username: "",
    password: undefined,
    role: "",
  };
}

//TODO better way of doing this
export function createFromPartialUser(partial: Partial<User>): User {
  const emptyUser = createEmptyUser();
  return {
    username: emptyUser.username,
    password: emptyUser.password,
    role: emptyUser.role,
    ...partial,
    id: emptyUser.id,
  };
}

export type SearchUserQuery = {
  role?: string | undefined;
};

export interface UserStore {
  insert(user: User): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findBySearchQuery(searchQuery: SearchUserQuery): Promise<User[]>;
  update(id: UserId, user: User): Promise<User>;
  delete(id: UserId): Promise<boolean>;
}
