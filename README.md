# ShopMate App

ShopMate is a mobile shopping application built with **React Native**, **Expo**, **TypeScript**, and **Supabase**.
The app includes a product catalog, product images from Supabase Storage, authentication, user/admin profile roles, cart, favorites, and a clean mobile UI.

## Features

- Product listing with real data from Supabase
- Product images loaded from Supabase Storage
- User authentication with Supabase Auth
- Login and Register flow
- User and Admin role system
- Dynamic Profile page based on user role
- Cart functionality
- Favorites functionality
- Product detail screens
- Category-based product browsing
- Responsive mobile-first UI
- Expo Router navigation
- TanStack Query for API data fetching
- Local state management with React Context

## Tech Stack

- React Native
- Expo
- TypeScript
- Expo Router
- Supabase
  - Authentication
  - PostgreSQL Database
  - Storage
  - Row Level Security

- TanStack Query
- React Context API
- Expo Vector Icons

## Project Structure

```bash
src/
  app/
    home.tsx
    login.tsx
    cart.tsx
    profile.tsx
    _layout.tsx
  components/
  data/
  features/
  lib/
    supabase.ts
    auth.ts
    profile.ts
  store/
  types/
  utils/
```

## Environment Variables

Create a `.env` file in the root of the project:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit your `.env` file.
Use `.env.example` for sharing environment variable names.

## Installation

```bash
npm install
```

## Run Project

```bash
npx expo start
```

For clearing cache:

```bash
npx expo start -c
```

## Supabase Setup

This project uses Supabase for backend services.

Main tables:

- `products`
- `profiles`
- `favorites`
- `cart_items`
- `orders`
- `order_items`

Storage bucket:

- `Images`

Authentication:

- Email and password login/register
- User profile is stored in the `profiles` table
- Each user has a role:
  - `user`
  - `admin`

## User Roles

The Profile page supports two different modes:

### User Panel

The normal user can see:

- Profile information
- Orders summary
- Favorites
- Cart information
- User settings

### Admin Panel

The admin can see:

- Store overview
- Product statistics
- Order statistics
- Admin dashboard options

The role is stored in the Supabase `profiles` table.

## Demo Accounts

```txt
Admin:
email: admin@admin.com
password: 123456

User:
email: user@user.com
password: 123456
```

## Screens

- Home
- Product List
- Product Details
- Cart
- Favorites
- Login / Register
- Profile
- Admin Profile Panel
- User Profile Panel

## Notes

This project was built as a portfolio-ready React Native shopping app.
The main goal was to practice real-world mobile app development with a real backend using Supabase.

## Author

Ali Goudarzi

GitHub: [@aligoodi77](https://github.com/aligoodi77)
