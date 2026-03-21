import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/sessions",
});

export const sessionService = {
  createSession: async (name: string, createdBy: string) => {
    const { data } = await api.post("/", { name, createdBy });
    return data;
  },

  getSession: async (code: string) => {
    const { data } = await api.get(`/${code}`);
    return data;
  },

  getActiveSessions: async () => {
    const { data } = await api.get("/active");
    return data;
  },

  endSession: async (code: string) => {
    const { data } = await api.post(`/${code}/end`);
    return data;
  }
};
