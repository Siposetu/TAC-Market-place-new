export const stripeProducts = [
  {
    priceId: 'free_plan', // Special ID for free plan
    name: 'Free Plan',
    description: 'Perfect for getting started with basic features and limited AI generation',
    mode: 'payment' as const,
    price: 0,
    currency: 'ZAR'
  },
  {
    priceId: 'price_1RiVkACVwlXJEJ4LUrEYcLDe', // Individual subscription price ID
    name: 'Individual Subscription',
    description: 'Unlimited AI profile generation and premium features for individual service providers',
    mode: 'subscription' as const,
    price: 50,
    currency: 'ZAR'
  },
  {
    priceId: 'price_1RiVhtCVwlXJEJ4LKPOZPcqh', // Business subscription price ID
    name: 'Business Subscription',
    description: 'Complete business solution with booking management, analytics, and priority support',
    mode: 'subscription' as const,
    price: 100,
    currency: 'ZAR'
  }
];

export type StripeProduct = typeof stripeProducts[number];