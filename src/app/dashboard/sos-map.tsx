
"use client";

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SOSMapProps {
  latitude: number | string;
  longitude: number | string;
  label?: string;
}

export default function SOSMap({ latitude, longitude, label }: SOSMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mounted = useRef(true);

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

  const resetView = () => {
    if (mapInstance.current && isValid) {
      mapInstance.current.setView([lat, lng], 15, { animate: true });
    }
  };

  // Initialize Map Instance
  useEffect(() => {
    mounted.current = true;
    if (!mapRef.current || !isValid || mapInstance.current) return;

    try {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: false
      }).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstance.current = map;

      // Handle dialog animations/layout shifts
      const timer1 = setTimeout(() => {
        if (mounted.current && mapInstance.current) mapInstance.current.invalidateSize();
      }, 100);
      const timer2 = setTimeout(() => {
        if (mounted.current && mapInstance.current) mapInstance.current.invalidateSize();
      }, 500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } catch (error) {
      console.warn("Tactical Map Initialization Error:", error);
    }

    return () => {
      mounted.current = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, []); // Only init once per mount

  // Update Marker and View on Prop Change
  useEffect(() => {
    if (!mapInstance.current || !isValid) return;

    const tacticalIcon = L.divIcon({
      className: 'tactical-marker',
      html: `
        <div class="relative">
          <div class="absolute -inset-6 bg-destructive/20 rounded-full animate-ping"></div>
          <div class="absolute -inset-3 bg-destructive/10 rounded-full animate-pulse"></div>
          <div class="relative h-8 w-8 bg-destructive rounded-full border-2 border-white flex items-center justify-center shadow-lg">
            <div class="h-2.5 w-2.5 bg-white rounded-full"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const popupContent = `
      <div class="p-1 min-w-[120px]">
        <b class="text-destructive uppercase font-bold text-[10px] block mb-1">${label || 'SOS SIGNAL'}</b>
        <span class="text-[8px] uppercase font-bold tracking-widest opacity-60">Critical Alert Detected</span>
        <div class="mt-2 text-[8px] font-mono opacity-80">
          LAT: ${lat.toFixed(4)}<br/>
          LNG: ${lng.toFixed(4)}
        </div>
      </div>
    `;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]).setPopupContent(popupContent);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: tacticalIcon })
        .addTo(mapInstance.current)
        .bindPopup(popupContent, {
          closeButton: false,
          offset: [0, -10],
          className: 'tactical-popup'
        });
      
      markerRef.current.openPopup();
    }

    // Move view to follow signal
    mapInstance.current.panTo([lat, lng], { animate: true });

  }, [lat, lng, label, isValid]);

  if (!isValid) {
    return (
      <div className="h-[200px] sm:h-[250px] md:h-[350px] w-full rounded-xl bg-muted/10 flex flex-col items-center justify-center border-2 border-dashed border-primary/10">
        <div className="p-8 bg-white/50 rounded-full mb-4">
           <div className="h-10 w-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Awaiting Signal Fix...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[200px] sm:h-[250px] md:h-[350px] w-full rounded-xl overflow-hidden group border border-primary/5">
      <div 
        ref={mapRef} 
        className="h-full w-full z-10"
        style={{ isolation: 'isolate' }}
      />
      <div className="absolute top-4 right-4 z-[20] flex flex-col gap-2">
        <Button 
          size="icon" 
          variant="secondary" 
          className="h-10 w-10 rounded-xl shadow-xl border border-white/20 opacity-90 hover:opacity-100 transition-opacity duration-300 bg-white hover:bg-white"
          onClick={resetView}
          title="Recenter Signal"
        >
          <Target className="h-5 w-5 text-primary" />
        </Button>
      </div>
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 1rem;
          padding: 0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
        }
        .leaflet-popup-content {
          margin: 12px;
        }
        .leaflet-popup-tip {
          display: none;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
          margin-bottom: 24px !important;
          margin-right: 16px !important;
        }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
          background-color: white !important;
          border-radius: 0.5rem !important;
          margin-bottom: 2px;
          border: none !important;
          color: #3b82f6 !important;
          font-weight: bold !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
        }
      `}</style>
    </div>
  );
}
