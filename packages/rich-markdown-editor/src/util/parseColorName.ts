interface StyleObject {
  color: string | null;
  bg: string | null;
}

export const parseColorName = (styleString: string): StyleObject => {
  // sample input:
  // color:#fffff-bg:#00000
  // color:#fffff-bg:null
  // color:#fffff
  // color:null-bg:#00000
  const regex =
    /color:(#(?:[0-9a-fA-F]{3}){1,2}|null)(-bg:(#(?:[0-9a-fA-F]{3}){1,2}|null))?/;
  const matches = styleString.match(regex);
  if (matches) {
    return {
      color: matches[1] !== "null" ? matches[1] : null,
      bg: matches[3] !== "null" ? matches[3] : null,
    };
  }
  return { color: null, bg: null };
};
