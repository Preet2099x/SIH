import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function BusDetail() {
  const { id } = useParams();
  const [bus, setBus] = useState(null);

  useEffect(() => {
    const fetchBus = () => {
      fetch(`http://localhost:4000/buses/${id}`)
        .then(res => res.json())
        .then(data => setBus(data));
    };
    fetchBus();
    const interval = setInterval(fetchBus, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (!bus) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;

  return (
    <div style={{ padding: "30px", fontFamily: "Inter, sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      <Link
        to="/"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          textDecoration: "none",
          color: "#007bff",
          fontWeight: "500",
        }}
      >
        ← Back
      </Link>

      <div
        style={{
          background: "#fff",
          padding: "25px 30px",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ marginBottom: "10px", fontSize: "1.8rem", color: "#222" }}>{bus.name}</h1>
        <p style={{ marginBottom: "20px", color: "#555", fontSize: "0.95rem" }}>
          Tracking live movement of bus <strong>{bus.id}</strong>
        </p>

        {/* Distance / Next stop info */}
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
          <span style={{ color: "#1b5e20" }}>{bus.nextStop.name}</span>
        </div>

        {/* Timeline */}
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
                {/* Connector line coloring */}
                {idx > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      left: "-25px",
                      top: "-20px",
                      width: "4px",
                      height: "40px",
                      backgroundColor: isPast ? "#ef5350" : "#e0e0e0",
                      zIndex: 0,
                      borderRadius: "2px",
                      transition: "background-color 0.3s ease",
                    }}
                  />
                )}

                {/* Stop marker */}
                <div
                  style={{
                    width: isCurrent ? "20px" : "14px",
                    height: isCurrent ? "20px" : "14px",
                    backgroundColor: isCurrent ? "#43a047" : isPast ? "#ef5350" : "#42a5f5",
                    borderRadius: "50%",
                    position: "absolute",
                    left: "-32px",
                    top: "0",
                    zIndex: 1,
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
