const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_URL = IS_LOCAL
  ? 'http://localhost:8080/api/v1'
  : 'https://TU_API_URL/api/v1';