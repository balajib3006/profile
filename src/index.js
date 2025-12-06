/**
 * Cloudflare Worker Entry Point
 * Handles all HTTP requests and routes them to appropriate handlers
 */

import { Router } from 'itty-router';
import { handleCORS, corsHeaders } from './middleware/cors.js';
import { authMiddleware } from './middleware/auth.js';
import * as publicRoutes from './routes/public.js';
import * as authRoutes from './routes/auth.js';
import * as adminRoutes from './routes/admin.js';

const router = Router();

// Health check
router.get('/api/health', () => {
    return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: 'production'
    }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
});

// Public routes (no authentication)
router.get('/api/data', publicRoutes.getAllData);
router.get('/api/public/personal-details', publicRoutes.getPersonalDetails);
router.post('/api/contact', publicRoutes.handleContact);

// Auth routes
router.post('/api/auth/login', authRoutes.login);
router.post('/api/auth/logout', authRoutes.logout);
router.get('/api/auth/check', authMiddleware, authRoutes.checkAuth);

// Admin routes (protected)
router.get('/api/admin/personal-details', authMiddleware, adminRoutes.getPersonalDetails);
router.post('/api/admin/personal-details', authMiddleware, adminRoutes.updatePersonalDetails);
router.get('/api/admin/about', authMiddleware, adminRoutes.getAbout);
router.post('/api/admin/about', authMiddleware, adminRoutes.updateAbout);

router.get('/api/admin/experience', authMiddleware, adminRoutes.getExperience);
router.post('/api/admin/experience', authMiddleware, adminRoutes.createExperience);
router.put('/api/admin/experience/:id', authMiddleware, adminRoutes.updateExperience);
router.delete('/api/admin/experience/:id', authMiddleware, adminRoutes.deleteExperience);

router.get('/api/admin/skills', authMiddleware, adminRoutes.getSkills);
router.post('/api/admin/skills', authMiddleware, adminRoutes.createSkill);
router.put('/api/admin/skills/:id', authMiddleware, adminRoutes.updateSkill);
router.delete('/api/admin/skills/:id', authMiddleware, adminRoutes.deleteSkill);

router.get('/api/admin/projects', authMiddleware, adminRoutes.getProjects);
router.post('/api/admin/projects', authMiddleware, adminRoutes.createProject);
router.put('/api/admin/projects/:id', authMiddleware, adminRoutes.updateProject);
router.delete('/api/admin/projects/:id', authMiddleware, adminRoutes.deleteProject);

router.get('/api/admin/certifications', authMiddleware, adminRoutes.getCertifications);
router.post('/api/admin/certifications', authMiddleware, adminRoutes.createCertification);
router.put('/api/admin/certifications/:id', authMiddleware, adminRoutes.updateCertification);
router.delete('/api/admin/certifications/:id', authMiddleware, adminRoutes.deleteCertification);

router.get('/api/admin/publications', authMiddleware, adminRoutes.getPublications);
router.post('/api/admin/publications', authMiddleware, adminRoutes.createPublication);
router.put('/api/admin/publications/:id', authMiddleware, adminRoutes.updatePublication);
router.delete('/api/admin/publications/:id', authMiddleware, adminRoutes.deletePublication);

router.get('/api/admin/messages', authMiddleware, adminRoutes.getMessages);
router.delete('/api/admin/messages/:id', authMiddleware, adminRoutes.deleteMessage);

router.get('/api/admin/notification-settings', authMiddleware, adminRoutes.getNotificationSettings);
router.post('/api/admin/notification-settings', authMiddleware, adminRoutes.updateNotificationSettings);

router.post('/api/admin/upload', authMiddleware, adminRoutes.handleUpload);

// 404 handler
router.all('*', () => {
    return new Response('Not Found', {
        status: 404,
        headers: corsHeaders
    });
});

export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS();
        }

        try {
            // Attach env to request for access in handlers
            request.env = env;

            const response = await router.handle(request, env, ctx);

            // Add CORS headers to all responses
            const newHeaders = new Headers(response.headers);
            Object.entries(corsHeaders).forEach(([key, value]) => {
                newHeaders.set(key, value);
            });

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders
            });
        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({
                error: 'Internal Server Error',
                message: error.message
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }
    }
};
