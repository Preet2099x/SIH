import { useState } from 'react';
import { Link } from 'react-router-dom';

function ManageTicket() {
  const [ticketData, setTicketData] = useState({
    pnr: '',
    email: ''
  });
  const [ticketInfo, setTicketInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  const handleChange = (e) => {
    setTicketData({
      ...ticketData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setTicketInfo({
        pnr: ticketData.pnr,
        passengerName: 'John Doe',
        email: ticketData.email,
        phone: '+91 98765 43210',
        route: 'Hyderabad to Bangalore',
        busOperator: 'GoBus Travels',
        busNumber: 'TS07HY1234',
        departureDate: '2024-01-25',
        departureTime: '10:00 AM',
        arrivalTime: '05:00 PM',
        boardingPoint: 'KPHB Bus Stop, Hyderabad',
        droppingPoint: 'Majestic Bus Stand, Bangalore',
        seatNumbers: ['A15', 'A16'],
        totalFare: '₹1,200',
        bookingStatus: 'Confirmed',
        bookingDate: '2024-01-20',
        cancellationPolicy: 'Free cancellation up to 2 hours before departure',
        amenities: ['WiFi', 'Charging Point', 'AC', 'Water Bottle']
      });
      setIsLoading(false);
      setActiveTab('details');
    }, 2000);
  };

  const handleCancelTicket = () => {
    if (window.confirm('Are you sure you want to cancel this ticket? Refund will be processed as per our cancellation policy.')) {
      alert('Ticket cancelled successfully! Refund will be processed within 5-7 business days.');
      setTicketInfo(null);
      setActiveTab('search');
    }
  };

  const handleReschedule = () => {
    alert('Reschedule feature will be available soon! Please contact customer support for now.');
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
            Manage Your <span style={{ color: '#4f76ff' }}>Ticket</span>
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Cancel, reschedule, or modify your bus ticket booking
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '5px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={() => setActiveTab('search')}
              style={{
                background: activeTab === 'search' ? 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)' : 'transparent',
                color: activeTab === 'search' ? 'white' : '#666',
                padding: '12px 30px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginRight: '10px'
              }}
            >
              🔍 Search Ticket
            </button>
            <button
              onClick={() => setActiveTab('details')}
              disabled={!ticketInfo}
              style={{
                background: activeTab === 'details' ? 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)' : 'transparent',
                color: activeTab === 'details' ? 'white' : (ticketInfo ? '#666' : '#ccc'),
                padding: '12px 30px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: ticketInfo ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease'
              }}
            >
              🎫 Ticket Details
            </button>
          </div>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '700', 
              color: '#333',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              Find Your Ticket
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  PNR Number *
                </label>
                <input
                  type="text"
                  name="pnr"
                  value={ticketData.pnr}
                  onChange={handleChange}
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

              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={ticketData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
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
                {isLoading ? 'Searching...' : 'Find My Ticket'}
              </button>
            </form>
          </div>
        )}

        {/* Ticket Details Tab */}
        {activeTab === 'details' && ticketInfo && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Ticket Header */}
            <div style={{
              background: 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)',
              borderRadius: '15px',
              padding: '30px',
              color: 'white',
              marginBottom: '40px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{ticketInfo.route}</h2>
                  <p style={{ margin: '5px 0 0 0', opacity: '0.9' }}>
                    {ticketInfo.departureDate} • {ticketInfo.departureTime}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: '#28a745',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {ticketInfo.bookingStatus}
                  </span>
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <p style={{ margin: 0, opacity: '0.8', fontSize: '14px' }}>PNR</p>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>{ticketInfo.pnr}</p>
                </div>
                <div>
                  <p style={{ margin: 0, opacity: '0.8', fontSize: '14px' }}>Bus Number</p>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>{ticketInfo.busNumber}</p>
                </div>
                <div>
                  <p style={{ margin: 0, opacity: '0.8', fontSize: '14px' }}>Seats</p>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>{ticketInfo.seatNumbers.join(', ')}</p>
                </div>
                <div>
                  <p style={{ margin: 0, opacity: '0.8', fontSize: '14px' }}>Total Fare</p>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>{ticketInfo.totalFare}</p>
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '30px',
              marginBottom: '40px'
            }}>
              <div style={{
                padding: '25px',
                background: '#f8f9fa',
                borderRadius: '15px'
              }}>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '20px', 
                  fontSize: '1.3rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  👤 Passenger Details
                </h3>
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Name</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '16px', fontWeight: '600' }}>{ticketInfo.passengerName}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Email</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '16px' }}>{ticketInfo.email}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Phone</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '16px' }}>{ticketInfo.phone}</p>
                </div>
              </div>

              <div style={{
                padding: '25px',
                background: '#f8f9fa',
                borderRadius: '15px'
              }}>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '20px', 
                  fontSize: '1.3rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  🚌 Journey Details
                </h3>
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Bus Operator</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '16px', fontWeight: '600' }}>{ticketInfo.busOperator}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Departure</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '16px' }}>{ticketInfo.departureTime}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Arrival</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '16px' }}>{ticketInfo.arrivalTime}</p>
                </div>
              </div>
            </div>

            {/* Boarding & Dropping Points */}
            <div style={{
              padding: '25px',
              background: '#f8f9fa',
              borderRadius: '15px',
              marginBottom: '40px'
            }}>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '20px', 
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                📍 Boarding & Dropping Points
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px'
              }}>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Boarding Point</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '16px', fontWeight: '600' }}>{ticketInfo.boardingPoint}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Dropping Point</p>
                  <p style={{ margin: 0, color: '#333', fontSize: '16px', fontWeight: '600' }}>{ticketInfo.droppingPoint}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '40px'
            }}>
              <Link
                to="/track-bus"
                style={{
                  background: 'linear-gradient(135deg, #28a745 0%, #34ce57 100%)',
                  color: 'white',
                  padding: '15px 30px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  display: 'inline-block'
                }}
              >
                📍 Track Bus
              </Link>
              <button
                onClick={handleReschedule}
                style={{
                  background: 'linear-gradient(135deg, #ffc107 0%, #ffcd39 100%)',
                  color: '#333',
                  padding: '15px 30px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🔄 Reschedule
              </button>
              <button
                onClick={handleCancelTicket}
                style={{
                  background: 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)',
                  color: 'white',
                  padding: '15px 30px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ❌ Cancel Ticket
              </button>
            </div>

            {/* Cancellation Policy */}
            <div style={{
              padding: '20px',
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
                <strong>Cancellation Policy:</strong> {ticketInfo.cancellationPolicy}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageTicket;
