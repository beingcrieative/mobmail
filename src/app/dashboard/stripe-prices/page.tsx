"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Price {
  id: string;
  currency: string;
  unit_amount: number | null;
  nickname: string | null;
  recurring: {
    interval: string;
    interval_count: number;
  } | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

interface EnvConfig {
  [key: string]: string;
}

const StripePricesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [pricesByProduct, setPricesByProduct] = useState<Record<string, any[]>>({});
  const [envConfig, setEnvConfig] = useState<EnvConfig>({});
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/dev/list-stripe-prices');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch Stripe prices');
        }
        
        const data = await response.json();
        
        setProducts(data.products || []);
        setPrices(data.prices || []);
        setPricesByProduct(data.pricesByProduct || {});
        setEnvConfig(data.env_config || {});
      } catch (err) {
        console.error('Error fetching Stripe prices:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast.error('Failed to fetch Stripe price data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrices();
  }, []);
  
  const formatAmount = (amount: number | null, currency: string) => {
    if (amount === null) return 'N/A';
    
    // Convert cents to dollars/euros
    const value = amount / 100;
    
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(value);
  };
  
  const copyEnvConfig = () => {
    const envText = Object.entries(envConfig)
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');
    
    navigator.clipboard.writeText(envText)
      .then(() => {
        setCopied(true);
        toast.success('Price IDs copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
      });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stripe Prices</h1>
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stripe Prices</h1>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-100 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <p className="text-red-600 dark:text-red-400 mt-2">
                Make sure your STRIPE_SECRET_KEY is correct in .env.local
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stripe Prices</h1>
          
          {/* Environment Variables Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Environment Variables</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Copy these values to your <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">.env.local</code> file:
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md font-mono text-sm mb-4 overflow-x-auto">
              {Object.keys(envConfig).length > 0 ? (
                Object.entries(envConfig).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <span className="text-purple-600 dark:text-purple-400">{key}</span>=
                    <span className="text-green-600 dark:text-green-400">"{value}"</span>
                  </div>
                ))
              ) : (
                <p className="text-orange-600 dark:text-orange-400">
                  No price IDs found that match our expected naming pattern.
                </p>
              )}
            </div>
            
            <button
              onClick={copyEnvConfig}
              disabled={Object.keys(envConfig).length === 0}
              className={`px-4 py-2 rounded-md font-medium ${
                Object.keys(envConfig).length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
          
          {/* Products and Prices Section */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">All Products and Prices</h2>
          
          {products.length === 0 ? (
            <p className="text-orange-600 dark:text-orange-400">
              No products found in your Stripe account. Create products in the Stripe dashboard first.
            </p>
          ) : (
            <div className="space-y-8">
              {products.map(product => (
                <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {product.name}
                      {!product.active && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Inactive</span>}
                    </h3>
                    {product.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                    )}
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price ID</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nickname</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Billing</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {pricesByProduct[product.id]?.length > 0 ? (
                          pricesByProduct[product.id].map(price => (
                            <tr key={price.id}>
                              <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">{price.id}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{price.nickname || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                {formatAmount(price.unit_amount, price.currency)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                {price.recurring 
                                  ? `Every ${price.recurring.interval_count} ${price.recurring.interval}${price.recurring.interval_count > 1 ? 's' : ''}` 
                                  : 'One-time'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                              No prices found for this product
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Need to set up products in Stripe? <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Go to Stripe Dashboard</a>
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              After adding the price IDs to your .env.local file, set <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">NEXT_PUBLIC_DEV_BYPASS_STRIPE="false"</code> to use the real Stripe checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripePricesPage; 