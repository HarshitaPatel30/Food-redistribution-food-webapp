import { fetchAllListings, fetchAllClaims } from "./api";

// Compatibility helpers use the API; application records are never stored in localStorage.
export const getListings = () => fetchAllListings();

export const getClaims = () => fetchAllClaims();
