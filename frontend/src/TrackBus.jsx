import { useState } from 'react';
import { Link } from 'react-router-dom';

function TrackBus() {
  const [ticketPnr, setTicketPnr] = useState('');
  const [busData, setBusData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setBusData({
        pnr: ticketPnr,
        busNumber: 'TS07HY1234',
        route: 'Hyderabad to Bangalore',
        departureTime: '10:00 AM',
        arrivalTime: '05:00 PM',
        currentLocation: 'Kurnool',
        status: 'On Time',
        progress: 65,
        nextStop: 'Anantapur',
        estimatedArrival: '2 hours 30 minutes',
        busOperator: 'GoBus Travels',
        seatNumbers: ['A15', 'A16'],
        driver: {
          name: 'Rajesh Kumar',
          phone: '+91 94931 51511'
        }
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      paddingTop: '100px', 
      fontFamily: 'Inter, sans-serif',
      background: '#f8f9fa'
    }}>
      <div className="container">
        {/* Navigation */}
        <div style={{ marginBottom: '30px' }}>
          <Link 
            to="/" 
            style={{ 
              color: "#4f76ff", 
              textDecoration: "none", 
              fontSize: "16px",
              fontWeight: '500'
            }}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '700', 
            color: '#333',
            marginBottom: '20px'
          }}>
            Track Your <span style={{ color: '#4f76ff' }}>Bus</span>
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Enter your ticket PNR to track your bus in real-time
          </p>
        </div>

        {/* Tracking Form */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px auto'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '600',
                color: '#333',
                fontSize: '1.1rem'
              }}>
                Enter PNR Number
              </label>
              <input
                type="text"
                value={ticketPnr}
                onChange={(e) => setTicketPnr(e.target.value)}
                placeholder="Enter your PNR number"
                required
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4f76ff'}
                onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? '#ccc' : 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)',
                color: 'white',
                padding: '15px 40px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                width: '100%'
              }}
            >
              {isLoading ? 'Tracking...' : 'Track Bus'}
            </button>
          </form>
        </div>

        {/* Bus Tracking Results */}
        {busData && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            marginBottom: '40px'
          }}>
            {/* Trip Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              padding: '20px',
              background: 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)',
              borderRadius: '15px',
              color: 'white'
            }}>
              <div>
                <h2 style={{ margin: 0, marginBottom: '5px' }}>{busData.route}</h2>
                <p style={{ margin: 0, opacity: '0.9' }}>PNR: {busData.pnr}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>{busData.status}</p>
                <p style={{ margin: 0, opacity: '0.9' }}>Bus: {busData.busNumber}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{ fontWeight: '600', color: '#333' }}>Journey Progress</span>
                <span style={{ fontWeight: '600', color: '#4f76ff' }}>{busData.progress}%</span>
              </div>
              <div style={{
                background: '#e1e5e9',
                borderRadius: '10px',
                height: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)',
                  height: '100%',
                  width: `${busData.progress}%`,
                  transition: 'width 1s ease-in-out'
                }}></div>
              </div>
            </div>

            {/* Trip Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              marginBottom: '30px'
            }}>
              {/* Current Status */}
              <div style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '15px',
                border: '2px solid #4f76ff'
              }}>
                <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.2rem' }}>
                  📍 Current Status
                </h3>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Location:</strong> {busData.currentLocation}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Next Stop:</strong> {busData.nextStop}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>ETA:</strong> {busData.estimatedArrival}
                </p>
              </div>

              {/* Trip Information */}
              <div style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '15px'
              }}>
                <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.2rem' }}>
                  🚌 Trip Details
                </h3>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Departure:</strong> {busData.departureTime}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Arrival:</strong> {busData.arrivalTime}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Seats:</strong> {busData.seatNumbers.join(', ')}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px'
            }}>
              <div style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '15px'
              }}>
                <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.2rem' }}>
                  👨‍✈️ Driver Details
                </h3>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Name:</strong> {busData.driver.name}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Contact:</strong> {busData.driver.phone}
                </p>
              </div>

              <div style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '15px'
              }}>
                <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.2rem' }}>
                  🏢 Operator
                </h3>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Company:</strong> {busData.busOperator}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Support:</strong> 94931 51511
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '20px',
              marginTop: '30px',
              justifyContent: 'center'
            }}>
              <button
                style={{
                  background: 'linear-gradient(135deg, #28a745 0%, #34ce57 100%)',
                  color: 'white',
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📞 Call Driver
              </button>
              <button
                style={{
                  background: 'linear-gradient(135deg, #ffc107 0%, #ffcd39 100%)',
                  color: '#333',
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📋 View Ticket
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#333', marginBottom: '20px', fontSize: '1.5rem' }}>
            Need Help?
          </h3>
          <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
            Having trouble tracking your bus? Our customer support team is here to help you 24/7.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/contact"
              style={{
                background: 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)',
                color: 'white',
                padding: '12px 30px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              📞 Contact Support
            </Link>
            <button
              style={{
                background: 'transparent',
                color: '#4f76ff',
                padding: '12px 30px',
                border: '2px solid #4f76ff',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#4f76ff';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#4f76ff';
              }}
            >
              💬 Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackBus;
