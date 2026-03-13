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
      
      // Fetch products from Shopify Storefront API (public, no token needed)
      const productsResponse = await fetch(
        `https://thegreyhill.com/api/2024-01/graphql.json`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              {
                products(first: 100) {
                  edges {
                    node {
                      id
                      title
                      handle
                      description
                      priceRange {
                        minVariantPrice {
                          amount
                          currencyCode
                        }
                      }
                      images(first: 1) {
                        edges {
                          node {
                            url
                            altText
                          }
                        }
                      }
                      collections(first: 10) {
                        edges {
                          node {
                            title
                            handle
                          }
                        }
                      }
                    }
                  }
                }
                collections(first: 50) {
                  edges {
                    node {
                      id
                      title
                      handle
                    }
                  }
                }
              }
            `
          })
        }
      );

      const data = await productsResponse.json();
      
      if (data.data && data.data.products) {
        const productsList = data.data.products.edges.map(edge => edge.node);
        const collectionsList = data.data.collections.edges.map(edge => edge.node);
        
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
        const productCollections = product.collections?.edges?.map(e => e.node.title) || [];
        if (!productCollections.includes(selectedCategory)) {
          return false;
        }
      }

      // Publisher filter
      if (selectedPublisher !== 'all') {
        const productCollections = product.collections?.edges?.map(e => e.node.title) || [];
        if (!productCollections.includes(selectedPublisher)) {
          return false;
        }
      }

      return true;
    });
  };

  // Get related products for single product view
  const getRelatedProducts = (currentProduct) => {
    const currentCollections = currentProduct.collections?.edges?.map(e => e.node.title) || [];
    return products
      .filter(p => p.id !== currentProduct.id)
      .filter(p => {
        const pCollections = p.collections?.edges?.map(e => e.node.title) || [];
        return pCollections.some(c => currentCollections.includes(c));
      })
      .slice(0, 4);
  };

  // Get publisher collections (non-main categories)
  const getPublishers = () => {
    const publisherSet = new Set();
    collections.forEach(col => {
      if (!MAIN_CATEGORIES.includes(col.title)) {
        publisherSet.add(col.title);
      }
    });
    return Array.from(publisherSet).sort();
  };

  const addToCart = (product) => {
    setCart([...cart, { ...product, cartId: Date.now() }]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const proceedToCheckout = () => {
    const cartItems = cart.map(item => `${item.handle}:1`).join(',');
    const checkoutUrl = `https://thegreyhill.com/cart?${cartItems}&ref=${customerId}`;
    window.location.href = checkoutUrl;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading products...</p>
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();
  const publishers = getPublishers();
  const relatedProducts = selectedProduct ? getRelatedProducts(selectedProduct) : [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>The Grey Hill</h1>
        <p style={styles.subtitle}>Digital Theatre & Content</p>
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {selectedProduct ? (
        // PRODUCT DETAIL VIEW
        <div style={styles.detailView}>
          <button 
            onClick={() => setSelectedProduct(null)}
            style={styles.backButton}
          >
            ← Back
          </button>

          <div style={styles.productDetail}>
            <div style={styles.productImage}>
              {selectedProduct.images?.edges?.[0]?.node?.url && (
                <img 
                  src={selectedProduct.images.edges[0].node.url} 
                  alt={selectedProduct.title}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              )}
            </div>

            <div style={styles.productInfo}>
              <h2 style={styles.productTitle}>{selectedProduct.title}</h2>
              <p style={styles.price}>
                £{selectedProduct.priceRange?.minVariantPrice?.amount || 'TBC'}
              </p>
              <p style={styles.description}>{selectedProduct.description}</p>
              
              <button 
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                style={styles.addButton}
              >
                Add to Cart
              </button>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div style={styles.relatedSection}>
              <h3>You Might Also Like</h3>
              <div style={styles.productGrid}>
                {relatedProducts.map(product => (
                  <div 
                    key={product.id}
                    style={styles.productCard}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.images?.edges?.[0]?.node?.url && (
                      <img 
                        src={product.images.edges[0].node.url} 
                        alt={product.title}
                        style={styles.cardImage}
                      />
                    )}
                    <h4 style={styles.cardTitle}>{product.title}</h4>
                    <p style={styles.cardPrice}>
                      £{product.priceRange?.minVariantPrice?.amount || 'TBC'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // MAIN BROWSE VIEW
        <>
          {/* Category Tabs */}
          <div style={styles.categoryTabs}>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedPublisher('all');
              }}
              style={{
                ...styles.tab,
                ...(selectedCategory === 'all' ? styles.tabActive : {})
              }}
            >
              All
            </button>
            {MAIN_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedPublisher('all');
                }}
                style={{
                  ...styles.tab,
                  ...(selectedCategory === cat ? styles.tabActive : {})
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Publisher Filter */}
          {publishers.length > 0 && (
            <div style={styles.filterSection}>
              <label style={styles.filterLabel}>Filter by Publisher:</label>
              <select
                value={selectedPublisher}
                onChange={(e) => setSelectedPublisher(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Publishers</option>
                {publishers.map(pub => (
                  <option key={pub} value={pub}>{pub}</option>
                ))}
              </select>
            </div>
          )}

          {/* Products Grid */}
          <div style={styles.productGrid}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div 
                  key={product.id}
                  style={styles.productCard}
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.images?.edges?.[0]?.node?.url && (
                    <img 
                      src={product.images.edges[0].node.url} 
                      alt={product.title}
                      style={styles.cardImage}
                    />
                  )}
                  <h4 style={styles.cardTitle}>{product.title}</h4>
                  <p style={styles.cardPrice}>
                    £{product.priceRange?.minVariantPrice?.amount || 'TBC'}
                  </p>
                </div>
              ))
            ) : (
              <p style={styles.noResults}>No products found</p>
            )}
          </div>

          {/* Floating Cart */}
          <div style={styles.cartButton}>
            <button 
              onClick={() => setShowCart(!showCart)}
              style={styles.cartBadge}
            >
              🛒 Cart ({cart.length})
            </button>
          </div>

          {/* Cart Sidebar */}
          {showCart && (
            <div style={styles.cartSidebar}>
              <h3>Shopping Cart</h3>
              {cart.length > 0 ? (
                <>
                  {cart.map(item => (
                    <div key={item.cartId} style={styles.cartItem}>
                      <span>{item.title}</span>
                      <button 
                        onClick={() => removeFromCart(item.cartId)}
                        style={styles.removeButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={proceedToCheckout}
                    style={styles.checkoutButton}
                  >
                    Proceed to Checkout
                  </button>
                  <p style={styles.transferMessage}>
                    You'll be transferred to The Grey Hill store to complete payment.
                  </p>
                </>
              ) : (
                <p>Your cart is empty</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #333',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '28px',
    color: '#333',
  },
  subtitle: {
    margin: '0',
    fontSize: '14px',
    color: '#666',
  },
  searchContainer: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  categoryTabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease',
  },
  tabActive: {
    backgroundColor: '#333',
    color: '#fff',
    borderColor: '#333',
  },
  filterSection: {
    marginBottom: '20px',
  },
  filterLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  select: {
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  productCard: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    textAlign: 'center',
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  cardTitle: {
    margin: '10px 0 5px 0',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  cardPrice: {
    margin: '0',
    fontSize: '16px',
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  noResults: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#666',
  },
  cartButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '100',
  },
  cartBadge: {
    padding: '12px 20px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  cartSidebar: {
    position: 'fixed',
    right: '0',
    top: '0',
    width: '300px',
    height: '100vh',
    backgroundColor: '#fff',
    boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
    padding: '20px',
    overflowY: 'auto',
    zIndex: '99',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
  },
  checkoutButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
  },
  transferMessage: {
    fontSize: '12px',
    color: '#666',
    marginTop: '10px',
    fontStyle: 'italic',
  },
  detailView: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '20px',
  },
  productDetail: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '40px',
  },
  productImage: {
    maxHeight: '400px',
    overflow: 'hidden',
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  productTitle: {
    margin: '0 0 15px 0',
    fontSize: '24px',
  },
  price: {
    fontSize: '20px',
    color: '#2ecc71',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
  },
  description: {
    margin: '0 0 20px 0',
    lineHeight: '1.6',
    color: '#555',
  },
  addButton: {
    padding: '12px 24px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  relatedSection: {
    marginTop: '40px',
    paddingTop: '30px',
    borderTop: '1px solid #eee',
  },
};

export default GreyHillWidget;
