/**
 * Admin Routes - Protected by authMiddleware
 * Handles all admin CRUD operations
 */

import { corsHeaders } from '../middleware/cors.js';

// Helper function to create JSON responses
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
}

// ===== PERSONAL DETAILS =====
export async function getPersonalDetails(request) {
    const db = request.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM personal_details ORDER BY id DESC LIMIT 1').first();
        return jsonResponse(result || {});
    } catch (error) {
        return jsonResponse({ error: error.message }, 500);
    }
}

export async function updatePersonalDetails(request) {
    const db = request.env.DB;
    try {
        const body = await request.json();
        const {
            name, email, phone, location, bio, work_contact,
            portfolio_url, linkedin_url, github_url, gitlab_url, orcid_url, google_scholar_url,
            profile_picture
        } = body;

        const existing = await db.prepare('SELECT * FROM personal_details ORDER BY id DESC LIMIT 1').first();

        if (existing) {
            await db.prepare(`UPDATE personal_details SET 
                name = ?, email = ?, phone = ?, location = ?, bio = ?, work_contact = ?,
                portfolio_url = ?, linkedin_url = ?, github_url = ?, gitlab_url = ?, 
                orcid_url = ?, google_scholar_url = ?, profile_picture = ?
                WHERE id = ?`
            ).bind(name, email, phone, location, bio, work_contact,
                portfolio_url, linkedin_url, github_url, gitlab_url,
                orcid_url, google_scholar_url, profile_picture, existing.id).run();
        } else {
            await db.prepare(`INSERT INTO personal_details (
                name, email, phone, location, bio, work_contact,
                portfolio_url, linkedin_url, github_url, gitlab_url, 
                orcid_url, google_scholar_url, profile_picture
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(name, email, phone, location, bio, work_contact,
                portfolio_url, linkedin_url, github_url, gitlab_url,
                orcid_url, google_scholar_url, profile_picture).run();
        }

        return jsonResponse({ success: true, profile_picture });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

// ===== ABOUT =====
export async function getAbout(request) {
    const db = request.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM about ORDER BY id DESC LIMIT 1').first();
        return jsonResponse(result || {});
    } catch (error) {
        return jsonResponse({ error: error.message }, 500);
    }
}

export async function updateAbout(request) {
    const db = request.env.DB;
    try {
        const { summary, experience_years, projects_completed, companies_count } = await request.json();

        const existing = await db.prepare('SELECT * FROM about LIMIT 1').first();

        if (existing) {
            await db.prepare(`UPDATE about SET summary = ?, experience_years = ?, 
                projects_completed = ?, companies_count = ? WHERE id = ?`
            ).bind(summary, experience_years, projects_completed, companies_count, existing.id).run();
        } else {
            await db.prepare(`INSERT INTO about (summary, experience_years, projects_completed, companies_count) 
                VALUES (?, ?, ?, ?)`
            ).bind(summary, experience_years, projects_completed, companies_count).run();
        }

        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

// ===== EXPERIENCE =====
export async function getExperience(request) {
    const db = request.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM experience ORDER BY id DESC').all();
        const experience = result.results.map(row => ({
            ...row,
            responsibilities: JSON.parse(row.responsibilities || '[]')
        }));
        return jsonResponse(experience);
    } catch (error) {
        return jsonResponse({ error: error.message }, 500);
    }
}

export async function createExperience(request) {
    const db = request.env.DB;
    try {
        const { title, company, period, responsibilities, location } = await request.json();
        const respArray = Array.isArray(responsibilities)
            ? responsibilities
            : responsibilities.split('\n').filter(line => line.trim() !== '');

        await db.prepare(`INSERT INTO experience (title, company, period, responsibilities, location) 
            VALUES (?, ?, ?, ?, ?)`
        ).bind(title, company, period, JSON.stringify(respArray), location).run();

        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

export async function updateExperience(request) {
    const db = request.env.DB;
    const id = request.params?.id || new URL(request.url).pathname.split('/').pop();

    try {
        const { title, company, period, responsibilities, location } = await request.json();
        const respArray = Array.isArray(responsibilities)
            ? responsibilities
            : responsibilities.split('\n').filter(line => line.trim() !== '');

        await db.prepare(`UPDATE experience SET title = ?, company = ?, period = ?, 
            responsibilities = ?, location = ? WHERE id = ?`
        ).bind(title, company, period, JSON.stringify(respArray), location, id).run();

        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

export async function deleteExperience(request) {
    const db = request.env.DB;
    const id = request.params?.id || new URL(request.url).pathname.split('/').pop();

    try {
        await db.prepare('DELETE FROM experience WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

// ===== SKILLS =====
export async function getSkills(request) {
    const db = request.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM skills ORDER BY category, level DESC').all();
        return jsonResponse(result.results);
    } catch (error) {
        return jsonResponse({ error: error.message }, 500);
    }
}

export async function createSkill(request) {
    const db = request.env.DB;
    try {
        const { category, name, level } = await request.json();
        await db.prepare('INSERT INTO skills (category, name, level) VALUES (?, ?, ?)')
            .bind(category, name, level).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

export async function updateSkill(request) {
    const db = request.env.DB;
    const id = request.params?.id || new URL(request.url).pathname.split('/').pop();

    try {
        const { category, name, level } = await request.json();
        await db.prepare('UPDATE skills SET category = ?, name = ?, level = ? WHERE id = ?')
            .bind(category, name, level, id).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

export async function deleteSkill(request) {
    const db = request.env.DB;
    const id = request.params?.id || new URL(request.url).pathname.split('/').pop();

    try {
        await db.prepare('DELETE FROM skills WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

// ===== PROJECTS =====
export async function getProjects(request) {
    const db = request.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM projects ORDER BY id DESC').all();
        const projects = result.results.map(row => ({
            ...row,
            tags: JSON.parse(row.tags || '[]')
        }));
        return jsonResponse(projects);
    } catch (error) {
        return jsonResponse({ error: error.message }, 500);
    }
}

export async function createProject(request) {
    const db = request.env.DB;
    try {
        const { title, description, tags, image_url, cad_file } = await request.json();
        const tagsArray = Array.isArray(tags)
            ? tags
            : tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        await db.prepare(`INSERT INTO projects (title, description, image_url, tags, cad_file) 
            VALUES (?, ?, ?, ?, ?)`
        ).bind(title, description, image_url, JSON.stringify(tagsArray), cad_file).run();

        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

export async function updateProject(request) {
    const db = request.env.DB;
    const id = request.params?.id || new URL(request.url).pathname.split('/').pop();

    try {
        const { title, description, tags, image_url, cad_file } = await request.json();
        const tagsArray = Array.isArray(tags)
            ? tags
            : tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        const existing = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
        if (!existing) {
            return jsonResponse({ success: false, message: 'Project not found' }, 404);
        }

        const finalImageUrl = image_url !== undefined ? image_url : existing.image_url;
        const finalCadFile = cad_file !== undefined ? cad_file : existing.cad_file;

        await db.prepare(`UPDATE projects SET title = ?, description = ?, image_url = ?, 
            tags = ?, cad_file = ? WHERE id = ?`
        ).bind(title, description, finalImageUrl, JSON.stringify(tagsArray), finalCadFile, id).run();

        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

export async function deleteProject(request) {
    const db = request.env.DB;
    const id = request.params?.id || new URL(request.url).pathname.split('/').pop();

    try {
        await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

// ===== CERTIFICATIONS =====
export async function getCertifications(request) {
    const db = request.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM certifications ORDER BY id DESC').all();
        return jsonResponse(result.results);
    } catch (error) {
        return jsonResponse({ error: error.message }, 500);
    }
}

export async function createCertification(request) {
    const db = request.env.DB;
    try {
        const { name, issuer, date, link, type, embed_code } = await request.json();
        await db.prepare(`INSERT INTO certifications (name, issuer, date, link, type, embed_code) 
            VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(name, issuer, date, link, type || 'Certification', embed_code).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

export async function updateCertification(request) {
    const db = request.env.DB;
    const id = request.params?.id || new URL(request.url).pathname.split('/').pop();

    try {
        const { name, issuer, date, link, type, embed_code } = await request.json();
        await db.prepare(`UPDATE certifications SET name = ?, issuer = ?, date = ?, 
            link = ?, type = ?, embed_code = ? WHERE id = ?`
        ).bind(name, issuer, date, link, type || 'Certification', embed_code, id).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

export async function deleteCertification(request) {
    const db = request.env.DB;
    const id = request.params?.id || new URL(request.url).pathname.split('/').pop();

    try {
        await db.prepare('DELETE FROM certifications WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

// ===== PUBLICATIONS =====
export async function getPublications(request) {
    const db = request.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM publications ORDER BY id DESC').all();
        return jsonResponse(result.results);
    } catch (error) {
        return jsonResponse({ error: error.message }, 500);
    }
}

export async function createPublication(request) {
    const db = request.env.DB;
    try {
        const { title, publisher, date, link } = await request.json();
        await db.prepare('INSERT INTO publications (title, publisher, date, link) VALUES (?, ?, ?, ?)')
            .bind(title, publisher, date, link).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

export async function updatePublication(request) {
    const db = request.env.DB;
    const id = request.params?.id || new URL(request.url).pathname.split('/').pop();

    try {
        const { title, publisher, date, link } = await request.json();
        await db.prepare('UPDATE publications SET title = ?, publisher = ?, date = ?, link = ? WHERE id = ?')
            .bind(title, publisher, date, link, id).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

export async function deletePublication(request) {
    const db = request.env.DB;
    const id = request.params?.id || new URL(request.url).pathname.split('/').pop();

    try {
        await db.prepare('DELETE FROM publications WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

// ===== MESSAGES =====
export async function getMessages(request) {
    const db = request.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
        return jsonResponse(result.results);
    } catch (error) {
        return jsonResponse({ error: error.message }, 500);
    }
}

export async function deleteMessage(request) {
    const db = request.env.DB;
    const id = request.params?.id || new URL(request.url).pathname.split('/').pop();

    try {
        await db.prepare('DELETE FROM messages WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

// ===== NOTIFICATION SETTINGS =====
export async function getNotificationSettings(request) {
    const db = request.env.DB;
    try {
        const result = await db.prepare('SELECT * FROM notification_settings ORDER BY id DESC LIMIT 1').first();
        return jsonResponse(result || { email_notifications: 0, whatsapp_notifications: 0 });
    } catch (error) {
        return jsonResponse({ error: error.message }, 500);
    }
}

export async function updateNotificationSettings(request) {
    const db = request.env.DB;
    try {
        const { email_notifications, whatsapp_notifications, notification_email, whatsapp_number } = await request.json();

        const existing = await db.prepare('SELECT * FROM notification_settings LIMIT 1').first();

        if (existing) {
            await db.prepare(`UPDATE notification_settings SET 
                email_notifications = ?, whatsapp_notifications = ?, 
                notification_email = ?, whatsapp_number = ? WHERE id = ?`
            ).bind(
                email_notifications ? 1 : 0,
                whatsapp_notifications ? 1 : 0,
                notification_email,
                whatsapp_number,
                existing.id
            ).run();
        } else {
            await db.prepare(`INSERT INTO notification_settings 
                (email_notifications, whatsapp_notifications, notification_email, whatsapp_number) 
                VALUES (?, ?, ?, ?)`
            ).bind(
                email_notifications ? 1 : 0,
                whatsapp_notifications ? 1 : 0,
                notification_email,
                whatsapp_number
            ).run();
        }

        return jsonResponse({ success: true });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}

// ===== FILE UPLOAD (R2) =====
export async function handleUpload(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return jsonResponse({ success: false, message: 'No file provided' }, 400);
        }

        const r2 = request.env.UPLOADS;
        const fileName = `${Date.now()}-${file.name}`;

        await r2.put(fileName, file.stream(), {
            httpMetadata: {
                contentType: file.type
            }
        });

        // Return URL to access the file
        const fileUrl = `/uploads/${fileName}`;

        return jsonResponse({
            success: true,
            url: fileUrl,
            filename: fileName
        });
    } catch (error) {
        return jsonResponse({ success: false, message: error.message }, 500);
    }
}
