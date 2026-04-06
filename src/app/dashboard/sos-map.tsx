"use client";

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';

interface SOSMapProps {
  latitude: number | string;
  longitude: number | string;
  label?: string;
}

export default function SOSMap({ latitude, longitude, label }: SOSMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const { lat, lng, isValid } = useMemo(() => {
    const latVal = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lngVal = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
    
    const valid = !isNaN(latVal) && 
                  !isNaN(lngVal) && 
                  isFinite(latVal) && 
                  isFinite(lngVal) &&
                  latVal !== 0 && 
                  lngVal !== 0;

    return { lat: latVal, lng: lngVal, isValid: valid };
  }, [latitude, longitude]);

  useEffect(() => {
    if (!mapRef.current || !isValid) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    try {
      mapInstance.current = L.map(mapRef.current).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      const tacticalIcon = L.divIcon({
        className: 'tactical-marker',
        html: `
          <div class="relative">
            <div class="absolute -inset-4 bg-destructive/20 rounded-full animate-ping"></div>
            <div class="relative h-6 w-6 bg-destructive rounded-full border-2 border-white flex items-center justify-center">
              <div class="h-2 w-2 bg-white rounded-full"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([lat, lng], { icon: tacticalIcon })
        .addTo(mapInstance.current)
        .bindPopup(`<b class="text-destructive uppercase font-bold">${label || 'SOS SIGNAL'}</b><br><span class="text-[10px] uppercase font-bold tracking-widest opacity-60">Critical Alert Detected</span>`)
        .openPopup();
    } catch (error) {
      console.warn("Leaflet Map Error:", error);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lng, label, isValid]);

  if (!isValid) {
    return (
      <div className="h-[420px] w-full rounded-xl bg-muted/20 flex flex-col items-center justify-center border-2 border-dashed border-primary/10">
        <div className="p-8 bg-white/50 rounded-full mb-4">
           <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Awaiting Signal Fix...</p>
        <p className="text-[8px] font-mono mt-2 opacity-40">COORDINATES: UNRELIABLE OR PENDING</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="h-[420px] w-full rounded-xl z-10"
      style={{ isolation: 'isolate' }}
    />
  );
}
