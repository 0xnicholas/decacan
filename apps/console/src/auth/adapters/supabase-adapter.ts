// Placeholder adapter - Decacan uses JWT instead of Supabase
 
export class SupabaseAdapter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async signIn(_credentials: { email: string; password: string }) {
    // Placeholder - actual implementation uses JWT
    return { error: null, data: null };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async signUp(_credentials: { email: string; password: string; name?: string }) {
    return { error: null, data: null };
  }

  static async signOut() {
    // No-op
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  static async getUser() {
    return { data: { user: null }, error: null };
  }
}