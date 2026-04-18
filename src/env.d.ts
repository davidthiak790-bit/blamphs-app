/// <reference types="astro/client" />
type D1Database = import("@cloudflare/workers-types").D1Database;
type Env = {
  DB: D1Database;
  SESSION_SECRET: string;
};
declare namespace App {
  interface Locals {
    user: { id: string; email: string; name: string | null } | null;
    org: { id: string; name: string; plan: string } | null;
    db: D1Database;
  }
}
