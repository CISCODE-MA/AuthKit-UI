# 🧪 Quick Setup - OAuth Testing App

> **Setup veloce per testare tutti i provider OAuth**

---

## 📦 1. Installa Dipendenze

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-router-dom
npm install @ciscode/ui-authentication-kit
```

---

## 📁 2. Struttura File

```
src/
├── App.tsx                        # Main app con routes
├── pages/
│   ├── LoginPage.tsx              # Complete login (local + OAuth)
│   ├── DashboardPage.tsx          # Protected page
│   └── callbacks/
│       ├── GoogleCallback.tsx
│       ├── MicrosoftCallback.tsx
│       └── FacebookCallback.tsx
└── .env                           # Environment vars
```

---

## 🔧 3. Copia File Example

```bash
# Da auth-kit-ui/examples/ alla tua app:

# Login page con tutti i provider
cp examples/CompleteLoginPage.example.tsx src/pages/LoginPage.tsx

# OAuth callbacks
cp examples/OAuthCallbackPages.example.tsx src/pages/callbacks/OAuthCallbacks.tsx

# App router completo
cp examples/AppWithOAuth.example.tsx src/App.tsx
```

---

## 🌐 4. Configura Environment

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:3000
```

**Backend (.env):**
```env
# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/auth_kit_test

# JWT (già generati)
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EMAIL_SECRET=...
JWT_RESET_SECRET=...

# SMTP (già configurato)
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...

# URLs
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_SECRET
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=YOUR_CLIENT_ID
MICROSOFT_CLIENT_SECRET=YOUR_SECRET
MICROSOFT_CALLBACK_URL=http://localhost:3000/api/auth/microsoft/callback
MICROSOFT_TENANT_ID=common

# Facebook OAuth
FB_CLIENT_ID=YOUR_APP_ID
FB_CLIENT_SECRET=YOUR_APP_SECRET
FB_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
```

---

## 🚀 5. Avvia App

```bash
# Backend (porta 3000)
cd modules/auth-kit
npm run start:dev

# Frontend (porta 3001 o diversa)
cd your-test-app
npm run dev
```

---

## 🧪 6. Test Flow

### Local Login (già testato):
1. Vai su `http://localhost:3001/login`
2. Login con email/password
3. ✅ Redirect a `/dashboard`

### Google OAuth:
1. Vai su `http://localhost:3001/login`
2. Click "Continue with Google"
3. Redirect a Google consent screen
4. Accetta permessi
5. ✅ Redirect a `/dashboard` con token

### Microsoft OAuth:
1. Click "Continue with Microsoft"
2. Login con Microsoft account
3. ✅ Redirect a `/dashboard`

### Facebook OAuth:
1. Click "Continue with Facebook"
2. Login con Facebook account
3. ✅ Redirect a `/dashboard`

---

## 🔍 Debug

### Verifica Token Salvati:
```javascript
// In browser console
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

### Verifica Backend Logs:
```bash
# Terminal backend - dovresti vedere:
[OAuth] INFO: Google login successful: user@gmail.com
[OAuth] INFO: Microsoft login successful: user@company.com
[OAuth] INFO: Facebook login successful: user@facebook.com
```

### Verifica Callback URL:
```
# Dopo OAuth redirect, dovresti vedere URL tipo:
http://localhost:3001/oauth/google/callback?accessToken=...&refreshToken=...
```

---

## ⚙️ Configurazione OAuth Providers

### Callback URLs da configurare:

**Google Cloud Console:**
```
Authorized redirect URIs:
http://localhost:3000/api/auth/google/callback
```

**Azure Portal (Microsoft):**
```
Redirect URI:
http://localhost:3000/api/auth/microsoft/callback
```

**Facebook Developers:**
```
Valid OAuth Redirect URIs:
http://localhost:3000/api/auth/facebook/callback
```

---

## 📝 Checklist

### Backend:
- [ ] `.env` configurato con OAuth credentials
- [ ] Backend running su porta 3000
- [ ] MongoDB running
- [ ] Seed default roles eseguito

### Frontend:
- [ ] Dependencies installate
- [ ] File copiati da examples/
- [ ] `.env` con `REACT_APP_API_URL=http://localhost:3000`
- [ ] App running su porta diversa da 3000

### OAuth Providers:
- [ ] Google Client ID + Secret configurati
- [ ] Microsoft Client ID + Secret configurati
- [ ] Facebook App ID + Secret configurati
- [ ] Callback URLs matchano in tutti i provider

### Test:
- [ ] Local login funziona
- [ ] Google OAuth redirect funziona
- [ ] Google callback riceve tokens
- [ ] Microsoft OAuth funziona
- [ ] Facebook OAuth funziona
- [ ] Dashboard mostra utente autenticato

---

## 🚨 Troubleshooting

### ❌ "Redirect URI mismatch"
**Fix**: Verifica che callback URL in .env sia **IDENTICO** a quello nel provider console

### ❌ "CORS error"
**Fix**: Backend deve avere:
```typescript
app.enableCors({
  origin: 'http://localhost:3001', // Frontend URL
  credentials: true,
});
```

### ❌ "Token not found in callback"
**Fix**: Controlla backend logs - provider potrebbe aver ritornato errore

### ❌ OAuth button non redirige
**Fix**: Verifica che `REACT_APP_API_URL` sia corretto in frontend .env

---

## 📚 Risorse

- **Backend Guide**: `modules/auth-kit/docs/TESTING_GUIDE.md`
- **OAuth Credentials**: `modules/auth-kit/docs/CREDENTIALS_NEEDED.md`
- **Examples**: `modules/auth-kit-ui/examples/`

---

**Pronto per testare! 🚀**

