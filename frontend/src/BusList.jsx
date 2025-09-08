// frontend/src/BusList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function BusList() {
  const [buses, setBuses] = useState([]);
  const [liveStatus, setLiveStatus] = useState({}); // { busId: { currentIndex, currentStopName } }
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:4000/buses")
      .then((r) => r.json())
      .then((data) => setBuses(data))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

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
      } catch (e) {
        // ignore
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
      <h1 style={{ fontSize: "2rem", marginBottom: "25px", color: "#222", textAlign: "center" }}>
        🚌 Available Buses
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {buses.map((bus) => {
          const status = liveStatus[bus.id];
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
                  padding: "20px",
                  borderRadius: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h2 style={{ fontSize: "1.15rem", marginBottom: "8px", color: "#007bff" }}>{bus.name}</h2>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>Bus ID: {bus.id}</p>
                <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <small style={{ color: "#666" }}>Click to view route →</small>
                  <div style={{ fontSize: 12, color: "#444" }}>
                    {status ? <span>At: <strong>{status.currentStop}</strong></span> : <span>—</span>}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default BusList;
