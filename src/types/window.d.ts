export {}

declare global {
  interface Window {
    auth: {
      saveSession: (session: any) => Promise<void>
      getSession: () => Promise<any | null>
      clearSession: () => Promise<void>
    }
  }
}
