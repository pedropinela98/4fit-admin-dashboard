# 🔧 Supabase TypeScript Types Setup

## 🚀 Quick Setup (One-time)

### 1. Login to Supabase CLI:
```bash
supabase login
```
This will open your browser to authenticate with Supabase.

### 2. Link Your Project:
```bash
npm run supabase:link
```
This links the CLI to your 4Fit project.

## 🔄 Generate Types (Anytime)

### Generate Types from Your Database:
```bash
npm run supabase:types
```

This will:
- Connect to your Supabase project
- Read your database schema
- Generate TypeScript types
- Save them to `src/lib/database.types.ts`

## 🎯 What Gets Generated

The generated types include:

### **Database Interface:**
- Complete table definitions (Row, Insert, Update)
- All your custom enums (staff_role, payment_status, etc.)
- Type-safe database queries

### **Helper Types:**
```typescript
// Use table types easily
type User = Tables<'User_detail'>
type Member = Tables<'Box_Member'>

// Use enums
type Role = Enums<'staff_role'>
```

### **Type-Safe Queries:**
```typescript
// Your queries will be fully typed
const { data: members } = await supabase
  .from('Box_Member')
  .select('*, User_detail(*)')
  .eq('box_id', boxId)

// TypeScript knows the exact shape of 'members'
```

## ⚙️ When to Regenerate Types

Run `npm run supabase:types` after:
- Adding new tables
- Modifying existing tables  
- Adding new enums
- Changing column types
- Adding new functions

## 🛠️ Manual Types (Current)

For now, I've created manual types based on your DBML schema in:
`src/lib/database.types.ts`

These types include all your tables:
- `User_detail` - User information
- `Box` - CrossFit box details  
- `Box_Member` - Member relationships
- `Box_Staff` - Staff assignments
- `Plan` & `Membership` - Subscription management
- `Class` & `Class_Attendance` - Class scheduling
- `Movement` & `Workout` - Exercise programming
- `PR` - Personal records
- `Payment` - Payment processing
- `Announcement` & `Expense` - Admin features

## 🔐 Authentication Required

The Supabase CLI needs authentication to access your project schema. 

If you get authentication errors:
1. Run `supabase login` first
2. Make sure you have access to the project
3. Check that the project ID in package.json is correct

## 🎉 Next Steps

Once types are set up:
1. ✅ Database types configured  
2. ⏭️ Create authentication system
3. ⏭️ Build API service layer
4. ⏭️ Replace mock data with real queries

The types provide full IntelliSense and type safety for all database operations!