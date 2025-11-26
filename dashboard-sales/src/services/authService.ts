export const mockLogin = (username: string, password: string): string => {
  // Accept any credentials for mock authentication
  const mockToken = btoa(`${username}:${Date.now()}`);
  localStorage.setItem('sales_token', mockToken);
  return mockToken;
};

export const mockLogout = (): void => {
  localStorage.removeItem('sales_token');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('sales_token');
};

export const getMockToken = (): string | null => {
  return localStorage.getItem('sales_token');
};
