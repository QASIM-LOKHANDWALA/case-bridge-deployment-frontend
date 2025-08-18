import axios from "axios";

const isDev = import.meta.env.MODE === "development";
const baseURL = isDev
    ? import.meta.env.VITE_API_BASE_URL_LOCAL
    : import.meta.env.VITE_API_BASE_URL_DEPLOY;

const axiosInstance = axios.create({
    baseURL,
});

export default axiosInstance;
