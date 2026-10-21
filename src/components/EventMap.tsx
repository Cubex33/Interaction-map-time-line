
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function EventMap() {
  return (
    <MapContainer
      center={[48, 67]}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
    >
    <TileLayer
      attribution='&copy; OpenStreetMap contributors'
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    </MapContainer>
  );
}
