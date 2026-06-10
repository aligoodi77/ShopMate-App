# ShopMate App

ShopMate is a modern mobile shopping app built with **React Native** and **Expo**. It provides a sleek ecommerce experience with product listing, details, search, favorites and cart functionality. The app is built using **TypeScript**, **Expo Router**, **TanStack Query**, **Zustand** and **AsyncStorage** for state management and offline persistence.

## Features

- **Product catalog** – Browse a list of products with images, prices and short descriptions.
- **Search & filters** – Search for products by name and filter by category.
- **Product details** – View detailed information, images and specifications for each product.
- **Add to cart** – Add items to a shopping cart and adjust quantities.
- **Favorites** – Save products to a favorites list for quick access.
- **Persistent storage** – Cart and favorites are saved to AsyncStorage so your data persists between sessions.
- **Responsive UI** – Built with React Native for a seamless experience across iOS and Android.

## Technology Stack

- **Expo & React Native** – Cross‑platform mobile application framework.
- **TypeScript** – Type‑safe codebase.
- **Expo Router** – File‑based routing for navigation.
- **TanStack Query (React Query)** – Data fetching and caching.
- **Zustand** – Global state management for cart and favorites.
- **AsyncStorage** – Local storage persistence.

## Getting Started

Follow these steps to set up and run ShopMate locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/aligoodi77/ShopMate-App.git
   cd ShopMate-App
   ```

2. **Install dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Or yarn:

   ```bash
   yarn
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

   This will start Expo’s Metro bundler. Use a mobile simulator or the Expo Go app on your device to run the application.

4. **Build a production binary**

   Follow Expo’s [build documentation](https://docs.expo.dev/build/introduction/) to build the app for iOS and Android.

## Project Structure

```
├── app/                 # Route-based screens using Expo Router
├── components/          # Reusable UI components
├── hooks/               # Custom React hooks (e.g. useCart)
├── lib/                 # API clients and utility functions
├── store/               # Zustand state stores
├── assets/              # Images and other static assets
├── package.json         # NPM scripts and dependencies
└── tsconfig.json        # TypeScript configuration
```

## Contributing

Contributions are welcome! Please open an issue to discuss new features or bug fixes, or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
