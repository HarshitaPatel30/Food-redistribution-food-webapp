const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      errMsg = body.error || body.message || errMsg;
    } catch {
      // Keep the HTTP status as the fallback when the response isn't JSON.
    }
    throw new Error(errMsg);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ---- Food Listings ----
export const fetchAllListings = () => request('/api/food/all');
export const fetchListingById = (id) => request(`/api/food/${id}`);
export const createListing = (data) => request('/api/food/add', { method: 'POST', body: JSON.stringify(data) });
export const deleteListing = (id) => request(`/api/food/${id}`, { method: 'DELETE' });

// ---- Claims ----
export const fetchAllClaims = () => request('/api/claim/all');
export const createClaim = (data) => request('/api/claim/add', { method: 'POST', body: JSON.stringify(data) });
export const verifyClaimToken = (token) => request(`/api/claim/verify/${token}`, { method: 'POST' });

// ---- Dashboard ----
export const fetchDashboardStats = () => request('/api/dashboard/stats');
