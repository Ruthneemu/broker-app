import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import './index.css';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ouscjkmgdsnzakairivo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91c2Nqa21nZHNuemFrYWlyaXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzY0MzYsImV4cCI6MjA3MTUxMjQzNn0.ii49ymR7Bi7WZTYOkYnE1-kJIlZ7DV5xR_tM3kbX-MU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Header Component
const Header = ({ currentView, setCurrentView, isLoggedIn, session, showProfileModal, setShowProfileModal, profileForm, setProfileForm, handleProfileChange, handleLogout, setShowLoginModal, setShowRegistrationModal }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const handleCategorySelect = (category) => {
    setCurrentView(category);
    navigate(`/${category}`);
    setShowDropdown(false);
  };
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-blue-600">Broker</span><span className="text-gray-800">Connect</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-1">
            <button
              type="button"
              onClick={() => {
                setCurrentView('public');
                navigate('/');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'public' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Home
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center"
              >
                Categories
                <i className="fas fa-chevron-down ml-2 text-xs"></i>
              </button>
              {showDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('apartments')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Apartments
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('cars')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Cars
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('land')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Land
                  </button>
                </div>
              )}
            </div>
            {isLoggedIn && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentView('private')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'private' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  My Listings
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('favorites')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === 'favorites' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Favorites
                </button>
              </>
            )}
            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {session.user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700">{session.user.email.split('@')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm({ name: session.user.user_metadata.name || '' });
                      setShowProfileModal(true);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Update Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button 
                  type="button"
                  onClick={() => setShowLoginModal(true)} 
                  className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
                <button 
                  type="button"
                  onClick={() => setShowRegistrationModal(true)} 
                  className="ml-2 px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </nav>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-700">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
// Home Page Component
const HomePage = ({ setCurrentView, isLoggedIn, setShowAddForm }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to BrokerConnect</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your ultimate marketplace for premium apartments, reliable cars, and valuable land. 
            Discover your next great investment with ease, precision, and trust.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => {
                setCurrentView('apartments');
                navigate('/apartments');
              }}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              Browse Apartments
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('cars');
                navigate('/cars');
              }}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors"
            >
              Browse Cars
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('land');
                navigate('/land');
              }}
              className="px-8 py-3 bg-yellow-600 text-white font-semibold rounded-lg shadow hover:bg-yellow-700 transition-colors"
            >
              Browse Land
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-building text-blue-600 text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Apartments</h3>
            <p className="text-gray-600 mb-6">Discover luxury apartments in prime locations with top-notch amenities.</p>
            <button
              type="button"
              onClick={() => {
                setCurrentView('apartments');
                navigate('/apartments');
              }}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Apartments
            </button>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-car text-green-600 text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Reliable Cars</h3>
            <p className="text-gray-600 mb-6">Find quality vehicles from trusted sellers with verified history reports.</p>
            <button
              type="button"
              onClick={() => {
                setCurrentView('cars');
                navigate('/cars');
              }}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              View Cars
            </button>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-yellow-200">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-tree text-yellow-600 text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Valuable Land</h3>
            <p className="text-gray-600 mb-6">Invest in prime land parcels with great potential for development.</p>
            <button
              type="button"
              onClick={() => {
                setCurrentView('land');
                navigate('/land');
              }}
              className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              View Land
            </button>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Listings</h3>
              <p className="text-gray-600">Explore our extensive collection of properties, vehicles, and land.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect with Brokers</h3>
              <p className="text-gray-600">Get in touch with professional brokers for expert guidance.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Make Your Investment</h3>
              <p className="text-gray-600">Secure your next great investment with confidence and ease.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
