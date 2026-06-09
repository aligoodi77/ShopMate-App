<<<<<<< HEAD
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
=======
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies
>>>>>>> 7dd88b8 (Initial commit)

   ```bash
   npm install
   ```

<<<<<<< HEAD
   Or yarn:

   ```bash
   yarn
   ```

3. **Start the development server**
=======
2. Start the app
>>>>>>> 7dd88b8 (Initial commit)

   ```bash
   npx expo start
   ```

<<<<<<< HEAD
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
=======
In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
>>>>>>> 7dd88b8 (Initial commit)
