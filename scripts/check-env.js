#!/usr/bin/env node

/**
 * Environment variables checker script
 * Run with: npm run env:check
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const optionalEnvVars = [
  'VITE_SUPABASE_SERVICE_ROLE_KEY',
  'VITE_APP_ENV',
  'VITE_APP_NAME',
  'VITE_API_BASE_URL',
  'VITE_DEBUG_MODE',
  'VITE_ENABLE_CONSOLE_LOGS'
];

console.log('🔍 Checking environment configuration...\n');

// Check if .env.local exists
const envLocalPath = join(rootDir, '.env.local');
if (!existsSync(envLocalPath)) {
  console.log('❌ .env.local file not found');
  console.log('💡 Copy .env.example to .env.local and fill in your values\n');
  process.exit(1);
}

console.log('✅ .env.local file found');

// Load environment variables from .env.local
try {
  const envContent = readFileSync(envLocalPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      envVars[key.trim()] = value.trim();
    }
  });
  
  // Set environment variables for checking
  Object.assign(process.env, envVars);
} catch (error) {
  console.log('❌ Error reading .env.local file:', error.message);
  process.exit(1);
}

// Check required variables
let hasErrors = false;

console.log('📋 Required environment variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${varName}: Missing`);
    hasErrors = true;
  }
});

console.log('\n📋 Optional environment variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: Not set (using default)`);
  }
});

// Validate Supabase URL format
const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
  console.log('\n⚠️  VITE_SUPABASE_URL might not be a valid Supabase URL');
  console.log('   Expected format: https://your-project-id.supabase.co');
}

if (hasErrors) {
  console.log('\n❌ Environment configuration has errors!');
  console.log('🔧 Please fix the missing variables and try again.');
  process.exit(1);
} else {
  console.log('\n✅ Environment configuration looks good!');
  console.log('🚀 You can now run the application.');
}