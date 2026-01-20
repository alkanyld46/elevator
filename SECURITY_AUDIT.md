# Frontend Security Audit Report

**Date**: January 19, 2026  
**Scope**: `client/src/` application code (excluding service worker files)  
**Auditor**: AI Security Review

---

## Executive Summary

This audit identified **15 security findings** across the React frontend application:

| Severity | Count |
|----------|-------|
| Critical | 1     |
| High     | 5     |
| Medium   | 5     |
| Low      | 4     |

Key concerns include insecure token storage (XSS vulnerability), dependency vulnerabilities, and client-side authorization that can be bypassed.

---

## Critical Findings

### C1: JWT Token Stored in localStorage (XSS Vulnerability)

**Severity**: Critical  
**Files**:
- `client/src/pages/Login.jsx:18-19`
- `client/src/utils/api.js:8`
- `client/src/auth.js:7-8`

**Description**:  
Authentication tokens are stored in `localStorage`, which is accessible to any JavaScript running on the page. If an attacker injects malicious scripts (XSS), they can steal tokens and impersonate users.

```javascript
// Login.jsx:18-19
localStorage.setItem('token', data.token)
localStorage.setItem('user', JSON.stringify(data.user))
```

**Risk**: Complete account takeover if any XSS vulnerability exists.

**Recommendation**:
1. Store tokens in `httpOnly` cookies (set by server)
2. If localStorage must be used, implement Content Security Policy (CSP)
3. Add XSS sanitization library for user-generated content

---

## High Severity Findings

### H1: Dependency Vulnerabilities (18 total, 13 high severity)

**Severity**: High  
**Source**: `npm audit`

**Critical Dependencies**:

| Package | Vulnerability | Advisory |
|---------|--------------|----------|
| axios 1.10.0 | DoS via unchecked data size | GHSA-4hjh-wcwx-xvwj |
| react-router 7.x | XSS via Open Redirects, CSRF | GHSA-2w69-qvjg-hvjx |
| node-forge | ASN.1 Unbounded Recursion | GHSA-554w-wpv2-vw27 |
| qs | DoS via memory exhaustion | GHSA-6rw7-vpxm-498p |

**Recommendation**:
```bash
cd client
npm audit fix           # Fix non-breaking
npm audit fix --force   # Fix all (may break react-scripts)
```

Consider upgrading `react-router-dom` to 7.12+ and `axios` to 1.12+.

---

### H2: Client-Side Role Authorization (Bypassable)

**Severity**: High  
**Files**:
- `client/src/RequireAuth.js:9`
- `client/src/RoleRedirect.jsx:16`
- `client/src/components/NavBar.jsx:7`

**Description**:  
Role checks rely on `user.role` from localStorage, which users can modify via browser DevTools:

```javascript
// RequireAuth.js:9
if (roles && !roles.includes(user?.role)) return <Navigate to="/unauthorized" />

// NavBar.jsx:7
const user = JSON.parse(localStorage.getItem('user') || '{}')
```

An attacker can change `user.role` from "tech" to "admin" in localStorage to access admin routes.

**Risk**: Unauthorized access to admin pages (UI only - server should still block).

**Recommendation**:
1. **Critical**: Ensure all API endpoints verify roles server-side (currently done via `authorize()` middleware)
2. Fetch user role from server on app load instead of trusting localStorage
3. Add role verification in AuthContext that validates against server

---

### H3: Unvalidated JSON.parse on User Data

**Severity**: High  
**Files**:
- `client/src/auth.js:8`
- `client/src/components/NavBar.jsx:7`
- `client/src/pages/TechHome.jsx:8`

**Description**:  
`JSON.parse()` is called on localStorage data without try/catch. Malformed data causes app crash.

```javascript
// auth.js:8
const initialUser = initialToken ? JSON.parse(localStorage.getItem('user') || '{}') : null;
```

**Risk**: Application denial of service, or exploitable behavior if attacker controls localStorage content.

**Recommendation**:
```javascript
function safeParseUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}
```

---

### H4: Sensitive User Data in localStorage

**Severity**: High  
**Files**: `client/src/pages/Login.jsx:19`

**Description**:  
The entire user object (including potentially sensitive fields) is stored in localStorage:

```javascript
localStorage.setItem('user', JSON.stringify(data.user))
// Stores: { id, name, role } - currently minimal, but pattern is risky
```

**Risk**: If user object expands to include email, phone, or other PII, it becomes accessible to XSS attacks.

**Recommendation**:
- Store minimal data (just role or user ID)
- Fetch user details from API when needed
- Use httpOnly cookies for sensitive data

---

### H5: innerHTML Usage in Scanner Component

**Severity**: High  
**File**: `client/src/components/Scanner.jsx:76`

**Description**:  
Direct `innerHTML` assignment is used for DOM manipulation:

```javascript
if (reader) reader.innerHTML = '';
```

**Context**: Currently safe as it's clearing the element, but `innerHTML` usage sets a dangerous precedent.

**Risk**: Low in current context, but future modifications could introduce XSS.

**Recommendation**:
```javascript
// Safer alternative
if (reader) {
  while (reader.firstChild) {
    reader.removeChild(reader.firstChild);
  }
}
```

---

## Medium Severity Findings

### M1: Hardcoded Fallback API URL

**Severity**: Medium  
**File**: `client/src/utils/api.js:4`

**Description**:
```javascript
baseURL: process.env.REACT_APP_API_URL || 'https://elevator-a8d0.onrender.com/api',
```

Production URL is hardcoded as fallback. If env var is missing in development, requests go to production.

**Recommendation**:
- Remove fallback or use localhost as default
- Fail explicitly if env var is missing in development

---

### M2: No Password Strength Validation

**Severity**: Medium  
**File**: `client/src/pages/Register.jsx:42`

