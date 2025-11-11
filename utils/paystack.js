const axios = require('axios');

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  timeout: 10000,
});

paystack.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
  return config;
});

module.exports = paystack;