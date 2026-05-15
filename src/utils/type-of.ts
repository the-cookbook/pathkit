export const typeOf = (value: unknown): string => {
  const match = /\s([A-Za-z]+)/.exec(Object.prototype.toString.call(value));

  return match?.[1]?.toLowerCase() ?? 'unknown';
};