// Category Listings Page Component
const CategoryListingsPage = ({ 
  category, 
  title, 
  colorClass, 
  listings, 
  loading, 
  currentImageIndex, 
  handleSelectListing, 
  handleToggleFavorite, 
  favorites, 
  isLoggedIn, 
  handleOpenChat, 
  setListingForReview, 
  setShowReviewModal, 
  handleShareListing, 
  handleOpenNotesModal, 
  currentView,
  userId
}) => {
  const navigate = useNavigate();
  const getCategoryIcon = () => {
    switch(category) {
      case 'apartments': return 'fas fa-building';
      case 'cars': return 'fas fa-car';
      case 'land': return 'fas fa-tree';
      default: return 'fas fa-home';
    }
  };
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              <span>Back to Home</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder={`Search by title, description, or location...`}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <button
              type="button"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <i className="fas fa-search mr-2"></i>
              Search
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            <div className="text-center text-gray-500 text-xl font-semibold col-span-full py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p>Loading listings...</p>
            </div>
          ) : listings.length > 0 ? (
            listings.filter(listing => listing.type === category.slice(0, -1)).map(listing => (
              <div
                key={listing.id}
                onClick={() => handleSelectListing(listing.id)}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue-300 cursor-pointer"
              >
                {listing.image_urls && listing.image_urls.length > 0 ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={listing.image_urls[currentImageIndex[listing.id] || 0]}
                      alt={`Listing at ${listing.address}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex space-x-2">
                      {isLoggedIn && (
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(listing.id); }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${
                            favorites.includes(listing.id) 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white/80 text-gray-700'
                          }`}
                        >
                          <i className={`fas ${favorites.includes(listing.id) ? 'fa-heart' : 'fa-heart'} text-lg`}></i>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <i className="fas fa-home text-4xl mb-2"></i>
                      <p>No Image Available</p>
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-1">{listing.address}</h2>
                      <p className="text-gray-600 text-sm">{listing.city}</p>
                    </div>
                    <div className="text-xl font-bold text-blue-600 mb-3">
                      ${new Intl.NumberFormat().format(listing.price)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {isLoggedIn && (
                      <>
                        {listing.owner_id === userId ? (
                          <>
                            <button className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm">
                              <i className="fas fa-edit mr-1"></i> Edit
                            </button>
                            <button className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm">
                              <i className="fas fa-trash mr-1"></i> Delete
                            </button>
                          </>
                        ) : (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(listing.id);
                            }}
                            className={`flex-1 text-center px-3 py-2 font-medium rounded-lg transition-colors text-sm ${
                              favorites.includes(listing.id) 
                                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <i className={`fas ${favorites.includes(listing.id) ? 'fa-heart' : 'fa-heart'} mr-1`}></i>
                            {favorites.includes(listing.id) ? 'Saved' : 'Save'}
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleOpenChat(listing); }}
                          className="flex-1 text-center px-3 py-2 bg-blue-100 text-blue-600 font-medium rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          <i className="fas fa-comment mr-1"></i> Chat
                        </button>
                      </>
                    )}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setListingForReview(listing);
                        setShowReviewModal(true);
                      }}
                      className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <i className="fas fa-star mr-1"></i> Reviews
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareListing(listing);
                      }}
                      className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <i className="fas fa-share-alt mr-1"></i> Share
                    </button>
                    {currentView === 'favorites' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenNotesModal(listing);
                        }}
                        className="flex-1 text-center px-3 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition-colors text-sm"
                      >
                        <i className="fas fa-sticky-note mr-1"></i> Note
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 text-xl font-semibold col-span-full py-12">
              <i className={`fas ${getCategoryIcon()} text-4xl mb-4 text-gray-300`}></i>
              <p>No listings found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
// Listing Detail Page Component
const ListingDetailPage = ({ 
  selectedListing, 
  currentImageIndex, 
  handlePrevImage, 
  handleNextImage, 
  renderStars, 
  getAverageRating, 
  isLoggedIn, 
  favorites, 
  handleToggleFavorite, 
  setListingForReview, 
  setShowReviewModal, 
  setCurrentListing, 
  setUploadedImage, 
  setShowEditModal, 
  handleOpenChat,
  userId
}) => {
  const navigate = useNavigate();
  if (!selectedListing) {
    return <div>Loading...</div>;
  }
  const getCategoryColor = () => {
    switch(selectedListing.type) {
      case 'house': return 'from-blue-600 to-indigo-700';
      case 'car': return 'from-green-600 to-emerald-700';
      case 'land': return 'from-red-600 to-orange-700';
      default: return 'from-gray-600 to-gray-700';
    }
  };
  const getCategoryName = () => {
    switch(selectedListing.type) {
      case 'house': return 'Apartment';
      case 'car': return 'Car';
      case 'land': return 'Land';
      default: return 'Property';
    }
  };
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className={`bg-gradient-to-r ${getCategoryColor()} py-6`}>
        <div className="max-w-7xl mx-auto px-6">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-gray-200 transition-colors mb-4"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            <span>Back to List</span>
          </button>
          <h1 className="text-3xl font-bold text-white">{selectedListing.address}</h1>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative w-full h-80 md:h-[500px]">
            <img
              src={selectedListing.image_urls[currentImageIndex[selectedListing.id] || 0]}
              alt={`Property at ${selectedListing.address}`}
              className="w-full h-full object-cover"
            />
            {selectedListing.image_urls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handlePrevImage(selectedListing.id, selectedListing.image_urls); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNextImage(selectedListing.id, selectedListing.image_urls); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}
          </div>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{selectedListing.address}</h1>
                <p className="text-lg text-gray-600">{selectedListing.city}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-3xl font-bold text-blue-600">${new Intl.NumberFormat().format(selectedListing.price)}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-700 mb-8">
              {selectedListing.type === 'house' && selectedListing.details && (
                <>
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <i className="fas fa-bed text-blue-500 mr-2"></i>
                    <span className="font-medium">{selectedListing.details.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <i className="fas fa-bath text-blue-500 mr-2"></i>
                    <span className="font-medium">{selectedListing.details.bathrooms} Baths</span>
                  </div>
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <i className="fas fa-ruler-combined text-blue-500 mr-2"></i>
                    <span className="font-medium">{selectedListing.details.sqft} sqft</span>
                  </div>
                </>
              )}
              {selectedListing.type === 'car' && selectedListing.details && (
                <>
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <i className="fas fa-car text-blue-500 mr-2"></i>
                    <span className="font-medium">{selectedListing.details.make} {selectedListing.details.model}</span>
                  </div>
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <i className="fas fa-tachometer-alt text-blue-500 mr-2"></i>
                    <span className="font-medium">{selectedListing.details.mileage} miles</span>
                  </div>
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <i className="fas fa-calendar-alt text-blue-500 mr-2"></i>
                    <span className="font-medium">{selectedListing.details.year}</span>
                  </div>
                </>
              )}
              {selectedListing.type === 'land' && selectedListing.details && (
                <>
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <i className="fas fa-tree text-blue-500 mr-2"></i>
                    <span className="font-medium">{selectedListing.details.acres} Acres</span>
                  </div>
                  <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                    <i className="fas fa-ruler text-blue-500 mr-2"></i>
                    <span className="font-medium">{selectedListing.details.zoning}</span>
                  </div>
                </>
              )}
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{selectedListing.description}</p>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Reviews</h3>
              <div className="flex items-center space-x-2">
                {renderStars(getAverageRating(selectedListing.reviews))}
                <span className="text-gray-600">({selectedListing.reviews.length} reviews)</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Broker</h3>
                <p className="text-gray-600 mb-6">Interested in this {getCategoryName().toLowerCase()}? Reach out to the broker for more details or to schedule a viewing.</p>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-6">
                  <div className="flex items-center mb-4">
                    <i className="fas fa-envelope text-blue-600 mr-3"></i>
                    <span className="font-medium">broker@example.com</span>
                  </div>
                  <p className="text-gray-600 text-sm">Response time: Usually within 24 hours</p>
                </div>
                <form className="space-y-4">
                  <div>
                    <input type="text" placeholder="Your Name" required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <input type="email" placeholder="Your Email" required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <textarea placeholder="Your Message" rows="4" required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>
                  <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Send Message
                  </button>
                </form>
              </div>
              <div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setListingForReview(selectedListing);
                        setShowReviewModal(true);
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <i className="fas fa-star mr-2 text-yellow-500"></i>
                      View Reviews
                    </button>
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(selectedListing.id);
                        }}
                        className={`w-full px-4 py-3 font-medium rounded-lg transition-colors flex items-center justify-center ${
                          favorites.includes(selectedListing.id) 
                            ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100' 
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <i className={`fas ${favorites.includes(selectedListing.id) ? 'fa-heart' : 'fa-heart'} mr-2`}></i>
                        {favorites.includes(selectedListing.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                      </button>
                    )}
                    {isLoggedIn && selectedListing.owner_id === userId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentListing(selectedListing);
                          setUploadedImage(null);
                          setShowEditModal(true);
                        }}
                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <i className="fas fa-edit mr-2 text-blue-500"></i>
                        Edit Listing
                      </button>
                    )}
                    {isLoggedIn && selectedListing.owner_id !== userId && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleOpenChat(selectedListing); }}
                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <i className="fas fa-comment mr-2 text-green-500"></i>
                        Chat with Broker
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
// Main App Component
const App = () => {
  const [session, setSession] = useState(null);
  const [listings, setListings] = useState([]);
  const [currentView, setCurrentView] = useState('public');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentListing, setCurrentListing] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [listingForReview, setListingForReview] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [listingForChat, setListingForChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '' });
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [filters] = useState({
    priceMin: '',
    priceMax: '',
    bedroomsMin: '',
    bathroomsMin: '',
    sqftMin: '',
  });
  const [listingType, setListingType] = useState('house'); 
  const [formDetails, setFormDetails] = useState({});
  const [selectedType] = useState(null);
  const [carFilters] = useState({ make: '', mileageMax: '' });
  const [landFilters] = useState({ acresMax: '', zoning: '' });
  const [searchTerm] = useState('');
  // Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });
  const mapCenter = useMemo(() => ({ lat: 34.0522, lng: -118.2437 }), []);
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('listings').select('*');
      if (selectedType) {
        query = query.eq('type', selectedType);
      }
      if (searchTerm) {
        query = query.textSearch('search_vector', searchTerm, {
          config: 'english',
          type: 'websearch'
        });
      }
      if (filters.priceMin) {
        query = query.gte('price', parseFloat(filters.priceMin));
      }
      if (filters.priceMax) {
        query = query.lte('price', parseFloat(filters.priceMax));
      }
      if (filters.bedroomsMin) {
        query = query.gte('details->>bedrooms', parseInt(filters.bedroomsMin, 10));
      }
      if (filters.bathroomsMin) {
        query = query.gte('details->>bathrooms', parseInt(filters.bathroomsMin, 10));
      }
      if (filters.sqftMin) {
        query = query.gte('details->>sqft', parseInt(filters.sqftMin, 10));
      }
      if (selectedType === 'car' && carFilters.make) {
        query = query.ilike('details->>make', `%${carFilters.make}%`);
      }
      if (selectedType === 'car' && carFilters.mileageMax) {
        query = query.lte('details->>mileage', parseFloat(carFilters.mileageMax));
      }
      if (selectedType === 'land' && landFilters.acresMax) {
        query = query.lte('details->>acres', parseFloat(landFilters.acresMax));
      }
      if (selectedType === 'land' && landFilters.zoning) {
        query = query.ilike('details->>zoning', `%${landFilters.zoning}%`);
      }
      const { data: listingsData, error: listingsError } = await query;
      if (listingsError) throw listingsError;
      setListings(listingsData);
      if (session) {
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('favorites')
          .select('listing_id');
        if (favoritesError) throw favoritesError;
        setFavorites(favoritesData.map(fav => fav.listing_id));
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchTerm, filters, carFilters, landFilters, session]);
 useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setSession(session);
      fetchListings();
    }
  );
  return () => {
    authListener.subscription.unsubscribe();
  };
}, [fetchListings]); 
 useEffect(() => {
  fetchListings();
}, [fetchListings]);
  const trackListingView = async (listingId) => {
    if (!session?.user?.id) return;
    try {
      await supabase.from('listing_views').insert({
        listing_id: listingId,
        viewer_id: session.user.id,
      });
    } catch (error) {
      console.error('Error tracking listing view:', error.message);
    }
  };
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };
  const handleSelectListing = (listingId) => {
    setSelectedListingId(listingId);
    if (session?.user?.id) {
      trackListingView(listingId);
    }
  };
  useEffect(() => {
    if (listingForChat && session) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('listing_id', listingForChat.id)
          .order('created_at', { ascending: true });
        if (error) {
          console.error("Error fetching messages:", error);
        } else {
          setChatMessages(data);
        }
      };
      fetchMessages();
      const channel = supabase
        .channel(`chat-room-${listingForChat.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `listing_id=eq.${listingForChat.id}`,
          },
          (payload) => {
            setChatMessages(prevMessages => [...prevMessages, payload.new]);
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [listingForChat, session]);
  const userId = session?.user?.id;
  const isLoggedIn = !!session;
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
  const generateListingImage = async (listingDetails) => {
    setIsGeneratingImage(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const imageUrl = `https://loremflickr.com/640/480/${listingDetails.bedrooms} bed ${listingDetails.bathrooms} bath, ${listingDetails.city}, real estate?lock=${Math.floor(Math.random() * 1000)}`;
        setIsGeneratingImage(false);
        resolve(imageUrl);
      }, 2000);
    });
  };
  const uploadImage = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `listings/${fileName}`;
    try {
      const { error } = await supabase.storage
        .from('listing_photos')
        .upload(filePath, file);
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from('listing_photos')
        .getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error.message);
      return null;
    }
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
    } else {
      setUploadedImage(null);
    }
  };
  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  };
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`star-solid-${i}`} className="fas fa-star text-yellow-400"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="star-half" className="fas fa-star-half-alt text-yellow-400"></i>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<i key={`star-empty-${i}`} className="far fa-star text-gray-400"></i>);
    }
    return <div className="flex space-x-0.5">{stars}</div>;
  };
  const handleAddListing = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imageUrls = [];
    if (uploadedImage) {
      const url = await uploadImage(uploadedImage);
      if (url) {
        imageUrls.push(url);
      }
    } else {
      const aiImageUrl = await generateListingImage({
        city: formDetails.city,
        bedrooms: formDetails.bedrooms,
        bathrooms: formDetails.bathrooms,
      });
      imageUrls.push(aiImageUrl);
    }
    const newListing = {
      type: listingType,
      address: formDetails.address,
      city: formDetails.city,
      price: parseInt(formDetails.price, 10),
      latitude: parseFloat(formDetails.latitude),
      longitude: parseFloat(formDetails.longitude),
      description: formDetails.description,
      image_urls: imageUrls,
      reviews: [],
      owner_id: userId,
      details: formDetails.details,
    };
    try {
      const { error } = await supabase.from('listings').insert([newListing]);
      if (error) {
        throw error;
      }
      await fetchListings();
      setShowAddForm(false);
      setUploadedImage(null);
      setListingType('house');
      setFormDetails({});
    } catch (error) {
      console.error('Error adding listing:', error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteListing = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);
      if (error) {
        throw error;
      }
      await fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error.message);
    } finally {
      setShowConfirmDeleteModal(false);
      setListingToDelete(null);
      setLoading(false);
    }
  };
  const handleUpdateListing = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imageUrls = currentListing.image_urls;
    if (uploadedImage) {
      const url = await uploadImage(uploadedImage);
      if (url) {
        imageUrls = [url];
      }
    }
    const updatedListing = {
      ...currentListing,
      address: formDetails.address,
      city: formDetails.city,
      price: parseInt(formDetails.price, 10),
      latitude: parseFloat(formDetails.latitude),
      longitude: parseFloat(formDetails.longitude),
      description: formDetails.description,
      image_urls: imageUrls,
      details: formDetails.details,
    };
    try {
      const { error } = await supabase
        .from('listings')
        .update(updatedListing)
        .eq('id', currentListing.id);
      if (error) {
        throw error;
      }
      await fetchListings();
      setShowEditModal(false);
      setCurrentListing(null);
      setUploadedImage(null);
    } catch (error) {
      console.error('Error updating listing:', error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleAddReview = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newReview = {
      reviewer_id: userId,
      rating: parseInt(form.rating.value, 10),
      review_text: form.reviewText.value,
    };
    const updatedReviews = [...listingForReview.reviews, newReview];
    try {
      const { error } = await supabase
        .from('listings')
        .update({ reviews: updatedReviews })
        .eq('id', listingForReview.id);
      if (error) {
        throw error;
      }
      await fetchListings();
      setShowAddReviewModal(false);
      setShowReviewModal(true);
    } catch (error) {
      console.error('Error adding review:', error.message);
    }
  };
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: profileForm.name },
      });
      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error.message);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleToggleFavorite = async (listingId) => {
    if (!userId) {
      alert("Please log in to add favorites.");
      return;
    }
    const isFavorite = favorites.includes(listingId);
    setLoading(true);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', listingId);
        if (error) throw error;
        const { error: noteError } = await supabase
          .from('private_notes')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', listingId);
        if (noteError) console.error("Error deleting private note:", noteError);
        setFavorites(favorites.filter(id => id !== listingId));
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: userId, listing_id: listingId }]);
        if (error) throw error;
        setFavorites([...favorites, listingId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleOpenChat = (listing) => {
    if (!isLoggedIn) {
      alert("Please log in to chat with a broker.");
      return;
    }
    setListingForChat(listing);
    setShowChatModal(true);
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !userId || !listingForChat) return;
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          listing_id: listingForChat.id,
          user_id: userId,
          content: newChatMessage,
        });
      if (error) {
        throw error;
      }
      setNewChatMessage('');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };
  const scrollToBottom = () => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const handleShareListing = async (listing) => {
    const listingUrl = `${window.location.origin}?listingId=${listing.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(listingUrl);
        alert('Listing link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy text:', err);
        alert('Failed to copy link. Please try again.');
      }
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = listingUrl;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        alert('Listing link copied to clipboard!');
      } catch (err) {
        console.error('Fallback: Failed to copy text:', err);
        alert('Failed to copy link. Please copy it manually from the URL bar.');
      }
      document.body.removeChild(textarea);
    }
  };
  const handleNextImage = (listingId, imageUrls) => {
    setCurrentImageIndex(prev => {
      const currentIndex = prev[listingId] || 0;
      const nextIndex = (currentIndex + 1) % imageUrls.length;
      return { ...prev, [listingId]: nextIndex };
    });
  };
  const handlePrevImage = (listingId, imageUrls) => {
    setCurrentImageIndex(prev => {
      const currentIndex = prev[listingId] || 0;
      const prevIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
      return { ...prev, [listingId]: prevIndex };
    });
  };
  const handleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const name = form.name.value;
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      if (error) throw error;
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: authData.user.id, 
              email: authData.user.email,
              name: name,
              role: 'user'
            }
          ]);
        if (profileError) throw profileError;
      }
      alert('Registration successful! Please check your email to confirm your account.');
      setShowRegistrationModal(false);
      setShowLoginModal(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.value,
      password: form.password.value,
    });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      setShowLoginModal(false);
    }
  };
  const handleForgotPassword = async () => {
    const email = prompt('Please enter your email address to reset your password:');
    if (email) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        alert('Password reset email sent. Please check your inbox.');
      } catch (error) {
        console.error('Error sending password reset email:', error.message);
        alert('Error sending password reset email. Please try again.');
      }
    }
  };
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setFavorites([]);
    } catch (error) {
      console.error('Error signing out:', error.message);
      alert('Error signing out. Please try again.');
    }
  };
  const handleOpenNotesModal = async (listing) => {
    setCurrentListing(listing);
    setLoading(true);
    try {
      const result = await supabase
        .from('private_notes')
        .select('note_content')
        .eq('user_id', userId)
        .eq('listing_id', listing.id)
        .single();
      if (result.error && result.error.code !== 'PGRST116') throw result.error;
      setCurrentNote(result.data?.note_content || '');
      setShowNotesModal(true);
    } catch (error) {
      console.error('Error fetching private note:', error.message);
      setCurrentNote('');
    } finally {
      setLoading(false);
    }
  };
  const handleSaveNote = async () => {
    if (!currentListing || !userId) return;
    setLoading(true);
    try {
      const noteData = {
        user_id: userId,
        listing_id: currentListing.id,
        note_content: currentNote,
      };
      const { data: existingNote, error: fetchError } = await supabase
        .from('private_notes')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', currentListing.id)
        .single();
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      if (existingNote) {
        const { error: updateError } = await supabase
          .from('private_notes')
          .update(noteData)
          .eq('id', existingNote.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('private_notes')
          .insert(noteData);
        if (insertError) throw insertError;
      }
      setShowNotesModal(false);
      alert('Note saved successfully!');
    } catch (error) {
      console.error('Error saving note:', error.message);
      alert('Failed to save note.');
    } finally {
      setLoading(false);
    }
  };
  const selectedListing = selectedListingId ? listings.find(l => l.id === selectedListingId) : null;
  const renderMapAndListings = () => {
    if (loadError) return <div className="text-red-500 text-center font-semibold p-8">Error loading maps</div>;
    if (!isLoaded) return <div className="text-gray-500 text-center font-semibold p-8">Loading Map...</div>;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        <div className="h-[60vh] lg:h-[80vh] sticky top-28 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={10}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {listings.map((listing) => (
              <MarkerF
                key={listing.id}
                position={{ lat: listing.latitude, lng: listing.longitude }}
                onClick={() => handleSelectListing(listing.id)}
              />
            ))}
          </GoogleMap>
        </div>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {loading ? (
              <div className="text-center text-gray-500 text-xl font-semibold col-span-full py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p>Loading listings...</p>
              </div>
            ) : listings.length > 0 ? (
              listings.map(listing => (
                <div
                  key={listing.id}
                  onClick={() => handleSelectListing(listing.id)}
                  className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue-300 cursor-pointer"
                >
                  {listing.image_urls && listing.image_urls.length > 0 ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={listing.image_urls[currentImageIndex[listing.id] || 0]}
                        alt={`Listing at ${listing.address}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex space-x-2">
                        {isLoggedIn && (
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(listing.id); }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${
                              favorites.includes(listing.id) 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white/80 text-gray-700'
                            }`}
                          >
                            <i className={`fas ${favorites.includes(listing.id) ? 'fa-heart' : 'fa-heart'} text-lg`}></i>
                          </button>
                        )}
                      </div>
                      {listing.image_urls.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {listing.image_urls.map((_, index) => (
                            <span
                              key={index}
                              className={`block w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex[listing.id] ? 'bg-white' : 'bg-white/50'
                              }`}
                            ></span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <i className="fas fa-home text-4xl mb-2"></i>
                        <p>No Image Available</p>
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">{listing.address}</h2>
                        <p className="text-gray-600 text-sm">{listing.city}</p>
                      </div>
                      <div className="text-xl font-bold text-blue-600 mb-3">
                        ${new Intl.NumberFormat().format(listing.price)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {isLoggedIn && currentView === 'public' && (
                        <>
                          {listing.owner_id === userId ? (
                            <>
                              <button className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm">
                                <i className="fas fa-edit mr-1"></i> Edit
                              </button>
                              <button className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm">
                                <i className="fas fa-trash mr-1"></i> Delete
                              </button>
                            </>
                          ) : (
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(listing.id);
                              }}
                              className={`flex-1 text-center px-3 py-2 font-medium rounded-lg transition-colors text-sm ${
                                favorites.includes(listing.id) 
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <i className={`fas ${favorites.includes(listing.id) ? 'fa-heart' : 'fa-heart'} mr-1`}></i>
                              {favorites.includes(listing.id) ? 'Saved' : 'Save'}
                            </button>
                          )}
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleOpenChat(listing); }}
                            className="flex-1 text-center px-3 py-2 bg-blue-100 text-blue-600 font-medium rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <i className="fas fa-comment mr-1"></i> Chat
                          </button>
                        </>
                      )}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setListingForReview(listing);
                          setShowReviewModal(true);
                        }}
                        className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <i className="fas fa-star mr-1"></i> Reviews
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareListing(listing);
                        }}
                        className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <i className="fas fa-share-alt mr-1"></i> Share
                      </button>
                      {currentView === 'favorites' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenNotesModal(listing);
                          }}
                          className="flex-1 text-center px-3 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition-colors text-sm"
                        >
                          <i className="fas fa-sticky-note mr-1"></i> Note
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-xl font-semibold col-span-full py-12">
                <i className="fas fa-home text-4xl mb-4 text-gray-300"></i>
                <p>No listings found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderDynamicForm = (isEdit = false) => {
    const currentListingDetails = isEdit && currentListing ? currentListing.details : formDetails.details;
    const currentType = isEdit && currentListing ? currentListing.type : listingType;
    let dynamicFields = null;
    switch (currentType) {
      case 'house':
        dynamicFields = (
          <>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Bedrooms</label>
              <input type="number" name="bedrooms" placeholder="Number of bedrooms" required min="0" defaultValue={currentListingDetails?.bedrooms} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, bedrooms: e.target.value } })} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Bathrooms</label>
              <input type="number" name="bathrooms" placeholder="Number of bathrooms" required min="0" defaultValue={currentListingDetails?.bathrooms} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, bathrooms: e.target.value } })} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Square Feet</label>
              <input type="number" name="sqft" placeholder="Square footage" required min="0" defaultValue={currentListingDetails?.sqft} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, sqft: e.target.value } })} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </>
        );
        break;
      case 'car':
        dynamicFields = (
          <>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Make</label>
              <input type="text" name="make" placeholder="Car make" required defaultValue={currentListingDetails?.make} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, make: e.target.value } })} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Model</label>
              <input type="text" name="model" placeholder="Car model" required defaultValue={currentListingDetails?.model} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, model: e.target.value } })} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Year</label>
              <input type="number" name="year" placeholder="Year" required defaultValue={currentListingDetails?.year} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, year: e.target.value } })} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Mileage</label>
              <input type="number" name="mileage" placeholder="Mileage" required defaultValue={currentListingDetails?.mileage} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, mileage: e.target.value } })} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </>
        );
        break;
      case 'land':
        dynamicFields = (
          <>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Acres</label>
              <input type="number" step="any" name="acres" placeholder="Number of acres" required defaultValue={currentListingDetails?.acres} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, acres: e.target.value } })} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Zoning</label>
              <input type="text" name="zoning" placeholder="Zoning type" required defaultValue={currentListingDetails?.zoning} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, zoning: e.target.value } })} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </>
        );
        break;
      default:
        dynamicFields = null;
    }
    return dynamicFields;
  };
  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <Header 
          currentView={currentView}
          setCurrentView={setCurrentView}
          isLoggedIn={isLoggedIn}
          session={session}
          showProfileModal={showProfileModal}
          setShowProfileModal={setShowProfileModal}
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          handleProfileChange={handleProfileChange}
          handleLogout={handleLogout}
          setShowLoginModal={setShowLoginModal}
          setShowRegistrationModal={setShowRegistrationModal}
        />
        <Routes>
          <Route path="/" element={
            <HomePage 
              setCurrentView={setCurrentView}
              isLoggedIn={isLoggedIn}
              setShowAddForm={setShowAddForm}
            />
          } />
          <Route path="/apartments" element={
            <CategoryListingsPage 
              category="apartments"
              title="Apartment Listings"
              colorClass="from-blue-600 to-indigo-700"
              listings={listings}
              loading={loading}
              currentImageIndex={currentImageIndex}
              handleSelectListing={handleSelectListing}
              handleToggleFavorite={handleToggleFavorite}
              favorites={favorites}
              isLoggedIn={isLoggedIn}
              handleOpenChat={handleOpenChat}
              setListingForReview={setListingForReview}
              setShowReviewModal={setShowReviewModal}
              handleShareListing={handleShareListing}
              handleOpenNotesModal={handleOpenNotesModal}
              currentView={currentView}
              userId={userId}
            />
          } />
          <Route path="/cars" element={
            <CategoryListingsPage 
              category="cars"
              title="Car Listings"
              colorClass="from-green-600 to-emerald-700"
              listings={listings}
              loading={loading}
              currentImageIndex={currentImageIndex}
              handleSelectListing={handleSelectListing}
              handleToggleFavorite={handleToggleFavorite}
              favorites={favorites}
              isLoggedIn={isLoggedIn}
              handleOpenChat={handleOpenChat}
              setListingForReview={setListingForReview}
              setShowReviewModal={setShowReviewModal}
              handleShareListing={handleShareListing}
              handleOpenNotesModal={handleOpenNotesModal}
              currentView={currentView}
              userId={userId}
            />
          } />
          <Route path="/land" element={
            <CategoryListingsPage 
              category="land"
              title="Land Listings"
              colorClass="from-yellow-600 to-orange-700"
              listings={listings}
              loading={loading}
              currentImageIndex={currentImageIndex}
              handleSelectListing={handleSelectListing}
              handleToggleFavorite={handleToggleFavorite}
              favorites={favorites}
              isLoggedIn={isLoggedIn}
              handleOpenChat={handleOpenChat}
              setListingForReview={setListingForReview}
              setShowReviewModal={setShowReviewModal}
              handleShareListing={handleShareListing}
              handleOpenNotesModal={handleOpenNotesModal}
              currentView={currentView}
              userId={userId}
            />
          } />
          <Route path="/listing/:id" element={
            <ListingDetailPage 
              selectedListing={selectedListing}
              currentImageIndex={currentImageIndex}
              handlePrevImage={handlePrevImage}
              handleNextImage={handleNextImage}
              renderStars={renderStars}
              getAverageRating={getAverageRating}
              isLoggedIn={isLoggedIn}
              favorites={favorites}
              handleToggleFavorite={handleToggleFavorite}
              setListingForReview={setListingForReview}
              setShowReviewModal={setShowReviewModal}
              setCurrentListing={setCurrentListing}
              setUploadedImage={setUploadedImage}
              setShowEditModal={setShowEditModal}
              handleOpenChat={handleOpenChat}
              userId={userId}
            />
          } />
          <Route path="*" element={
            currentView === 'public' ? (
              <div className="max-w-7xl mx-auto px-6 py-8">
                {renderMapAndListings()}
              </div>
            ) : selectedListing ? (
              <ListingDetailPage 
                selectedListing={selectedListing}
                currentImageIndex={currentImageIndex}
                handlePrevImage={handlePrevImage}
                handleNextImage={handleNextImage}
                renderStars={renderStars}
                getAverageRating={getAverageRating}
                isLoggedIn={isLoggedIn}
                favorites={favorites}
                handleToggleFavorite={handleToggleFavorite}
                setListingForReview={setListingForReview}
                setShowReviewModal={setShowReviewModal}
                setCurrentListing={setCurrentListing}
                setUploadedImage={setUploadedImage}
                setShowEditModal={setShowEditModal}
                handleOpenChat={handleOpenChat}
                userId={userId}
              />
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                <button 
                  type="button"
                  onClick={() => setCurrentView('public')}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Home
                </button>
              </div>
            )
          } />
        </Routes>
        {/* Add Listing Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Add New Listing</h2>
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)} 
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Listing Type</label>
                  <select
                    value={listingType}
                    onChange={(e) => {
                      setListingType(e.target.value);
                      setFormDetails({});
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="house">House</option>
                    <option value="car">Car</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                <form onSubmit={handleAddListing} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Address</label>
                      <input 
                        type="text" 
                        name="address" 
                        placeholder="Street address" 
                        required 
                        value={formDetails.address || ''} 
                        onChange={(e) => setFormDetails({ ...formDetails, address: e.target.value })} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">City</label>
                      <input 
                        type="text" 
                        name="city" 
                        placeholder="City" 
                        required 
                        value={formDetails.city || ''} 
                        onChange={(e) => setFormDetails({ ...formDetails, city: e.target.value })} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Price</label>
                      <input 
                        type="number" 
                        name="price" 
                        placeholder="Price" 
                        required 
                        min="0" 
                        value={formDetails.price || ''} 
                        onChange={(e) => setFormDetails({ ...formDetails, price: e.target.value })} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Latitude</label>
                      <input 
                        type="number" 
                        step="any" 
                        name="latitude" 
                        placeholder="Latitude" 
                        required 
                        value={formDetails.latitude || ''} 
                        onChange={(e) => setFormDetails({ ...formDetails, latitude: e.target.value })} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Longitude</label>
                      <input 
                        type="number" 
                        step="any" 
                        name="longitude" 
                        placeholder="Longitude" 
                        required 
                        value={formDetails.longitude || ''} 
                        onChange={(e) => setFormDetails({ ...formDetails, longitude: e.target.value })} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea 
                      name="description" 
                      placeholder="Description" 
                      required 
                      value={formDetails.description || ''} 
                      onChange={(e) => setFormDetails({ ...formDetails, description: e.target.value })} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      rows="3"
                    ></textarea>
                  </div>
                  {renderDynamicForm()}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Upload Image (optional)</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)} 
                      className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading || isGeneratingImage}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading || isGeneratingImage ? 'Processing...' : 'Add Listing'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Edit Listing Modal */}
        {showEditModal && currentListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Edit Listing</h2>
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)} 
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <form onSubmit={handleUpdateListing} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Address</label>
                      <input 
                        type="text" 
                        name="address" 
                        placeholder="Address" 
                        required 
                        defaultValue={currentListing.address} 
                        onChange={(e) => setFormDetails({ ...formDetails, address: e.target.value })} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">City</label>
                      <input 
                        type="text" 
                        name="city" 
                        placeholder="City" 
                        required 
                        defaultValue={currentListing.city} 
                        onChange={(e) => setFormDetails({ ...formDetails, city: e.target.value })} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Price</label>
                      <input 
                        type="number" 
                        name="price" 
                        placeholder="Price" 
                        required 
                        min="0" 
                        defaultValue={currentListing.price} 
                        onChange={(e) => setFormDetails({ ...formDetails, price: e.target.value })} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Latitude</label>
                      <input 
                        type="number" 
                        step="any" 
                        name="latitude" 
                        placeholder="Latitude" 
                        required 
                        defaultValue={currentListing.latitude} 
                        onChange={(e) => setFormDetails({ ...formDetails, latitude: e.target.value })} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Longitude</label>
                      <input 
                        type="number" 
                        step="any" 
                        name="longitude" 
                        placeholder="Longitude" 
                        required 
                        defaultValue={currentListing.longitude} 
                        onChange={(e) => setFormDetails({ ...formDetails, longitude: e.target.value })} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea 
                      name="description" 
                      placeholder="Description" 
                      required 
                      defaultValue={currentListing.description} 
                      onChange={(e) => setFormDetails({ ...formDetails, description: e.target.value })} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      rows="3"
                    ></textarea>
                  </div>
                  {renderDynamicForm(true)}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Upload New Image (optional)</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowEditModal(false)} 
                      className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Listing'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Confirm Delete Modal */}
        {showConfirmDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this listing? This action cannot be undone.</p>
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmDeleteModal(false);
                      setListingToDelete(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteListing(listingToDelete)} 
                    className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Review Modal */}
        {showReviewModal && listingForReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Reviews for {listingForReview.address}</h2>
                  <button 
                    type="button"
                    onClick={() => setShowReviewModal(false)} 
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-6">
                {listingForReview.reviews.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {listingForReview.reviews.map((review, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {renderStars(review.rating)}
                            <span className="text-sm font-medium text-gray-700">
                              {review.rating === 5 ? 'Excellent' : 
                               review.rating === 4 ? 'Good' : 
                               review.rating === 3 ? 'Average' : 
                               review.rating === 2 ? 'Poor' : 'Terrible'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.review_text}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          by User {review.reviewer_id.substring(0, 8)}...
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                      <i className="fas fa-star text-gray-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 mb-6">Be the first to share your experience with this property.</p>
                  </div>
                )}
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewModal(false);
                      setShowAddReviewModal(true);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Your Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Add Review Modal */}
        {showAddReviewModal && listingForReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Add Review</h2>
                  <button 
                    type="button"
                    onClick={() => setShowAddReviewModal(false)} 
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <form onSubmit={handleAddReview} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Rating</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <label key={num} className="flex flex-col items-center">
                          <input 
                            type="radio" 
                            name="rating" 
                            value={num} 
                            required 
                            className="sr-only" 
                          />
                          <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <span className="text-lg font-medium">{num}</span>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {num === 1 ? 'Poor' : 
                             num === 2 ? 'Fair' : 
                             num === 3 ? 'Good' : 
                             num === 4 ? 'Very Good' : 'Excellent'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Your Review</label>
                    <textarea 
                      name="reviewText" 
                      placeholder="Share your experience with this property..." 
                      rows="4" 
                      required 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button 
                      type="button" 
                      onClick={() => setShowAddReviewModal(false)} 
                      className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Notes Modal */}
        {showNotesModal && currentListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Personal Note</h2>
                  <button 
                    type="button"
                    onClick={() => setShowNotesModal(false)} 
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{currentListing.address}</h3>
                <p className="text-gray-600 mb-6">{currentListing.city}</p>
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Your Note</label>
                  <textarea
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    placeholder="Write your private notes here..."
                    rows="6"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotesModal(false);
                      setCurrentNote('');
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Chat Modal */}
        {showChatModal && listingForChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col h-full max-h-[80vh]">
              <div className="bg-gradient-to-r from-green-600 to-teal-700 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Chat for {listingForChat.address}</h2>
                  <button 
                    type="button"
                    onClick={() => setShowChatModal(false)} 
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
                {chatMessages.length > 0 ? (
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.user_id === userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            message.user_id === userId
                              ? 'bg-green-500 text-white rounded-tr-none'
                              : 'bg-white border border-gray-200 rounded-tl-none'
                          }`}
                        >
                          <p className="break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.user_id === userId ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatMessagesEndRef} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-200 mb-4">
                        <i className="fas fa-comments text-gray-500 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
                      <p className="text-gray-600">Start the conversation with the broker.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Registration Modal */}
        {showRegistrationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Create Account</h2>
                  <button 
                    type="button"
                    onClick={() => setShowRegistrationModal(false)} 
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="Your full name" 
                      required 
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="Your email address" 
                      required 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Password</label>
                    <input 
                      type="password" 
                      name="password" 
                      placeholder="Create a password" 
                      required 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                    />
                  </div>
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
                <p className="mt-6 text-center text-gray-600">
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => { 
                      setShowRegistrationModal(false); 
                      setShowLoginModal(true); 
                    }} 
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                  <button 
                    type="button"
                    onClick={() => setShowLoginModal(false)} 
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                  </div>
                </form>
                <p className="mt-6 text-center text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => { 
                      setShowLoginModal(false); 
                      setShowRegistrationModal(true); 
                    }} 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Profile Update Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Update Profile</h2>
                  <button 
                    type="button"
                    onClick={() => setShowProfileModal(false)} 
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="Your name" 
                      required 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowProfileModal(false)} 
                      className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};
export default App;