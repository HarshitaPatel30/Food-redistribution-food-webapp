export const getTheme = () => {
  return localStorage.getItem("theme") || "light";
};

export const setTheme = (theme) => {
  localStorage.setItem("theme", theme);
  document.body.className = theme;
};

export const toggleTheme = () => {
  const current = getTheme();
  const next = current === "light" ? "dark" : "light";
  setTheme(next);
};
