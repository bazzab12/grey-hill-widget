# The Grey Hill Widget

A React-based product widget for embedding The Grey Hill store on theatre partner websites.

## Features

- ✓ Searchable product catalog (3k+ items)
- ✓ Filter by category (Ebooks, Audio, Plays, Live Events, Gift Cards)
- ✓ Filter by publisher (Birlinn Ltd, Nick Hern Books, etc.)
- ✓ Product detail pages with images and descriptions
- ✓ Related product recommendations
- ✓ Shopping cart functionality
- ✓ Direct checkout link to Shopify with customer tracking
- ✓ Mobile responsive

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Development
```bash
npm run dev
```

This starts a local dev server at http://localhost:3000

### 3. Build for Production
```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### 4. Deploy to Netlify

1. Go to https://netlify.com
2. Sign in with your account
3. Click "Add new site" → "Deploy manually"
4. Drag and drop the `dist/` folder
5. Your site is live!

## Embedding on Customer Websites

Once deployed to Netlify, you'll get a URL like: `https://grey-hill-widget.netlify.app`

### For Perth Theatre & Concert Hall

Give them this embed code:
```html
<div id="grey-hill-widget"></div>
<script src="https://grey-hill-widget.netlify.app/static/js/main.js?customer_id=perth_theatre"></script>
```

### For The Book Whisperers
```html
<div id="grey-hill-widget"></div>
<script src="https://grey-hill-widget.netlify.app/static/js/main.js?customer_id=book_whisperers"></script>
```

## Tracking Sales

In Shopify, orders will have the `ref=` parameter showing which customer referred them.
