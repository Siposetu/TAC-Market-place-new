import React, { useState } from 'react';
import { User, Briefcase, Calendar, MapPin, Phone, Clock, Camera, CheckCircle, Star, Plus, X, AlertCircle, Info } from 'lucide-react';
import { useLocalProfiles } from '../hooks/useLocalProfiles';
import { useGoogleSheets } from '../hooks/useGoogleSheets';
import { LocationPicker } from './LocationPicker';
import { NavigationButtons } from './NavigationButtons';

interface LocalFormData {
  fullName: string;
  skill: string;
  yearsExperience: number;
  location: string;
  contact: string;
  availability: string;
  profileImage?: File;
  portfolioImages?: File[];
  customerReviews?: Review[];
  flexibleHours?: FlexibleHour[];
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  service: string;
  date: string;
}

interface PortfolioImage {
  id: string;
  file: File;
  preview: string;
  caption: string;
}

interface FlexibleHour {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export function LocalProfileForm() {
  const [formData, setFormData] = useState<LocalFormData>({
    fullName: '',
    skill: '',
    yearsExperience: 0,
    location: '',
    contact: '',
    availability: '',
    flexibleHours: []
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [customerReviews, setCustomerReviews] = useState<Review[]>([]);
  const [flexibleHours, setFlexibleHours] = useState<FlexibleHour[]>([]);
  const [newReview, setNewReview] = useState({
    clientName: '',
    rating: 5,
    comment: '',
    service: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [googleSheetsError, setGoogleSheetsError] = useState<string>('');
  
  const { submitProfile } = useLocalProfiles();
  const { connectToGoogleSheets, isSignedIn } = useGoogleSheets();

  const skills = [
    'Hairdressing',
    'Plumbing', 
    'Tutoring',
    'Makeup',
    'Cleaning',
    'Catering',
    'Photography',
    'Sewing',
    'Crochet',
    'Electrical',
    'Other'
  ];

  const availabilityOptions = [
    'Full-time',
    'Part-time', 
    'Weekends only',
    'Flexible hours (set custom schedule)'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleInputChange = (field: keyof LocalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If availability is set to flexible hours, initialize flexible hours
    if (field === 'availability' && value === 'Flexible hours (set custom schedule)') {
      if (flexibleHours.length === 0) {
        const defaultHours = daysOfWeek.map(day => ({
          id: `${day}-${Date.now()}`,
          day,
          startTime: '09:00',
          endTime: '17:00',
          available: day !== 'Sunday'
        }));
        setFlexibleHours(defaultHours);
      }
    }
  };

  const handleLocationSelect = (locationData: { address: string; coordinates: { lat: number; lng: number } }) => {
    setFormData(prev => ({ ...prev, location: locationData.address }));
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage: PortfolioImage = {
            id: Date.now().toString() + Math.random(),
            file,
            preview: event.target?.result as string,
            caption: ''
          };
          setPortfolioImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removePortfolioImage = (imageId: string) => {
    setPortfolioImages(prev => prev.filter(img => img.id !== imageId));
  };

  const updateImageCaption = (imageId: string, caption: string) => {
    setPortfolioImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, caption } : img
    ));
  };

  const addReview = () => {
    if (newReview.clientName && newReview.comment) {
      const review: Review = {
        id: Date.now().toString(),
        ...newReview
      };
      setCustomerReviews(prev => [...prev, review]);
      setNewReview({
        clientName: '',
        rating: 5,
        comment: '',
        service: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const removeReview = (reviewId: string) => {
    setCustomerReviews(prev => prev.filter(review => review.id !== reviewId));
  };

  const updateFlexibleHour = (id: string, field: keyof FlexibleHour, value: any) => {
    setFlexibleHours(prev => prev.map(hour =>
      hour.id === id ? { ...hour, [field]: value } : hour
    ));
  };

  const addCustomTimeSlot = () => {
    const newSlot: FlexibleHour = {
      id: `custom-${Date.now()}`,
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      available: true
    };
    setFlexibleHours(prev => [...prev, newSlot]);
  };

  const removeFlexibleHour = (id: string) => {
    setFlexibleHours(prev => prev.filter(hour => hour.id !== id));
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star 
              className={`w-4 h-4 ${
                star <= rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`} 
            />
          </button>
        ))}
      </div>
    );
  };

  const handleGoogleSheetsConnect = async () => {
    try {
      setGoogleSheetsError('');
      await connectToGoogleSheets();
    } catch (error: any) {
      console.error('Failed to connect to Google Sheets:', error);
      setGoogleSheetsError(error.message || 'Failed to connect to Google Sheets');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const enhancedFormData = {
        ...formData,
        portfolioImages: portfolioImages.map(img => img.file),
        customerReviews,
        flexibleHours: formData.availability === 'Flexible hours (set custom schedule)' ? flexibleHours : []
      };
      
      await submitProfile(enhancedFormData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting profile:', error);
      alert('There was an error submitting your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-lg mx-auto">
        <NavigationButtons />
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Thank You!</h2>
          <p className="text-gray-600 leading-relaxed mb-8 text-lg">
            We're creating your professional profile — you'll be notified when it's ready.
          </p>
          {!isSignedIn && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-blue-800 font-medium">Optional: Connect to Google Sheets</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Your profile is saved locally. Connect to Google Sheets to sync your data across devices.
                  </p>
                  <button
                    onClick={handleGoogleSheetsConnect}
                    className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect Now
                  </button>
                  {googleSheetsError && (
                    <p className="text-xs text-red-600 mt-2">{googleSheetsError}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                fullName: '',
                skill: '',
                yearsExperience: 0,
                location: '',
                contact: '',
                availability: '',
                flexibleHours: []
              });
              setProfileImagePreview('');
              setPortfolioImages([]);
              setCustomerReviews([]);
              setFlexibleHours([]);
              setGoogleSheetsError('');
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Submit Another Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <NavigationButtons />
      
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Join TAC Marketplace</h2>
            <p className="text-gray-600 mt-2">Share your skills with your local community</p>
          </div>
        </div>

        {/* Google Sheets Connection Info */}
        {!isSignedIn && (
          <div className="mx-8 mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">Optional: Connect to Google Sheets</p>
                <p className="text-xs text-blue-600 mt-1">
                  Your profile will be saved locally. Connect to Google Sheets to sync your data and enable advanced features.
                </p>
                <button
                  onClick={handleGoogleSheetsConnect}
                  className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Connect to Google Sheets
                </button>
                {googleSheetsError && (
                  <p className="text-xs text-red-600 mt-2">{googleSheetsError}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Profile Image */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg mx-auto">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
                id="profile-image"
              />
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">Upload your profile photo</p>
          </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-gray-50 focus:bg-white transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Skill or Service *
              </label>
              <select
                required
                value={formData.skill}
                onChange={(e) => handleInputChange('skill', e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg appearance-none bg-gray-50 focus:bg-white transition-all"
              >
                <option value="">Select your skill</option>
                {skills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Years of Experience *
              </label>
              <input
                type="number"
                required
                min="0"
                max="50"
                value={formData.yearsExperience || ''}
                onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-gray-50 focus:bg-white transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Location / Area *
              </label>
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={formData.location}
                placeholder="e.g. Khayelitsha, Tembisa, Gugulethu"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Contact (WhatsApp or Phone) *
              </label>
              <input
                type="tel"
                required
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-gray-50 focus:bg-white transition-all"
                placeholder="+27 XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Availability *
              </label>
              <select
                required
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg appearance-none bg-gray-50 focus:bg-white transition-all"
              >
                <option value="">Select availability</option>
                {availabilityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Flexible Hours Section */}
          {formData.availability === 'Flexible hours (set custom schedule)' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Set Your Schedule</h3>
                </div>
                <button
                  type="button"
                  onClick={addCustomTimeSlot}
                  className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Time Slot</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {flexibleHours.map(hour => (
                  <div key={hour.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <select
                      value={hour.day}
                      onChange={(e) => updateFlexibleHour(hour.id, 'day', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    
                    <input
                      type="time"
                      value={hour.startTime}
                      onChange={(e) => updateFlexibleHour(hour.id, 'startTime', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    />
                    
                    <span className="text-gray-500 text-sm">to</span>
                    
                    <input
                      type="time"
                      value={hour.endTime}
                      onChange={(e) => updateFlexibleHour(hour.id, 'endTime', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    />
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={hour.available}
                        onChange={(e) => updateFlexibleHour(hour.id, 'available', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">Available</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeFlexibleHour(hour.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              {flexibleHours.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No time slots added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Add Time Slot" to set your schedule</p>
                </div>
              )}
            </div>
          )}

          {/* Portfolio Images Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <Camera className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Portfolio Images (Optional)</h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePortfolioUpload}
                className="hidden"
                id="portfolio-upload"
              />
              <label htmlFor="portfolio-upload" className="cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Upload Your Work</h4>
                <p className="text-sm text-gray-600">Show examples of your best work</p>
              </label>
            </div>

            {portfolioImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {portfolioImages.map(image => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-md">
                      <img
                        src={image.preview}
                        alt="Portfolio"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePortfolioImage(image.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <input
                      type="text"
                      placeholder="Caption..."
                      value={image.caption}
                      onChange={(e) => updateImageCaption(image.id, e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <Star className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-bold text-gray-900">Customer Reviews (Optional)</h3>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-4">Add Customer Review</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    placeholder="Customer name"
                    value={newReview.clientName}
                    onChange={(e) => setNewReview(prev => ({ ...prev, clientName: e.target.value }))}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Service provided"
                    value={newReview.service}
                    onChange={(e) => setNewReview(prev => ({ ...prev, service: e.target.value }))}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview(prev => ({ ...prev, rating }))
                  )}
                </div>
                <textarea
                  placeholder="What did the customer say about your work?"
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addReview}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all font-semibold text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Review</span>
                </button>
              </div>
            </div>

            {customerReviews.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Added Reviews</h4>
                {customerReviews.map(review => (
                  <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900 text-sm">{review.clientName}</h5>
                        <p className="text-xs text-gray-600">{review.service}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReview(review.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-5 px-8 rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Profile'
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              Your profile will be reviewed and you'll be notified when it's ready
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}