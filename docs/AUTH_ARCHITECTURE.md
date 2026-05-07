# AUTHENTICATION & AUTHORIZATION ARCHITECTURE

## Admin Access Control - Faith & Fashion Nairobi

**Version:** 2.0  
**Security Level:** Production-Standard  
**Authentication Provider:** Supabase Auth (JWT)

---

## 1. OVERVIEW

The administrative interface is a **restricted route** decoupled from public navigation. Access is controlled through a multi-layered authentication and authorization system:

```
Client Request → Route Guard → Token Validation → Role Check → Admin Dashboard
                   (403 if fail)
```

**Key Principles:**
- Zero-trust model: Every admin API call requires authentication
- JWT-based stateless authentication (no server sessions)
- Token expiry and refresh mechanism
- Rate limiting per token/IP
- Comprehensive audit logging

---

## 2. AUTHENTICATION FLOW

### 2.1 Initial Admin Login

**Login Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "admin@faithandfashion.co.ke",
  "password": "encrypted-admin-password-or-service-key"
}
```

**Login Process:**
1. **Validate credentials** against Supabase Auth service
2. **Verify admin role** (custom `app_metadata.role === 'admin'`)
3. **Generate JWT token** with claims:
   ```javascript
   {
     "sub": "admin-user-id",
     "email": "admin@faithandfashion.co.ke",
     "role": "admin",
     "exp": 1715170800, // 1 hour from now
     "iat": 1715167200,
     "iss": "https://your-project.supabase.co/auth/v1"
   }
   ```
4. **Return response:**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIs...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "def50200..."
   }
   ```
5. **Store token** on client: `localStorage.setItem('admin_token', accessToken)`

---

### 2.2 Token Structure (Supabase JWT)

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (claims):**
```json
{
  "aud": "authenticated",
  "exp": 1756651200,
  "iat": 1756647600,
  "iss": "https://your-project.supabase.co/auth/v1",
  "sub": "a1b2c3d4-...",
  "email": "admin@faithandfashion.co.ke",
  "app_metadata": {
    "provider": "email",
    "providers": ["email"]
  },
  "user_metadata": {
    "role": "admin",
    "full_name": "Admin User"
  },
  "role": "authenticated"
}
```

**Signature Verification:**
- HMAC-SHA256 using `SUPABASE_JWT_SECRET`
- Verified server-side on every admin API request

---

### 2.3 Token Lifecycle

```
[User logs in]
     ↓
[Access Token] (1 hour)
     ↓
[Token Expires?] → No → Continue using
     ↓ Yes
[Refresh Token] (7 days) → Refresh endpoint → New access token
     ↓
[Refresh Token Expired?] → No → Continue
     ↓ Yes
[Redirect to Login] (session truly expired)
```

**Refresh Mechanism:**
```javascript
// /api/auth/refresh
POST with refresh_token in body
→ Validates refresh token with Supabase
→ Returns new access_token
→ Client updates localStorage
```

**Client Implementation:**
```javascript
// Auto-refresh before expiry
setTimeout(() => {
  refreshToken().catch(() => {
    // Refresh failed → force logout
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  });
}, (expires_in - 300) * 1000); // 5 minutes before expiry
```

---

## 3. AUTHORIZATION MODEL

### 3.1 Role-Based Access Control (RBAC)

**Roles:**
- `admin` - Full access (manage products, orders, users)
- `editor` - Read-only access + limited product edits (future)
- `viewer` - Read-only dashboard (future)

**Role Storage:**
- Stored in `user_metadata.role` in Supabase Auth
- Or via RLS policies on database level
- Checked by admin middleware

---

### 3.2 Permission Matrix

| Endpoint | GET | POST | PATCH | DELETE | Role Required |
|----------|-----|------|-------|--------|---------------|
| `/api/admin/products` | ✓ List all | ✓ Create | ✓ Update | ✓ Delete | admin |
| `/api/admin/products/:id` | ✓ Single | — | ✓ Update | ✓ Delete | admin |
| `/api/admin/orders` | ✓ List all | — | ✓ Update status | — | admin |
| `/api/admin/orders/:id` | ✓ Details | — | ✓ Update | — | admin |
| `/api/admin/inventory` | ✓ View stock | — | ✓ Adjust | — | admin, editor |
| `/api/admin/analytics` | ✓ View charts | — | — | — | admin, editor, viewer |
| `/api/admin/users` | ✓ List users | — | ✓ Role change | ✓ Suspended | admin only |

