export const getSearchKeyForPhoneNumber = (key: string): string => {
  if (key.charAt(0) === '0') return key.slice(1);

  return key;
};
