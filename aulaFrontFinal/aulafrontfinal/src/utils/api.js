const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const API_URLS = {
  login: process.env.REACT_APP_AUTH_LOGIN_URL || `${API_BASE_URL}/auth/login`,
  me: process.env.REACT_APP_AUTH_ME_URL || `${API_BASE_URL}/auth/me`,
  postos: process.env.REACT_APP_POSTOS_URL || `${API_BASE_URL}/postos`,
  bombeiros: process.env.REACT_APP_BOMBEIROS_URL || `${API_BASE_URL}/bombeiros`,
  checkin: process.env.REACT_APP_CHECKIN_URL || `${API_BASE_URL}/check/in`,
  checkout: process.env.REACT_APP_CHECKOUT_URL || `${API_BASE_URL}/check/out`,
  checkStatus: process.env.REACT_APP_CHECK_STATUS_URL || `${API_BASE_URL}/check/status`,
  checkinsHoje: process.env.REACT_APP_CHECKINS_HOJE_URL || `${API_BASE_URL}/check/checkins`,
  checkoutsHoje: process.env.REACT_APP_CHECKOUTS_HOJE_URL || `${API_BASE_URL}/check/checkouts`,
};

export function authHeaders(extra = {}) {
  return {
    ...extra,
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export function apiFileUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}
