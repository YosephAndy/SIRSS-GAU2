export const getMockData = (key: string, defaultData: any) => {
  if (typeof window === 'undefined') return defaultData;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

export const setMockData = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};
