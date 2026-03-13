import React, { useState, useEffect } from 'react';

const GreyHillWidget = () => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPublisher, setSelectedPublisher] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);

  // Get customer ID from URL parameter
  const customerId = new URLSearchParams(window.location.search).get('customer_id') || 'unknown';

  // Main categories
  const MAIN_CATEGORIES = ['Ebooks', 'Audio', 'Plays', 'Live Events', 'Gift Cards'];

  // Featured products (you can customize this logic)
  const featuredProductIds = new Set();

  useEffect(() => {
    fetchProductsAndCollections();
  }, []);

  const fetchProductsAndCollections = async () => {
    try {
      setLoading(true);
      
      // Fetch from Shopify public REST API (no authentication needed)
      const productsRes = await fetch(`https://thegreyhill.myshopify.com/products.json?limit=250`);
      const productsData = await productsRes.json();
      
      const collectionsRes = await fetch(`https://thegreyhill.myshopify.com/collections.json?limit=250`);
      const collectionsData = await collectionsRes.json();

      if (productsData.products) {
        const productsList = productsData.products.map(product => ({
          id: product.id.toString(),
          title: product.title,
          handle: product.handle,
          description: product.body_html || '',
          priceRange: {
            minVariantPrice: {
              amount: product.variants && product.variants[0] ? product.variants[0].price : '0',
              currencyCode: 'GBP'
            }
          },
          images: {
            edges: product.images && product.images.length > 0 
              ? product.images.map(img => ({
                  node: {
                    url: img.src,
                    altText: img.alt || product.title
                  }
                }))
              : []
          },
          collections: { edges: [] }
        }));

        const collectionsList = collectionsData.collections 
          ? collectionsData.collections.map(col => ({
              id: col.id.toString(),
              title: col.title,
              handle: col.handle
            }))
          : [];
        
        setProducts(productsList);
        setCollections(collectionsList);
      }
    } catch (error) {
      console.error('Error fetching from Shopify:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search, category, and publisher
  const getFilteredProducts = () => {
    return products.filter(product => {
      // Search filter
      if (searchTerm && !product.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const productCollections = product.collections?.edges?.map(e => e.
