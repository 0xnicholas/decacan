// Placeholder adapter - Decacan uses JWT instead of Supabase
export class SupabaseAdapter {
  static async signIn(credentials: { email: string; password: string }) {
    // Placeholder - actual implementation uses JWT
    return { error: null, data: null };
  }

  static async signUp(credentials: { email: string; password: string; name?: string }) {
    return { error: null, data: null };
  }

  static async signOut() {
    // No-op
  }

  static onAuthStateChange(callback: Function) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  static async getUser() {
    return { data: { user: null }, error: null };
  }
}