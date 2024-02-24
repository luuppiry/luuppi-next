import jwt from 'jsonwebtoken';
import getPem from 'rsa-pem-from-mod-exp';

const options = {
  jwksUri: `https://${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}.ciamlogin.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/discovery/v2.0/keys`,
  issuer: `https://${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}.ciamlogin.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/v2.0`,
  audience: process.env.NEXT_PUBLIC_AZURE_FRONTEND_CLIENT_ID!,
};

/**
 * Fetches the public key from the jwks endpoint and returns it as a PEM
 * @param kid The key id
 * @returns The public key
 */
const getPublicKey = async (kid: string): Promise<string | null> => {
  const jwks = await fetch(options.jwksUri, {
    next: {
      revalidate: 3600, // 1 hour
    },
  });
  const jwksData = await jwks.json();
  const key = jwksData.keys.find((k: { kid: string }) => k.kid === kid);
  if (!key) return null;
  const publicKey = getPem(key.n, key.e);
  if (!publicKey) return null;
  return publicKey;
};

/**
 * Validates a token using the Azure public keys
 * @param token The token to validate
 * @returns Whether the token is valid
 */
export const validateToken = async (token: string): Promise<boolean> => {
  let decoded: { [key: string]: any } | null;
  let kid: string;

  try {
    decoded = jwt.decode(token, { complete: true, json: true });
    kid = decoded?.header.kid;
    if (!kid) return false;
  } catch (error) {
    return false;
  }

  const publicKey = await getPublicKey(kid);

  if (!publicKey) return false;

  try {
    jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: options.audience,
      issuer: options.issuer,
    });
  } catch (error) {
    return false;
  }

  return true;
};
