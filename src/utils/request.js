import axios from "axios";

const baseUrl = process.env.MAIN_STORE_URL;

const request = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export default request;