// frontend/src/BusList.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function BusList() {
  const [buses, setBuses] = useState([]);
  const [liveStatus, setLiveStatus] = useState({}); // { busId: { currentIndex, currentStopName } }
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [searchParams] = useSearchParams();
  
  // Get search parameters
  const fromCity = searchParams.get('from') || '';
  const toCity = searchParams.get('to') || '';
  const travelDate = searchParams.get('date') || '';
  const tripType = searchParams.get('type') || 'single';

  useEffect(() => {
    fetch("http://localhost:4000/buses")
      .then((r) => r.json())
      .then((data) => {
        setBuses(data);
        // Filter buses based on search parameters
        if (fromCity && toCity) {
          const filtered = data.filter(bus => {
            // Check if bus has direct route from origin to destination
            const matchesFromTo = (
              bus.from?.toLowerCase().includes(fromCity.toLowerCase()) &&
              bus.to?.toLowerCase().includes(toCity.toLowerCase())
            );
            
            // Also check stops for partial matches if direct route doesn't match
            if (!matchesFromTo) {
              const stops = bus.stops || [];
              const hasFromStop = stops.some(stop => 
                stop.name.toLowerCase().includes(fromCity.toLowerCase())
              );
              const hasToStop = stops.some(stop => 
                stop.name.toLowerCase().includes(toCity.toLowerCase())
              );
              return hasFromStop && hasToStop;
            }
            
            return matchesFromTo;
          });
          setFilteredBuses(filtered);
        } else if (fromCity) {
          const filtered = data.filter(bus => 
            bus.from?.toLowerCase().includes(fromCity.toLowerCase()) ||
            bus.stops?.some(stop => stop.name.toLowerCase().includes(fromCity.toLowerCase()))
          );
          setFilteredBuses(filtered);
        } else if (toCity) {
          const filtered = data.filter(bus => 
            bus.to?.toLowerCase().includes(toCity.toLowerCase()) ||
            bus.stops?.some(stop => stop.name.toLowerCase().includes(toCity.toLowerCase()))
          );
          setFilteredBuses(filtered);
        } else {
          setFilteredBuses(data);
        }
      })
      .catch((e) => console.error(e));
  }, [fromCity, toCity]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000/ws");

    ws.onopen = () => {
      // optional: send a ping
      ws.send(JSON.stringify({ type: "hello", text: "client connected" }));
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "snapshot") {
          // snapshot: array of {id, currentIndex, currentStop}
          const map = {};
          msg.payload.forEach((p) => {
            map[p.id] = { currentIndex: p.currentIndex, currentStop: p.currentStop?.name };
          });
          setLiveStatus((s) => ({ ...s, ...map }));
        } else if (msg.type === "bus_update") {
          const p = msg.payload;
          setLiveStatus((s) => ({
            ...s,
            [p.id]: { currentIndex: p.currentIndex, currentStop: p.currentStop?.name },
          }));
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => console.log("WS closed");
    ws.onerror = (err) => console.error("WS error", err);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Inter, sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <Link 
          to="/" 
          style={{ 
            color: "#4f76ff", 
            textDecoration: "none", 
            fontSize: "16px",
            marginBottom: "10px",
            display: "inline-block"
          }}
        >
          ← Back to Home
        </Link>
        <h1 style={{ fontSize: "2rem", marginBottom: "15px", color: "#222" }}>
          🚌 Available Buses
        </h1>
        
        {/* Search Info */}
        {(fromCity || toCity) && (
          <div style={{ 
            background: "#e3f2fd", 
            padding: "15px", 
            borderRadius: "12px", 
            marginBottom: "25px",
            maxWidth: "600px",
            margin: "0 auto 25px auto"
          }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#1976d2" }}>Search Results</h3>
            <p style={{ margin: 0, color: "#555" }}>
              {fromCity && toCity ? 
                `Showing buses from ${fromCity.charAt(0).toUpperCase() + fromCity.slice(1)} to ${toCity.charAt(0).toUpperCase() + toCity.slice(1)}` :
                fromCity ? `Buses from ${fromCity.charAt(0).toUpperCase() + fromCity.slice(1)}` :
                `Buses to ${toCity.charAt(0).toUpperCase() + toCity.slice(1)}`
              }
              {travelDate && ` on ${new Date(travelDate).toLocaleDateString()}`}
              {tripType === 'round' && ' (Round Trip)'}
            </p>
            <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
              Found {filteredBuses.length} buses
            </p>
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {filteredBuses.length > 0 ? (
          filteredBuses.map((bus) => {
            const status = liveStatus[bus.id];
            const firstStop = bus.stops?.[0]?.name || 'Unknown';
            const lastStop = bus.stops?.[bus.stops.length - 1]?.name || 'Unknown';
            const estimatedDuration = bus.stops?.[bus.stops.length - 1]?.time || 'N/A';
            
            return (
              <Link
                key={bus.id}
                to={`/bus/${bus.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    padding: "24px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: "1px solid #e0e0e0",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <h2 style={{ fontSize: "1.25rem", marginBottom: "0", color: "#007bff", fontWeight: "600" }}>
                      {bus.name}
                    </h2>
                    <div style={{
                      background: status ? "#e8f5e8" : "#f5f5f5",
                      color: status ? "#2e7d32" : "#666",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      {status ? "Live" : "Offline"}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "0.9rem", color: "#666", margin: "0 0 4px 0" }}>
                      <strong>Route:</strong> {firstStop} → {lastStop}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#888", margin: "0" }}>
                      Bus ID: {bus.id} • Arrives by: {estimatedDuration}
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {status ? (
                        <span>Currently at: <strong style={{ color: "#2e7d32" }}>{status.currentStop}</strong></span>
                      ) : (
                        <span>Click to view details →</span>
                      )}
                    </div>
                    <div style={{ 
                      background: "#f0f8ff", 
                      color: "#1976d2", 
                      padding: "6px 12px", 
                      borderRadius: "20px", 
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      View Details
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div style={{ 
            gridColumn: "1 / -1", 
            textAlign: "center", 
            padding: "60px 20px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🚌</div>
            <h3 style={{ color: "#666", marginBottom: "8px" }}>No buses found</h3>
            <p style={{ color: "#888", fontSize: "14px" }}>
              {fromCity && toCity ? 
                `Sorry, no buses available from ${fromCity} to ${toCity} for the selected date.` :
                "Try adjusting your search criteria or browse all available buses."
              }
            </p>
            <Link 
              to="/buses"
              style={{
                display: "inline-block",
                marginTop: "16px",
                padding: "10px 20px",
                background: "#007bff",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "14px"
              }}
            >
              View All Buses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default BusList;
