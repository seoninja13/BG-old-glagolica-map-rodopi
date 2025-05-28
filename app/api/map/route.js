// app/api/map/route.js
import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase configuration for server-side usage
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase for server-side
const app = initializeApp(firebaseConfig, 'server');
const db = getFirestore(app);
const auth = getAuth(app);

// Constants
const MAX_REQUESTS_PER_HOUR = 5;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const APP_ID = process.env.APP_ID || 'default-app-id';

// Define the locations (could also be fetched from Firestore if they change)
const locations = [
  { 
    lat: 41.6011, 
    lng: 24.5742, 
    name: "Rhodopes (Голям Перелик)", 
    description: "Where energy is born" 
  },
  { 
    lat: 42.7170, 
    lng: 26.3670, 
    name: "Karandila", 
    description: "Where time is controlled" 
  },
  { 
    lat: 39.0000, 
    lng: 33.0000, 
    name: "Anatolian Plateau", 
    description: "Time itself, Space" 
  }
];

export async function GET(request) {
  // Get client IP for rate limiting
  // In production, you'd use request.headers.get('x-forwarded-for') or similar
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown-ip';
  const ipDocId = clientIp.replace(/\./g, '_'); // Basic sanitization for doc ID
  
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!googleMapsApiKey) {
    return NextResponse.json(
      { error: "Google Maps API Key not configured on server." },
      { status: 500 }
    );
  }
  
  try {
    // Sign in anonymously to interact with Firestore
    // This is per instruction to use client SDK patterns
    await signInAnonymously(auth);
    // const userId = auth.currentUser ? auth.currentUser.uid : 'anonymous_function_user';
    // console.log(`API route signed in with UID: ${userId} for IP: ${clientIp}`);
    const rateLimitDocRef = doc(db, `artifacts/${APP_ID}/public/data/ipRateLimits/${ipDocId}`);
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
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in an hour." },
        { status: 429 }
      );
    }

    // Add current request timestamp
    const newTimestamp = Timestamp.now();
    if (docSnap.exists()) {
      // Atomically add the new timestamp to the array
      await updateDoc(rateLimitDocRef, {
        timestamps: arrayUnion(newTimestamp)
      });
    } else {
      await setDoc(rateLimitDocRef, {
        timestamps: [newTimestamp]
      });
    }
    
    console.log(`Request allowed for IP: ${clientIp}. Count: ${requestTimestamps.length + 1}`);
    
    return NextResponse.json({
      apiKey: googleMapsApiKey,
      locations: locations,
    });
  } catch (error) {
    console.error(`Error in API route for IP ${clientIp}:`, error);
    return NextResponse.json(
      { error: "Internal server error processing your request." },
      { status: 500 }
    );
  }
}
