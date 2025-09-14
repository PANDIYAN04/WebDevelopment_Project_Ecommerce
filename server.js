const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const USERS_FILE = path.join(__dirname, 'users.json');

function readJSON(file, defaultValue){ try { return JSON.parse(fs.readFileSync(file)); } catch(e){ return defaultValue; } }
function writeJSON(file, data){ fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

app.get('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE, []);
  res.json(products);
});

app.post('/api/orders', (req, res) => {
  const order = req.body;
  if(!order || !order.items || order.items.length === 0) return res.status(400).json({error:'Empty order'});
  const orders = readJSON(ORDERS_FILE, []);
  order.id = (orders.length + 1);
  order.date = new Date().toISOString();
  orders.push(order);
  writeJSON(ORDERS_FILE, orders);
  res.json({status:'ok', orderId: order.id});
});

app.post('/api/register', (req, res) => {
  const {name, email, password} = req.body;
  if(!email || !password) return res.status(400).json({error:'email and password required'});
  const users = readJSON(USERS_FILE, []);
  if(users.find(u=>u.email===email)) return res.status(400).json({error:'user exists'});
  const id = users.length + 1;
  users.push({id, name, email, password});
  writeJSON(USERS_FILE, users);
  res.json({status:'ok', id});
});

app.post('/api/login', (req, res) => {
  const {email, password} = req.body;
  const users = readJSON(USERS_FILE, []);
  const u = users.find(x=>x.email===email && x.password===password);
  if(!u) return res.status(401).json({error:'invalid credentials'});
  res.json({status:'ok', user:{id:u.id, name:u.name, email:u.email}});
});

app.listen(PORT, ()=> console.log('Server running on port', PORT));