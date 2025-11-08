import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api"
});

export const getLeads = () => API.get("/leads");
export const addLead = (data) => API.post("/leads", data);
