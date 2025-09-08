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
  const [followBus, setFollowBus] = useState(true);
  const mapRef = useRef();

  // Marker animation
  const [markerPosition, setMarkerPosition] = useState(null);
  const animRef = useRef(null);

  // Timeline measurement & state
  const timelineContainerRef = useRef(null);
  const labelRefs = useRef([]);
  const measuredPositionsRef = useRef([]);
  const [progressTopPx, setProgressTopPx] = useState(0);
  const [progressHeightPx, setProgressHeightPx] = useState(0);
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);

  useEffect(() => {
    const fetchBus = () => {
      fetch(`http://localhost:4000/buses/${id}`)
        .then(res => res.json())
        .then(data => setBus(data))
        .catch((e) => console.error("fetchBus error", e));
    };
    fetchBus();
    const interval = setInterval(fetchBus, 2000);
    return () => clearInterval(interval);
  }, [id]);

  // Animate marker between server positions
  useEffect(() => {
    if (!bus) return;
    const targetLat = typeof bus.lat === "number" ? bus.lat : bus.stops[bus.currentIndex].lat;
    const targetLng = typeof bus.lng === "number" ? bus.lng : bus.stops[bus.currentIndex].lng;

    if (!markerPosition) {
      setMarkerPosition([targetLat, targetLng]);
      return;
    }

    if (animRef.current) {
      cancelAnimationFrame(animRef.current.frame);
      animRef.current = null;
    }

    const [startLat, startLng] = markerPosition;
    const duration = 800;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const lat = startLat + (targetLat - startLat) * ease;
      const lng = startLng + (targetLng - startLng) * ease;
      setMarkerPosition([lat, lng]);

      if (t < 1) animRef.current = { frame: requestAnimationFrame(step) };
      else animRef.current = null;
    }

    animRef.current = { frame: requestAnimationFrame(step) };
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current.frame);
        animRef.current = null;
      }
    };
  }, [bus, markerPosition]);

  // Measure label positions and compute filled track top/height
  useEffect(() => {
    function measure() {
      const container = timelineContainerRef.current;
      if (!container || !bus) return;
      const rect = container.getBoundingClientRect();

      const centers = bus.stops.map((_, i) => {
        const el = labelRefs.current[i];
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return r.top - rect.top + r.height / 2;
      });

      if (!centers.every((c) => typeof c === "number")) {
        const spacing = 80;
        measuredPositionsRef.current = bus.stops.map((_, i) => 20 + i * spacing);
      } else {
        measuredPositionsRef.current = centers;
      }

      const tops = measuredPositionsRef.current;
      if (!tops.length) return;
      const start = tops[0];
      const end = tops[tops.length - 1];
      const stopsCount = Math.max(1, bus.stops.length - 1);
      const frac = Math.max(0, Math.min(stopsCount, (bus.currentIndex || 0) + (bus.progress || 0)));
      const proportion = frac / (stopsCount || 1);
      const target = start + (end - start) * proportion;

      setProgressTopPx(start);
      setProgressHeightPx(Math.max(4, target - start));
    }

    measure();
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 300);
    const t3 = setTimeout(() => setIsTimelineVisible(true), 400);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", measure);
    };
  }, [bus?.stops?.length, bus?.currentIndex, bus?.progress, bus]);

  if (!bus) return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '24px 32px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '3px solid #e3e3e3',
          borderTop: '3px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: '#666', fontWeight: '500' }}>Loading bus details...</span>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  const currentStop = bus.stops[bus.currentIndex] || bus.stops[0];
  const markerLat = markerPosition ? markerPosition[0] : (bus.lat ?? currentStop.lat);
  const markerLng = markerPosition ? markerPosition[1] : (bus.lng ?? currentStop.lng);

  const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const fitToRoute = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const bounds = bus.stops.map(s => [s.lat, s.lng]);
    map.fitBounds(bounds, { padding: [50, 50] });
  };

  const status = (bus.status || "").toString().toUpperCase() || (bus.isCompleted ? "COMPLETED" : "ENROUTE");
  const isCompleted = !!bus.isCompleted || status === "COMPLETED";
  const isDeparting = status === "DEPARTING";
  const isEnroute = status === "ENROUTE";

  function renderStatusBadge(idx) {
    const isPast = idx < bus.currentIndex;
    const isCurrent = idx === bus.currentIndex;

    if (isCurrent && isCompleted) {
      return (
        <div style={{ 
          padding: "8px 16px", 
          borderRadius: 20, 
          background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)", 
          color: "#1b5e20", 
          fontWeight: 600, 
          fontSize: 12,
          border: "1px solid rgba(27, 94, 32, 0.2)",
          boxShadow: "0 2px 8px rgba(67, 160, 71, 0.15)"
        }}>
          🎯 Completed
        </div>
      );
    }
    if (isCurrent && isDeparting) {
      return (
        <div style={{ 
          padding: "8px 16px", 
          borderRadius: 20, 
          background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)", 
          color: "#bf360c", 
          fontWeight: 600, 
          fontSize: 12,
          border: "1px solid rgba(191, 54, 12, 0.2)",
          boxShadow: "0 2px 8px rgba(255, 152, 0, 0.15)"
        }}>
          🚀 Departing
        </div>
      );
    }
    if (isCurrent) {
      const pct = Math.round((bus.progress ?? 0) * 100);
      return (
        <div style={{ 
          padding: "8px 16px", 
          borderRadius: 20, 
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)", 
          color: "#0d47a1", 
          fontWeight: 600, 
          fontSize: 12,
          border: "1px solid rgba(13, 71, 161, 0.2)",
          boxShadow: "0 2px 8px rgba(33, 150, 243, 0.15)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
            animation: "shimmer 2s infinite"
          }} />
          <span style={{ position: "relative", zIndex: 1 }}>
            🚌 {isEnroute ? (pct > 0 ? `En Route (${pct}%)` : "Arriving") : "Current Stop"}
          </span>
        </div>
      );
    }
    if (isPast) {
      return (
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: 6, 
          padding: "8px 14px", 
          borderRadius: 20, 
          background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)", 
          color: "#1b5e20", 
          fontWeight: 600, 
          fontSize: 12,
          border: "1px solid rgba(27, 94, 32, 0.2)",
          boxShadow: "0 2px 8px rgba(67, 160, 71, 0.15)"
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="#1b5e20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Completed
        </div>
      );
    }
    return (
      <div style={{ 
        padding: "8px 16px", 
        borderRadius: 20, 
        background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)", 
        color: "#4a148c", 
        fontWeight: 600, 
        fontSize: 12,
        border: "1px solid rgba(74, 20, 140, 0.2)",
        boxShadow: "0 2px 8px rgba(156, 39, 176, 0.15)"
      }}>
        ⏳ Upcoming
      </div>
    );
  }

  const centers = measuredPositionsRef.current;
  const stopsCount = bus.stops.length;

  return (
    <div style={{ 
      padding: "30px", 
      fontFamily: "Inter, system-ui, -apple-system, sans-serif", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "100vh" 
    }}>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(67, 160, 71, 0.3); }
          50% { box-shadow: 0 0 30px rgba(67, 160, 71, 0.6); }
        }
      `}</style>

      <Link to="/" style={{ 
        textDecoration: "none", 
        color: "#007bff", 
        fontWeight: "600",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderRadius: "8px",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 123, 255, 0.2)",
        transition: "all 0.3s ease"
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Dashboard
      </Link>
      
      <h1 style={{ 
        margin: "24px 0", 
        background: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontSize: "2.5rem",
        fontWeight: "800"
      }}>{bus.name}</h1>

      <div style={{ 
        maxWidth: 900, 
        margin: "24px auto", 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: 16 
      }}>
        <div style={{ 
          padding: "20px", 
          borderRadius: 16, 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff", 
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
          animation: "fadeInUp 0.6s ease-out"
        }}>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Journey Type</div>
          <div style={{ fontWeight: 700, fontSize: "18px" }}>🚌 Outbound Journey</div>
        </div>
        
        <div style={{ 
          padding: "20px", 
          borderRadius: 16, 
          background: isCompleted 
            ? "linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)"
            : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "#fff", 
          textAlign: "center",
          boxShadow: isCompleted 
            ? "0 10px 30px rgba(86, 171, 47, 0.3)"
            : "0 10px 30px rgba(240, 147, 251, 0.3)",
          animation: "fadeInUp 0.7s ease-out"
        }}>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Currently At</div>
          <div style={{ fontWeight: 700, fontSize: "18px" }}>
            {bus.currentStop?.name} 
            {isCompleted ? " — ✅ Completed" : isDeparting ? " — 🚀 Departing" : ""}
          </div>
        </div>
        
        <div style={{ 
          padding: "20px", 
          borderRadius: 16, 
          background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
          color: "#fff", 
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(255, 154, 158, 0.3)",
          animation: "fadeInUp 0.8s ease-out"
        }}>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Final Destination</div>
          <div style={{ fontWeight: 700, fontSize: "18px" }}>🏁 {bus.stops[bus.stops.length - 1]?.name}</div>
        </div>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "12px", justifyContent: "center" }}>
        <button 
          onClick={() => { setFollowBus(true); }} 
          style={{ 
            padding: "12px 24px", 
            borderRadius: "12px", 
            border: followBus ? "none" : "1px solid rgba(255, 255, 255, 0.2)", 
            background: followBus 
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : "rgba(255, 255, 255, 0.8)", 
            color: followBus ? "#fff" : "#333", 
            cursor: "pointer", 
            fontWeight: "600",
            boxShadow: followBus 
              ? "0 8px 25px rgba(102, 126, 234, 0.4)"
              : "0 4px 15px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)"
          }}
        >
          🎯 Focus on Bus
        </button>
        <button 
          onClick={() => { setFollowBus(false); fitToRoute(); }} 
          style={{ 
            padding: "12px 24px", 
            borderRadius: "12px", 
            border: !followBus ? "none" : "1px solid rgba(255, 255, 255, 0.2)", 
            background: !followBus 
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : "rgba(255, 255, 255, 0.8)", 
            color: !followBus ? "#fff" : "#333", 
            cursor: "pointer", 
            fontWeight: "600",
            boxShadow: !followBus 
              ? "0 8px 25px rgba(102, 126, 234, 0.4)"
              : "0 4px 15px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)"
          }}
        >
          🗺 View Full Route
        </button>
      </div>

      <div style={{ 
        height: "450px", 
        borderRadius: "20px", 
        overflow: "hidden", 
        marginBottom: "30px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}>
        <MapContainer center={[markerLat, markerLng]} zoom={12} style={{ height: "100%", width: "100%" }} whenCreated={(mapInstance) => (mapRef.current = mapInstance)}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={bus.stops.map(s => [s.lat, s.lng])} color="#667eea" weight={4} />
          {bus.stops.map((stop, idx) => (
            <Marker key={idx} position={[stop.lat, stop.lng]}>
              <Popup>{stop.name} <br /> {stop.time}</Popup>
            </Marker>
          ))}
          <Marker position={[markerLat, markerLng]} icon={busIcon}>
            <Popup>🚌 {currentStop.name} {isCompleted ? "(Completed)" : isDeparting ? "(Departing)" : bus.progress ? `(${Math.round(bus.progress * 100)}% to next)` : "(Current)"}</Popup>
          </Marker>
          <RecenterMap lat={markerLat} lng={markerLng} followBus={followBus} />
        </MapContainer>
      </div>

      <div style={{ 
        background: "linear-gradient(135deg, rgba(86, 171, 47, 0.1) 0%, rgba(168, 230, 207, 0.1) 100%)", 
        padding: "20px 24px", 
        margin: "20px auto", 
        borderRadius: "16px", 
        border: "1px solid rgba(86, 171, 47, 0.2)",
        color: "#2e7d32", 
        fontWeight: "600", 
        fontSize: "1.1rem",
        maxWidth: "600px",
        textAlign: "center",
        boxShadow: "0 8px 25px rgba(86, 171, 47, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>📍</span>
          <span><strong style={{ color: "#1b5e20" }}>{bus.distanceLeft} km</strong> remaining to <span style={{ color: "#1b5e20", fontWeight: "700" }}>{bus.nextStop?.name}</span></span>
        </div>
      </div>

      <div style={{ margin: "0 auto 35px", maxWidth: "700px" }}>
        {(() => {
          const traveled = bus.currentStop?.distance ?? currentStop.distance ?? 0;
          const total = bus.stops[bus.stops.length - 1].distance ?? 1;
          const progress = Math.min(100, Math.round((traveled / total) * 100));
          return (
            <div style={{ 
              padding: "24px", 
              background: "rgba(255, 255, 255, 0.9)", 
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(20px)"
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "16px" 
              }}>
                <span style={{ fontWeight: "700", color: "#333" }}>Journey Progress</span>
                <span style={{ 
                  padding: "4px 12px", 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white", 
                  borderRadius: "12px", 
                  fontSize: "14px", 
                  fontWeight: "600" 
                }}>
                  {progress}%
                </span>
              </div>
              <div style={{ 
                height: "12px", 
                background: "rgba(0, 0, 0, 0.08)", 
                borderRadius: "10px", 
                overflow: "hidden", 
                position: "relative" 
              }}>
                <div style={{ 
                  width: `${progress}%`, 
                  height: "100%", 
                  background: "linear-gradient(90deg, #56ab2f 0%, #a8e6cf 100%)", 
                  borderRadius: "10px",
                  transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                    animation: "shimmer 2s infinite"
                  }} />
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ENHANCED TIMELINE */}
      <div style={{ 
        background: "rgba(255, 255, 255, 0.95)", 
        padding: "32px", 
        borderRadius: 24, 
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)", 
        maxWidth: 800, 
        margin: "0 auto",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        opacity: isTimelineVisible ? 1 : 0,
        transform: isTimelineVisible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px", 
          marginBottom: 32 
        }}>
          <div style={{
            width: "6px",
            height: "32px",
            background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "3px"
          }} />
          <h2 style={{ 
            margin: 0, 
            fontSize: "1.75rem", 
            background: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800 
          }}>
            Route Timeline
          </h2>
        </div>

        <div style={{ position: "relative", paddingLeft: 60, paddingRight: 16 }} ref={timelineContainerRef}>
          {/* Background track with gradient */}
          <div style={{ 
            position: "absolute", 
            top: 20, 
            left: 15, 
            bottom: 20, 
            width: 6, 
            borderRadius: 6, 
            background: "linear-gradient(180deg, #e8f4fd 0%, #f0f7ff 100%)",
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)"
          }} />

          {/* Animated progress track */}
          <div style={{ 
            position: "absolute", 
            left: 15, 
            width: 6, 
            borderRadius: 6, 
            top: progressTopPx ? `${progressTopPx}px` : "20px", 
            height: progressHeightPx ? `${progressHeightPx}px` : "0px", 
            background: "linear-gradient(180deg, #56ab2f 0%, #a8e6cf 50%, #56ab2f 100%)", 
            transition: "height 800ms cubic-bezier(0.4, 0, 0.2, 1), top 600ms cubic-bezier(0.4, 0, 0.2, 1)", 
            boxShadow: "0 8px 25px rgba(86, 171, 47, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
            zIndex: 1,
            animation: isTimelineVisible ? "pulseGlow 3s ease-in-out infinite" : "none"
          }} />

          {/* Enhanced stop circles */}
          {centers && centers.length === stopsCount && centers.map((center, idx) => {
            const isPast = idx < bus.currentIndex;
            const isCurrent = idx === bus.currentIndex;
            const circleSize = isCurrent ? 24 : 16;
            
            return (
              <div
                key={"dot-" + idx}
                style={{
                  position: "absolute",
                  left: 9,
                  top: (typeof center === "number") ? `${center}px` : "20px",
                  transform: "translateY(-50%)",
                  width: circleSize,
                  height: circleSize,
                  borderRadius: "50%",
                  background: isPast 
                    ? "linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)"
                    : isCurrent 
                      ? "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
                      : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                  border: isPast 
                    ? "3px solid #43a047" 
                    : isCurrent 
                      ? "4px solid #43a047" 
                      : "3px solid #90caf9",
                  boxShadow: isCurrent 
                    ? "0 8px 25px rgba(67, 160, 71, 0.4), 0 0 20px rgba(67, 160, 71, 0.2)"
                    : isPast
                      ? "0 4px 15px rgba(67, 160, 71, 0.3)"
                      : "0 4px 15px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 3,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: isCurrent ? "pulseGlow 2s ease-in-out infinite" : "none"
                }}
              >
                {isPast ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isCurrent ? (
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
                    animation: "pulseGlow 1.5s ease-in-out infinite"
                  }} />
                ) : (
                  <div style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #90caf9 0%, #42a5f5 100%)"
                  }} />
                )}
              </div>
            );
          })}

          {/* Enhanced stop cards with better animations */}
          {bus.stops.map((stop, idx) => {
            const isPast = idx < bus.currentIndex;
            const isCurrent = idx === bus.currentIndex;
            
            const cardStyles = {
              past: {
                background: "linear-gradient(135deg, rgba(232, 245, 233, 0.8) 0%, rgba(200, 230, 201, 0.8) 100%)",
                border: "1px solid rgba(67, 160, 71, 0.3)",
                boxShadow: "0 4px 15px rgba(67, 160, 71, 0.1)",
                color: "#1b5e20"
              },
              current: {
                background: "linear-gradient(135deg, rgba(248, 249, 250, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)",
                border: "2px solid #43a047",
                boxShadow: "0 8px 30px rgba(67, 160, 71, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                color: "#1b5e20",
                transform: "scale(1.02)"
              },
              upcoming: {
                background: "linear-gradient(135deg, rgba(250, 250, 250, 0.7) 0%, rgba(245, 245, 245, 0.7) 100%)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                color: "#666"
              }
            };

            const currentStyle = isPast ? cardStyles.past : isCurrent ? cardStyles.current : cardStyles.upcoming;

            return (
              <div 
                key={idx} 
                style={{ 
                  position: "relative", 
                  padding: "12px 0 32px", 
                  zIndex: 2,
                  animation: `slideInFromLeft ${0.6 + idx * 0.1}s ease-out`
                }}
              >
                <div
                  ref={(el) => (labelRefs.current[idx] = el)}
                  style={{
                    marginLeft: 48,
                    padding: "20px 24px",
                    borderRadius: 16,
                    ...currentStyle,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Subtle animated background for current stop */}
                  {isCurrent && (
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "linear-gradient(90deg, transparent 0%, rgba(67, 160, 71, 0.05) 50%, transparent 100%)",
                      animation: "shimmer 3s ease-in-out infinite",
                      zIndex: -1
                    }} />
                  )}
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "12px", 
                      marginBottom: "8px" 
                    }}>
                      <div style={{ 
                        fontSize: "18px", 
                        fontWeight: isCurrent ? 800 : isPast ? 700 : 600, 
                        color: currentStyle.color,
                        lineHeight: 1.2
                      }}>
                        {stop.name}
                      </div>
                      {isCurrent && (
                        <div style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 8px",
                          background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
                          color: "white",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                          animation: "pulseGlow 2s ease-in-out infinite"
                        }}>
                          <span>🚌</span>
                          <span>Current</span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      color: isPast ? "#2e7d32" : isCurrent ? "#1b5e20" : "#888",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{stop.time}</span>
                    </div>
                    
                    {stop.distance && (
                      <div style={{ 
                        marginTop: "6px",
                        fontSize: "13px", 
                        color: isPast ? "#388e3c" : isCurrent ? "#2e7d32" : "#999",
                        fontWeight: "500"
                      }}>
                        📍 {stop.distance}km from start
                      </div>
                    )}
                  </div>

                  <div style={{ 
                    textAlign: "right", 
                    marginLeft: "16px" 
                  }}>
                    {renderStatusBadge(idx)}
                  </div>
                </div>
                
                {/* Connection line between stops */}
                {idx < bus.stops.length - 1 && (
                  <div style={{
                    position: "absolute",
                    left: 15 + 3,
                    bottom: -16,
                    width: 6,
                    height: 32,
                    background: isPast 
                      ? "linear-gradient(180deg, #56ab2f 0%, #a8e6cf 100%)"
                      : "linear-gradient(180deg, #e8f4fd 0%, #f0f7ff 100%)",
                    borderRadius: "3px",
                    transition: "background 0.6s ease",
                    zIndex: 1
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Timeline footer with journey stats */}
        <div style={{
          marginTop: "24px",
          padding: "20px",
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
          borderRadius: "12px",
          border: "1px solid rgba(102, 126, 234, 0.15)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          textAlign: "center"
        }}>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#667eea", marginBottom: "4px" }}>
              {bus.stops.length}
            </div>
            <div style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>Total Stops</div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#43a047", marginBottom: "4px" }}>
              {bus.currentIndex + 1}
            </div>
            <div style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>Stops Completed</div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#ff7043", marginBottom: "4px" }}>
              {Math.max(0, bus.stops.length - bus.currentIndex - 1)}
            </div>
            <div style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>Stops Remaining</div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#9c27b0", marginBottom: "4px" }}>
              {bus.stops[bus.stops.length - 1]?.distance || 0}km
            </div>
            <div style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}>Total Distance</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusDetail;