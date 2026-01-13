export const getListings = () =>
  JSON.parse(localStorage.getItem("listings")) || [];

export const getClaims = () =>
  JSON.parse(localStorage.getItem("claims")) || [];
