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

      {/* TIMELINE (improved UI) */}
      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: 16,
          boxShadow: "0 6px 20px rgba(12,16,22,0.06)",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <h2 style={{ marginBottom: 18, fontSize: "1.25rem", color: "#222", fontWeight: 700 }}>Route Timeline</h2>

        <div style={{ position: "relative", paddingLeft: 48, paddingRight: 12 }}>
          {/* vertical line */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              bottom: 12,
              width: 6,
              borderRadius: 6,
              background: "linear-gradient(180deg, #dfeff1 0%, #e9f7ee 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          />

          {bus.stops.map((stop, idx) => {
            const isPast = idx < bus.currentIndex;
            const isCurrent = idx === bus.currentIndex;

            // circle styles
            const circleSize = isCurrent ? 18 : 12;
            const circleColor = isPast ? "#43a047" : isCurrent ? "#ffffff" : "#42a5f5";
            const circleBorder = isPast ? "3px solid #43a047" : isCurrent ? "3px solid #2e7d32" : "3px solid #e6eef0";
            const labelColor = isCurrent ? "#1b5e20" : isPast ? "#666" : "#333";
            const timeColor = isCurrent ? "#145a32" : "#777";
            const cardBg = isCurrent ? "#f0fbf4" : "transparent";
            const connectorTop = idx === 0 ? 18 : -6; // small overlap to look continuous

            return (
              <div key={idx} style={{ position: "relative", padding: "8px 0 20px" }}>
                {/* connector segment (colored for past) */}
                {idx > 0 && (
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 12 + (6 - 2) / 2, // center under the line
                      top: connectorTop,
                      width: 2,
                      height: 40,
                      background: isPast ? "#43a047" : "#e6eef0",
                      borderRadius: 2,
                      transition: "background 300ms",
                    }}
                  />
                )}

                {/* circle on the line */}
                <div
                  style={{
                    position: "absolute",
                    left: 6,
                    top: 12,
                    transform: "translateY(-2px)",
                    width: circleSize,
                    height: circleSize,
                    borderRadius: "50%",
                    background: circleColor,
                    border: circleBorder,
                    boxShadow: isCurrent ? "0 6px 14px rgba(46,125,50,0.12)" : "0 2px 6px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isPast ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : isCurrent ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="4" fill="#2e7d32" />
                    </svg>
                  ) : null}
                </div>

                {/* stop label */}
                <div
                  style={{
                    marginLeft: 40,
                    padding: 12,
                    borderRadius: 10,
                    background: cardBg,
                    border: isCurrent ? "1px solid rgba(46,125,50,0.12)" : "1px solid transparent",
                    transition: "background 220ms, box-shadow 220ms",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: isCurrent ? 700 : 600, color: labelColor }}>
                      {stop.name}
                      {isCurrent && <span style={{ marginLeft: 8, fontSize: 13, color: "#1b5e20" }}>🚌 Current</span>}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: timeColor }}>{stop.time}</div>
                  </div>

                  {/* right-side status badge */}
                  <div style={{ textAlign: "right" }}>
                    {isPast ? (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: "#e8f5e9", color: "#1b5e20", fontWeight: 600, fontSize: 13 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#1b5e20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Completed
                      </div>
                    ) : isCurrent ? (
                      <div style={{ padding: "6px 10px", borderRadius: 8, background: "#fff8e6", color: "#a55b00", fontWeight: 700, fontSize: 13, border: "1px solid rgba(255,193,7,0.12)" }}>
                        Arriving
                      </div>
                    ) : (
                      <div style={{ padding: "6px 10px", borderRadius: 8, background: "#eef6ff", color: "#0b63d6", fontWeight: 600, fontSize: 13 }}>
                        Upcoming
                      </div>
                    )}
                  </div>
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
