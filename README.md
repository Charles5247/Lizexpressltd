
# LizExpress

**LizExpress** is a modern item-swapping platform where users can list personal items, interact through chats, and manage their favorites—all while maintaining privacy and secure access. The app is backed by Supabase with row-level security for robust access control.

---

## 🚀 Current Status

### ✅ Implemented Features

- **User Profiles**
  - Custom user data extending Supabase's `auth.users`
  - Includes personal details and verification status

- **Item Listings**
  - Users can list items with images, categories, conditions, prices, etc.
  - Items support active/inactive status
  - Receipt image support included

- **Chat System**
  - One-on-one chat between users over items
  - Separate threads and messages table

- **Favorites**
  - Wishlist functionality for users to favorite items

- **Notifications**
  - System and personal notifications with read/unread tracking

- **Security**
  - Row-Level Security (RLS) enabled for all tables
  - Policies for authenticated user access and actions
  - Indexes created for performance optimization

---

## 🧩 Database Schema

Located in:
```
/supabase/migrations/20250512102628_black_island.sql
```

Tables:
- `users`
- `items`
- `chats`
- `messages`
- `favorites`
- `notifications`

Security: Enabled RLS with defined access policies per table.

---

## 📦 Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Next.js /Supabase (PostgreSQL)
- **Database Migration**: SQL schema files
- **Version Control**: Git

---

## 🧠 Next Steps

- Build out frontend components for item listings, chats, and favorites
- Implement authentication and user profile forms
- Add media upload UI
- Sync Supabase with the local schema

---

> Maintained by Charles5247 & contributors.
