export const isUndo = (e: KeyboardEvent): boolean => {
  return (e.ctrlKey && e.key === "z") || (e.metaKey && e.key === "z");
};

export const isEscape = (e: KeyboardEvent): boolean => {
  return e.key === "Escape";
};

export const isDelete = (e: KeyboardEvent): boolean => {
  return e.key === "Delete" || e.key === "Backspace";
};

export const isLock = (e: KeyboardEvent): boolean => {
  return (e.ctrlKey && e.key === "l") || (e.metaKey && e.key === "l");
};
