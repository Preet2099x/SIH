import { useState } from 'react';
import { Link } from 'react-router-dom';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
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
            Contact <span style={{ color: '#4f76ff' }}>Us</span>
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Get in touch with us for any queries or support
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          marginBottom: '60px'
        }}>
          {/* Contact Information */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#333',
              marginBottom: '30px'
            }}>
              Get In Touch
            </h2>

            <div style={{ marginBottom: '30px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '2rem',
                  marginRight: '20px'
                }}>📞</div>
                <div>
                  <h4 style={{ color: '#333', marginBottom: '5px', fontWeight: '600' }}>Phone</h4>
                  <p style={{ color: '#666', margin: 0 }}>94931 51511</p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '2rem',
                  marginRight: '20px'
                }}>✉️</div>
                <div>
                  <h4 style={{ color: '#333', marginBottom: '5px', fontWeight: '600' }}>Email</h4>
                  <p style={{ color: '#666', margin: 0 }}>care.gobustravels@gmail.com</p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '2rem',
                  marginRight: '20px'
                }}>📍</div>
                <div>
                  <h4 style={{ color: '#333', marginBottom: '5px', fontWeight: '600' }}>Address</h4>
                  <p style={{ color: '#666', margin: 0 }}>
                    123 Transport Street<br/>
                    Hyderabad, Telangana 500001<br/>
                    India
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '2rem',
                  marginRight: '20px'
                }}>⏰</div>
                <div>
                  <h4 style={{ color: '#333', marginBottom: '5px', fontWeight: '600' }}>Business Hours</h4>
                  <p style={{ color: '#666', margin: 0 }}>
                    24/7 Customer Support<br/>
                    Monday - Sunday
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#333',
              marginBottom: '30px'
            }}>
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'border-color 0.3s ease',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)',
                  color: 'white',
                  padding: '15px 40px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(79, 118, 255, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          marginBottom: '60px'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#333',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            Find Us
          </h2>
          <div style={{
            background: 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)',
            borderRadius: '15px',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem'
          }}>
            🗺️ Interactive Map Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
