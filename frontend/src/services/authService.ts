import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

const request = async (promise: Promise<any>, errorMsg: string) => {
  try {
    const { data } = await promise;
    return data;
  } catch (error: any) {
    throw error.response?.data || { message: errorMsg };
  }
};

export const authService = {
  register: (email: string, password: string, name: string, role: string) =>
    request(api.post("/register", { email, password, name, role }), "Failed to register"),

  login: async (email: string, password: string) => {
    const data = await request(
      api.post("/login", { email, password }),
      "Login failed"
    );

    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  googleLogin: async (token: string, role?: string) => {
    const data = await request(
      api.post("/google-login", { token, role }),
      "Google Login failed"
    );

    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("studentInfo");
  },

  getProfile: () =>
    request(api.get("/profile"), "Failed to fetch profile"),

  getToken: () => localStorage.getItem("token"),

  isAuthenticated: () => !!localStorage.getItem("token"),
};