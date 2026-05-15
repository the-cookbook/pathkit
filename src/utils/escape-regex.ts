// Escape regex special characters in a string
const escapeRegex = (str: string): string => {
  return str.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&');
};

export default escapeRegex;
