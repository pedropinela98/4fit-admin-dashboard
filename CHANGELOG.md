# Changelog

All notable changes to this CrossFit Box Management Dashboard will be documented in this file.

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