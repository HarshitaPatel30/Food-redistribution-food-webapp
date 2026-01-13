
export const login = (role) => {
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("role", role);
};

export const logout = () => {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("role");
};

export const isLoggedIn = () => {
  return localStorage.getItem("loggedIn") === "true";
};

export const getRole = () => {
  return localStorage.getItem("role");
};
