// This is a conceptual structure. You'll create these files in your Next.js project.

// ---------------------------------------------------------------------------
// 1. Netlify Function: netlify/functions/getMapConfig.js
// ---------------------------------------------------------------------------
// This function handles rate limiting and provides map configuration.
// Make sure to install firebase: npm install firebase

/*
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, Timestamp, arrayUnion, updateDoc } from 'firebase/firestore';

// These should be set as environment variables in your Netlify project settings
const firebaseConfigJson = process.env.FIREBASE_CONFIG_JSON;
const appId = process.env.APP_ID || 'default-app-id'; // Your __app_id
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

let db, auth;

if (firebaseConfigJson) {
    try {
        const firebaseConfig = JSON.parse(firebaseConfigJson);
        const firebaseApp = initializeApp(firebaseConfig);
        db = getFirestore(firebaseApp);
        auth = getAuth(firebaseApp);
    } catch (error) {
        console.error("Failed to initialize Firebase:", error);
    }
} else {
    console.error("FIREBASE_CONFIG_JSON environment variable not set.");
}

const MAX_REQUESTS_PER_HOUR = 5;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

// Define the locations (could also be fetched from Firestore if they change)
const location1 = { lat: 41.6011, lng: 24.5742, name: "Rhodopes (Голям Перелик)", description: "Where energy is born" };
const location2 = { lat: 42.7170, lng: 26.3670, name: "Karandila", description: "Where time is controlled" };
const location3 = { lat: 39.0000, lng: 33.0000, name: "Anatolian Plateau", description: "Time itself, Space" };
const locations = [location1, location2, location3];


export const handler = async (event, context) => {
    if (!db || !auth) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Firebase not initialized on server." }),
        };
    }
    if (!googleMapsApiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Google Maps API Key not configured on server." }),
        };
    }

    // Use client's IP address for rate limiting.
    // Note: 'x-nf-client-connection-ip' is Netlify's way of providing the original client IP.
    const clientIp = event.headers['x-nf-client-connection-ip'] || 'unknown-ip';
    // It's good practice to hash or anonymize IPs if stored long-term,
    // but for simplicity, we'll use it directly here.
    // Firestore document IDs cannot contain '/', so replace if necessary, or use a hash.
    const ipDocId = clientIp.replace(/\./g, '_'); // Basic sanitization for doc ID

    const rateLimitDocRef = doc(db, `artifacts/${appId}/public/data/ipRateLimits/${ipDocId}`);

    try {
        // Sign in the function anonymously to interact with Firestore
        // This is per instruction to use client SDK patterns.
        // Ideally, a backend uses Admin SDK with service accounts.
        await signInAnonymously(auth);
        // const userId = auth.currentUser ? auth.currentUser.uid : 'anonymous_function_user';
        // console.log(`Netlify function signed in with UID: ${userId} for IP: ${clientIp}`);


        const docSnap = await getDoc(rateLimitDocRef);
        const now = Date.now();
        let requestTimestamps = [];

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.timestamps && Array.isArray(data.timestamps)) {
                // Filter out timestamps older than one hour
                requestTimestamps = data.timestamps.filter(ts => (now - ts.toMillis()) < ONE_HOUR_IN_MS);
            }
        }

        if (requestTimestamps.length >= MAX_REQUESTS_PER_HOUR) {
            console.warn(`Rate limit exceeded for IP: ${clientIp}`);
            return {
                statusCode: 429, // Too Many Requests
                body: JSON.stringify({ error: "Rate limit exceeded. Please try again in an hour." }),
            };
        }

        // Add current request timestamp
        const newTimestamp = Timestamp.now();
        if (docSnap.exists()) {
            // Atomically add the new timestamp to the array
            await updateDoc(rateLimitDocRef, {
                timestamps: arrayUnion(newTimestamp)
            });
            // Prune old timestamps (optional, could also be done by filtering on read)
            // For simplicity, we'll rely on read-filtering for now.
            // To prune: updateDoc(rateLimitDocRef, { timestamps: requestTimestamps.concat(newTimestamp) });
        } else {
            await setDoc(rateLimitDocRef, {
                timestamps: [newTimestamp]
            });
        }
        
        console.log(`Request allowed for IP: ${clientIp}. Count: ${requestTimestamps.length + 1}`);
        return {
            statusCode: 200,
            body: JSON.stringify({
                apiKey: googleMapsApiKey,
                locations: locations,
            }),
        };

    } catch (error) {
        console.error(`Error in Netlify function for IP ${clientIp}:`, error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error processing your request." }),
        };
    }
};
*/

