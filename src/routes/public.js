/**
 * Public Routes - No Authentication Required
 */

import { corsHeaders } from '../middleware/cors.js';

export async function getAllData(request) {
    const db = request.env.DB;

    try {
        // Fetch all data in parallel
        const [about, experience, skills, projects, certifications, publications] = await Promise.all([
            db.prepare('SELECT * FROM about LIMIT 1').first(),
            db.prepare('SELECT * FROM experience ORDER BY id DESC').all(),
            db.prepare('SELECT * FROM skills ORDER BY category, level DESC').all(),
            db.prepare('SELECT * FROM projects ORDER BY id DESC').all(),
            db.prepare('SELECT * FROM certifications ORDER BY id DESC').all(),
            db.prepare('SELECT * FROM publications ORDER BY id DESC').all()
        ]);

        // Parse JSON fields
        const data = {
            about: about || {},
            experience: experience.results.map(exp => ({
                ...exp,
                responsibilities: JSON.parse(exp.responsibilities || '[]')
            })),
            skills: skills.results,
            projects: projects.results.map(proj => ({
                ...proj,
                tags: JSON.parse(proj.tags || '[]')
            })),
            certifications: certifications.results,
            publications: publications.results
        };

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}

export async function getPersonalDetails(request) {
    const db = request.env.DB;

    try {
        const result = await db.prepare('SELECT * FROM personal_details ORDER BY id DESC LIMIT 1').first();

        return new Response(JSON.stringify(result || {}), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    } catch (error) {
        console.error('Error fetching personal details:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}

export async function handleContact(request) {
    const db = request.env.DB;

    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Save message to database
        await db.prepare(
            'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)'
        ).bind(name, email, subject, message).run();

        // Check notification settings
        const settings = await db.prepare('SELECT * FROM notification_settings LIMIT 1').first();

        if (settings) {
            // Send notifications (email/WhatsApp) if enabled
            if (settings.email_notifications && settings.notification_email) {
                // Send email notification
                try {
                    await sendEmailNotification(
                        { name, email, subject, message },
                        settings.notification_email,
                        request.env
                    );
                } catch (error) {
                    console.error('Failed to send email notification:', error);
                }
            }

            if (settings.whatsapp_notifications && settings.whatsapp_number) {
                // Send WhatsApp notification
                try {
                    await sendWhatsAppNotification(
                        { name, email, subject, message },
                        settings.whatsapp_number,
                        request.env
                    );
                } catch (error) {
                    console.error('Failed to send WhatsApp notification:', error);
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Message sent successfully'
        }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    } catch (error) {
        console.error('Error handling contact:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Database error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
}

// Email notification helper
async function sendEmailNotification(messageData, toEmail, env) {
    // Using a simple SMTP API service (like SendGrid, Mailgun, etc.)
    // This is a placeholder - you'll need to implement based on your email service

    const { name, email, subject, message } = messageData;

    const emailBody = `
New contact form submission:

From: ${name} (${email})
Subject: ${subject}
Message: ${message}

You can reply directly to this email to respond to the sender.
    `.trim();

    // Example using Mailgun API (you can adapt to any email service)
    if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
        const formData = new FormData();
        formData.append('from', `Portfolio <mailgun@${env.MAILGUN_DOMAIN}>`);
        formData.append('to', toEmail);
        formData.append('subject', `New Contact: ${subject}`);
        formData.append('text', emailBody);
        formData.append('h:Reply-To', email);

        const response = await fetch(
            `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}`
                },
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error(`Email API error: ${response.status}`);
        }
    }
}

// WhatsApp notification helper
async function sendWhatsAppNotification(messageData, toNumber, env) {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_WHATSAPP_FROM) {
        return; // Skip if not configured
    }

    const { name, email, subject } = messageData;

    const whatsappMessage = `New portfolio contact from ${name} (${email}): ${subject}`;

    const formData = new URLSearchParams();
    formData.append('From', env.TWILIO_WHATSAPP_FROM);
    formData.append('To', `whatsapp:${toNumber}`);
    formData.append('Body', whatsappMessage);

    const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error(`Twilio API error: ${response.status}`);
    }
}
