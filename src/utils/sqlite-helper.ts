/**
 * Sanitizes parameters for SQLite to prevent native crashes.
 * Replaces undefined with null and NaN with 0.
 */
export const sanitizeParams = (params: any[]): any[] => {
  return params.map(p => {
    if (p === undefined) return null;
    if (typeof p === 'number' && isNaN(p)) return 0;
    return p;
  });
};