// ---------------------------------------------------------------------------
// 2. Next.js Page: pages/index.js
// ---------------------------------------------------------------------------
// This page fetches config from the Netlify function and renders the map.
/*
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import MapComponent from '../components/MapComponent'; // We'll create this component

export default function HomePage() {
    const [mapConfig, setMapConfig] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMapConfig = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/getMapConfig');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Error: ${response.status}`);
                }
                setMapConfig(data);
            } catch (err) {
                console.error("Failed to fetch map config:", err);
                setError(err.message || "Could not load map configuration.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMapConfig();
    }, []);

    return (
        <>
            <Head>
                <title>Interactive Triangle Map</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 md:p-8 font-inter">
                <main className="w-full max-w-4xl">
                    <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
                        Interactive Geographic Triangle
                    </h1>
                    
                    {isLoading && (
                        <div className="flex justify-center items-center h-96 bg-white rounded-lg shadow-xl">
                            <p className="text-gray-500">Loading Map...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col justify-center items-center h-96 bg-white rounded-lg shadow-xl p-6 text-center">
                            <p className="text-red-500 font-semibold text-lg">Could not load map:</p>
                            <p className="text-gray-700 mt-2">{error}</p>
                            {error.includes("Rate limit exceeded") && (
                                <p className="text-sm text-gray-500 mt-4">
                                    You've reached the maximum number of views for this hour. Please try again later.
                                </p>
                            )}
                        </div>
                    )}

                    {!isLoading && !error && mapConfig && (
                        <div className="w-full h-[60vh] md:h-[70vh] bg-white p-2 rounded-lg shadow-xl">
                            <MapComponent apiKey={mapConfig.apiKey} locations={mapConfig.locations} />
                        </div>
                    )}
                    
                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>This map displays three specified geographic locations and the triangle connecting them.</p>
                        {mapConfig && mapConfig.locations && (
                            <p>Locations: {mapConfig.locations.map(l => l.name).join(', ')}.</p>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
*/

