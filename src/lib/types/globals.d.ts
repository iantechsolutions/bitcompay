export {};
export type Roles = "admin" | "user" | "unathourized";
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
