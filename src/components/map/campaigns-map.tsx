"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  BRAZIL_CENTER,
  BRAZIL_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  brandPinIcon,
  loadLeaflet,
} from "./leaflet-utils";

export type CampaignPin = {
  id: string;
  title: string;
  locality: string;
  latitude: number;
  longitude: number;
};

// Mapa público com vários pins de campanhas. Cada marcador abre um popup
// com link para a campanha.
export function CampaignsMap({ pins }: { pins: CampaignPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

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

      const icon = brandPinIcon(L);
      const latLngs: [number, number][] = [];
      for (const pin of pins) {
        const marker = L.marker([pin.latitude, pin.longitude], { icon }).addTo(
          map
        );
        const safeTitle = pin.title.replace(/</g, "&lt;");
        marker.bindPopup(
          `<div style="min-width:160px"><strong>${safeTitle}</strong><br/><span style="color:#78716c">${pin.locality.replace(/</g, "&lt;")}</span><br/><a href="/campanhas/${pin.id}" style="color:#1f7d65;font-weight:600">Ver campanha →</a></div>`
        );
        latLngs.push([pin.latitude, pin.longitude]);
      }

      if (latLngs.length > 0) {
        map.fitBounds(latLngs, { padding: [40, 40], maxZoom: 13 });
      }

      mapRef.current = map;
    }

    init();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [pins]);

  return (
    <div
      ref={containerRef}
      className="h-80 w-full overflow-hidden rounded-2xl border border-stone-100"
      aria-label="Mapa com as campanhas publicadas"
    />
  );
}
