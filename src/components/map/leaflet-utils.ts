import type * as Leaflet from "leaflet";

// Centro aproximado do Brasil, para o mapa inicial sem pin.
export const BRAZIL_CENTER: [number, number] = [-14.235, -51.925];
export const BRAZIL_ZOOM = 4;
export const PIN_ZOOM = 14;

export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Leaflet acessa window no carregamento, então o import precisa ser
// dinâmico (os componentes de mapa rodam só no cliente).
export async function loadLeaflet() {
  return (await import("leaflet")).default;
}

// Ícone próprio (divIcon) para não depender dos PNGs padrão do Leaflet,
// cujos caminhos quebram com bundlers.
export function brandPinIcon(L: typeof Leaflet) {
  return L.divIcon({
    className: "",
    html: '<div style="width:22px;height:22px;border-radius:9999px 9999px 9999px 0;transform:rotate(-45deg);background:#1f7d65;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });
}

// Arredonda para 3 casas decimais (~100 m): o pin público é aproximado por
// padrão e não expõe endereço exato.
export function roundCoordinate(value: number) {
  return Math.round(value * 1000) / 1000;
}
