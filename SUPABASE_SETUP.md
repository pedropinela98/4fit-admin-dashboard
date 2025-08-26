# 🚀 Supabase Environment Setup Guide

## 📋 Quick Setup Checklist

### 1. **Copy Environment Template**
```bash
cp .env.example .env.local
```

### 2. **Get Your Supabase Credentials**

#### For Development:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **DEVELOPMENT** project
3. Go to **Settings** → **API**
4. Copy the values:

```env
# .env.local
VITE_SUPABASE_URL=https://your-dev-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key-here
```

#### For Production:
1. Select your **PRODUCTION** project
2. Copy values to `.env.production` or set in deployment platform

### 3. **Verify Configuration**
```bash
npm run env:check
```

## 🏗️ File Structure

```
├── .env.local          # Development environment (not in git)
├── .env.production     # Production template
├── .env.example        # Template for team members
├── src/lib/
│   ├── supabase.ts     # Supabase client configuration
│   └── env.ts          # Environment validation
└── scripts/
    └── check-env.js    # Environment checker script
```

## 🔧 Environment Variables Explained

### Required Variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public API key for client-side operations

### Optional Variables:
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Admin key (use carefully!)
- `VITE_APP_ENV`: Environment name (development/production/staging)
- `VITE_APP_NAME`: Application display name
- `VITE_DEBUG_MODE`: Enable debug features
- `VITE_ENABLE_CONSOLE_LOGS`: Enable console logging

## 🚀 Deployment Platform Setup

### Vercel:
1. Go to Project → Settings → Environment Variables
2. Add all `VITE_*` variables
3. Set environment to "Production"

### Netlify:
1. Go to Site settings → Environment variables
2. Add all `VITE_*` variables

### Railway/Render:
1. Add environment variables in platform settings
2. Ensure all `VITE_*` variables are included

## 🔒 Security Best Practices

### ✅ Safe to expose (client-side):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_*` variables

### ⚠️ Handle with care:
- `VITE_SUPABASE_SERVICE_ROLE_KEY` - Only use if absolutely necessary
- Never commit `.env.local` to git
- Use different Supabase projects for dev/prod

## 🧪 Testing Your Setup

### 1. Environment Check:
```bash
npm run env:check
```

### 2. Start Development:
```bash
npm run dev
```

### 3. Verify Connection:
Check browser console for any Supabase connection errors.

## 🛠️ Troubleshooting

### Common Issues:

**Error: "Missing environment variable"**
- Ensure `.env.local` exists
- Check variable names match exactly (case-sensitive)
- Restart development server after changes

**Error: "Invalid API key"**
- Double-check you copied the correct key from Supabase dashboard
- Ensure you're using the right project (dev vs prod)

**Error: "Cross-origin request blocked"**
- Verify your domain is added to Supabase allowed origins
- Check if URL format is correct

### Getting Help:
1. Run `npm run env:check` for diagnostics
2. Check browser console for detailed error messages
3. Verify Supabase dashboard shows your project as active

## 🔄 Switching Between Environments

### Development:
```bash
npm run dev
```

### Test with Production Config:
```bash
npm run dev:prod-env
```

### Build for Different Environments:
```bash
npm run build:dev      # Development build
npm run build:staging  # Staging build
npm run build:prod     # Production build
```

## 📝 Next Steps

After completing this setup:
1. ✅ Environment variables configured
2. ⏭️ Generate TypeScript types from database
3. ⏭️ Set up authentication system
4. ⏭️ Create API service layer

Ready to move to the next phase? Let's generate your database types!