import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Helper: auto-pan to bus
function RecenterMap({ lat, lng, followBus }) {
  const map = useMap();
  useEffect(() => {
    if (followBus) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, followBus, map]);
  return null;
}

function BusDetail() {
  const { id } = useParams();
  const [bus, setBus] = useState(null);
  const [followBus, setFollowBus] = useState(true); // toggle state
  const mapRef = useRef();

  // markerPosition is what we feed to the Marker component — it's animated locally
  const [markerPosition, setMarkerPosition] = useState(null);
  const animRef = useRef(null);

  useEffect(() => {
    const fetchBus = () => {
      fetch(`http://localhost:4000/buses/${id}`)
        .then(res => res.json())
        .then(data => {
          setBus(data);
        })
        .catch((e) => {
          console.error("fetchBus error", e);
        });
    };
    fetchBus();
    const interval = setInterval(fetchBus, 2000);
    return () => clearInterval(interval);
  }, [id]);

  // When bus updates, animate markerPosition from previous to new coords
  useEffect(() => {
    if (!bus) return;

    const targetLat = typeof bus.lat === "number" ? bus.lat : bus.stops[bus.currentIndex].lat;
    const targetLng = typeof bus.lng === "number" ? bus.lng : bus.stops[bus.currentIndex].lng;

    // initialize markerPosition if unset
    if (!markerPosition) {
      setMarkerPosition([targetLat, targetLng]);
      return;
    }

    // cancel previous animation
    if (animRef.current) {
      cancelAnimationFrame(animRef.current.frame);
      animRef.current = null;
    }

    const [startLat, startLng] = markerPosition;
    const duration = 800; // ms for the animation; tweak for faster/slower
    const startTime = performance.now();

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      // linear easing; replace with easeInOut if you want nicer motion
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // quick easeInOut
      const lat = startLat + (targetLat - startLat) * ease;
      const lng = startLng + (targetLng - startLng) * ease;
      setMarkerPosition([lat, lng]);

      if (t < 1) {
        animRef.current = { frame: requestAnimationFrame(step) };
      } else {
        animRef.current = null;
      }
    }

    animRef.current = { frame: requestAnimationFrame(step) };

    // cleanup on unmount or bus change
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current.frame);
        animRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus]); // only react to bus change

  if (!bus) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;

  // derive data (safe fallbacks)
  const currentStop = bus.stops[bus.currentIndex] || bus.stops[0];
  const markerLat = markerPosition ? markerPosition[0] : (bus.lat ?? currentStop.lat);
  const markerLng = markerPosition ? markerPosition[1] : (bus.lng ?? currentStop.lng);

  // bus marker icon
  const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  // Fit all stops in view
  const fitToRoute = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const bounds = bus.stops.map(s => [s.lat, s.lng]);
    map.fitBounds(bounds, { padding: [50, 50] });
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Inter, sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      <Link to="/" style={{ textDecoration: "none", color: "#007bff", fontWeight: "500" }}>← Back</Link>
      <h1 style={{ margin: "15px 0" }}>{bus.name}</h1>

      {/* Map toggle buttons */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => {
            setFollowBus(true);
          }}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: followBus ? "#007bff" : "#e0e0e0",
            color: followBus ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: "500",
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
            borderRadius: "8px",
            border: "none",
            background: !followBus ? "#007bff" : "#e0e0e0",
            color: !followBus ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          View Full Route
        </button>
      </div>

      {/* MAP */}
      <div style={{ height: "400px", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
        <MapContainer
          center={[markerLat, markerLng]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={bus.stops.map(s => [s.lat, s.lng])} color="blue" />
          {bus.stops.map((stop, idx) => (
            <Marker key={idx} position={[stop.lat, stop.lng]}>
              <Popup>
                {stop.name} <br /> {stop.time}
              </Popup>
            </Marker>
          ))}

          {/* animated marker uses the animated markerPosition */}
          <Marker position={[markerLat, markerLng]} icon={busIcon}>
            <Popup>🚌 {currentStop.name} {bus.progress ? `(${Math.round(bus.progress * 100)}% to next)` : "(Current)"}</Popup>
          </Marker>

          <RecenterMap lat={markerLat} lng={markerLng} followBus={followBus} />
        </MapContainer>
      </div>

      {/* Distance Info */}
      <div
        style={{
          background: "#e8f5e9",
          padding: "12px 18px",
          margin: "15px 0 25px",
          borderRadius: "12px",
          border: "1px solid #c8e6c9",
          color: "#2e7d32",
          fontWeight: "500",
          fontSize: "1rem",
        }}
      >
        <strong>{bus.distanceLeft} kms</strong> to{" "}
        <span style={{ color: "#1b5e20" }}>{bus.nextStop?.name}</span>
      </div>

      {/* Progress Bar */}
      <div style={{ margin: "0 auto 25px", maxWidth: "600px" }}>
        {(() => {
          const traveled = bus.currentStop?.distance ?? currentStop.distance ?? 0;
          const total = bus.stops[bus.stops.length - 1].distance ?? 1;
          const progress = Math.min(100, Math.round((traveled / total) * 100));

          return (
            <div>
              <div
                style={{
                  height: "14px",
                  background: "#e0e0e0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "linear-gradient(135deg, #43a047 25%, #66bb6a 25%, #66bb6a 50%, #43a047 50%, #43a047 75%, #66bb6a 75%, #66bb6a)",
                    backgroundSize: "40px 40px",
                    animation: "progress-stripes 1s linear infinite",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <p style={{ textAlign: "right", marginTop: "6px", fontSize: "0.85rem", color: "#444" }}>
                {progress}% completed
              </p>
            </div>
          );
        })()}
      </div>

      {/* TIMELINE */}
      <div
        style={{
          background: "#fff",
          padding: "20px 25px",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "1.3rem", color: "#333" }}>Route Timeline</h2>
        <div style={{ position: "relative", marginLeft: "25px" }}>
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              bottom: "0",
              width: "4px",
              background: "#e0e0e0",
              borderRadius: "2px",
            }}
          />
          {bus.stops.map((stop, idx) => {
            const isPast = idx < bus.currentIndex;
            const isCurrent = idx === bus.currentIndex;

            return (
              <div key={idx} style={{ marginBottom: "35px", position: "relative" }}>
                {idx > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "-25px",
                      top: "-20px",
                      width: "4px",
                      height: "40px",
                      backgroundColor: isPast ? "#ef5350" : "#e0e0e0",
                      borderRadius: "2px",
                      transition: "background-color 0.3s ease",
                    }}
                  />
                )}

                <div
                  style={{
                    width: isCurrent ? "20px" : "14px",
                    height: isCurrent ? "20px" : "14px",
                    backgroundColor: isCurrent ? "#43a047" : isPast ? "#ef5350" : "#42a5f5",
                    borderRadius: "50%",
                    position: "absolute",
                    left: "-32px",
                    top: "0",
                    border: "3px solid #fff",
                    boxShadow: "0 0 4px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                  }}
                />

                <div
                  style={{
                    fontWeight: isCurrent ? "600" : "400",
                    color: isCurrent ? "#2e7d32" : isPast ? "#b71c1c" : "#333",
                    fontSize: "1rem",
                  }}
                >
                  <strong>{stop.time}</strong> — {stop.name}
                  {isCurrent && <span style={{ marginLeft: "6px", fontSize: "0.9rem" }}>🚌 Current Stop</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BusDetail;
