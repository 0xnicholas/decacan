import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('- VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅' : '❌');
  process.exit(1);
}

// Create Supabase client with service role key (for admin operations)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createDemoUser() {
  console.log('🚀 Creating demo user...');

  const demoEmail = 'demo@kt.com';
  const demoPassword = 'demo123';

  try {
    // First, check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error checking existing users:', listError.message);
      return;
    }

    const existingUser = existingUsers.users.find(user => user.email === demoEmail);

    if (existingUser) {
      console.log('✅ Demo user already exists!');
      console.log(`📧 Email: ${demoEmail}`);
      console.log(`🔑 Password: ${demoPassword}`);
      console.log(`🆔 User ID: ${existingUser.id}`);
      return;
    }

    // Create the demo user
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: 'Demo User',
        first_name: 'Demo',
        last_name: 'User',
      },
    });

    if (error) {
      console.error('❌ Error creating demo user:', error.message);
      return;
    }

    console.log('✅ Demo user created successfully!');
    console.log(`📧 Email: ${demoEmail}`);
    console.log(`🔑 Password: ${demoPassword}`);
    console.log(`🆔 User ID: ${user.user.id}`);
    console.log('');
    console.log('💡 You can now log in using these credentials in your application.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
createDemoUser();