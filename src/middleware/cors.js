/**
 * CORS Middleware
 */

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Will be configured based on environment
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
};

export function handleCORS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

export function getAllowedOrigins(env) {
    // In production, restrict to specific origins
    const allowedOrigins = [
        'https://balajib3006.github.io',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];

    // Add custom frontend URL if configured
    if (env.FRONTEND_URL) {
        allowedOrigins.push(env.FRONTEND_URL);
    }

    return allowedOrigins;
}

export function setCORSHeaders(request, env) {
    const origin = request.headers.get('Origin');
    const allowedOrigins = getAllowedOrigins(env);

    if (origin && allowedOrigins.includes(origin)) {
        return {
            ...corsHeaders,
            'Access-Control-Allow-Origin': origin
        };
    }

    return corsHeaders;
}