**Description**:  
Password input has no minimum length or complexity requirements:

```jsx
<input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
```

**Recommendation**:
- Add `minLength={8}` attribute
- Implement password strength indicator
- Validate on both client and server

---

### M3: Error Messages May Leak Information

**Severity**: Medium  
**Files**:
- `client/src/pages/Login.jsx:24`
- `client/src/pages/Register.jsx:22`

**Description**:  
Error messages from server are displayed directly to users:

```javascript
setError(err.response?.data?.msg || 'Login failed')
```

**Risk**: Server may return detailed error messages that reveal system internals.

**Recommendation**:
- Use generic client-side error messages
- Log detailed errors for debugging only

---

### M4: Console Statements in Production Code

**Severity**: Medium  
**File**: `client/src/components/Scanner.jsx:56, 67, 78`

**Description**:
```javascript
console.error(e);
console.warn('Stop failed:', e);
console.warn('Manual stop failed:', err);
```

**Risk**: Information leakage about internal operations; may expose stack traces.

**Recommendation**:
- Use environment-based logging
- Strip console statements in production builds

---

### M5: File Upload Without Client-Side Validation

**Severity**: Medium  
**File**: `client/src/pages/UploadAttachments.jsx:45-62`

**Description**:  
File uploads accept `image/*` but don't validate:
- File size limits
- Actual file type (only MIME hint from browser)

```jsx
<input type="file" accept="image/*" multiple />
```

**Risk**: Users may upload excessively large files, causing performance issues.

**Recommendation**:
```javascript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const validFiles = files.filter(f => f.size <= MAX_SIZE);
```

---

## Low Severity Findings

### L1: No CSRF Token Implementation

**Severity**: Low  
**File**: `client/src/utils/api.js`

**Description**:  
API requests rely solely on JWT for authentication. While JWTs in headers provide some CSRF protection, explicit CSRF tokens are more robust.

**Note**: Current architecture (Bearer token in header) mitigates CSRF, but cookies would require tokens.

---

### L2: Open Redirect Potential on 401

**Severity**: Low  
**File**: `client/src/utils/api.js:19`

**Description**:
```javascript
window.location.href = '/login'
```

Currently hardcoded to `/login`, which is safe. Pattern could become vulnerable if path becomes dynamic.

---

### L3: No Rate Limiting Indicator for Failed Logins

**Severity**: Low  
**File**: `client/src/pages/Login.jsx`

**Description**:  
No client-side tracking of failed login attempts. Server should implement rate limiting (verify server-side).

---

### L4: Session Doesn't Expire Client-Side

**Severity**: Low  
**Files**: `client/src/auth.js`, `client/src/utils/api.js`

**Description**:  
Tokens persist in localStorage indefinitely until:
1. User logs out
2. Server returns 401

No proactive token expiration check exists client-side.

**Recommendation**:
- Decode JWT and check `exp` claim
- Implement token refresh mechanism

---

## Security Checklist

| Check | Status | Notes |
|-------|--------|-------|
| No `dangerouslySetInnerHTML` | PASS | Not found in codebase |
| No `eval()` or `Function()` | PASS | Not found |
| No hardcoded secrets | PASS | Only public URLs found |
| HTTPS enforcement | PASS | API URL uses HTTPS |
| Route protection | PASS | RequireAuth wraps sensitive routes |
| Server-side auth | PASS | Middleware protects API endpoints |
| XSS via localStorage | FAIL | Tokens accessible to scripts |
| Dependency security | FAIL | 18 vulnerabilities found |
| Input validation | PARTIAL | Basic HTML5 validation only |

---

## Recommended Actions (Priority Order)

1. **Immediate**: Run `npm audit fix` to patch axios and other fixable dependencies
2. **High**: Migrate token storage from localStorage to httpOnly cookies
3. **High**: Add try/catch wrappers around JSON.parse calls
4. **Medium**: Implement client-side input validation (password strength, file size)
5. **Medium**: Remove or conditionalize console.log statements
6. **Low**: Consider adding refresh token mechanism

---

## Files Reviewed

| File | Lines | Findings |
|------|-------|----------|
| `auth.js` | 15 | H3 |
| `RequireAuth.js` | 13 | H2 |
| `RoleRedirect.jsx` | 18 | H2 |
| `utils/api.js` | 26 | C1, M1, L2 |
| `pages/Login.jsx` | 60 | C1, M3 |
| `pages/Register.jsx` | 73 | M2, M3 |
| `pages/Dashboard.jsx` | 238 | - |
| `pages/TechHome.jsx` | 87 | H3 |
| `pages/Elevators.jsx` | 220 | - |
| `pages/Users.jsx` | 59 | - |
| `pages/UploadAttachments.jsx` | 134 | M5 |
| `components/Scanner.jsx` | 134 | H5, M4 |
| `components/NavBar.jsx` | 76 | H2, H3 |
| `components/NavBarLayout.jsx` | 13 | - |
| `App.js` | 59 | - |
| `index.js` | 24 | - |

---

## Appendix: npm audit Summary

```
18 vulnerabilities (5 moderate, 13 high)

High severity:
- axios 1.0.0-1.11.0: DoS vulnerability
- react-router 7.0.0-7.12.0: XSS/CSRF vulnerabilities  
- node-forge <=1.3.1: ASN.1 parsing issues
- qs <6.14.1: DoS via memory exhaustion
- nth-check <2.0.1: ReDoS vulnerability
- glob 10.2.0-10.4.5: Command injection

Moderate severity:
- js-yaml <3.14.2: Prototype pollution
- postcss <8.4.31: Line return parsing error
- webpack-dev-server <=5.2.0: Source code theft
```

Run `npm audit fix` to address fixable vulnerabilities.
