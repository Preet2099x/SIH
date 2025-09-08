import { Link } from 'react-router-dom';

function AboutUs() {
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
            About <span style={{ color: '#4f76ff' }}>GO Bus Travels</span>
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#666',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Your trusted partner for comfortable and reliable bus travel across India
          </p>
        </div>

        {/* Content Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '50px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          marginBottom: '50px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700', 
                color: '#333',
                marginBottom: '30px'
              }}>
                Our Story
              </h2>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#666',
                lineHeight: '1.8',
                marginBottom: '25px'
              }}>
                Founded with a vision to revolutionize bus travel in India, GO Bus Travels has been serving passengers with dedication and excellence for over a decade. We believe that every journey should be comfortable, safe, and memorable.
              </p>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#666',
                lineHeight: '1.8'
              }}>
                Our commitment to quality service and customer satisfaction has made us one of the most trusted names in the transportation industry.
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)',
              borderRadius: '15px',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '4rem'
            }}>
              🚌
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}>
          <div style={{
            background: 'white',
            padding: '40px 30px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px'
            }}>🛡️</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#333',
              marginBottom: '15px'
            }}>
              Safety First
            </h3>
            <p style={{ 
              color: '#666',
              lineHeight: '1.6'
            }}>
              All our buses are equipped with modern safety features and undergo regular maintenance checks.
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '40px 30px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px'
            }}>⏰</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#333',
              marginBottom: '15px'
            }}>
              On-Time Service
            </h3>
            <p style={{ 
              color: '#666',
              lineHeight: '1.6'
            }}>
              We pride ourselves on punctuality and ensure our buses depart and arrive on schedule.
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '40px 30px',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '20px'
            }}>💺</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#333',
              marginBottom: '15px'
            }}>
              Comfortable Seating
            </h3>
            <p style={{ 
              color: '#666',
              lineHeight: '1.6'
            }}>
              Enjoy spacious, ergonomic seats designed for maximum comfort during your journey.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{
          background: 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)',
          borderRadius: '20px',
          padding: '50px',
          color: 'white',
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            marginBottom: '40px'
          }}>
            Our Achievements
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px'
          }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '10px' }}>10+</div>
              <div style={{ fontSize: '1.1rem', opacity: '0.9' }}>Years of Service</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '10px' }}>50+</div>
              <div style={{ fontSize: '1.1rem', opacity: '0.9' }}>Routes Covered</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '10px' }}>1M+</div>
              <div style={{ fontSize: '1.1rem', opacity: '0.9' }}>Happy Passengers</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '10px' }}>100+</div>
              <div style={{ fontSize: '1.1rem', opacity: '0.9' }}>Fleet Size</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
