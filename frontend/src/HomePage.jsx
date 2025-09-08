import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function HomePage() {
  const [tripType, setTripType] = useState('single');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to bus list with search parameters using React Router
    const searchParams = new URLSearchParams({
      from: fromCity,
      to: toCity,
      date: travelDate,
      type: tripType
    });
    navigate(`/buses?${searchParams.toString()}`);
  };

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  return (
    <div className="homepage">
      {/* Header Navigation */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <nav className="main-nav">
          <div className="container">
            <div className="nav-wrapper">
              <div className="logo">
                <div className="logo-icon">
                  <img src="/logo.png" alt="GET Bus" className="logo-image" />
                </div>
                <div className="logo-text">
                  <span className="brand-name">GET <span className="brand-accent">Bus</span></span>
                  <span className="brand-tagline"></span>
                </div>
              </div>
              
              <div className="nav-menu">
                <Link to="/" className="nav-link active">Home</Link>
                <div className="nav-dropdown">
                  <a href="#tickets" className="nav-link dropdown-toggle">
                    Manage Ticket
                    <svg className="dropdown-icon" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                    </svg>
                  </a>
                  <div className="dropdown-menu">
                    <Link to="/buses" className="dropdown-item">Book Ticket</Link>
                    <a href="#cancel" className="dropdown-item">Cancel Ticket</a>
                    <a href="#reschedule" className="dropdown-item">Reschedule</a>
                    <a href="#print" className="dropdown-item">Print Ticket</a>
                  </div>
                </div>
                <a href="#track" className="nav-link">
                  <svg className="nav-icon" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path d="M10 1C5 1 1 5 1 10s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z"/>
                  </svg>
                  Track My Bus
                </a>
                <Link to="/routes" className="nav-link">Routes</Link>
                <a href="#about" className="nav-link">About Us</a>
                <a href="#contact" className="nav-link">Contact</a>
              </div>
              
              <div className="nav-actions">
                <button className="btn btn-outline">
                  <svg className="btn-icon" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                  Customer Login
                </button>
              </div>
              
              <button className="mobile-menu-btn">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <div className="badge">Safe | Reliable | Friendly</div>
                <h1 className="hero-title">
                  Where every trip is a new opportunity 
                  <span className="highlight"> for adventure</span>
                </h1>
                <p className="hero-subtitle">
                  Experience comfort, safety, and reliability on every journey with our premium bus services across India.
                </p>
              </div>
              
              <div className="booking-card">
                <div className="booking-header">
                  <span>For Booking</span>
                  <div className="trip-selector">
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        value="single" 
                        checked={tripType === 'single'} 
                        onChange={(e) => setTripType(e.target.value)}
                      />
                      <span>Single Trip</span>
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        value="round" 
                        checked={tripType === 'round'} 
                        onChange={(e) => setTripType(e.target.value)}
                      />
                      <span>Round Trip</span>
                    </label>
                  </div>
                </div>

                <form onSubmit={handleSearch} className="booking-form">
                  <div className="form-row">
                    <div className="input-group">
                      <label>From</label>
                      <select 
                        value={fromCity} 
                        onChange={(e) => setFromCity(e.target.value)}
                        required
                      >
                        <option value="">Select From City</option>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="bangalore">Bangalore</option>
                        <option value="chennai">Chennai</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="delhi">Delhi</option>
                      </select>
                    </div>
                    
                    <button type="button" className="swap-btn" onClick={swapCities}>
                      ⇄
                    </button>
                    
                    <div className="input-group">
                      <label>To</label>
                      <select 
                        value={toCity} 
                        onChange={(e) => setToCity(e.target.value)}
                        required
                      >
                        <option value="">Select To City</option>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="bangalore">Bangalore</option>
                        <option value="chennai">Chennai</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="delhi">Delhi</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Departure Date</label>
                      <input 
                        type="date" 
                        value={travelDate} 
                        onChange={(e) => setTravelDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="date-options">
                      <div className="date-option">Mon<br/>08</div>
                      <div className="date-option">Tue<br/>09</div>
                      <div className="date-option active">Wed<br/>10</div>
                    </div>
                  </div>

                  <button type="submit" className="search-btn">
                    🔍 Search
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="amenities">
        <div className="container">
          <div className="section-badge"></div>
          <h2 className="section-title">Our <span className="highlight">Amenities</span></h2>
          
          <div className="amenities-grid">
            <div className="amenity-card">
              <div className="amenity-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                  <path d="M13 3c3.9 0 7 3.1 7 7 0 5.25-7 13-7 13s-7-7.75-7-13c0-3.9 3.1-7 7-7zm0 9.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5z"/>
                </svg>
              </div>
              <h3>Fast Booking</h3>
              <p>Enjoy buying your bus tickets online with our quick and secure booking system.</p>
            </div>
            
            <div className="amenity-card">
              <div className="amenity-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3>Stress Free</h3>
              <p>Professional bus captains and staff will assist you throughout your comfortable journey.</p>
            </div>
            
            <div className="amenity-card">
              <div className="amenity-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3>Ladies Seat</h3>
              <p>The seat adjoining yours has been specially reserved for women ensuring safe travel.</p>
            </div>
            
            <div className="amenity-card">
              <div className="amenity-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                </svg>
              </div>
              <h3>24/7 Support</h3>
              <p>With customer satisfaction being our ultimate goal, we provide round-the-clock assistance.</p>
            </div>
          </div>

          <div className="cta-section">
            <div className="cta-badge"></div>
            <h2>A Real Good Choice<br/>To Travel</h2>
            <button className="cta-btn">Contact</button>
            <div className="travel-badge">
              <div className="badge-content">GO BUS TRAVELS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Routes Section */}
      <section className="top-routes">
        <div className="container">
          <div className="section-badge"></div>
          <h2 className="section-title">Top <span className="highlight">Routes</span></h2>
          
          <div className="routes-grid">
            <div className="route-card">
              <div className="route-image eluru-bg">
                <h3>Eluru</h3>
              </div>
            </div>
            
            <div className="route-card">
              <div className="route-image hyderabad-bg">
                <h3>Hyderabad</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Comfort Section */}
      <section className="journey-comfort">
        <div className="container">
          <div className="comfort-content">
            <div className="comfort-images">
              <div className="comfort-image main-bus"></div>
              <div className="comfort-image bus-interior"></div>
              <div className="comfort-image side-bus-1"></div>
              <div className="comfort-image side-bus-2"></div>
              <div className="comfort-image side-bus-3"></div>
            </div>
            
            <div className="comfort-text">
              <div className="section-badge"></div>
              <h2>Make Your<br/><span className="highlight">Journey</span> Comfort</h2>
              <p>We are professional team, With good experience and passionate about our service for you and we have quality completed buses for your travel.</p>
              <button className="routes-btn">Top Routes</button>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Experience Section */}
      <section className="travel-experience">
        <div className="container">
          <div className="experience-content">
            <div className="experience-text">
              <h2>Making Your<br/><span className="highlight">Travel Experience</span><br/>Stress-Free</h2>
              <p>At GO Bus Travels, we understand that when it comes to affordable travel you want to be a <span className="highlight-text">wise and confident traveler.</span></p>
            </div>
            
            <div className="experience-features">
              <div className="feature">
                <h3>1</h3>
                <h4>Book Stress free</h4>
                <p>Choose your favorite seat.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bus Gallery Section */}
      <section className="bus-gallery">
        <div className="container">
          <h2 className="section-title"><span className="highlight">Premium Bus</span><br/>Gallery</h2>
          
          <div className="gallery-grid">
            <div className="gallery-item">
              <div className="gallery-image bus-gallery-1"></div>
            </div>
            <div className="gallery-item">
              <div className="gallery-image bus-gallery-2"></div>
            </div>
            <div className="gallery-item">
              <div className="gallery-image bus-gallery-3"></div>
            </div>
            <div className="gallery-item">
              <div className="gallery-image bus-gallery-4"></div>
            </div>
            <div className="gallery-item">
              <div className="gallery-image bus-gallery-5"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <img src="/getbus-logo.png" alt="GO Bus" style={{width: '60px', height: '50px', marginBottom: '10px'}} />
                <div style={{fontSize: '18px', fontWeight: 'bold', color: 'white'}}>GET Bus Travels</div>
                <p style={{color: 'rgba(255, 255, 255, 0.8)', marginTop: '10px'}}>Your trusted travel partner</p>
              </div>
            </div>
            
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#terms">Terms & Conditions</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#feedback">Feedback</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>24 X 7 Helpdesk</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span>📞</span> 9142307306
                </p>
                <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span>✉️</span> care.getbustravels@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
