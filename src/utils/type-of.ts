export const typeOf = (value: unknown): string => {
  const match = /\s([A-Za-z0-9]+)/.exec(Object.prototype.toString.call(value));

  return match?.[1]?.toLowerCase() ?? 'unknown';
};
