"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  BRAZIL_CENTER,
  BRAZIL_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  PIN_ZOOM,
  brandPinIcon,
  loadLeaflet,
  roundCoordinate,
} from "./leaflet-utils";

export function MapPicker({
  initialLat,
  initialLng,
}: {
  initialLat?: number | null;
  initialLng?: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const hasInitial =
    typeof initialLat === "number" && typeof initialLng === "number";
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    hasInitial ? { lat: initialLat!, lng: initialLng! } : null
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = await loadLeaflet();
      if (cancelled || !containerRef.current || mapRef.current) return;

      const startCenter = hasInitial
        ? ([initialLat!, initialLng!] as [number, number])
        : BRAZIL_CENTER;
      const startZoom = hasInitial ? PIN_ZOOM : BRAZIL_ZOOM;

      const map = L.map(containerRef.current).setView(startCenter, startZoom);
      L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION }).addTo(map);

      if (hasInitial) {
        markerRef.current = L.marker([initialLat!, initialLng!], {
          icon: brandPinIcon(L),
        }).addTo(map);
      }

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
    // Inicialização única; mudanças de posição vêm dos cliques no mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
