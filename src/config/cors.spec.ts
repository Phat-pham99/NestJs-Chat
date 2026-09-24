import { getCorsOptions } from './cors';

describe('getCorsOptions', () => {
  const originalCorsOrigins = process.env.CORS_ORIGINS;

  afterEach(() => {
    if (originalCorsOrigins === undefined) {
      delete process.env.CORS_ORIGINS;
    } else {
      process.env.CORS_ORIGINS = originalCorsOrigins;
    }
  });

  it('disables cross-origin access by default', () => {
    delete process.env.CORS_ORIGINS;

    expect(getCorsOptions()).toEqual({
      origin: false,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      credentials: false,
    });
  });

  it('parses and trims an explicit origin allowlist', () => {
    process.env.CORS_ORIGINS =
      'http://localhost:3001, https://chat.example.test';

    expect(getCorsOptions().origin).toEqual([
      'http://localhost:3001',
      'https://chat.example.test',
    ]);
  });

  it('rejects wildcard origins', () => {
    process.env.CORS_ORIGINS = '*, https://chat.example.test';

    expect(getCorsOptions().origin).toEqual(['https://chat.example.test']);
  });

  it('never enables credentialed cross-origin requests', () => {
    process.env.CORS_ORIGINS = 'https://chat.example.test';

    expect(getCorsOptions().credentials).toBe(false);
  });
});
