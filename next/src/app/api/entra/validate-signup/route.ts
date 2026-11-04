import { createRemoteJWKSet, jwtVerify } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

const ENTRA_CALLER_APP_ID = '99045fe1-7639-4a75-9d4a-577b6ca3810f';
const EVENT_TYPE = 'microsoft.graph.authenticationEvent.attributeCollectionStart';
const RESPONSE_TYPE = 'microsoft.graph.onAttributeCollectionStartResponseData';

interface EntraIdentity {
  signInType?: string;
  issuerAssignedId?: string;
}

interface EntraSignupEvent {
  type?: string;
  data?: {
    tenantId?: string;
    userSignUpInfo?: { identities?: EntraIdentity[] };
  };
}

const jwksUri = process.env.ENTRA_EXTENSION_JWKS_URI;
const jwks = jwksUri ? createRemoteJWKSet(new URL(jwksUri), {
  timeoutDuration: 1500,
  cooldownDuration: 30_000,
  cacheMaxAge: 600_000,
}) : null;

function reply(action: Record<string, string>) {
  return NextResponse.json(
    { data: { '@odata.type': RESPONSE_TYPE, actions: [action] } },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}

function block(message: string) {
  return reply({
    '@odata.type': 'microsoft.graph.attributeCollectionStart.showBlockPage',
    title: 'Registration not allowed',
    message,
  });
}

function allow() {
  return reply({
    '@odata.type': 'microsoft.graph.attributeCollectionStart.continueWithDefaultBehavior',
  });
}

export async function POST(request: NextRequest) {
  const issuer = process.env.ENTRA_EXTENSION_ISSUER;
  const audience = process.env.ENTRA_EXTENSION_API_CLIENT_ID;
  const tenantId = process.env.ENTRA_EXTENSION_TENANT_ID;

  if (!issuer || !audience || !tenantId || !jwks) {
    return new NextResponse('Service is not configured', { status: 503 });
  }

  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(authorization.slice(7), jwks, {
      issuer,
      audience,
      algorithms: ['RS256'],
      clockTolerance: 30,
    });

    if (payload.tid !== tenantId ||
        (payload.azp !== ENTRA_CALLER_APP_ID && payload.appid !== ENTRA_CALLER_APP_ID)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  } catch {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let event: EntraSignupEvent;
  try {
    event = await request.json() as EntraSignupEvent;
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 });
  }

  const identities = event?.data?.userSignUpInfo?.identities;
  if (event?.type !== EVENT_TYPE || event.data?.tenantId !== tenantId || !Array.isArray(identities)) {
    return new NextResponse('Invalid Entra event', { status: 400 });
  }

  const emails = identities
    .filter((identity) => identity?.signInType === 'email' || identity?.signInType === 'emailAddress')
    .map((identity) => typeof identity.issuerAssignedId === 'string'
      ? identity.issuerAssignedId.trim().toLowerCase()
      : '');

  // The policy is deliberately fail-closed: unknown/federated identities without an email are not admitted.
  if (emails.length === 0 || emails.some((email) => !email || !/^[^\s@]+@[^\s@]+$/.test(email))) {
    return block('Registration requires a verified email address.');
  }

  if (emails.some((email) => email?.split('@')[1] === 'tuni.fi')) {
    return block('Registration with a @tuni.fi email address is not allowed.');
  }

  return allow();
}
