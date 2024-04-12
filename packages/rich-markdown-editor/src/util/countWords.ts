export const countWords = (text: string): number => {
  const words = text.match(/\b\w+\b/g);
  if (!words) return 0;
  return words.length;
};
