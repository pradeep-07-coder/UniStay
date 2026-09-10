import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { MapPin, Navigation, Calendar, X, CheckCircle, AlertCircle, Sparkles, ArrowRight, GraduationCap } from 'lucide-react';
import './Accommodations.css';
import universityIconImg from '../assets/University_Icon.png';
import accommodationIconImg from '../assets/Accommodation_Icon.png';

const mapContainerStyle = { width: '100%', height: '560px', borderRadius: '16px' };

const circleOptions = {
  strokeColor: '#2563EB',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#3B82F6',
  fillOpacity: 0.12,
  clickable: false,
  zIndex: 1,
};

export default function Accommodations() {
  const navigate = useNavigate(); // 2. Initialized navigate hook
  const { user } = useAuth();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedAccId, setHighlightedAccId] = useState(null);

  // Booking Modal State
  const [selectedListing, setSelectedListing] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState({ type: '', text: '' });

  const cardRefs = useRef({});
  const mapRef = useRef(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      fetchAccommodationsByUni(selectedUniversity.university_id);
      if (mapRef.current && selectedUniversity.latitude && selectedUniversity.longitude) {
        const lat = parseFloat(selectedUniversity.latitude);
        const lng = parseFloat(selectedUniversity.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          mapRef.current.panTo({ lat, lng });
        }
      }
    }
  }, [selectedUniversity]);

  const fetchUniversities = async () => {
    try {
      const res = await API.get('/accommodations/universities/list');
      const unis = res.data.data.universities;
      setUniversities(unis);
      if (unis.length > 0) {
        setSelectedUniversity(unis[0]); // Select first university by default
      }
    } catch (err) {
      console.error('Fetch Universities Error:', err);
    }
  };

  const fetchAccommodationsByUni = async (uniId) => {
    setLoading(true);
    try {
      const res = await API.get(`/accommodations?university_id=${uniId}`);
      setAccommodations(res.data.data.accommodations);
    } catch (err) {
      console.error('Fetch Accommodations Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (accId) => {
    setHighlightedAccId(accId);
    if (cardRefs.current[accId]) {
      cardRefs.current[accId].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'student') {
      setBookingMsg({ type: 'error', text: 'You must be logged in as a Student to place a booking.' });
      return;
    }

    setBookingLoading(true);
    setBookingMsg({ type: '', text: '' });

    try {
      await API.post('/bookings', {
        accommodation_id: selectedListing.accommodation_id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
      });

      setBookingMsg({ type: 'success', text: '✅ Booking request successfully sent!' });
      setTimeout(() => {
        setSelectedListing(null);
        setBookingMsg({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      setBookingMsg({ type: 'error', text: err.response?.data?.message || 'Failed to place booking request.' });
    } finally {
      setBookingLoading(false);
    }
  };

  const uniCenter = selectedUniversity ? {
    lat: parseFloat(selectedUniversity.latitude),
    lng: parseFloat(selectedUniversity.longitude)
  } : { lat: 6.9271, lng: 79.8612 };

  return (
    <div className="container accommodations-page">
      {/* 1. TOP SECTION: UNIVERSITY SELECTION BADGES */}
      <div className="university-pills-bar">
        {universities.map((uni) => (
          <button
            key={uni.university_id}
            className={`uni-pill ${selectedUniversity?.university_id === uni.university_id ? 'active' : ''}`}
            onClick={() => setSelectedUniversity(uni)}
          >
            <GraduationCap size={15} />
            <span>{uni.name}</span>
          </button>
        ))}
      </div>

      {/* 2. SPLIT VIEW SECTION: MAP & SIDEBAR */}
      <div className="map-split-container">
        {/* LEFT: GOOGLE MAP WITH 5KM RADIUS CIRCLE */}
        <div className="map-wrapper">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={uniCenter}
              zoom={13}
              onLoad={(map) => {
                mapRef.current = map;
              }}
            >
              {/* 5 Km Radius Circle strictly around Selected University ONLY (no circle on other places/districts) */}
              {selectedUniversity && selectedUniversity.latitude && selectedUniversity.longitude && (
                <Circle
                  center={{
                    lat: parseFloat(selectedUniversity.latitude),
                    lng: parseFloat(selectedUniversity.longitude),
                  }}
                  radius={5000}
                  options={{
                    ...circleOptions,
                    center: {
                      lat: parseFloat(selectedUniversity.latitude),
                      lng: parseFloat(selectedUniversity.longitude),
                    },
                    radius: 5000,
                  }}
                />
              )}

              {/* University Marker with Custom Icon */}
              {selectedUniversity && selectedUniversity.latitude && selectedUniversity.longitude && (
                <Marker
                  position={{
                    lat: parseFloat(selectedUniversity.latitude),
                    lng: parseFloat(selectedUniversity.longitude),
                  }}
                  title={selectedUniversity.name}
                  icon={{
                    url: universityIconImg,
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                />
              )}

              {/* Accommodation Markers */}
              {accommodations.map((acc) => {
                const isHovered = highlightedAccId === acc.accommodation_id;
                return (
                  <Marker
                    key={acc.accommodation_id}
                    position={{ lat: parseFloat(acc.latitude), lng: parseFloat(acc.longitude) }}
                    title={acc.title}
                    icon={{
                      url: accommodationIconImg,
                      scaledSize: isHovered
                        ? new window.google.maps.Size(50, 50)
                        : new window.google.maps.Size(35, 35),
                    }}
                    onClick={() => handleMarkerClick(acc.accommodation_id)}
                    onMouseOver={() => setHighlightedAccId(acc.accommodation_id)}
                    onMouseOut={() => setHighlightedAccId(null)}
                  />
                );
              })}
            </GoogleMap>
          ) : (
            <div className="map-placeholder">Loading Map Engine...</div>
          )}
        </div>

        {/* RIGHT: SIDEBAR ACCOMMODATION LIST */}
        <div className="sidebar-list">
          <div className="sidebar-header-bar">
            <span className="sidebar-results-count">
              {loading ? 'Searching...' : `${accommodations.length} Properties Nearby`}
            </span>
            <span className="sidebar-radius-badge">5 km Map Radius</span>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading nearby properties...</div>
          ) : accommodations.length === 0 ? (
            <div className="no-properties">
              <MapPin size={36} />
              <p>No accommodations found within 5 km of {selectedUniversity?.name}.</p>
            </div>
          ) : (
            accommodations.map((acc) => (
              <div
                key={acc.accommodation_id}
                ref={(el) => (cardRefs.current[acc.accommodation_id] = el)}
                className={`sidebar-card ${highlightedAccId === acc.accommodation_id ? 'highlighted' : ''}`}
                onClick={() => setHighlightedAccId(acc.accommodation_id)}
              >
                <div className="sidebar-card-img-wrapper">
                  <img
                    src={acc.image_urls?.[0] || acc.images?.[0] || acc.image_url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'}
                    alt={acc.title}
                    className="sidebar-card-img"
                    loading="lazy"
                  />
                  <div className="card-img-badges">
                    <span className="card-badge-type">
                      <Sparkles size={11} /> {acc.room_type || 'Verified Space'}
                    </span>
                    <span className="card-badge-price">
                      LKR {parseFloat(acc.price_per_month).toLocaleString()}<small>/mo</small>
                    </span>
                  </div>
                </div>
                <div className="sidebar-card-content">
                  <h4>{acc.title}</h4>
                  <p className="card-street">
                    <MapPin size={13} className="card-pin-icon" />
                    <span>{acc.street ? `${acc.street}, ` : ''}{acc.city}</span>
                  </p>

                  <div className="card-tags">
                    {acc.distance_km && (
                      <span className="distance-badge">
                        <Navigation size={12} /> {parseFloat(acc.distance_km).toFixed(1)} km away
                      </span>
                    )}
                    <span className="amenity-chip">{acc.ac_status ? 'A/C' : 'Non-A/C'}</span>
                    {acc.rooms_available && (
                      <span className="amenity-chip rooms-chip">{acc.rooms_available} Rooms</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/accommodations/${acc.accommodation_id}`);
                    }}
                    className="btn btn-primary btn-sm btn-block card-action-btn"
                  >
                    <span>View Details</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {selectedListing && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Book Accommodation</h2>
              <button className="close-btn" onClick={() => setSelectedListing(null)}><X size={20} /></button>
            </div>

            <div className="modal-body">
              <div className="listing-summary">
                <h4>{selectedListing.title}</h4>
                <p>Price: <strong>LKR {parseFloat(selectedListing.price_per_month).toLocaleString()} / month</strong></p>
              </div>

              {bookingMsg.text && (
                <div className={`status-box ${bookingMsg.type}`}>
                  {bookingMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{bookingMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="form-group">
                  <label><Calendar size={16} /> Check-In Date</label>
                  <input type="date" required value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label><Calendar size={16} /> Check-Out Date (Optional)</label>
                  <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setSelectedListing(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
                    {bookingLoading ? 'Sending...' : 'Confirm Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}