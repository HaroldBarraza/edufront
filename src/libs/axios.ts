import axios from "axios";

export const api = axios.create({
  baseURL: "https://institucionedu.onrender.com",
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);
    const status = error.response?.status;
    const msg = error.response?.data?.message;
    const url = error.config?.url ?? "";
    if (status === 401) {
      if (url.includes("/auth/login")) return Promise.reject(error);
      if (window.location.pathname === "/login") return Promise.reject(error);
      localStorage.removeItem("token");
      let reason: "expired" | "suspended" | "inactive" = "expired";
      if (typeof msg === "string") {
        if (msg.includes("SUSPENDIDO_MORA")) reason = "suspended";
        else if (msg.includes("INACTIVO")) reason = "inactive";
      }
      if (reason === "expired") {
        window.location.href = "/login?expired=1";
      } else {
        window.location.href = `/cuenta-suspendida?reason=${reason}`;
      }
    }
    return Promise.reject(error);
  },
);
