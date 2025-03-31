import api from './axios';

export const login = async (username, password) => {
  const res = await api.post('/login', { username, password });
  localStorage.setItem('access_token', res.data.access_token);
};

export const getMe = async () => {
  const res = await api.get('/me');
  return res.data;
};

export const logout = async () => {
  localStorage.removeItem('access_token');
  await api.post('/logout');
};

export const silentLogin = async () => {
  try {
    const res = await api.post('/refresh');
    localStorage.setItem('access_token', res.data.access_token);
    return true;
  } catch {
    return false;
  }
};