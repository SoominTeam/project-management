import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // ✅ این رو اضافه کن
});

// ✅ Interceptor برای لاگ کردن درخواست‌ها
api.interceptors.request.use(
    (config) => {
        console.log('📤 API Request:', config.method.toUpperCase(), config.url);
        console.log('📤 Headers:', config.headers);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;