---

## 4. PROTECTED ROUTE IMPLEMENTATION

### 4.1 Client-Side Route Guard

**File:** `src/utils/auth-guard.js`

```javascript
/**
 * Admin route protector
 * Checks auth before rendering admin page
 */
export async function requireAdminAuth() {
  const token = localStorage.getItem('admin_token');
  
  // Check token exists
  if (!token) {
    throw new Error('No authentication token');
  }
  
  // Validate token with server
  const response = await fetch('/api/auth/validate', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Invalid or expired token');
  }
  
  const data = await response.json();
  
  // Check admin role
  if (data.user.role !== 'admin') {
    throw new Error('Insufficient permissions');
  }
  
  return data.user;
}
```

**Usage in `admin.html`:**
```html
<script type="module">
  import { requireAdminAuth } from './src/utils/auth-guard.js';
  
  requireAdminAuth()
    .then(user => {
      initAdminDashboard(user);
    })
    .catch(err => {
      console.error('Auth failed:', err);
      window.location.href = '/admin/login.html';
    });
</script>
```

---

### 4.2 Server-Side API Middleware

**File:** `api/middleware/auth.js`

```javascript
/**
 * Admin API Authentication Middleware
 * Verifies JWT token and admin role
 */
export async function withAdminAuth(handler) {
  return async (req, res) => {
    try {
      // 1. Extract token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing authorization header' });
      }
      
      const token = authHeader.substring(7);
      
      // 2. Verify with Supabase
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // 3. Check admin role
      const role = user.app_metadata?.role || user.user_metadata?.role;
      if (role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      // 4. Attach user to request context
      req.user = user;
      
      // 5. Proceed to handler
      return handler(req, res);
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
```

**Applied to admin routes:**
```javascript
import { withAdminAuth } from './middleware/auth.js';

// Protected admin endpoints
export const GET = withAdminAuth(async (req, res) => {
  const products = await getAllProducts();
  return new Response(JSON.stringify(products), { status: 200 });
});

export const POST = withAdminAuth(async (req, res) => {
  const newProduct = await createProduct(req.body);
  return new Response(JSON.stringify(newProduct), { status: 201 });
});
```

---

## 5. SUPPORTING INFRASTRUCTURE

### 5.1 Rate Limiting

**Implementation:** In-memory store (Redis in production) per IP

**Limits:**
- Admin endpoints: 30 requests per minute
- Authentication endpoints: 5 attempts per 15 minutes (brute force protection)

**Headers returned:**
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 28
X-RateLimit-Reset: 1715167260
```

**Exceeded response:**
```json
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

---

### 5.2 Session Management

**Session Storage Options:**
1. **LocalStorage** (default) - persistent across browser sessions
2. **SessionStorage** - cleared on browser close (optional)

**Session Invalidation Triggers:**
- User logs out
- Token expires and refresh fails
- Admin password rotation (force logout all)
- Suspicious activity detected (geo IP change)

**Implementation:**
```javascript
// Logout
localStorage.removeItem('admin_token');
localStorage.removeItem('admin_refresh_token');
sessionStorage.clear();

// Force logout all sessions (admin action)
await supabase.admin.adminDeleteUser(userId);
```

---

### 5.3 Multi-Factor Authentication (Future)

**Planned Enhancement:**
- TOTP-based MFA (Google Authenticator)
- SMS-based OTP (via M-Pesa or Twilio)
- Backup codes for recovery

**Flow:**
```
Login with password → [MFA Required] → Enter TOTP code → Access granted
```

---

## 6. AUDIT LOGGING

### 6.1 What Gets Logged

| Event | Data Logged |
|-------|-------------|
| Admin login | User ID, IP, timestamp, user agent, success/failure |
| Token refresh | Token ID, expiry time |
| Product created/edited/deleted | Admin ID, product ID, action, timestamp, old vs new values |
| Order status changed | Admin ID, order ID, old status, new status |
| Failed auth attempts | IP, attempted username, reason (invalid token) |
| Rate limit triggered | IP, endpoint, timestamp |

