import { createClient } from "@supabase/supabase-js";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  sort: number;
  created_at: string;
}

export interface Message {
  id: string;
  phone: string;
  message: string | null;
  source: string | null;
  created_at: string;
}

/**
 * Sunucu tarafı Supabase istemcisi (service role). RLS'i baypas eder;
 * yalnızca API route'larında kullanılır, anahtar tarayıcıya sızmaz.
 */
export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase sunucu anahtarları (URL / SERVICE_ROLE) eksik.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Admin parolası doğrulaması. */
export function checkPassword(provided: string | null | undefined): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return !!pw && provided === pw;
}