// ---------------------------------------------------------------------------
// 3. Next.js Map Component: components/MapComponent.js
// ---------------------------------------------------------------------------
// This component handles the Google Maps rendering.
/*
import React, { useEffect, useRef, useState } from 'react';

const MapComponent = ({ apiKey, locations }) => {
    const mapRef = useRef(null);
    const [isApiLoaded, setIsApiLoaded] = useState(false);

    useEffect(() => {
        // Function to load the Google Maps script
        const loadGoogleMapsScript = () => {
            if (window.google && window.google.maps) {
                setIsApiLoaded(true);
                return;
            }
            
            if (document.getElementById('google-maps-script')) {
                 // Script is already requested or loaded by another instance
                const checkInterval = setInterval(() => {
                    if (window.google && window.google.maps) {
                        setIsApiLoaded(true);
                        clearInterval(checkInterval);
                    }
                }, 100);
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&callback=initMapComponent`; // Added marker library
            script.async = true;
            script.defer = true;
            window.initMapComponent = () => { // Callback function for when API is loaded
                setIsApiLoaded(true);
            };
            document.head.appendChild(script);
            
            script.onerror = () => {
                console.error("Google Maps script failed to load.");
                // Handle script load error (e.g., show a message)
            };
        };

        loadGoogleMapsScript();

        // Cleanup function to remove the callback from window object
        return () => {
            if (window.initMapComponent) {
                delete window.initMapComponent;
            }
            // Potentially remove the script tag if this component unmounts and no other map needs it
            // const scriptTag = document.getElementById('google-maps-script');
            // if (scriptTag) scriptTag.remove();
        };
    }, [apiKey]);


    useEffect(() => {
        if (!isApiLoaded || !mapRef.current || !locations || locations.length === 0) {
            return;
        }

        const initMap = async () => {
            try {
                const { Map } = await google.maps.importLibrary("maps");
                const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
                const { LatLngBounds, Polygon, InfoWindow } = google.maps;


                const bounds = new LatLngBounds();
                locations.forEach(loc => bounds.extend(new google.maps.LatLng(loc.lat, loc.lng)));

                const mapInstance = new Map(mapRef.current, {
                    center: bounds.getCenter(),
                    zoom: 6,
                    mapId: "NEXTJS_TRIANGLE_MAP", // You can create a Map ID in Google Cloud Console
                });

                locations.forEach(location => {
                    const marker = new AdvancedMarkerElement({
                        map: mapInstance,
                        position: { lat: location.lat, lng: location.lng },
                        title: location.name,
                    });

                    const infoWindow = new InfoWindow({
                         content: `<div style="padding: 5px; font-family: Inter, sans-serif;"><strong>${location.name}</strong><br>${location.description}</div>`
                    });
                    
                    // AdvancedMarkerElement does not have a 'addListener' method directly for 'click'.
                    // Instead, you attach event listeners to its content or handle clicks via the map.
                    // For simplicity with AdvancedMarkerElement, InfoWindows are often opened on map interaction
                    // or by managing a single InfoWindow instance.
                    // A common pattern is to open InfoWindow when marker is clicked:
                    marker.gmpDraggable = false; // Example property, API might differ
                    if (marker.content) { // AdvancedMarkerElement can have custom content
                         marker.content.addEventListener('click', () => {
                            infoWindow.open(mapInstance, marker);
                         });
                    } else { // Fallback for simple markers or if direct listener is supported in future
                        // This is a conceptual click handling for AdvancedMarkerElement.
                        // The actual implementation might vary based on how you customize the marker.
                        // If it's a standard AdvancedMarkerElement without custom DOM,
                        // you might need to handle clicks on the map and check proximity to markers,
                        // or use a single InfoWindow that updates its content and position.
                        // For now, let's assume a click on the marker element itself can be captured if it's DOM.
                        // A more robust way for AdvancedMarkerElement is to manage info windows centrally.
                        // Let's try a simpler approach if the marker itself is clickable:
                        google.maps.event.addListener(marker, 'click', () => { // This might not work with AdvancedMarkerElement
                            infoWindow.open(mapInstance, marker);
                        });
                        // If the above doesn't work, you might need to create a DOM element for the marker
                        // and attach the listener to that, or use a different click handling strategy.
                        // For now, we'll keep it, but be aware of AdvancedMarkerElement specifics.
                        // A simple way:
                        marker.addEventListener('gmp-click', () => { // gmp-click is the event for AdvancedMarkerElement
                             infoWindow.open({ anchor: marker, map: mapInstance });
                        });
                    }
                });

                const triangleCoords = locations.map(loc => ({ lat: loc.lat, lng: loc.lng }));
                new Polygon({
                    paths: triangleCoords,
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#FF0000",
                    fillOpacity: 0.25,
                    map: mapInstance,
                });

            } catch (e) {
                console.error("Error initializing Google Map:", e);
                if (mapRef.current) {
                    mapRef.current.innerHTML = '<p class="text-red-500 p-4">Error initializing map. Check console.</p>';
                }
            }
        };

        initMap();

    }, [isApiLoaded, locations]); // apiKey is not needed here as script loading handles it

    if (!isApiLoaded && apiKey) { // Show loading until API is ready
        return <div className="flex items-center justify-center h-full"><p>Loading Google Maps API...</p></div>;
    }
    
    if (!apiKey) { // Should not happen if /api/getMapConfig worked
        return <div className="flex items-center justify-center h-full"><p>API Key not available.</p></div>;
    }

    return <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}></div>;
};

export default MapComponent;
*/

