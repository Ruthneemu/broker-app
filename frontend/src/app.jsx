import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import './App.css';
import {
  HeartIcon as HeartOutline,
  StarIcon as StarOutline,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
} from '@heroicons/react/24/solid';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const [sortOption, setSortOption] = useState('price_asc');
  const [carFilters, setCarFilters] = useState({ make: '', mileageMax: '' });
  const [landFilters, setLandFilters] = useState({ acresMax: '', zoning: '' });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '' });
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    bedroomsMin: '',
    bathroomsMin: '',
    sqftMin: '',
  });

  // === Admin Dashboard State ===
  const [userRole, setUserRole] = useState('user');
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminListings, setAdminListings] = useState([]);
  // NEW: State variables for admin dashboard stats
  const [dashboardStats, setDashboardStats] = useState({ totalListings: 0, totalUsers: 0, totalViews: 0 });

  // NEW: State for dynamic listing form
  const [listingType, setListingType] = useState('house'); 
  const [formDetails, setFormDetails] = useState({});

  // Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const mapCenter = useMemo(() => ({ lat: 34.0522, lng: -118.2437 }), []);

  const fetchListings = async () => {
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

      if (selectedType === 'car' && filters.carMake) {
        query = query.ilike('details->>make', `%${filters.carMake}%`);
      }
      if (selectedType === 'car' && filters.carMileageMax) {
        query = query.lte('details->>mileage', parseFloat(filters.carMileageMax));
      }
      if (selectedType === 'land' && filters.acresMax) {
        query = query.lte('details->>acres', parseFloat(filters.acresMax));
      }
      if (selectedType === 'land' && filters.zoning) {
        query = query.ilike('details->>zoning', `%${filters.zoning}%`);
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
  };

  const fetchUserRole = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return 'user';
    }
    return data.role;
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
        } else {
          setUserRole('user');
        }
        fetchListings();
      }
    );

    fetchListings();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchListings();
  }, [searchTerm, filters]);

  // === NEW: Function to track a listing view ===
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

  // === UPDATED: setSelectedListingId to track views ===
  const handleSelectListing = (listingId) => {
    setSelectedListingId(listingId);
    if (session?.user?.id) {
      trackListingView(listingId);
    }
  };

  // === UPDATED: Fetch data for Admin Dashboard, now including views and total counts ===
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) throw usersError;
      setAdminUsers(usersData);

      // Fetch all listings and their view counts
      const { data: allListingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          *,
          listing_views(count)
        `);

      if (listingsError) throw listingsError;
      setAdminListings(allListingsData.map(listing => ({
        ...listing,
        views: listing.listing_views.length > 0 ? listing.listing_views[0].count : 0
      })));

      // Fetch total counts for quick stats cards
      const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalViews } = await supabase
        .from('listing_views')
        .select('*', { count: 'exact', head: true });

      setDashboardStats({
        totalListings,
        totalUsers,
        totalViews
      });

    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAdminDashboard) {
      fetchAdminData();
    }
  }, [showAdminDashboard]);

  // === Realtime Subscription for Chat Messages ===
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
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    const { data, error } = await supabase.storage
      .from('listing_photos')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    const { data: publicUrlData } = supabase.storage
      .from('listing_photos')
      .getPublicUrl(filePath);
    return publicUrlData.publicUrl;
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

  // === UPDATED: handleAddListing to use dynamic form state ===
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
      if (showAdminDashboard) {
        await fetchAdminData();
      }
    } catch (error) {
      console.error('Error deleting listing:', error.message);
    } finally {
      setShowConfirmDeleteModal(false);
      setListingToDelete(null);
      setLoading(false);
    }
  };
  const uploadImage = async (file) => {
    if (!file) {
      return null;
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('listing-images') // This is the name of your bucket
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get the public URL of the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };
  // === UPDATED: handleUpdateListing to use dynamic form state ===
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

    const renderUserProfile = () => {
      return (
        <div className="container mx-auto p-8">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-indigo-500 pb-2">Your Profile</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Name</h3>
                <p className="text-gray-800 text-xl">{session?.user?.user_metadata?.name || 'Not available'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Email</h3>
                <p className="text-gray-800 text-xl">{session?.user?.email || 'Not available'}</p>
              </div>
            </div>
            <form onSubmit={handleUpdateProfile} className="mt-8 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      );
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

        // Also delete the private note if the listing is unfavorited
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

  // === UPDATED: Send Message to Supabase ===
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
      // Fallback for older browsers
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

  // Add this function with your other handler functions, like handleLogin, etc.
  const handleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! Please log in.');
        setShowRegistrationModal(false);
        setShowLoginModal(true); // Redirect to login after successful registration
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
      console.error('Registration error:', error);
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
          redirectTo: 'YOUR_REDIRECT_URL_HERE',
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
    setFavorites([]);
  };

  // === NEW: Function to handle opening the note modal ===
  const handleOpenNotesModal = async (listing) => {
    setCurrentListing(listing);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('private_notes')
        .select('note_content')
        .eq('user_id', userId)
        .eq('listing_id', listing.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"

      setCurrentNote(data?.note_content || '');
      setShowNotesModal(true);
    } catch (error) {
      console.error('Error fetching private note:', error.message);
      setCurrentNote('');
    } finally {
      setLoading(false);
    }
  };

  // === UPDATED: Function to handle saving the note ===
  const handleSaveNote = async () => {
    if (!currentListing || !userId) return;

    setLoading(true);
    try {
      const noteData = {
        user_id: userId,
        listing_id: currentListing.id,
        note_content: currentNote,
      };

      // Check if a note already exists for this user and listing
      const { data: existingNote, error: fetchError } = await supabase
        .from('private_notes')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', currentListing.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingNote) {
        // Update the existing note
        const { error: updateError } = await supabase
          .from('private_notes')
          .update(noteData)
          .eq('id', existingNote.id);

        if (updateError) throw updateError;
      } else {
        // Insert a new note
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

  // === UPDATED: Admin Dashboard Component to show analytics ===
  const AdminDashboard = () => {
    const sortedListings = useMemo(() => {
        // Sort listings by views in descending order
        return [...adminListings].sort((a, b) => b.views - a.views);
    }, [adminListings]);

    return (
      <div className="bg-gray-100 min-h-screen p-4 md:p-8">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-7xl mx-auto my-4 md:my-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">Admin Dashboard</h2>
            <button
              onClick={() => setShowAdminDashboard(false)}
              className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-full hover:bg-gray-400 transition-colors"
            >
              Back to Listings
            </button>
          </div>

          {/* NEW: Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-indigo-50 p-6 rounded-xl shadow-md text-center">
              <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">Total Listings</h3>
              <p className="mt-2 text-4xl font-extrabold text-indigo-900">{dashboardStats.totalListings}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl shadow-md text-center">
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider">Total Users</h3>
              <p className="mt-2 text-4xl font-extrabold text-green-900">{dashboardStats.totalUsers}</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-xl shadow-md text-center">
              <h3 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider">Total Views</h3>
              <p className="mt-2 text-4xl font-extrabold text-yellow-900">{dashboardStats.totalViews}</p>
            </div>
          </div>

          <div className="space-y-8 md:space-y-12">
            {/* All Listings Section, now including view counts and sorted */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-indigo-600">All Listings (Most Viewed)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-xs md:text-sm leading-normal">
                      <th className="py-3 px-3 md:px-6 text-left">Image</th>
                      <th className="py-3 px-3 md:px-6 text-left">Address</th>
                      <th className="py-3 px-3 md:px-6 text-left">Price</th>
                      <th className="py-3 px-3 md:px-6 text-left">Views</th>
                      <th className="py-3 px-3 md:px-6 text-left">Owner ID</th>
                      <th className="py-3 px-3 md:px-6 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-xs md:text-sm font-light">
                    {sortedListings.map(listing => (
                      <tr key={listing.id} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="py-3 px-3 md:px-6 text-left whitespace-nowrap">
                          {listing.image_urls && listing.image_urls.length > 0 && (
                            <img src={listing.image_urls[0]} alt="Listing" className="w-12 h-8 md:w-16 md:h-12 object-cover rounded-md" />
                          )}
                        </td>
                        <td className="py-3 px-3 md:px-6 text-left font-semibold">{listing.address}, {listing.city}</td>
                        <td className="py-3 px-3 md:px-6 text-left">${new Intl.NumberFormat().format(listing.price)}</td>
                        <td className="py-3 px-3 md:px-6 text-left font-bold text-lg">{listing.views}</td>
                        <td className="py-3 px-3 md:px-6 text-left">{listing.owner_id.substring(0, 8)}...</td>
                        <td className="py-3 px-3 md:px-6 text-left">
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All Users Section (unchanged but part of the dashboard) */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-indigo-600">All Users</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-xs md:text-sm leading-normal">
                      <th className="py-3 px-3 md:px-6 text-left">User ID</th>
                      <th className="py-3 px-3 md:px-6 text-left">Email</th>
                      <th className="py-3 px-3 md:px-6 text-left">Role</th>
                      <th className="py-3 px-3 md:px-6 text-left">Joined At</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-xs md:text-sm font-light">
                    {adminUsers.map(user => (
                      <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="py-3 px-3 md:px-6 text-left whitespace-nowrap">{user.id.substring(0, 8)}...</td>
                        <td className="py-3 px-3 md:px-6 text-left">{user.email}</td>
                        <td className="py-3 px-3 md:px-6 text-left">
                          <span className={`py-1 px-3 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 md:px-6 text-left">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedListing) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => setSelectedListingId(null)}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back to Listings</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-indigo-600">Broker</span><span className="text-gray-800">Find</span>
            </h1>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors">
                Logout
              </button>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors">
                Login
              </button>
            )}
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{selectedListing.address}</h1>
            <p className="text-xl text-gray-600 mb-6">{selectedListing.city}</p>

            <div className="relative w-full h-80 md:h-[500px] rounded-lg mb-8 overflow-hidden">
              <img
                src={selectedListing.image_urls[currentImageIndex[selectedListing.id] || 0]}
                alt={`Property at ${selectedListing.address}`}
                className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
              />
              {selectedListing.image_urls.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(selectedListing.id, selectedListing.image_urls); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(selectedListing.id, selectedListing.image_urls); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-3xl font-bold text-indigo-600 mb-4">${new Intl.NumberFormat().format(selectedListing.price)}</h2>
                {/* NEW: Conditional rendering for Listing Details */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-700 font-semibold text-lg mb-4">
                  {selectedListing.type === 'house' && selectedListing.details && (
                    <>
                      <span><i className="fas fa-bed"></i> {selectedListing.details.bedrooms} Beds</span>
                      <span><i className="fas fa-bath"></i> {selectedListing.details.bathrooms} Baths</span>
                      <span><i className="fas fa-ruler-combined"></i> {selectedListing.details.sqft} sqft</span>
                    </>
                  )}
                  {selectedListing.type === 'car' && selectedListing.details && (
                    <>
                      <span><i className="fas fa-car"></i> {selectedListing.details.make} {selectedListing.details.model}</span>
                      <span><i className="fas fa-tachometer-alt"></i> {selectedListing.details.mileage} miles</span>
                      <span><i className="fas fa-calendar-alt"></i> {selectedListing.details.year}</span>
                    </>
                  )}
                  {selectedListing.type === 'land' && selectedListing.details && (
                    <>
                      <span><i className="fas fa-tree"></i> {selectedListing.details.acres} Acres</span>
                      <span><i className="fas fa-ruler"></i> {selectedListing.details.zoning}</span>
                    </>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 mb-8">{selectedListing.description}</p>

                <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-4">
                  {renderStars(getAverageRating(selectedListing.reviews))}
                  <span>({selectedListing.reviews.length} reviews)</span>
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Contact Broker</h3>
                  <p className="text-gray-600 mb-4">Interested in this listing? Fill out the form below and the broker will get in touch with you.</p>
                  <form className="space-y-4">
                    <input type="text" placeholder="Your Name" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="email" placeholder="Your Email" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <textarea placeholder="Your Message" rows="4" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                    <button type="submit" className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors">
                      Send Message
                    </button>
                  </form>
                </div>
              </div>

              <div>
                <div className="bg-gray-100 p-6 rounded-xl shadow-inner space-y-4">
                  <h3 className="text-2xl font-bold text-gray-800">Actions</h3>
                  <button
                    onClick={() => {
                      setListingForReview(selectedListing);
                      setShowReviewModal(true);
                    }}
                    className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors"
                  >
                    View Reviews
                  </button>
                  {isLoggedIn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(selectedListing.id);
                      }}
                      className={`w-full px-4 py-2 font-semibold rounded-full transition-colors ${favorites.includes(selectedListing.id) ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {favorites.includes(selectedListing.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                  )}
                  {isLoggedIn && selectedListing.owner_id === userId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentListing(selectedListing);
                        setUploadedImage(null);
                        setShowEditModal(true);
                      }}
                      className="w-full px-4 py-2 bg-yellow-400 text-gray-800 font-semibold rounded-full hover:bg-yellow-500 transition-colors"
                    >
                      Edit Listing
                    </button>
                  )}
                  {isLoggedIn && selectedListing.owner_id !== userId && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenChat(selectedListing); }}
                      className="w-full px-4 py-2 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 transition-colors"
                    >
                      Chat with Broker
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showAdminDashboard) {
    return <AdminDashboard />;
  }

  const renderMapAndListings = () => {
    if (loadError) return <div className="text-red-500 text-center font-semibold">Error loading maps</div>;
    if (!isLoaded) return <div className="text-gray-500 text-center font-semibold">Loading Map...</div>;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        <div className="h-[60vh] lg:h-[80vh] sticky top-28 rounded-2xl overflow-hidden shadow-lg">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={10}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {sortListings(listings).map((listing) => (
            <MarkerF
                key={listing.id}
                position={{ lat: listing.latitude, lng: listing.longitude }}
                onClick={() => handleSelectListing(listing.id)}
              />
            ))}
          </GoogleMap>
        </div>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {loading ? (
              <div className="text-center text-gray-500 text-xl font-semibold col-span-full">Loading...</div>
            ) : listings.length > 0 ? (
              sortListings(listings).map(listing => (
                <div
                  key={listing.id}
                  onClick={() => handleSelectListing(listing.id)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out overflow-hidden cursor-pointer flex flex-col hover:-translate-y-2"
                >
                  {listing.image_urls && listing.image_urls.length > 0 ? (
                    <div className="relative w-full h-48 overflow-hidden">
                      <img
                        src={listing.image_urls[currentImageIndex[listing.id] || 0]}
                        alt={`Listing at ${listing.address}`}
                        className="w-full h-full object-cover transition-transform duration-300 transform"
                      />
                      {listing.image_urls.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePrevImage(listing.id, listing.image_urls); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleNextImage(listing.id, listing.image_urls); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                            {listing.image_urls.map((_, index) => (
                              <span
                                key={index}
                                className={`block w-2 h-2 rounded-full transition-colors duration-200 ${index === currentImageIndex[listing.id] ? 'bg-white' : 'bg-gray-400'}`}
                              ></span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image Available
                    </div>
                  )}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{listing.address}</h2>
                        <div className="flex items-center space-x-1 text-sm font-semibold text-gray-700">
                          {renderStars(getAverageRating(listing.reviews))}
                          <span>({listing.reviews.length})</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{listing.city}</p>
                      <div className="text-3xl font-extrabold text-indigo-600 mb-4">
                        ${new Intl.NumberFormat().format(listing.price)}
                      </div>
                      {/* NEW: Conditional rendering for Listing Card details */}
                      <div className="flex items-center space-x-4 text-gray-700 mb-4">
                        {listing.type === 'house' && listing.details && (
                          <>
                            <div className="flex items-center space-x-1"><i className="fas fa-bed text-sm text-indigo-500"></i><span className="text-sm">{listing.details.bedrooms} Beds</span></div>
                            <div className="flex items-center space-x-1"><i className="fas fa-bath text-sm text-indigo-500"></i><span className="text-sm">{listing.details.bathrooms} Baths</span></div>
                            <div className="flex items-center space-x-1"><i className="fas fa-ruler-combined text-sm text-indigo-500"></i><span className="text-sm">{listing.details.sqft} sqft</span></div>
                          </>
                        )}
                        {listing.type === 'car' && listing.details && (
                          <>
                            <div className="flex items-center space-x-1"><i className="fas fa-car text-sm text-indigo-500"></i><span className="text-sm">{listing.details.make}</span></div>
                            <div className="flex items-center space-x-1"><i className="fas fa-tachometer-alt text-sm text-indigo-500"></i><span className="text-sm">{listing.details.mileage} miles</span></div>
                          </>
                        )}
                        {listing.type === 'land' && listing.details && (
                          <>
                            <div className="flex items-center space-x-1"><i className="fas fa-tree text-sm text-indigo-500"></i><span className="text-sm">{listing.details.acres} Acres</span></div>
                            <div className="flex items-center space-x-1"><i className="fas fa-ruler text-sm text-indigo-500"></i><span className="text-sm">{listing.details.zoning}</span></div>
                          </>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-3">{listing.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {isLoggedIn && currentView === 'private' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentListing(listing);
                              setUploadedImage(null);
                              setShowEditModal(true);
                            }}
                            className="flex-grow text-center px-4 py-2 bg-yellow-400 text-gray-800 font-semibold rounded-full hover:bg-yellow-500 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteListing(listing.id);
                            }}
                            className="flex-grow text-center px-4 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareListing(listing);
                            }}
                            className="flex-grow text-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors"
                          >
                            Share
                          </button>
                        </>
                      )}
                      {isLoggedIn && currentView === 'public' && (
                        <>
                          {listing.owner_id === userId ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentListing(listing);
                                  setUploadedImage(null);
                                  setShowEditModal(true);
                                }}
                                className="flex-grow text-center px-4 py-2 bg-yellow-400 text-gray-800 font-semibold rounded-full hover:bg-yellow-500 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteListing(listing.id);
                                }}
                                className="flex-grow text-center px-4 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(listing.id);
                              }}
                              className={`flex-grow text-center px-4 py-2 font-semibold rounded-full transition-colors ${favorites.includes(listing.id) ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                              {favorites.includes(listing.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenChat(listing); }}
                            className="flex-grow text-center px-4 py-2 bg-teal-500 text-white font-semibold rounded-full hover:bg-teal-600 transition-colors"
                          >
                            Chat
                          </button>
                        </>
                      )}
                      {isLoggedIn && currentView === 'favorites' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(listing.id);
                            }}
                            className="flex-grow text-center px-4 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenNotesModal(listing);
                            }}
                            className="flex-grow text-center px-4 py-2 bg-purple-500 text-white font-semibold rounded-full hover:bg-purple-600 transition-colors"
                          >
          {loading ? 'Loading...' : 'Add Note'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShareListing(listing);
            }}
            className="flex-grow text-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors"
          >
            Share
          </button>
          </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setListingForReview(listing);
              setShowReviewModal(true);
            }}
            className="flex-grow text-center px-4 py-2 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors"
          >
            Reviews ({listing.reviews.length})
          </button>
          </div>
          </div>
          </div>
          ))
          ) : (
          <div className="text-center text-gray-500 text-xl font-semibold col-span-full">
            No listings found.
          </div>
          )}
          </div>
          </div>
          </div>
          );
          };

  const sortListings = (listings) => {
    const sorted = [...listings]; // Create a shallow copy to avoid mutating the original state
    switch (sortOption) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'date_desc':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'rating_desc':
        return sorted.sort((a, b) => {
          const avgRatingA = a.reviews.length > 0 ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length : 0;
          const avgRatingB = b.reviews.length > 0 ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length : 0;
          return avgRatingB - avgRatingA;
        });
      default:
        return sorted;
    }
  };

          // === NEW: Conditionally rendered form fields based on listing type ===
          const renderDynamicForm = (isEdit = false) => {
            const currentListingDetails = isEdit && currentListing ? currentListing.details : formDetails.details;
            const currentType = isEdit && currentListing ? currentListing.type : listingType;

            let dynamicFields = null;
            switch (currentType) {
              case 'house':
                dynamicFields = (
                  <>
                    <input type="number" name="bedrooms" placeholder="Bedrooms" required min="0" defaultValue={currentListingDetails?.bedrooms} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, bedrooms: e.target.value } })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="number" name="bathrooms" placeholder="Bathrooms" required min="0" defaultValue={currentListingDetails?.bathrooms} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, bathrooms: e.target.value } })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="number" name="sqft" placeholder="Sqft" required min="0" defaultValue={currentListingDetails?.sqft} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, sqft: e.target.value } })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </>
                );
                break;
              case 'car':
                dynamicFields = (
                  <>
                    <input type="text" name="make" placeholder="Make" required defaultValue={currentListingDetails?.make} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, make: e.target.value } })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="text" name="model" placeholder="Model" required defaultValue={currentListingDetails?.model} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, model: e.target.value } })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="number" name="year" placeholder="Year" required defaultValue={currentListingDetails?.year} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, year: e.target.value } })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="number" name="mileage" placeholder="Mileage" required defaultValue={currentListingDetails?.mileage} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, mileage: e.target.value } })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </>
                );
                break;
              case 'land':
                dynamicFields = (
                  <>
                    <input type="number" step="any" name="acres" placeholder="Acres" required defaultValue={currentListingDetails?.acres} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, acres: e.target.value } })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="text" name="zoning" placeholder="Zoning" required defaultValue={currentListingDetails?.zoning} onChange={(e) => setFormDetails({ ...formDetails, details: { ...formDetails.details, zoning: e.target.value } })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </>
                );
                break;
              default:
                dynamicFields = null;
            }
            return dynamicFields;
          };

          return (
            <div className="bg-gray-100 min-h-screen font-inter">
              <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4 flex flex-wrap justify-between items-center">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold text-gray-900">
                      <span className="text-indigo-600">Broker</span><span className="text-gray-800">Find</span>
                    </h1>
                  </div>
                  <nav className="flex flex-wrap items-center justify-center md:justify-end space-x-2">
                    <button
                      onClick={() => {
                        setCurrentView('public');
                        setSearchTerm(''); // Clear search term on view change
                        setFilters({
                          priceMin: '',
                          priceMax: '',
                          bedroomsMin: '',
                          bathroomsMin: '',
                          sqftMin: '',
                        });
                        fetchListings();
                      }}
                      className={`px-4 py-2 rounded-full font-semibold transition-colors ${currentView === 'public' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Public Listings
                    </button>
                    {isLoggedIn && (
                      <>
                        <button
                          onClick={() => {
                            setCurrentView('private');
                            setSearchTerm('');
                            setFilters({});
                            setListings(listings.filter(l => l.owner_id === userId));
                          }}
                          className={`px-4 py-2 rounded-full font-semibold transition-colors ${currentView === 'private' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          My Listings
                        </button>
                        <button
                          onClick={() => {
                            setCurrentView('favorites');
                            setSearchTerm('');
                            setFilters({});
                            setListings(listings.filter(l => favorites.includes(l.id)));
                          }}
                          className={`px-4 py-2 rounded-full font-semibold transition-colors ${currentView === 'favorites' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          Favorites
                        </button>
                      </>
                    )}
                    {isLoggedIn && userRole === 'admin' && (
                      <button
                        onClick={() => setShowAdminDashboard(true)}
                        className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors"
                      >
                        Admin Dashboard
                      </button>
                    )}
                    {isLoggedIn ? (
                      <button onClick={handleLogout} className="...">
                        Logout
                      </button>
                    ) : (
                      <>
                        <button onClick={() => setShowLoginModal(true)} className="...">
                          Login
                        </button>
                        <button onClick={() => setShowRegistrationModal(true)} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors">
                          Register
                        </button>
                      </>
                    )}
                  </nav>
                </div>
              </header>
              <main className="container mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
                    {currentView === 'public' && 'All Listings'}
                    {currentView === 'private' && 'My Listings'}
                    {currentView === 'favorites' && 'My Favorites'}
                  </h1>
                  {isLoggedIn && currentView === 'private' && (
                    <button
                      onClick={() => { setShowAddForm(true); setUploadedImage(null); }}
                      className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-colors w-full md:w-auto"
                    >
                      + Add New Listing
                    </button>
                  )}
                </div>
                {currentView === 'public' && (
                  <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                      <input
                        type="text"
                        placeholder="Search by address, city, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={fetchListings}
                        className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
                      >
                        Search
                      </button>
                    </div>
                    <div className="mt-6 flex items-center space-x-2">
                      <label htmlFor="sort-by" className="text-gray-700 font-semibold">Sort by:</label>
                      <select
                        id="sort-by"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="price_asc">Price (Low to High)</option>
                        <option value="price_desc">Price (High to Low)</option>
                        <option value="date_desc">Date Added (Newest First)</option>
                        <option value="rating_desc">Rating (Highest First)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-gray-200 pt-6">
                      {selectedType === 'car' && (
                        <>
                          <input
                            type="text"
                            placeholder="Car Make"
                            value={carFilters.make}
                            onChange={(e) => setCarFilters({ ...carFilters, make: e.target.value })}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <input
                            type="number"
                            placeholder="Max Mileage"
                            value={carFilters.mileageMax}
                            onChange={(e) => setCarFilters({ ...carFilters, mileageMax: e.target.value })}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </>
                      )}

                      {selectedType === 'land' && (
                        <>
                          <input
                            type="number"
                            placeholder="Max Acres"
                            value={landFilters.acresMax}
                            onChange={(e) => setLandFilters({ ...landFilters, acresMax: e.target.value })}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <input
                            type="text"
                            placeholder="Zoning"
                            value={landFilters.zoning}
                            onChange={(e) => setLandFilters({ ...landFilters, zoning: e.target.value })}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </>
                      )}
                      <input
                        type="number"
                        placeholder="Min Price"
                        value={filters.priceMin}
                        onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Max Price"
                        value={filters.priceMax}
                        onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Min Beds"
                        value={filters.bedroomsMin}
                        onChange={(e) => setFilters({ ...filters, bedroomsMin: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Min Baths"
                        value={filters.bathroomsMin}
                        onChange={(e) => setFilters({ ...filters, bathroomsMin: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
                {renderMapAndListings()}
              </main>

              {showAddForm && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Add New Listing</h2>
                      <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="fas fa-times text-2xl"></i>
                      </button>
                    </div>
                    {/* NEW: Type selection dropdown for Add Form */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">Listing Type</label>
                      <select
                        value={listingType}
                        onChange={(e) => {
                          setListingType(e.target.value);
                          setFormDetails({});
                        }}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="house">House</option>
                        <option value="car">Car</option>
                        <option value="land">Land</option>
                      </select>
                    </div>
                    <form onSubmit={handleAddListing} className="space-y-4">
                      <input type="text" name="address" placeholder="Address" required value={formDetails.address || ''} onChange={(e) => setFormDetails({ ...formDetails, address: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="text" name="city" placeholder="City" required value={formDetails.city || ''} onChange={(e) => setFormDetails({ ...formDetails, city: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="number" name="price" placeholder="Price" required min="0" value={formDetails.price || ''} onChange={(e) => setFormDetails({ ...formDetails, price: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="number" step="any" name="latitude" placeholder="Latitude (e.g., 34.0522)" required value={formDetails.latitude || ''} onChange={(e) => setFormDetails({ ...formDetails, latitude: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="number" step="any" name="longitude" placeholder="Longitude (e.g., -118.2437)" required value={formDetails.longitude || ''} onChange={(e) => setFormDetails({ ...formDetails, longitude: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </form>
                  </div>
                </div>
              )}

              {showConfirmDeleteModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
                    <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
                    <p className="text-gray-700 mb-6">Are you sure you want to delete this listing?</p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => {
                          setShowConfirmDeleteModal(false);
                          setListingToDelete(null);
                        }}
                        className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-full hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteListing(listingToDelete)}
                        className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showReviewModal && listingForReview && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Reviews for {listingForReview.address}</h2>
                      <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="fas fa-times text-2xl"></i>
                      </button>
                    </div>
                    {listingForReview.reviews.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto pr-4 space-y-4">
                        {listingForReview.reviews.map((review, index) => (
                          <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold">{renderStars(review.rating)}</span>
                              <span className="text-sm text-gray-600">from user: {review.reviewer_id.substring(0, 8)}...</span>
                            </div>
                            <p className="text-gray-800">{review.review_text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        No reviews yet. Be the first to add one!
                      </div>
                    )}
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => {
                          setShowReviewModal(false);
                          setShowAddReviewModal(true);
                        }}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
                      >
                        Add Your Review
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showAddReviewModal && listingForReview && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Add Review for {listingForReview.address}</h2>
                      <button onClick={() => setShowAddReviewModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="fas fa-times text-2xl"></i>
                      </button>
                    </div>
                    <form onSubmit={handleAddReview} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Rating</label>
                        <select name="rating" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num} Star</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Review</label>
                        <textarea name="reviewText" placeholder="Write your review here..." rows="4" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                      </div>
                      <div className="flex justify-end space-x-4">
                        <button type="button" onClick={() => setShowAddReviewModal(false)} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-full hover:bg-gray-400 transition-colors">
                          Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors">
                          Submit Review
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {showNotesModal && currentListing && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Personal Note for {currentListing.address}</h2>
                      <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="fas fa-times text-2xl"></i>
                      </button>
                    </div>
                    <textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="Write your private notes here..."
                      rows="6"
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    ></textarea>
                    <div className="mt-6 flex justify-end space-x-4">
                      <button
                        onClick={() => {
                          setShowNotesModal(false);
                          setCurrentNote('');
                        }}
                        className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-full hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNote}
                        className="px-6 py-2 bg-purple-500 text-white font-semibold rounded-full hover:bg-purple-600 transition-colors"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showChatModal && listingForChat && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col h-full max-h-[80vh]">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Chat for {listingForChat.address}</h2>
                      <button onClick={() => setShowChatModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="fas fa-times text-2xl"></i>
                      </button>
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-4 p-2 bg-gray-50 rounded-lg mb-4">
                      {chatMessages.length > 0 ? (
                        chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.user_id === userId ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] p-3 rounded-xl shadow-sm ${
                                message.user_id === userId
                                  ? 'bg-indigo-500 text-white rounded-br-none'
                                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              <p className="break-words">{message.content}</p>
                              <p className="text-[10px] opacity-50 mt-1 text-right">
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          Start the conversation!
                        </div>
                      )}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {showRegistrationModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                      <button onClick={() => setShowRegistrationModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="fas fa-times text-2xl"></i>
                      </button>
                    </div>
                    <form onSubmit={handleRegistration} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Name</label>
                        <input type="text" name="name" placeholder="Your Name" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Email</label>
                        <input type="email" name="email" placeholder="Your Email" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Password</label>
                        <input type="password" name="password" placeholder="Create a password" required className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors">
                          Register
                        </button>
                      </div>
                    </form>
                    <p className="mt-4 text-center text-gray-600">
                      Already have an account? <button onClick={() => { setShowRegistrationModal(false); setShowLoginModal(true); }} className="text-indigo-600 hover:underline font-semibold">Login</button>
                    </p>
                  </div>
                </div>
              )}

              {showLoginModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <button
  type="button"
  onClick={handleForgotPassword}
  className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
>
  Forgot your password?
</button>
                  <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Broker Login</h2>
                      <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="fas fa-times text-2xl"></i>
                      </button>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          required
                          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Password</label>
                        <input
                          type="password"
                          name="password"
                          placeholder="Enter your password"
                          required
                          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Logging in...' : 'Log In'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
          };

          export default App;