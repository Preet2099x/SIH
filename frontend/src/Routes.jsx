import { useState } from 'react';
import { Link } from 'react-router-dom';

function Routes() {
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const popularRoutes = [
    {
      id: 1,
      from: 'Hyderabad',
      to: 'Bangalore',
      duration: '8h 30m',
      price: '₹650',
      buses: 12,
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 2,
      from: 'Chennai',
      to: 'Bangalore',
      duration: '6h 15m',
      price: '₹580',
      buses: 8,
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 3,
      from: 'Mumbai',
      to: 'Pune',
      duration: '3h 45m',
      price: '₹350',
      buses: 15,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 4,
      from: 'Delhi',
      to: 'Jaipur',
      duration: '5h 20m',
      price: '₹450',
      buses: 10,
      image: 'https://images.unsplash.com/photo-1601894527788-f48edc4cd4ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 5,
      from: 'Bangalore',
      to: 'Mysore',
      duration: '3h 15m',
      price: '₹280',
      buses: 6,
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 6,
      from: 'Kolkata',
      to: 'Bhubaneswar',
      duration: '7h 30m',
      price: '₹520',
      buses: 7,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  const filteredRoutes = popularRoutes.filter(route => {
    const fromMatch = searchFrom === '' || route.from.toLowerCase().includes(searchFrom.toLowerCase());
    const toMatch = searchTo === '' || route.to.toLowerCase().includes(searchTo.toLowerCase());
    return fromMatch && toMatch;
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f8f9fa', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)', color: 'white', padding: '60px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
            ← Back to Home
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '20px' }}>
            Bus Routes
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            Discover our extensive network of bus routes connecting major cities across India
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div style={{ padding: '40px 0', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>From</label>
              <input
                type="text"
                placeholder="Enter departure city"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4f76ff'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>To</label>
              <input
                type="text"
                placeholder="Enter destination city"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4f76ff'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            <button
              onClick={() => {setSearchFrom(''); setSearchTo('');}}
              style={{
                background: '#4f76ff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                marginTop: '30px'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div style={{ padding: '60px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '40px', textAlign: 'center', color: '#333' }}>
            {searchFrom || searchTo ? 'Search Results' : 'Popular Routes'}
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '30px',
            marginBottom: '40px'
          }}>
            {filteredRoutes.map(route => (
              <div 
                key={route.id}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div 
                  style={{
                    height: '200px',
                    backgroundImage: `linear-gradient(rgba(79, 118, 255, 0.7), rgba(79, 118, 255, 0.7)), url(${route.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px' }}>
                      {route.from} → {route.to}
                    </h3>
                    <p style={{ fontSize: '1rem', opacity: 0.9 }}>{route.duration}</p>
                  </div>
                </div>
                
                <div style={{ padding: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <p style={{ fontSize: '2rem', fontWeight: '700', color: '#4f76ff', marginBottom: '5px' }}>
                        {route.price}
                      </p>
                      <p style={{ fontSize: '14px', color: '#666' }}>Starting from</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                        {route.buses} Buses
                      </p>
                      <p style={{ fontSize: '14px', color: '#666' }}>Available</p>
                    </div>
                  </div>
                  
                  <Link
                    to={`/buses?from=${route.from}&to=${route.to}`}
                    style={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '12px 0',
                      borderRadius: '10px',
                      textAlign: 'center',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #3d5cff 0%, #5a7aff 100%)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    View Buses
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredRoutes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#666', marginBottom: '20px' }}>
                No routes found
              </h3>
              <p style={{ color: '#999' }}>
                Try adjusting your search criteria or browse our popular routes above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Routes;
