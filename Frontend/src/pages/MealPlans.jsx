import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { Utensils, GraduationCap, ArrowRight, Sparkles, MapPin, Navigation } from 'lucide-react';
import mealPlanIconImg from '../assets/MealPlan_Icon.png';
import universityIconImg from '../assets/University_Icon.png';
import './MealPlans.css';

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

export default function MealPlans() {
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedPlanId, setHighlightedPlanId] = useState(null);

  const cardRefs = useRef({});
  const mapRef = useRef(null);

  useEffect(() => {
    API.get('/accommodations/universities/list').then(res => {
      const unis = res.data.data.universities || [];
      setUniversities(unis);
      if (unis.length > 0) setSelectedUniversity(unis[0]);
    });
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      setLoading(true);
      API.get(`/meal-plans?university_id=${selectedUniversity.university_id}`)
        .then(res => setMealPlans(res.data.data.meal_plans || []))
        .finally(() => setLoading(false));

      if (mapRef.current && selectedUniversity.latitude && selectedUniversity.longitude) {
        const lat = parseFloat(selectedUniversity.latitude);
        const lng = parseFloat(selectedUniversity.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          mapRef.current.panTo({ lat, lng });
        }
      }
    }
  }, [selectedUniversity]);

  const handleMarkerClick = (planId) => {
    setHighlightedPlanId(planId);
    if (cardRefs.current[planId]) {
      cardRefs.current[planId].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const uniCenter = selectedUniversity ? {
    lat: parseFloat(selectedUniversity.latitude),
    lng: parseFloat(selectedUniversity.longitude)
  } : { lat: 6.9271, lng: 79.8612 };

  return (
    <div className="container meal-plans-page">
      {/* 1. UNIVERSITY FILTER BADGES */}
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

      {/* 2. SPLIT MAP VIEW */}
      <div className="map-split-container">
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
              {/* 5 Km Radius Circle strictly around Selected University ONLY */}
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

              {/* Meal Plan Markers */}
              {mealPlans.map((plan) => (
                <Marker
                  key={plan.meal_plan_id}
                  position={{ lat: parseFloat(plan.latitude || 6.795), lng: parseFloat(plan.longitude || 79.900) }}
                  title={plan.plan_name}
                  icon={{
                    url: mealPlanIconImg,
                    scaledSize: highlightedPlanId === plan.meal_plan_id 
                      ? new window.google.maps.Size(50, 50) 
                      : new window.google.maps.Size(35, 35)
                  }}
                  onClick={() => handleMarkerClick(plan.meal_plan_id)}
                  onMouseOver={() => setHighlightedPlanId(plan.meal_plan_id)}
                  onMouseOut={() => setHighlightedPlanId(null)}
                />
              ))}
            </GoogleMap>
          ) : <div className="map-placeholder">Loading Map Engine...</div>}
        </div>

        {/* SIDEBAR MEAL PLAN LIST */}
        <div className="sidebar-list">
          <div className="sidebar-header-bar">
            <span className="sidebar-results-count">
              {loading ? 'Finding catering plans...' : `${mealPlans.length} Dining Plans Nearby`}
            </span>
            <span className="sidebar-radius-badge">5 km Map Radius</span>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading nearby meal plans...</div>
          ) : mealPlans.length === 0 ? (
            <div className="no-properties">
              <Utensils size={36} />
              <p>No meal plans found within 5 km of {selectedUniversity?.name}.</p>
            </div>
          ) : (
            mealPlans.map((plan) => (
              <div 
                key={plan.meal_plan_id} 
                ref={(el) => (cardRefs.current[plan.meal_plan_id] = el)}
                className={`sidebar-card sidebar-card-meal ${highlightedPlanId === plan.meal_plan_id ? 'highlighted' : ''}`}
                onClick={() => setHighlightedPlanId(plan.meal_plan_id)}
              >
                <div className="sidebar-card-img-wrapper">
                  <img 
                    src={plan.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                    alt={plan.plan_name}
                    className="sidebar-card-img"
                    loading="lazy"
                  />
                  <div className="card-img-badges">
                    <span className="card-badge-type meal-badge-type">
                      <Sparkles size={11} /> Campus Catering
                    </span>
                    {Number(plan.price) > 0 && (
                      <span className="card-badge-price badge-price-amber">
                        LKR {parseFloat(plan.price).toLocaleString()}<small>/plan</small>
                      </span>
                    )}
                  </div>
                </div>
                <div className="sidebar-card-content">
                  <h4>{plan.plan_name}</h4>
                  <p className="card-street">
                    <Utensils size={13} className="card-pin-icon meal-icon-tint" />
                    <span>{plan.business_name || 'Verified Culinary Provider'} &bull; {plan.city}</span>
                  </p>
                  
                  <div className="card-tags">
                    {plan.distance_km && (
                      <span className="distance-badge">
                        <Navigation size={12} /> {parseFloat(plan.distance_km).toFixed(1)} km away
                      </span>
                    )}
                    <span className="amenity-chip">{plan.university_name || plan.city || 'Campus Delivery'}</span>
                    <span className="amenity-chip meal-qr-chip">Digital Barcode Pass</span>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/meal-plans/${plan.meal_plan_id}`); }}
                    className="btn btn-primary btn-sm btn-block card-action-btn btn-meal-action"
                  >
                    <span>View Meal Plan</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}