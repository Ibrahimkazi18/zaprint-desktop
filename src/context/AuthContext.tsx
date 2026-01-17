import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/auth/supabase"
import { SupabaseClient } from "@supabase/supabase-js"

interface AuthContextType {
  user: any | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session on app start
  useEffect(() => {
    const restore = async () => {
      if (!window.auth) {
        console.warn('window.auth not available yet')
        setLoading(false)
        return
      }

      const session = await window.auth.getSession()
      if (session) {
        await supabase.auth.setSession(session)
        setUser(session.user)
      }
      setLoading(false)
    }

    restore()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session) {
          await window.auth.saveSession(session)
          setUser(session.user)
        } else {
          await window.auth.clearSession()
          setUser(null)
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    } 
  }, [])

  const upsertProfile = async (
    supabase: SupabaseClient,
    user: any,
    role: "customer" | "shop" = "customer"
  ) => {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (existingProfile) return existingProfile;

    // Create profile if first time
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name || "",
        role,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  };

  const login = async (email: string, password: string) => {
    const profile = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (!profile.data) {
      throw new Error("Profile not found");
    }

    if(profile.data.role !== "shop") {
      throw new Error("Not a shop account");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error
    if (!data.user) throw new Error("User not found");

    await window.auth.saveSession(data.session)
    setUser(data.user)
  }

  const signup = async (email: string, password: string, name: string) => {
    const role = "shop"

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
    if (error) throw error

    await upsertProfile(
      supabase,
      data.user,
      role
    );

    await window.auth.saveSession(data.session)
    setUser(data.user)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    await window.auth.clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("AuthProvider missing")
  return ctx
}
