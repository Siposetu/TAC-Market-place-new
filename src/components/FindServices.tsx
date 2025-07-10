import React, { useState } from 'react';
import { Search, MapPin, Filter, Calendar, Star, Phone, Mail, MessageCircle, Bot, Building2, Sparkles, Users, Award, Clock } from 'lucide-react';
import { ServiceProvider } from '../types';
import { useServiceProviders } from '../hooks/useServiceProviders';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { MapView } from './MapView';
import { BookingModal } from './BookingModal';
import { useAuth } from '../hooks/useAuth';

export function FindServices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [bookingProvider, setBookingProvider] = useState<ServiceProvider | null>(null);

  const { providers, findNearbyProviders } = useServiceProviders();
  const { geocodeAddress } = useGoogleMaps();
  const { user } = useAuth();

  const services = [
    'Plumbing', 'Electrical Work', 'Carpentry', 'Painting', 'Gardening',
    'Cleaning', 'Tutoring', 'Catering', 'Photography', 'Web Development',
    'Graphic Design', 'Music Lessons', 'Fitness Training', 'Hair Styling',
    'Mechanic', 'Tailoring', 'Other'
  ];

  const handleLocationSearch = async (location: string) => {
    const coords = await geocodeAddress(location);
    if (coords) {
      setUserLocation(coords);
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = !selectedService || provider.service === selectedService;

    return matchesSearch && matchesService && provider.status === 'Published';
  });

  const nearbyProviders = userLocation
    ? findNearbyProviders(userLocation, 15)
    : filteredProviders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          
          <div className="relative px-8 py-16 lg:px-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                      Find Amazing
                      <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                        Local Services
                      </span>
                    </h1>
                  </div>
                </div>
                
                <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
                  Connect with skilled professionals in your area. From home repairs to personal services, 
                  find trusted providers with AI-powered matching.
                </p>

                <div className="flex items-center space-x-6 text-white/80">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">1000+ Providers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span className="font-medium">Verified Professionals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span className="font-medium">AI-Powered</span>
                  </div>
                </div>
              </div>

              <div className="lg:flex-shrink-0">
                <div className="relative">
                  <div className="w-64 h-64 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Building2 className="w-32 h-32 text-white/80" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant Notice */}
            <div className="mt-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3">
                <Bot className="w-6 h-6 text-yellow-300 animate-pulse" />
                <p className="text-white/90 font-medium">
                  Need help finding the perfect service? Try our AI assistant in the bottom right corner!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search Input */}
            <div className="md:col-span-2 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search providers, services, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-lg placeholder-gray-500"
              />
            </div>

            {/* Service Filter */}
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors" />
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full pl-12 pr-8 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-gray-50 focus:bg-white transition-all text-lg"
              >
                <option value="">All Services</option>
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            {/* Location Input */}
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-500 transition-colors" />
              <input
                type="text"
                placeholder="Enter your location..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLocationSearch(e.currentTarget.value);
                  }
                }}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 focus:bg-white text-lg placeholder-gray-500"
              />
            </div>
          </div>

          {/* Map Toggle */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Found <span className="font-bold text-gray-900">{nearbyProviders.length}</span> service providers
            </div>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${
                showMap
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
            </button>
          </div>
        </div>

        {/* Map View */}
        {showMap && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <MapView
              providers={nearbyProviders}
              center={userLocation || undefined}
              onProviderSelect={setSelectedProvider}
            />
          </div>
        )}

        {/* Results Grid */}
        {nearbyProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nearbyProviders.map(provider => (
              <div key={provider.id} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:scale-105">
                {/* Card Header */}
                <div className="relative p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xl">
                            {provider.fullName.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {provider.isBusinessOwner && provider.businessInfo
                            ? provider.businessInfo.businessName
                            : provider.fullName}
                        </h3>
                        <p className="text-sm text-blue-600 font-semibold bg-blue-100 px-2 py-1 rounded-full inline-block">
                          {provider.service}
                        </p>
                      </div>
                    </div>
                    
                    {provider.isBusinessOwner && (
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        BUSINESS
                      </div>
                    )}
                  </div>

                  {/* Rating and Experience */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">4.8 (24 reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{provider.yearsExperience} years exp.</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{provider.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        From R{provider.suggestedPrice}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span>Available</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                    {provider.generatedBio}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setBookingProvider(provider)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Now</span>
                    </button>

                    {/* Contact Options */}
                    <div className="flex space-x-2">
                      {provider.contactDetails?.phone && (
                        <a
                          href={`tel:${provider.contactDetails.phone}`}
                          className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors shadow-md hover:shadow-lg transform hover:scale-110"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}

                      {provider.contactDetails?.whatsapp && (
                        <a
                          href={`https://wa.me/${provider.contactDetails.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors shadow-md hover:shadow-lg transform hover:scale-110"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      {provider.contactDetails?.email && (
                        <a
                          href={`mailto:${provider.contactDetails.email}`}
                          className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors shadow-md hover:shadow-lg transform hover:scale-110"
                          title="Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Search className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No services found</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Try adjusting your search criteria or location to find more providers
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedService('');
                setUserLocation(null);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Booking Modal */}
        {bookingProvider && (
          <BookingModal
            isOpen={!!bookingProvider}
            onClose={() => setBookingProvider(null)}
            provider={bookingProvider}
          />
        )}
      </div>
    </div>
  );
}