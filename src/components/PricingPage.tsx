import React, { useState } from 'react';
import { Check, Zap, Crown, CreditCard, Shield, Users, Sparkles, Star, ArrowRight, Building2, Gift } from 'lucide-react';
import { stripeProducts } from '../stripe-config';
import { StripeCheckout } from './StripeCheckout';
import { SubscriptionStatus } from './SubscriptionStatus';
import { OrderHistory } from './OrderHistory';
import { useAuth } from '../hooks/useAuth';
import { useStripe } from '../hooks/useStripe';

export function PricingPage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(stripeProducts[0]);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscription' | 'orders'>('plans');
  const { user } = useAuth();
  const { isSubscriptionActive } = useStripe();

  const handleSelectPlan = (product: typeof stripeProducts[0]) => {
    if (product.price === 0) {
      // Handle free plan - no checkout needed
      alert('Free plan selected! You can start using basic features immediately.');
      return;
    }
    setSelectedProduct(product);
    setShowCheckout(true);
  };

  const getProductIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'free plan':
        return <Gift className="w-8 h-8" />;
      case 'individual subscription':
        return <Zap className="w-8 h-8" />;
      case 'business subscription':
        return <Crown className="w-8 h-8" />;
      default:
        return <CreditCard className="w-8 h-8" />;
    }
  };

  const formatPrice = (product: typeof stripeProducts[0]) => {
    if (product.price === 0) {
      return 'Free';
    }
    const symbol = product.currency === 'ZAR' ? 'R' : '$';
    return `${symbol}${product.price}`;
  };

  const getFeatures = (name: string) => {
    switch (name.toLowerCase()) {
      case 'free plan':
        return [
          'Basic profile creation',
          'Limited AI bio generation (3 per month)',
          'Basic search functionality',
          'Community support',
          'Standard listing visibility'
        ];
      case 'individual subscription':
        return [
          'Unlimited AI-powered profile generation',
          'Advanced profile customization',
          'Priority search ranking',
          'Email support',
          'Analytics dashboard',
          'Social media integration'
        ];
      case 'business subscription':
        return [
          'Everything in Individual plan',
          'Business profile hosting',
          'Online booking system',
          'Customer management tools',
          'Payment processing integration',
          'Advanced analytics & reporting',
          'Priority customer support',
          'Custom branding options'
        ];
      default:
        return ['Standard features included'];
    }
  };

  const getCtaLabel = (product: typeof stripeProducts[0]) => {
    if (product.price === 0) return 'Get Started Free';
    return 'Upgrade Now';
  };

  const getPopularBadge = (name: string) => {
    if (name.toLowerCase() === 'individual subscription') {
      return (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl border-4 border-white">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-300" />
              <span>Most Popular</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center p-4">
        <StripeCheckout
          selectedProduct={selectedProduct}
          onSuccess={() => setShowCheckout(false)}
          onCancel={() => setShowCheckout(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-6 leading-tight">
            TAC Marketplace
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Choose the perfect plan for your business needs. Start free and upgrade as you grow with our AI-powered service platform.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-8 text-sm text-slate-500 mb-12">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Secure & Trusted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>1000+ Providers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {user && (
          <div className="flex justify-center mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-2">
              <div className="flex space-x-2">
                {[
                  { id: 'plans', label: 'Plans & Pricing', icon: CreditCard },
                  { id: 'subscription', label: 'My Subscription', icon: Crown },
                  { id: 'orders', label: 'Order History', icon: Zap }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg transform scale-105'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        {(!user || activeTab === 'plans') && (
          <div>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-800 mb-6">Choose Your Plan</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Start free and upgrade when you're ready. All plans include our core features with no hidden fees.
              </p>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
              {stripeProducts.map((product, index) => (
                <div
                  key={product.priceId}
                  className={`relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border overflow-hidden transform hover:scale-105 transition-all duration-500 ${
                    product.name.toLowerCase() === 'individual subscription'
                      ? 'border-blue-300 ring-4 ring-blue-200 ring-opacity-50 scale-105'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Popular Badge */}
                  {getPopularBadge(product.name)}

                  <div className="p-10">
                    {/* Icon */}
                    <div className="flex justify-center mb-8">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl ${
                        product.price === 0 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                          : product.name.toLowerCase() === 'individual subscription'
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                          : 'bg-gradient-to-br from-slate-700 to-slate-600'
                      }`}>
                        <div className="text-white">
                          {getProductIcon(product.name)}
                        </div>
                      </div>
                    </div>

                    {/* Plan Info */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-800 mb-3">{product.name}</h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">{product.description}</p>

                      <div className="mb-8">
                        <div className="flex items-baseline justify-center">
                          <span className="text-5xl font-bold text-slate-800">
                            {formatPrice(product)}
                          </span>
                          {product.mode === 'subscription' && product.price !== 0 && (
                            <span className="text-slate-600 ml-3 text-lg">/month</span>
                          )}
                        </div>
                        {product.mode === 'subscription' && product.price !== 0 && (
                          <p className="text-sm text-slate-500 mt-2">Billed monthly, cancel anytime</p>
                        )}
                        {product.price === 0 && (
                          <p className="text-sm text-green-600 mt-2 font-medium">No credit card required</p>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-10">
                      <ul className="space-y-4">
                        {getFeatures(product.name).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-slate-700 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(product)}
                      disabled={!user && product.price !== 0}
                      className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                        product.price === 0
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-xl hover:shadow-2xl transform hover:scale-105'
                          : product.name.toLowerCase() === 'individual subscription'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <span>
                        {!user && product.price !== 0
                          ? 'Sign in to purchase'
                          : getCtaLabel(product)}
                      </span>
                      {(user || product.price === 0) && (
                        <ArrowRight className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Features Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 p-12 mb-16">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-slate-800 mb-4">Why Choose TAC Marketplace?</h3>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Join thousands of successful service providers who trust our platform to grow their business
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-3">AI-Powered</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Generate professional profiles and content with our advanced AI technology
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-3">Secure & Reliable</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Bank-level security with 99.9% uptime guarantee for your peace of mind
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-3">Growing Community</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Connect with a thriving network of professionals and potential clients
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {user && activeTab === 'subscription' && (
          <div className="max-w-2xl mx-auto">
            <SubscriptionStatus />
          </div>
        )}

        {/* Orders Tab */}
        {user && activeTab === 'orders' && (
          <div className="max-w-4xl mx-auto">
            <OrderHistory />
          </div>
        )}

        {/* Footer CTA */}
        {(!user || activeTab === 'plans') && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl shadow-2xl p-12 text-white">
              <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                Join TAC Marketplace today and start growing your business with our powerful platform
              </p>
              {!user && (
                <button 
                  onClick={() => handleSelectPlan(stripeProducts[0])}
                  className="bg-white text-slate-800 font-bold py-4 px-8 rounded-xl hover:bg-slate-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Free Today
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}