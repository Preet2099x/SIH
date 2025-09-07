import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function BusList() {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/buses")
      .then(res => res.json())
      .then(data => setBuses(data));
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
        {buses.map(bus => (
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
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              }}
            >
              <h2 style={{ fontSize: "1.2rem", marginBottom: "10px", color: "#007bff" }}>{bus.name}</h2>
              <p style={{ fontSize: "0.9rem", color: "#555" }}>Bus ID: {bus.id}</p>
              <p style={{ marginTop: "8px", fontSize: "0.85rem", color: "#666" }}>
                Click to view route details →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BusList;
