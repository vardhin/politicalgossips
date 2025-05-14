/// <reference types="@sveltejs/kit" />

declare namespace App {
  interface Locals {}
  interface Platform {}
  interface Session {}
  interface Stuff {}
}

interface ImportMetaEnv {
  PUBLIC_API_URL: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PUBLIC_API_URL: string;
    }
  }
} 