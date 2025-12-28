import { supabase } from "@/auth/supabase"

const API_BASE = "http://localhost:4000/api"

export const apiFetch = async (
  path: string,
  options: RequestInit = {}
) => {
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
}
