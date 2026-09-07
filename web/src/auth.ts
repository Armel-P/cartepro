export type AuthUser = {
  id: string
  mail: string
  name: string
  role?: string
}

const STORAGE_KEY = "cartepro.user"

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
      console.error("error getting user");
    return null
  }
}

export function setUser(user: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
      console.error("error setting user");
  }
}

export function clearUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
      console.error("error clearing user");
  }
}

export function isLoggedIn(): boolean {
  return getUser() !== null
}
