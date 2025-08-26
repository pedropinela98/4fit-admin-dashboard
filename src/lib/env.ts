// Environment configuration with validation and type safety

interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  app: {
    env: 'development' | 'production' | 'staging';
    name: string;
    baseUrl: string;
    enableMockData: boolean;
  };
  debug: {
    debugMode: boolean;
    enableConsoleLogs: boolean;
  };
}

// Validate and parse environment variables
const getEnvVar = (key: string, required: boolean = true): string | undefined => {
  const value = import.meta.env[key];
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
};

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (!value) return defaultValue;
  
  return value.toLowerCase() === 'true' || value === '1';
};

// Create and validate environment configuration
export const env: EnvironmentConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY', false),
  },
  app: {
    env: (getEnvVar('VITE_APP_ENV', false) as any) || 'development',
    name: getEnvVar('VITE_APP_NAME', false) || 'CrossFit Box Admin',
    baseUrl: getEnvVar('VITE_API_BASE_URL', false) || 'http://localhost:5173',
    enableMockData: getBooleanEnvVar('VITE_ENABLE_MOCK_DATA'),
  },
  debug: {
    debugMode: getBooleanEnvVar('VITE_DEBUG_MODE', true),
    enableConsoleLogs: getBooleanEnvVar('VITE_ENABLE_CONSOLE_LOGS', true),
  },
};

// Environment checks
export const isDevelopment = env.app.env === 'development';
export const isProduction = env.app.env === 'production';
export const isStaging = env.app.env === 'staging';

// Debug helper
export const debugLog = (...args: any[]) => {
  if (env.debug.enableConsoleLogs) {
    console.log('[CrossFit Dashboard]', ...args);
  }
};

// Validate configuration on load
if (isDevelopment) {
  debugLog('Environment configuration loaded:', {
    environment: env.app.env,
    app: env.app.name,
    supabaseConfigured: !!env.supabase.url,
    debugMode: env.debug.debugMode,
  });
}