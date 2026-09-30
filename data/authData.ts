import raw from './authData.json';

/**
 * Login test data. Passwords are not stored in the repo: they come from environment
 * variables (a local .env file, or CI secrets). See .env.example.
 * A missing variable only fails the tests that actually read that password.
 */
function withPassword<T extends object>(login: T, envVar: string): T & { readonly password: string } {
  return Object.defineProperty({ ...login }, 'password', {
    enumerable: true,
    get() {
      const value = process.env[envVar];
      if (!value) throw new Error(`Missing environment variable ${envVar} (copy .env.example to .env and fill it in)`);
      return value;
    },
  }) as T & { readonly password: string };
}

const authData = {
  ...raw,
  kryaLogin: withPassword(raw.kryaLogin, 'KRYA_PASSWORD'),
  clientLogin: withPassword(raw.clientLogin, 'CLIENT_PASSWORD'),
  candidateLogin: withPassword(raw.candidateLogin, 'CANDIDATE_PASSWORD'),
};

export default authData;
