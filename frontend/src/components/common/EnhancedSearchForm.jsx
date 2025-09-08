import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EnhancedSearchForm = ({ 
  initialFromCity = '', 
  initialToCity = '', 
  initialDate = '', 
  initialTripType = 'single',
  onSearch 
}) => {
  const [fromCity, setFromCity] = useState(initialFromCity);
  const [toCity, setToCity] = useState(initialToCity);
  const [travelDate, setTravelDate] = useState(initialDate);
  const [tripType, setTripType] = useState(initialTripType);
  const [returnDate, setReturnDate] = useState('');
  const navigate = useNavigate();

  const cities = [
    'delhi', 'mumbai', 'bangalore', 'chennai', 'hyderabad', 
    'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow',
    'gurgaon'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!fromCity || !toCity) {
      alert('Please select both departure and destination cities');
      return;
    }
    
    if (!travelDate) {
      alert('Please select a travel date');
      return;
    }

    const searchParams = new URLSearchParams({
      from: fromCity,
      to: toCity,
      date: travelDate,
      type: tripType,
      ...(tripType === 'round' && returnDate && { returnDate })
    });

    // Call onSearch callback if provided (for homepage)
    if (onSearch) {
      onSearch({ from: fromCity, to: toCity, date: travelDate, type: tripType, returnDate });
    }

    // Navigate to bus list with enhanced search parameters
    navigate(`/buses?${searchParams.toString()}`);
  };

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const getTodaysDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getUpcomingDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        dayNum: date.getDate(),
        isToday: i === 0,
        isTomorrow: i === 1
      });
    }
    return dates;
  };

  const upcomingDates = getUpcomingDates();

  return (
    <div className="enhanced-search-form" style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#333', 
          fontSize: '1.5rem',
          fontWeight: '700'
        }}>
          🎫 Book Your Journey
        </h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '25px',
            background: tripType === 'single' ? '#4f76ff' : '#f8f9fa',
            color: tripType === 'single' ? '#fff' : '#666',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <input 
              type="radio" 
              value="single" 
              checked={tripType === 'single'} 
              onChange={(e) => setTripType(e.target.value)}
              style={{ display: 'none' }}
            />
            🎯 One Way
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '25px',
            background: tripType === 'round' ? '#4f76ff' : '#f8f9fa',
            color: tripType === 'round' ? '#fff' : '#666',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <input 
              type="radio" 
              value="round" 
              checked={tripType === 'round'} 
              onChange={(e) => setTripType(e.target.value)}
              style={{ display: 'none' }}
            />
            🔄 Round Trip
          </label>
        </div>
      </div>

      <form onSubmit={handleSearch}>
        {/* Cities Selection */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto 1fr', 
          gap: '16px', 
          alignItems: 'end',
          marginBottom: '24px'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#333',
              fontSize: '14px'
            }}>
              🛫 From
            </label>
            <select 
              value={fromCity} 
              onChange={(e) => setFromCity(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                background: '#fff',
                color: '#333',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                textTransform: 'capitalize'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4f76ff'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            >
              <option value="">Select departure city</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="button" 
            onClick={swapCities}
            style={{
              background: '#4f76ff',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(79, 118, 255, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'rotate(180deg) scale(1.1)';
              e.target.style.background = '#3d5afe';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'rotate(0deg) scale(1)';
              e.target.style.background = '#4f76ff';
            }}
          >
            ⇄
          </button>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#333',
              fontSize: '14px'
            }}>
              🛬 To
            </label>
            <select 
              value={toCity} 
              onChange={(e) => setToCity(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                background: '#fff',
                color: '#333',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                textTransform: 'capitalize'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4f76ff'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            >
              <option value="">Select destination city</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Selection */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: tripType === 'round' ? '1fr 1fr' : '1fr', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#333',
                fontSize: '14px'
              }}>
                📅 Departure Date
              </label>
              <input 
                type="date" 
                value={travelDate} 
                onChange={(e) => setTravelDate(e.target.value)}
                min={getTodaysDate()}
                required
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  background: '#fff',
                  color: '#333',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4f76ff'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            {tripType === 'round' && (
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  🔄 Return Date
                </label>
                <input 
                  type="date" 
                  value={returnDate} 
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={travelDate || getTodaysDate()}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px',
                    background: '#fff',
                    color: '#333',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4f76ff'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            )}
          </div>

          {/* Quick Date Selection */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {upcomingDates.map(dateInfo => (
              <button
                key={dateInfo.date}
                type="button"
                onClick={() => setTravelDate(dateInfo.date)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: travelDate === dateInfo.date ? '#4f76ff' : '#e2e8f0',
                  background: travelDate === dateInfo.date ? '#4f76ff' : '#fff',
                  color: travelDate === dateInfo.date ? '#fff' : '#666',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  minWidth: '70px'
                }}
                onMouseOver={(e) => {
                  if (travelDate !== dateInfo.date) {
                    e.target.style.borderColor = '#4f76ff';
                    e.target.style.color = '#4f76ff';
                  }
                }}
                onMouseOut={(e) => {
                  if (travelDate !== dateInfo.date) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.color = '#666';
                  }
                }}
              >
                <div>{dateInfo.day}</div>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>{dateInfo.dayNum}</div>
                {dateInfo.isToday && <div style={{ fontSize: '10px' }}>Today</div>}
                {dateInfo.isTomorrow && <div style={{ fontSize: '10px' }}>Tomorrow</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #4f76ff 0%, #6b8fff 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '16px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 25px rgba(79, 118, 255, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 35px rgba(79, 118, 255, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 25px rgba(79, 118, 255, 0.3)';
          }}
        >
          🚌 Search Buses
        </button>
      </form>
    </div>
  );
};

export default EnhancedSearchForm;