**Storage:** Supabase `audit_logs` table (or separate logging service)

**Retention:** 90 days (GDPR compliant)

---

### 6.2 Security Event Monitoring

**Alerts:**
- >5 failed login attempts in 10 minutes → Slack alert
- Token used from new geographic location → Email notification
- Bulk product deletion (>10 in 1 hour) → High-priority alert

---

## 7. SECURITY HARDENING

### 7.1 Token Security

- **HttpOnly cookies** alternative (XSS protection)
- **CSRF protection** (double-submit cookie pattern)
- **SameSite=Lax** for cookies
- Token auto-refresh with sliding expiration
- Short-lived access tokens (1 hour)

---

### 7.2 Password Policy

**Admin Credentials:**
- Minimum 12 characters
- Requires uppercase, lowercase, number, special character
- Unique (not used elsewhere)
- Rotate every 90 days
- Never stored in plaintext (bcrypt/scrypt)

**Supabase Level:**
- Enable email verification
- Disable sign-ups (invite-only admin accounts)
- Enforce strong password in Supabase dashboard

---

### 7.3 CORS Policy

**Allowed Origins:**
- production: `https://faithandfashion.co.ke`
- staging: `https://staging.faithandfashion.co.ke`
- localhost (dev): `http://localhost:3000`, `http://127.0.0.1:5500`

**Response Headers:**
```
Access-Control-Allow-Origin: <specific origin only>
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
```

---

### 7.4 Input Validation

**All admin API inputs validated:**
- Product name: max 255 chars, no HTML
- Price: positive number, max 1,000,000
- Email: RFC 5322 format
- Order status: enum ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

---

## 8. IMPLEMENTATION CHECKLIST

### Client-Side
- [x] Admin route guard in admin.html
- [x] Token storage in localStorage
- [x] Token refresh logic
- [x] Auto-logout on token expiry
- [x] Auto-redirect to login if unauthorized
- [ ] MFA setup screen (future)

### Server-Side
- [x] `/api/auth/login` endpoint
- [x] `/api/auth/validate` endpoint  
- [x] `/api/auth/refresh` endpoint
- [x] `/api/auth/logout` endpoint
- [x] Admin middleware on all `/api/admin/*` routes
- [x] Role verification in middleware
- [x] Rate limiting on auth endpoints
- [ ] Audit logging table and insertion
- [ ] Suspicious activity alerts

### Testing
- [ ] Unit tests for auth middleware
- [ ] Integration tests: login → access → token expiry → refresh
- [ ] Penetration test: attempt SQLi, XSS, CSRF on admin endpoints
- [ ] Load test: 100 concurrent admin requests

---

## 9. TROUBLESHOOTING

### "Admin page keeps redirecting to login"
**Likely:** Token expired and refresh failed  
**Fix:** Clear localStorage, log in again

### "403 Forbidden after login"
**Likely:** Role not set as 'admin' in Supabase user metadata  
**Fix:** Update user metadata in Supabase dashboard

### "429 Too Many Requests"
**Likely:** Rate limit exceeded (rapid page refreshes)  
**Fix:** Wait 60 seconds, then retry

### "Token invalid error"
**Likely:** Supabase JWT secret rotated  
**Fix:** Redeploy to pick up new env vars

---

## APPENDIX: TOKEN REFERENCE

### Frontend Token Storage
```javascript
// Recommended approach
localStorage.setItem('faith_admin_token', token);
localStorage.setItem('faith_admin_refresh', refreshToken);
localStorage.setItem('faith_admin_expires', Date.now() + (3600 * 1000));
```

### API Request Example
```javascript
fetch('/api/admin/products', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('faith_admin_token')}`,
    'Content-Type': 'application/json'
  }
});
```

---

**Document Owner:** Kilo Security Team  
**Last Updated:** 2026-05-07  
**Related:** SITEMAP.md, USER_FLOWS.md, RESPONSIVE_STRATEGY.md  
**Classification:** Internal - Sensitive
