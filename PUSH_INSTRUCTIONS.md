
# How to push this project to GitHub

## 1) Create an empty repo on GitHub
- GitHub → New repository → **mini-ecommerce-react** (no README)

## 2) On your machine
```bash
unzip mini-ecommerce-react-github.zip -d .
cd mini-ecommerce-react

git init
git add .
git commit -m "Initial commit: mini e-commerce full stack"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/mini-ecommerce-react.git
git push -u origin main
```

## 3) Run
### Backend
```bash
cd server
cp .env.example .env
npm i
npm run dev  # http://localhost:4000
```
### Frontend
Create `.env` at project root:
```env
VITE_API_URL=http://localhost:4000/api
# Optional Cloudinary:
# VITE_CLOUDINARY_CLOUD=your_cloud_name
# VITE_CLOUDINARY_PRESET=your_unsigned_preset
```
Then:
```bash
cd ..
npm i
npm run dev  # http://localhost:5173
```
Default admin: `admin@example.com` / `admin123` (change in `server/.env`)
