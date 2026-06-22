import axiosClient from './axiosClient';

export const login = (username: string, password: string) => {
  return axiosClient.post('/login', { username, password });
};

export const register = (name: string, username: string, password: string) => {
  return axiosClient.post('/register', { name, username, password });
};