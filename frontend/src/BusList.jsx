// frontend/src/BusDetail.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// small recenter hook
function RecenterMap({ lat, lng, followBus }) {
  const map = useMap();
  useEffect(() => {
    if (!followBus) return;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 12), { animate: true, duration: 0.7 });
  }, [lat, lng, followBus, map]);
  return null;
}

export default function BusDetail() {
  const { id } = useParams();
  const [bus, setBus] = useState(null);
  const [followBus, setFollowBus] = useState(true);
  const mapRef = useRef(null);
  const wsRef = useRef(null);

  // HTTP fetch initial full bus object (stops, etc)
  useEffect(() => {
    fetch(`http://localhost:4000/buses/${id}`)
      .then((r) => r.json())
      .then((data) => setBus(data))
      .catch((e) => console.error(e));
  }, [id]);

  // WebSocket subscription: update currentIndex when bus_update arrives
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      // nothing required, server sends snapshot
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "snapshot") {
          // if bus is included, update
          const found = msg.payload.find((p) => p.id === id);
          if (found && bus) {
            setBus((prev) => ({ ...prev, currentIndex: found.currentIndex }));
          }
        } else if (msg.type === "bus_update") {
          const p = msg.payload;
          if (p.id === id) {
            // update only the moving bits
            setBus((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                currentIndex: p.currentIndex,
                currentStop: p.currentStop,
                nextStop: p.nextStop,
                distanceLeft: p.distanceLeft,
              };
            });
          }
        }
      } catch (e) {
        // ignore bad messages
      }
    };

    ws.onclose = () => console.log("WS closed");
    ws.onerror = (e) => console.error("WS error", e);

    return () => {
      ws.close();
    };
  }, [id, bus]); // careful: bus in deps to apply snapshot update

  if (!bus) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;

  const currentStop = bus.stops[bus.currentIndex];
  const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });

  // fit route helper used by "View Full Route" button
  const fitToRoute = () => {
    const map = mapRef.current;
    if (!map || !bus?.stops?.length) return;
    const latlngs = bus.stops.map((s) => [s.lat, s.lng]);
    const bounds = L.latLngBounds(latlngs);
    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: true });
    }, 120);
  };

  return (
    <div style={{ padding: 28, fontFamily: "Inter, sans-serif", background: "#f7f9fb", minHeight: "100vh" }}>
      <Link to="/" style={{ color: "#007bff", textDecoration: "none", fontWeight: 600 }}>
        ← Back
      </Link>

      <h1 style={{ marginTop: 12, marginBottom: 8 }}>{bus.name}</h1>

      {/* Toggle buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button
          onClick={() => {
            setFollowBus(true);
            if (mapRef.current) {
              mapRef.current.flyTo([currentStop.lat, currentStop.lng], Math.max(mapRef.current.getZoom(), 12), {
                animate: true,
                duration: 0.6,
              });
            }
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: followBus ? "#007bff" : "#edf2ff",
            color: followBus ? "#fff" : "#0b3a66",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Focus on Bus
        </button>

        <button
          onClick={() => {
            setFollowBus(false);
            fitToRoute();
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: !followBus ? "#007bff" : "#f0f0f0",
            color: !followBus ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          View Full Route
        </button>
      </div>

      {/* Map */}
      <div style={{ height: 420, borderRadius: 12, overflow: "hidden", boxShadow: "0 6px 20px rgba(20,20,30,0.06)" }}>
        <MapContainer
          center={[currentStop.lat, currentStop.lng]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
            // initial fit if user toggled view
            // none here — keep centered on currentStop by default
          }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={bus.stops.map((s) => [s.lat, s.lng])} color="#2b7be4" weight={4} opacity={0.9} />
          {bus.stops.map((stop, idx) => (
            <Marker key={idx} position={[stop.lat, stop.lng]}>
              <Popup>
                <strong>{stop.name}</strong>
                <br />
                {stop.time}
              </Popup>
            </Marker>
          ))}

          <Marker position={[currentStop.lat, currentStop.lng]} icon={busIcon}>
            <Popup>
              <span role="img" aria-label="bus">
                🚌
              </span>{" "}
              <strong>{currentStop.name}</strong>
              <br />
              Current Stop
            </Popup>
          </Marker>

          <RecenterMap lat={currentStop.lat} lng={currentStop.lng} followBus={followBus} />
        </MapContainer>
      </div>

      {/* distance + progress + timeline (you already have these in your UI) */}
      <div style={{ marginTop: 18, maxWidth: 640 }}>
        <div style={{ background: "#eaf6ee", padding: 12, borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
          <div style={{ color: "#1b5e20", fontWeight: 700 }}>
            {bus.distanceLeft ?? 0} kms to <span style={{ color: "#145a32" }}>{bus.nextStop?.name}</span>
          </div>
          <div style={{ width: 260 }}>
            {(() => {
              const traveled = bus.currentStop?.distance ?? 0;
              const total = bus.stops[bus.stops.length - 1]?.distance || 1;
              const progress = Math.min(100, Math.round((traveled / total) * 100));
              return (
                <>
                  <div style={{ height: 10, background: "#e6eaf0", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,#43a047,#66bb6a)", transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12, color: "#333", marginTop: 6 }}>{progress}%</div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Timeline card */}
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 6px 18px rgba(20,20,30,0.04)", marginTop: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Route Timeline</h3>
          <div style={{ position: "relative", marginLeft: 24 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#eee", borderRadius: 2 }} />
            {bus.stops.map((stop, idx) => {
              const isPast = idx < bus.currentIndex;
              const isCurrent = idx === bus.currentIndex;
              return (
                <div key={idx} style={{ marginBottom: 28, position: "relative" }}>
                  {idx > 0 && <div style={{ position: "absolute", left: -18, top: -18, width: 6, height: 40, background: isPast ? "#ef5350" : "#eee", borderRadius: 3 }} />}
                  <div style={{ width: isCurrent ? 20 : 14, height: isCurrent ? 20 : 14, background: isCurrent ? "#2e7d32" : isPast ? "#ef5350" : "#2b7be4", borderRadius: "50%", position: "absolute", left: -28, top: 0, border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
                  <div style={{ fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "#145a32" : isPast ? "#b71c1c" : "#333" }}>
                    <strong>{stop.time}</strong> — {stop.name} {isCurrent && "🚌 Current"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
