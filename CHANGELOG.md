# Changelog

All notable changes to this CrossFit Box Management Dashboard will be documented in this file.

## [2025-08-31] - Database Schema & Session Pack Management

### Added
- **Room Management**: Room table with box relationship, classes now assigned to specific rooms
- **Enhanced Session Pack Management**: 
  - Automatic session decrementing on class attendance
  - Smart refund system for no-shows/cancellations
  - Booking validation (expired/depleted packs prevention)
  - Business rule enforcement (no membership + session pack conflicts)
  - Helper functions and management views for pack monitoring
- **User Privacy Controls**: Added `public_results` boolean column to `User_detail` table for controlling visibility of workout results and PRs
- **Query Optimization**: Comprehensive indexing and views for efficient public results/PRs queries with leaderboard support
- **Athlete Profile Enhancement**: Added `height` (INT, 0-250 cm) and `athlete_type` enum (Rx/Scaled) columns to `User_detail`
- **PR History Tracking**: Added `PR_History` table with composite PK to track historical personal records when new PRs are achieved
- **Weight History Tracking**: Added `Weight_History` table with composite PK to track user weight progression over time
- **Coach Role Validation**: Added trigger function to ensure only users with coach, admin, or super_admin roles can be assigned to classes
- **Customizable Class Types**: Added `Class_Type` table to allow each box to define custom class types instead of hardcoded VARCHAR values

### Database Changes
- New `Room` table with foreign key to `Box`
- Updated `Class` table with required `room_id` field
- Added `public_results` column to `User_detail` table (defaults to true)
- Added `height` and `athlete_type` columns to `User_detail` with proper constraints
- New `athlete_type` enum with values: 'Rx', 'Scaled'
- Added `PR_History` table with composite primary key (user_id, movement_id, value)
- Added `Weight_History` table with composite primary key (user_id, weight, created_at) for tracking weight progression
- Added `Class_Type` table with unique constraint (box_id, name) for customizable class types per box
- Updated `Class` table to reference `Class_Type` instead of VARCHAR type column
- Added `validate_class_coach()` trigger function to enforce coach role requirements for class assignments
- Enhanced triggers for automatic session pack lifecycle management and PR history saving
- Comprehensive validation constraints and indexes

---

## [2025-08-31] - Query Optimization & Navigation Improvements

### Added
- **Box Selection Dropdown** in Members page
  - Dynamic box filtering with real-time member updates
  - Auto-selects box from URL parameter (`/members?boxId=123`)
  - Fallback to demo/first box if no parameter provided
  - Consistent styling with existing dropdowns

- **Box Actions Dropdown** in Box List
  - "View Members" action navigates to `/members?boxId={boxId}`
  - "Edit Box" and "Delete Box" actions with confirmation
  - React Portal implementation for proper z-index handling
  - Click-outside-to-close functionality

### Optimized
- **Members Page Queries** - Reduced database calls by 50%
  - Eliminated redundant `getMemberStats()` query
  - Calculate stats from existing member data in frontend
  - Fixed search debounce to prevent unnecessary queries on empty input
  - Single query load: `getMembersByBox()` only

- **Boxes Page Queries** - Fixed duplicate query issue
  - Removed redundant search effect trigger on initial render
  - Optimized search-only behavior for actual user input

### Fixed
- **Database Relationship Issues** - Resolved foreign key relationship errors
  - Fixed `Box_Member` to `Membership` queries via `User_detail` junction
  - Updated all member service queries to use proper relationship chain
  - Corrected member stats query to use proper joins

- **Dropdown Visibility Issues** - Box actions dropdown
  - Implemented React Portal rendering to document.body
  - Dynamic position calculation with scroll awareness
  - Fixed z-index conflicts with `z-50` and backdrop layer

### Technical Improvements
- URL parameter integration with `useSearchParams`
- Proper state synchronization between URL and component state  
- Enhanced UX with loading states and proper error handling
- Mobile-responsive dropdown positioning

---

## [Unreleased]

### Added
- **Member Management System** - Complete CRUD functionality for managing CrossFit box members
  - Created `members.service.ts` with full CRUD operations and Supabase integration
    - Handles User_detail and Box_Member table relationships
    - Emergency contact information storage in notes field
    - Member search functionality by name and email
    - Member statistics (total, active, inactive, expired)
    - Soft delete functionality with `deleted_at` timestamp
  - Added `useMembers.ts` custom hooks for state management
    - `useMembers(boxId)` - Manages list of members for a specific box
    - `useMember(memberId)` - Fetches single member with full details
    - Real-time state updates and error handling
  - Implemented `MemberList` component with mobile-first responsive design
    - Real-time search with debouncing (300ms)
    - Mobile card view and desktop table view
    - Membership status indicators (Active/Inactive/Expired)
    - Membership type display
    - Statistics summary cards (total, active, inactive, expired)
    - Loading and error states with retry functionality
    - Status filtering (all, active, inactive, expired)
  - Implemented `MemberForm` component for creating and editing members
    - Personal information section (name, email, phone)
    - Emergency contact section (contact name and phone)
    - Additional information section (join date, notes)
    - Form validation with email format checking
    - Mobile-optimized layout with responsive grid
    - Emergency contact data parsing from notes field for editing
  - Updated navigation with "Members" menu item in sidebar
  - Created routes: `/members`, `/members/new`, `/members/:id`, `/members/:id/edit`
  - Full database schema compliance with User_detail and Box_Member tables

- **Box Management System** - Complete CRUD functionality for managing CrossFit boxes
  - Created `boxes.service.ts` with full CRUD operations and Supabase integration
  - Added `useBoxes.ts` custom hooks for state management (`useBoxes()` and `useBox()`)
  - Implemented `BoxList` component with mobile-first responsive design
    - Real-time search with debouncing
    - Mobile card view and desktop table view
    - Status indicators (Active/Inactive)
    - Statistics summary cards
    - Loading and error states
  - Implemented `BoxForm` component for creating and editing boxes
    - Form validation with proper error messages
    - Timezone and currency dropdowns with common options
    - Optional GPS coordinates support
    - Mobile-optimized layout
    - Active/inactive toggle
  - Added navigation integration with "Boxes" menu item in sidebar
  - Created routes: `/boxes`, `/boxes/new`, `/boxes/:id/edit`
  - Full database schema compliance with Box table structure
  - Type-safe TypeScript implementation throughout
  - Consistent UI design with existing dashboard components

### Technical Details
- Service layer handles Box CRUD operations with proper error handling
- Custom hooks provide loading states, error handling, and local state management
- Components follow mobile-first responsive design principles
- Integration with existing Supabase configuration and database types
- Form validation includes timezone, currency, and GPS coordinate validation
- Search functionality with real-time filtering
- Statistics tracking for box metrics

---

## Previous Changes
*This changelog was started with the box management system implementation. Previous changes are not documented here.*