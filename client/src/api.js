const BASE = '/api';

export const getToken = () => localStorage.getItem('token');

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is it running on port 5000?');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // An expired session on a normal request sends the user back to sign in.
    if (res.status === 401 && token && !path.startsWith('/auth/')) {
      setToken(null);
      window.location.reload();
    }
    throw new Error(data.message || 'Something went wrong.');
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
};
