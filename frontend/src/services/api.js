export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      // Not JSON response
    }
    throw new Error(errorMsg);
  }
  
  try {
    return await response.json();
  } catch (error) {
    throw new Error('Invalid JSON response from server');
  }
};

export const request = async (path, options = {}) => {
  const {
    method = 'GET',
    body = null,
    auth = false,
    headers: customHeaders = {},
  } = options;

  const url = API_BASE + path;
  
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (auth) {
    const token = localStorage.getItem('rs_token');
    if (!token) {
      throw new Error('Authentication required. Please login.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

export const get = (path, auth = false) => request(path, { method: 'GET', auth });
export const post = (path, body, auth = false) => request(path, { method: 'POST', body, auth });
export const put = (path, body, auth = false) => request(path, { method: 'PUT', body, auth });
export const del = (path, auth = false) => request(path, { method: 'DELETE', auth });