// API Configuration
// Thay đổi API_HOST thành IPv4 của máy để người khác trong mạng có thể truy cập
// Ví dụ: const API_HOST = '192.168.1.100';

const API_HOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '192.168.1.115'  // Nếu đang test local
    : window.location.hostname;  // Nếu truy cập từ IP, dùng IP đó

const API_PORT = '3939';
const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

console.log('🔧 API Config:', {
    host: API_HOST,
    port: API_PORT,
    baseUrl: API_BASE_URL
});

export { API_HOST, API_PORT, API_BASE_URL };
