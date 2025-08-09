
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const { nanoid } = require('nanoid')

const app = express()
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

app.use(cors())
app.use(express.json({ limit: '5mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const DB_PATH = path.join(__dirname, 'db.json')
function readDB(){ return JSON.parse(fs.readFileSync(DB_PATH,'utf8')) }
function writeDB(d){ fs.writeFileSync(DB_PATH, JSON.stringify(d,null,2)) }

// Auth
app.post('/api/auth/login', (req,res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).send('Email/password required')
  const ok = email === ADMIN_EMAIL && password === ADMIN_PASSWORD
  if (!ok) return res.status(401).send('Invalid credentials')
  const token = jwt.sign({ sub: email, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' })
  res.json({ token, email })
})

function auth(req,res,next){
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).send('Unauthorized')
  try { req.user = jwt.verify(token, JWT_SECRET); next() }
  catch { return res.status(401).send('Unauthorized') }
}

// Public
app.get('/api/products', (req,res)=> res.json(readDB().products))
app.get('/api/coupons', (req,res)=> res.json(readDB().coupons))

// Admin CRUD
app.post('/api/products', auth, (req,res)=>{
  const db = readDB(); const p = req.body; if(!p.id) p.id='p-'+nanoid(8); db.products.unshift(p); writeDB(db); res.status(201).json(p)
})
app.put('/api/products/:id', auth, (req,res)=>{
  const id = req.params.id; const db = readDB(); const idx = db.products.findIndex(x=>x.id===id)
  if(idx===-1) return res.status(404).send('Not Found')
  db.products[idx] = { ...db.products[idx], ...req.body, id }; writeDB(db); res.json(db.products[idx])
})
app.delete('/api/products/:id', auth, (req,res)=>{
  const id = req.params.id; const db = readDB(); const exists = db.products.some(x=>x.id===id)
  if(!exists) return res.status(404).send('Not Found')
  db.products = db.products.filter(x=>x.id!==id); writeDB(db); res.json({ ok:true })
})

// Upload
const upload = multer({ dest: path.join(__dirname, 'uploads') })
app.post('/api/upload', auth, upload.single('file'), (req,res)=>{ res.json({ url: `/uploads/${req.file.filename}` }) })

app.listen(PORT, ()=> console.log('API http://localhost:'+PORT))
