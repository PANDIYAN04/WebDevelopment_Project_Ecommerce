Simple E-commerce Demo
=================================

How to run:
1. Install Node.js (v14+)
2. In project folder run:
   npm install
   npm start
3. Open http://localhost:3000

Features:
- 50 demo products (products.json) with Picsum image URLs
- Product listing, product modal, cart (localStorage)
- Checkout posts order to server and saves to orders.json
- Simple register/login endpoints (for demo only; passwords stored in plaintext)
- Static frontend in public/

Notes:
- This is a demo project intended for learning. Do NOT use plaintext password storage in production.
- Images are loaded from https://picsum.photos which requires internet in the environment running the app.
