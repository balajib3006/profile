/**
 * JWT Authentication Middleware for Cloudflare Workers
 */

// Simple JWT verification without external libraries
async function verifyJWT(token, secret) {
    const encoder = new TextEncoder();
    const parts = token.split('.');

    if (parts.length !== 3) {
        throw new Error('Invalid token format');
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify signature
    const data = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );

    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const dataBytes = encoder.encode(data);

    const isValid = await crypto.subtle.verify('HMAC', key, signature, dataBytes);

    if (!isValid) {
        throw new Error('Invalid signature');
    }

    // Decode payload
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error('Token expired');
    }

    return payload;
}

async function createJWT(payload, secret, expiresIn = 86400) {
    const encoder = new TextEncoder();

    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
        ...payload,
        iat: now,
        exp: now + expiresIn
    };

    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadB64 = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const data = `${headerB64}.${payloadB64}`;

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const signatureArray = new Uint8Array(signatureBuffer);
    const signatureB64 = btoa(String.fromCharCode(...signatureArray))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${data}.${signatureB64}`;
}

export async function authMiddleware(request) {
    const authHeader = request.headers.get('Authorization');
    const cookieHeader = request.headers.get('Cookie');

    let token = null;

    // Try to get token from Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }
    // Try to get token from cookie
    else if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim());
        const authCookie = cookies.find(c => c.startsWith('auth_token='));
        if (authCookie) {
            token = authCookie.substring(11);
        }
    }

    if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const secret = request.env.SESSION_SECRET || 'default_secret_change_in_production';
        const payload = await verifyJWT(token, secret);

        // Attach user info to request
        request.user = payload;

        return null; // Continue to next handler
    } catch (error) {
        console.error('Auth error:', error.message);
        return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export { createJWT, verifyJWT };
