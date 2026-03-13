const { useState, useEffect } = React;

// Get customer_id from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('customer_id') || 'unknown';

function GreyHillWidget() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPublisher, setSelectedPublisher] = useState('all');

  useEffect(() => {
    // Fetch products from Shopify
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://thegreyhill.myshopify.com/products.json?limit=250');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } },
      React.createElement('p', null, 'Loading products...')
    );
  }

  return React.createElement(
    'div',
    { style: { padding: '20px', maxWidth: '1200px', margin: '0 auto' } },
    React.createElement('h1', null, 'The Grey Hill Products'),
    React.createElement('input', {
      type: 'text',
      placeholder: 'Search products...',
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      style: {
        width: '100%',
        padding: '10px',
        marginBottom: '20px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }
    }),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' } },
      filteredProducts.slice(0, 12).map(product =>
        React.createElement(
          'div',
          { key: product.id, style: {
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#fff'
          }},
          product.featured_image && React.createElement('img', {
            src: product.featured_image.src,
            alt: product.title,
            style: { width: '100%', height: '200px', objectFit: 'cover' }
          }),
          React.createElement(
            'div',
            { style: { padding: '15px' } },
            React.createElement('h3', { style: { marginBottom: '10px' } }, product.title),
            React.createElement('p', { style: { color: '#666', marginBottom: '10px' } },
              product.variants[0]?.price ? `£${product.variants[0].price}` : 'Price on request'
            ),
            React.createElement('a', {
              href: `https://thegreyhill.myshopify.com/products/${product.handle}?ref=${customerId}`,
              target: '_blank',
              rel: 'noopener noreferrer',
              style: {
                display: 'inline-block',
                padding: '10px 15px',
                backgroundColor: '#007bff',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }
            }, 'View Product')
          )
        )
      )
    )
  );
}

// Render the widget
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(GreyHillWidget));
