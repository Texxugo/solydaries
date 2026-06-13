"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  BRAZIL_CENTER,
  BRAZIL_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  brandPinIcon,
  loadLeaflet,
  roundCoordinate,
} from "./leaflet-utils";

export function MapPicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = await loadLeaflet();
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current).setView(
        BRAZIL_CENTER,
        BRAZIL_ZOOM
      );
      L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION }).addTo(map);

      map.on("click", (event) => {
        const lat = roundCoordinate(event.latlng.lat);
        const lng = roundCoordinate(event.latlng.lng);
        setPosition({ lat, lng });
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], {
            icon: brandPinIcon(L),
          }).addTo(map);
        }
      });

      mapRef.current = map;
    }

    init();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  return (
    <div>
      <div
        ref={containerRef}
        className="h-72 w-full overflow-hidden rounded-xl border-2 border-stone-200"
        aria-label="Mapa para escolher o pin público da campanha"
      />
      <p className="mt-1.5 text-xs text-stone-400">
        {position
          ? `Pin escolhido: ${position.lat.toFixed(3)}, ${position.lng.toFixed(3)} (aproximado)`
          : "Clique no mapa para posicionar o pin público."}{" "}
        Escolha um ponto aproximado (praça, bairro) — não use o endereço exato.
      </p>
      <input type="hidden" name="latitude" value={position?.lat ?? ""} />
      <input type="hidden" name="longitude" value={position?.lng ?? ""} />
    </div>
  );
}