// ---------------------------------------------------------------------------
// 4. Tailwind CSS Setup (ensure it's in your Next.js project)
// ---------------------------------------------------------------------------
// Follow Next.js official guide to add Tailwind CSS:
// https://tailwindcss.com/docs/guides/nextjs
// Typically involves:
// npm install -D tailwindcss postcss autoprefixer
// npx tailwindcss init -p
// Configure tailwind.config.js (content paths)
// Add Tailwind directives to globals.css

// ---------------------------------------------------------------------------
// 5. Firebase Project and Firestore Setup:
// ---------------------------------------------------------------------------
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Add a Web App to your Firebase project to get the `firebaseConfig` object.
// 3. Enable Firestore in your Firebase project.
// 4. Firestore Security Rules (Example - adjust as needed for more specific security):
//    For path `artifacts/{appId}/public/data/ipRateLimits/{ipAddress}`
//    Allow reads and writes if the request is "authenticated" (even anonymously by the function).
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow function to read/write rate limit data.
    // {appId} and {ipAddress} are wildcards.
    match /artifacts/{appId}/public/data/ipRateLimits/{ipDocId} {
      allow read, write: if request.auth != null; // Function signs in anonymously
    }
    // Add other rules for your app if needed
  }
}
*/

// ---------------------------------------------------------------------------
// 6. Netlify Setup:
// ---------------------------------------------------------------------------
// 1. Create a `netlify.toml` file in your project root:
/*
[build]
  command = "npm run build" # Or your Next.js build command
  publish = ".next"         # Default Next.js output directory
  functions = "netlify/functions"

[[plugins]]
  package = "@netlify/plugin-nextjs" # Essential for Next.js sites on Netlify

# If you need to redirect /api/* to your functions:
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
*/

// 2. Set Environment Variables in Netlify UI (Site settings > Build & deploy > Environment):
//    - `GOOGLE_MAPS_API_KEY`: Your Google Maps API Key.
//    - `FIREBASE_CONFIG_JSON`: The Firebase config object for your web app, as a JSON string.
//      Example: '{"apiKey":"AIza...","authDomain":"...", ...}'
//    - `APP_ID`: Your application ID (e.g., the `__app_id` you were using, or a new one like "interactive_triangle_map_nextjs").

// ---------------------------------------------------------------------------
// NOTES:
// ---------------------------------------------------------------------------
// - The code above is split into conceptual files. You'll need to create these
//   files in your Next.js project structure.
// - The Netlify function `getMapConfig.js` should be placed in `netlify/functions/getMapConfig.js`.
// - The Next.js pages and components go into `pages/` and `components/` respectively.
// - Error handling and loading states are included for a better user experience.
// - Remember to install `firebase` for the Netlify function.
// - The `AdvancedMarkerElement` click handling in `MapComponent.js` uses `gmp-click`. Ensure your
//   Google Maps API version and usage support this. InfoWindow styling is basic; customize as needed.
// - This is a significant refactor. Test each part (Netlify function locally, Next.js pages).
// - The `signInAnonymously` in the Netlify function is a workaround to fit the client SDK pattern
//   mandated by instructions. In a typical backend, you'd use Firebase Admin SDK with a service account.
// - The `appId` and `firebaseConfig` are now passed via environment variables to the Netlify function.
// - Ensure your Google Maps API key has the "Maps JavaScript API" and "Marker Library" enabled.
// - The solution uses client IP for rate limiting. This is generally okay for public, non-critical
//   rate limiting but can be spoofed or problematic for users behind NATs/VPNs. For more robust
//   rate limiting, user authentication would be needed.
