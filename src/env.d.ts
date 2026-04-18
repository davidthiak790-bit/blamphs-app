/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    user?: { id: string; email: string; name: string | null } | null;
    org?: { id: string; name: string; plan: string } | null;
    DB?: any;
    runtime?: { env?: { DB?: any; [key: string]: any }; [key: string]: any };
  }
}
