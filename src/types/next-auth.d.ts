/**
 * Next-Auth type augmentation.
 * Adds `id` to the Session user so TypeScript knows it exists.
 */
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}
