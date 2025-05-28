'use client';
// components/MapComponent.jsx
import { useRef, useState, useEffect } from 'react';

/**
 * Map Component for displaying the interactive geographic triangle
 * @param {Object} props - Component props
 * @param {string} props.apiKey - Google Maps API key
 * @param {Array} props.locations - Array of location objects with lat, lng, name, and description
 */
const MapComponent = ({ apiKey, locations }) => {
  const mapRef = useRef(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [lines, setLines] = useState([]);
  const [triangle, setTriangle] = useState(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);

  // Load the Google Maps API
  useEffect(() => {
    if (!apiKey || isApiLoaded) return;

    const loadGoogleMapsApi = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = () => {
        setIsApiLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsApi();

    return () => {
      // Clean up the global callback
      window.initMap = undefined;
      // Remove the script tag if component unmounts before API loads
      const script = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
      if (script) {
        script.remove();
      }
    };
  }, [apiKey, isApiLoaded]);

  // Initialize the map once the API is loaded
  useEffect(() => {
    if (!isApiLoaded || !mapRef.current || !locations || locations.length === 0) {
      return;
    }

    // Calculate the center of the map based on the locations
    const bounds = new window.google.maps.LatLngBounds();
    locations.forEach(location => {
      bounds.extend(new window.google.maps.LatLng(location.lat, location.lng));
    });

    // Create the map
    const newMap = new window.google.maps.Map(mapRef.current, {
      center: bounds.getCenter(),
      zoom: 6,
      mapTypeId: 'terrain',
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        mapTypeIds: ['roadmap', 'terrain', 'satellite', 'hybrid']
      },
      fullscreenControl: true,
      streetViewControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Fit the map to the bounds
    newMap.fitBounds(bounds);

    // Set the map in state
    setMap(newMap);

    // Create markers for each location
    const newMarkers = locations.map(location => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: newMap,
        title: location.name,
        animation: window.google.maps.Animation.DROP
      });

      // Create info window for the marker
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-lg">${location.name}</h3>
            <p class="text-gray-700">${location.description}</p>
          </div>
        `
      });

      // Add click listener to the marker
      marker.addListener('click', () => {
        if (activeInfoWindow) {
          activeInfoWindow.close();
        }
        infoWindow.open(newMap, marker);
        setActiveInfoWindow(infoWindow);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Create lines between the locations
    const newLines = [];
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const line = new window.google.maps.Polyline({
          path: [
            { lat: locations[i].lat, lng: locations[i].lng },
            { lat: locations[j].lat, lng: locations[j].lng }
          ],
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          map: newMap
        });
        newLines.push(line);
      }
    }

    setLines(newLines);

    // Create a triangle polygon
    const triangleCoords = locations.map(location => ({
      lat: location.lat,
      lng: location.lng
    }));

    const newTriangle = new window.google.maps.Polygon({
      paths: triangleCoords,
      strokeColor: '#0000FF',
      strokeOpacity: 0.5,
      strokeWeight: 2,
      fillColor: '#0000FF',
      fillOpacity: 0.1,
      map: newMap
    });

    setTriangle(newTriangle);

    // Clean up function
    return () => {
      // Remove markers
      newMarkers.forEach(marker => {
        window.google.maps.event.clearInstanceListeners(marker);
        marker.setMap(null);
      });

      // Remove lines
      newLines.forEach(line => {
        line.setMap(null);
      });

      // Remove triangle
      if (newTriangle) {
        newTriangle.setMap(null);
      }
    };
  }, [isApiLoaded, locations]);

  // Render loading state if API is not loaded
  if (!isApiLoaded && apiKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading Google Maps API...</p>
      </div>
    );
  }
  
  // Render error state if no API key
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error: Google Maps API key is missing.</p>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  );
};

export default MapComponent;
