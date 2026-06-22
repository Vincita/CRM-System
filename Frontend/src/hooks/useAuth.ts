import { useMutation } from '@tanstack/react-query';
import { login, register } from '../api/authApi';

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: ({ name, username, password }: { name: string; username: string; password: string }) =>
      register(name, username, password),
  });
};