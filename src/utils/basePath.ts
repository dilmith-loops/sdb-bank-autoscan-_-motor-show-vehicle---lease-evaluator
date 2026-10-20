/**
 * Helper utility to resolve URLs with the configured base path.
 * When hosted at uat.loopsintegrated.co/sdb, base path is '/sdb'.
 */
export const getBasePath = (): string => {
  const envPath = process.env.NEXT_PUBLIC_BASE_PATH;
  if (typeof envPath === 'string') {
    return envPath === '/' || envPath === ''
      ? ''
      : (envPath.startsWith('/') ? envPath : `/${envPath}`).replace(/\/$/, '');
  }
  // Default to '/sdb' as requested for uat.loopsintegrated.co/sdb
  return '/sdb';
};

export const withBasePath = (path: string): string => {
  const base = getBasePath();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};
