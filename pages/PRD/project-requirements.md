# Project Requirements Document (PRD)

## Project Goal

The primary goal of this project is to create a publicly accessible interactive web map that displays specific geographic locations and the triangle formed by them. The map should be hosted on Netlify and incorporate a rate-limiting mechanism to manage API usage.

## Architecture

The project will utilize a serverless architecture on Netlify, primarily consisting of:

1.  **Next.js Application:** A client-side React application built with Next.js to render the map and handle user interaction.
2.  **Netlify Function:** A serverless function (`/api/getMapConfig`) to handle backend logic, including rate limiting and securely providing the Google Maps API key and location data to the client.
3.  **Firestore:** A NoSQL cloud database used by the Netlify function to store and manage request timestamps for rate limiting based on client IP addresses.

## Features

*   Display an interactive Google Map.
*   Mark three specific geographic locations on the map.
*   Draw a triangle connecting the three marked locations.
*   Implement a rate limit of 5 requests per hour per client IP address for accessing map configuration data.
*   Fetch the Google Maps API key and location data securely via a serverless function.
*   Handle loading states while fetching map data.
*   Display user-friendly error messages, particularly when the rate limit is exceeded.
*   Deploy the application on Netlify.

## Technologies Used

*   **Frontend:** React, Next.js
*   **Mapping:** Google Maps JavaScript API (with Marker Library)
*   **Backend/Serverless:** Netlify Functions, Firebase (for Firestore)
*   **Styling:** Tailwind CSS (planned)
*   **Package Manager:** npm or yarn

## Setup Steps (Summarized)

1.  **Next.js Project:** Set up a new Next.js project.
2.  **Tailwind CSS:** Integrate Tailwind CSS into the Next.js project.
3.  **Firebase Project:** Create a Firebase project, set up Firestore, and configure security rules to allow the Netlify function to read and write rate limit data.
4.  **Netlify Function:** Implement the `/api/getMapConfig` function in `netlify/functions` to handle rate limiting with Firestore and return necessary map data and API key.
5.  **Next.js Pages/Components:** Create Next.js pages and React components to fetch data from the Netlify function and render the Google Map.
6.  **Netlify Configuration:** Create a `netlify.toml` file for build settings and redirects.
7.  **Netlify Environment Variables:** Set `GOOGLE_MAPS_API_KEY`, `FIREBASE_CONFIG_JSON`, and `APP_ID` in the Netlify site settings.

## Future Considerations

*   **More Robust Rate Limiting:** Explore more sophisticated rate limiting strategies beyond IP address (e.g., user authentication).
*   **Location Data Management:** Potentially move location data into Firestore or another database for easier updates.
*   **Map Customization:** Enhance map styling and add more interactive features.
*   **Error Logging and Monitoring:** Implement better logging for the Netlify function and monitor its performance and errors.
*   **User Authentication:** If more personalized features or stricter access control are needed, implement user authentication.