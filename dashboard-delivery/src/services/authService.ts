const TOKEN_KEY = 'delivery_token';

export const mockLogin = (username: string, password: string): boolean => {
  if (username && password) {
    const token = `mock_delivery_token_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  }
  return false;
};

export const mockLogout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};
