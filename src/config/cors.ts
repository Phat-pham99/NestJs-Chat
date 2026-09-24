const allowedMethods = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'];

export function getCorsOptions() {
  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0 && origin !== '*');

  return {
    origin: origins.length > 0 ? origins : false,
    methods: allowedMethods,
    credentials: false,
  };
}
