from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///portfolio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

# Add JSON filter for Jinja2
@app.template_filter('from_json')
def from_json_filter(value):
    if value:
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return []
    return []

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    location = db.Column(db.String(100))
    profile_image = db.Column(db.String(200))
    resume_url = db.Column(db.String(200))
    github_url = db.Column(db.String(200))
    linkedin_url = db.Column(db.String(200))
    orcid_url = db.Column(db.String(200))
    years_experience = db.Column(db.Float, default=0)
    projects_completed = db.Column(db.Integer, default=0)
    companies_worked = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Experience(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(100))
    start_date = db.Column(db.String(50), nullable=False)
    end_date = db.Column(db.String(50))
    is_current = db.Column(db.Boolean, default=False)
    description = db.Column(db.Text)
    responsibilities = db.Column(db.Text)  # JSON string of list
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    proficiency = db.Column(db.Integer, default=50)  # 0-100
    icon = db.Column(db.String(100))
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    detailed_description = db.Column(db.Text)
    technologies = db.Column(db.Text)  # JSON string of list
    features = db.Column(db.Text)  # JSON string of list
    images = db.Column(db.Text)  # JSON string of list
    project_url = db.Column(db.String(200))
    github_url = db.Column(db.String(200))
    is_featured = db.Column(db.Boolean, default=False)
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Certification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    issuer = db.Column(db.String(200), nullable=False)
    issue_date = db.Column(db.String(50))
    expiry_date = db.Column(db.String(50))
    credential_id = db.Column(db.String(100))
    credential_url = db.Column(db.String(200))
    image = db.Column(db.String(200))
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Helper functions
def init_db():
    """Initialize database with default data"""
    db.create_all()
    
    # Create admin user if doesn't exist
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            password_hash=generate_password_hash('admin123'),
            is_admin=True
        )
        db.session.add(admin)
    
    # Create default profile if doesn't exist
    profile = Profile.query.first()
    if not profile:
        profile = Profile(
            name='Balaji B',
            title='Associate Engineer',
            description='Specialized in hardware design, PCB development, and antenna systems with 1.9+ years of experience delivering innovative electronic solutions for aerospace and advanced composites industries.',
            email='balaji3006@outlook.in',
            location='Bengaluru, India',
            profile_image='profile-photo.jpg',
            github_url='https://github.com/balajib3006',
            linkedin_url='https://linkedin.com/in/balajib300602',
            orcid_url='https://orcid.org/0009-0001-5586-0951',
            years_experience=1.9,
            projects_completed=50,
            companies_worked=2
        )
        db.session.add(profile)
    
    # Add default experiences
    if not Experience.query.first():
        experiences = [
            Experience(
                job_title='Associate Engineer',
                company='Rangsons Aerospace PVT LTD',
                location='Bengaluru',
                start_date='2024',
                end_date='Present',
                is_current=True,
                description='Embedded hardware design, PCB development, and testing specialist.',
                responsibilities=json.dumps([
                    'Conducted in-depth analysis of project constraints, including functionalities, environment, and performance',
                    'Carried out feasibility studies to address technical and time limitations, setting practical goals',
                    'Converted system requirements into detailed circuit designs with multilayer PCB development adhering to DFM, DFT, and DFA standards',
                    'Designed, built, and rigorously tested prototypes to ensure specification compliance',
                    'Diagnosed and resolved design issues during testing using tools like oscilloscopes and multimeters',
                    'Maintained detailed documentation, including design files, test reports, and Bill of Materials (BOM)'
                ]),
                order_index=1
            ),
            Experience(
                job_title='Design Engineer Trainee (Antenna)',
                company='ST Advanced Composites PVT LTD',
                location='Chennai',
                start_date='2023',
                end_date='2024',
                is_current=False,
                description='Antenna design, validation, and Environmental Stress Screening specialist.',
                responsibilities=json.dumps([
                    'Conducted Environmental Stress Screening (ESS) to ensure the quality and performance of antenna systems under operational conditions',
                    'Designed and tested antennas and RF components to meet precise project specifications',
                    'Prepared comprehensive technical documentation for project hardware designs',
                    'Maintained communication and followed up with vendors to ensure project success',
                    'Provided ongoing support to the production team and aided in component selection for timely project completion'
                ]),
                order_index=2
            )
        ]
        for exp in experiences:
            db.session.add(exp)
    
    # Add default skills
    if not Skill.query.first():
        skills = [
            # Hardware Design
            Skill(name='Schematic Capture', category='Hardware Design', proficiency=90, icon='fas fa-microchip', order_index=1),
            Skill(name='PCB Layout', category='Hardware Design', proficiency=85, icon='fas fa-microchip', order_index=2),
            Skill(name='Antenna Design', category='Hardware Design', proficiency=80, icon='fas fa-microchip', order_index=3),
            
            # Protocols
            Skill(name='MIL-STD-1553B', category='Protocols', proficiency=85, icon='fas fa-network-wired', order_index=4),
            Skill(name='UART', category='Protocols', proficiency=90, icon='fas fa-network-wired', order_index=5),
            Skill(name='SPI', category='Protocols', proficiency=85, icon='fas fa-network-wired', order_index=6),
            Skill(name='I2C', category='Protocols', proficiency=80, icon='fas fa-network-wired', order_index=7),
            
            # Tools & Software
            Skill(name='Altium Designer', category='Tools & Software', proficiency=90, icon='fas fa-tools', order_index=8),
            Skill(name='Ansys HFSS', category='Tools & Software', proficiency=75, icon='fas fa-tools', order_index=9),
            Skill(name='LTSpice', category='Tools & Software', proficiency=80, icon='fas fa-tools', order_index=10),
            Skill(name='Oscilloscope', category='Tools & Software', proficiency=85, icon='fas fa-tools', order_index=11),
            
            # Testing & Validation
            Skill(name='Environmental Stress Screening (ESS)', category='Testing & Validation', proficiency=85, icon='fas fa-vial', order_index=12),
            Skill(name='DFM/DFA/DFT Standards', category='Testing & Validation', proficiency=80, icon='fas fa-vial', order_index=13),
        ]
        for skill in skills:
            db.session.add(skill)
    
    # Add default projects
    if not Project.query.first():
        projects = [
            Project(
                title='Multilayer PCB Design',
                description='Advanced multilayer PCB design for aerospace applications with DFM compliance',
                detailed_description='Advanced multilayer PCB design for aerospace applications with strict DFM compliance and high-density routing.',
                technologies=json.dumps(['PCB Design', 'Altium', 'DFM']),
                features=json.dumps([
                    'High-density multilayer routing',
                    'Impedance controlled traces',
                    'Via-in-pad technology',
                    'Thermal management',
                    'EMI/EMC compliance'
                ]),
                images=json.dumps(['https://via.placeholder.com/400x300/1a1a1a/ffffff?text=PCB+Design']),
                is_featured=True,
                order_index=1
            ),
            Project(
                title='RF Antenna System',
                description='High-performance antenna design with HFSS simulation and ESS validation',
                detailed_description='High-performance antenna design with comprehensive HFSS simulation and Environmental Stress Screening validation.',
                technologies=json.dumps(['Antenna Design', 'HFSS', 'RF']),
                features=json.dumps([
                    'Multi-band operation',
                    'High gain characteristics',
                    'Low VSWR across frequency range',
                    'Environmental stress tested',
                    'Compact form factor'
                ]),
                images=json.dumps(['https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Antenna+Design']),
                is_featured=True,
                order_index=2
            ),
            Project(
                title='Circuit Analysis & Simulation',
                description='Comprehensive circuit analysis using LTSpice for embedded systems',
                detailed_description='Comprehensive circuit analysis using LTSpice for embedded systems with focus on power management and signal conditioning.',
                technologies=json.dumps(['Circuit Design', 'LTSpice', 'Simulation']),
                features=json.dumps([
                    'AC/DC analysis',
                    'Transient response simulation',
                    'Frequency domain analysis',
                    'Monte Carlo analysis',
                    'Worst-case design verification'
                ]),
                images=json.dumps(['https://via.placeholder.com/400x300/1a1a1a/ffffff?text=Circuit+Analysis']),
                is_featured=True,
                order_index=3
            )
        ]
        for project in projects:
            db.session.add(project)
    
    db.session.commit()

# Routes
@app.route('/')
def index():
    profile = Profile.query.first()
    experiences = Experience.query.order_by(Experience.order_index).all()
    skills = Skill.query.order_by(Skill.order_index).all()
    projects = Project.query.filter_by(is_featured=True).order_by(Project.order_index).all()
    certifications = Certification.query.order_by(Certification.order_index).all()
    
    # Group skills by category
    skills_by_category = {}
    for skill in skills:
        if skill.category not in skills_by_category:
            skills_by_category[skill.category] = []
        skills_by_category[skill.category].append(skill)
    
    return render_template('index.html', 
                         profile=profile, 
                         experiences=experiences, 
                         skills_by_category=skills_by_category,
                         projects=projects,
                         certifications=certifications)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password) and user.is_admin:
            session['user_id'] = user.id
            session['is_admin'] = True
            flash('Login successful!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid credentials!', 'error')
    
    return render_template('admin/login.html')

@app.route('/admin/logout')
def admin_logout():
    session.clear()
    flash('Logged out successfully!', 'success')
    return redirect(url_for('index'))

@app.route('/admin')
def admin_dashboard():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    profile = Profile.query.first()
    total_experiences = Experience.query.count()
    total_skills = Skill.query.count()
    total_projects = Project.query.count()
    total_certifications = Certification.query.count()
    unread_messages = Contact.query.filter_by(is_read=False).count()
    
    return render_template('admin/dashboard.html',
                         profile=profile,
                         total_experiences=total_experiences,
                         total_skills=total_skills,
                         total_projects=total_projects,
                         total_certifications=total_certifications,
                         unread_messages=unread_messages)

@app.route('/admin/profile', methods=['GET', 'POST'])
def admin_profile():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    profile = Profile.query.first()
    
    if request.method == 'POST':
        if not profile:
            profile = Profile()
            db.session.add(profile)
        
        profile.name = request.form['name']
        profile.title = request.form['title']
        profile.description = request.form['description']
        profile.email = request.form['email']
        profile.phone = request.form.get('phone', '')
        profile.location = request.form['location']
        profile.github_url = request.form.get('github_url', '')
        profile.linkedin_url = request.form.get('linkedin_url', '')
        profile.orcid_url = request.form.get('orcid_url', '')
        profile.years_experience = float(request.form.get('years_experience', 0))
        profile.projects_completed = int(request.form.get('projects_completed', 0))
        profile.companies_worked = int(request.form.get('companies_worked', 0))
        
        db.session.commit()
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('admin_profile'))
    
    return render_template('admin/profile.html', profile=profile)

@app.route('/admin/experiences')
def admin_experiences():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    experiences = Experience.query.order_by(Experience.order_index).all()
    return render_template('admin/experiences.html', experiences=experiences)

@app.route('/admin/experience/add', methods=['GET', 'POST'])
def admin_add_experience():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    if request.method == 'POST':
        responsibilities = request.form.getlist('responsibilities[]')
        responsibilities = [r for r in responsibilities if r.strip()]
        
        experience = Experience(
            job_title=request.form['job_title'],
            company=request.form['company'],
            location=request.form.get('location', ''),
            start_date=request.form['start_date'],
            end_date=request.form.get('end_date', ''),
            is_current=bool(request.form.get('is_current')),
            description=request.form.get('description', ''),
            responsibilities=json.dumps(responsibilities),
            order_index=int(request.form.get('order_index', 0))
        )
        
        db.session.add(experience)
        db.session.commit()
        flash('Experience added successfully!', 'success')
        return redirect(url_for('admin_experiences'))
    
    return render_template('admin/experience_form.html', experience=None)

@app.route('/admin/experience/edit/<int:id>', methods=['GET', 'POST'])
def admin_edit_experience(id):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    experience = Experience.query.get_or_404(id)
    
    if request.method == 'POST':
        responsibilities = request.form.getlist('responsibilities[]')
        responsibilities = [r for r in responsibilities if r.strip()]
        
        experience.job_title = request.form['job_title']
        experience.company = request.form['company']
        experience.location = request.form.get('location', '')
        experience.start_date = request.form['start_date']
        experience.end_date = request.form.get('end_date', '')
        experience.is_current = bool(request.form.get('is_current'))
        experience.description = request.form.get('description', '')
        experience.responsibilities = json.dumps(responsibilities)
        experience.order_index = int(request.form.get('order_index', 0))
        
        db.session.commit()
        flash('Experience updated successfully!', 'success')
        return redirect(url_for('admin_experiences'))
    
    return render_template('admin/experience_form.html', experience=experience)

@app.route('/admin/experience/delete/<int:id>')
def admin_delete_experience(id):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    experience = Experience.query.get_or_404(id)
    db.session.delete(experience)
    db.session.commit()
    flash('Experience deleted successfully!', 'success')
    return redirect(url_for('admin_experiences'))

@app.route('/admin/skills')
def admin_skills():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    skills = Skill.query.order_by(Skill.category, Skill.order_index).all()
    return render_template('admin/skills.html', skills=skills)

@app.route('/admin/skill/add', methods=['GET', 'POST'])
def admin_add_skill():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    if request.method == 'POST':
        skill = Skill(
            name=request.form['name'],
            category=request.form['category'],
            proficiency=int(request.form['proficiency']),
            icon=request.form.get('icon', ''),
            order_index=int(request.form.get('order_index', 0))
        )
        
        db.session.add(skill)
        db.session.commit()
        flash('Skill added successfully!', 'success')
        return redirect(url_for('admin_skills'))
    
    return render_template('admin/skill_form.html', skill=None)

@app.route('/admin/skill/edit/<int:id>', methods=['GET', 'POST'])
def admin_edit_skill(id):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    skill = Skill.query.get_or_404(id)
    
    if request.method == 'POST':
        skill.name = request.form['name']
        skill.category = request.form['category']
        skill.proficiency = int(request.form['proficiency'])
        skill.icon = request.form.get('icon', '')
        skill.order_index = int(request.form.get('order_index', 0))
        
        db.session.commit()
        flash('Skill updated successfully!', 'success')
        return redirect(url_for('admin_skills'))
    
    return render_template('admin/skill_form.html', skill=skill)

@app.route('/admin/skill/delete/<int:id>')
def admin_delete_skill(id):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    skill = Skill.query.get_or_404(id)
    db.session.delete(skill)
    db.session.commit()
    flash('Skill deleted successfully!', 'success')
    return redirect(url_for('admin_skills'))

@app.route('/admin/projects')
def admin_projects():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    projects = Project.query.order_by(Project.order_index).all()
    return render_template('admin/projects.html', projects=projects)

@app.route('/admin/project/add', methods=['GET', 'POST'])
def admin_add_project():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    if request.method == 'POST':
        technologies = request.form.getlist('technologies[]')
        technologies = [t for t in technologies if t.strip()]
        
        features = request.form.getlist('features[]')
        features = [f for f in features if f.strip()]
        
        images = request.form.getlist('images[]')
        images = [i for i in images if i.strip()]
        
        project = Project(
            title=request.form['title'],
            description=request.form['description'],
            detailed_description=request.form.get('detailed_description', ''),
            technologies=json.dumps(technologies),
            features=json.dumps(features),
            images=json.dumps(images),
            project_url=request.form.get('project_url', ''),
            github_url=request.form.get('github_url', ''),
            is_featured=bool(request.form.get('is_featured')),
            order_index=int(request.form.get('order_index', 0))
        )
        
        db.session.add(project)
        db.session.commit()
        flash('Project added successfully!', 'success')
        return redirect(url_for('admin_projects'))
    
    return render_template('admin/project_form.html', project=None)

@app.route('/admin/project/edit/<int:id>', methods=['GET', 'POST'])
def admin_edit_project(id):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    project = Project.query.get_or_404(id)
    
    if request.method == 'POST':
        technologies = request.form.getlist('technologies[]')
        technologies = [t for t in technologies if t.strip()]
        
        features = request.form.getlist('features[]')
        features = [f for f in features if f.strip()]
        
        images = request.form.getlist('images[]')
        images = [i for i in images if i.strip()]
        
        project.title = request.form['title']
        project.description = request.form['description']
        project.detailed_description = request.form.get('detailed_description', '')
        project.technologies = json.dumps(technologies)
        project.features = json.dumps(features)
        project.images = json.dumps(images)
        project.project_url = request.form.get('project_url', '')
        project.github_url = request.form.get('github_url', '')
        project.is_featured = bool(request.form.get('is_featured'))
        project.order_index = int(request.form.get('order_index', 0))
        
        db.session.commit()
        flash('Project updated successfully!', 'success')
        return redirect(url_for('admin_projects'))
    
    return render_template('admin/project_form.html', project=project)

@app.route('/admin/project/delete/<int:id>')
def admin_delete_project(id):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    project = Project.query.get_or_404(id)
    db.session.delete(project)
    db.session.commit()
    flash('Project deleted successfully!', 'success')
    return redirect(url_for('admin_projects'))

@app.route('/admin/certifications')
def admin_certifications():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    certifications = Certification.query.order_by(Certification.order_index).all()
    return render_template('admin/certifications.html', certifications=certifications)

@app.route('/admin/certification/add', methods=['GET', 'POST'])
def admin_add_certification():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    if request.method == 'POST':
        certification = Certification(
            name=request.form['name'],
            issuer=request.form['issuer'],
            issue_date=request.form.get('issue_date', ''),
            expiry_date=request.form.get('expiry_date', ''),
            credential_id=request.form.get('credential_id', ''),
            credential_url=request.form.get('credential_url', ''),
            image=request.form.get('image', ''),
            order_index=int(request.form.get('order_index', 0))
        )
        
        db.session.add(certification)
        db.session.commit()
        flash('Certification added successfully!', 'success')
        return redirect(url_for('admin_certifications'))
    
    return render_template('admin/certification_form.html', certification=None)

@app.route('/admin/certification/edit/<int:id>', methods=['GET', 'POST'])
def admin_edit_certification(id):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    certification = Certification.query.get_or_404(id)
    
    if request.method == 'POST':
        certification.name = request.form['name']
        certification.issuer = request.form['issuer']
        certification.issue_date = request.form.get('issue_date', '')
        certification.expiry_date = request.form.get('expiry_date', '')
        certification.credential_id = request.form.get('credential_id', '')
        certification.credential_url = request.form.get('credential_url', '')
        certification.image = request.form.get('image', '')
        certification.order_index = int(request.form.get('order_index', 0))
        
        db.session.commit()
        flash('Certification updated successfully!', 'success')
        return redirect(url_for('admin_certifications'))
    
    return render_template('admin/certification_form.html', certification=certification)

@app.route('/admin/certification/delete/<int:id>')
def admin_delete_certification(id):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    certification = Certification.query.get_or_404(id)
    db.session.delete(certification)
    db.session.commit()
    flash('Certification deleted successfully!', 'success')
    return redirect(url_for('admin_certifications'))

@app.route('/admin/messages')
def admin_messages():
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    messages = Contact.query.order_by(Contact.created_at.desc()).all()
    return render_template('admin/messages.html', messages=messages)

@app.route('/admin/message/<int:id>/read')
def admin_mark_message_read(id):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    message = Contact.query.get_or_404(id)
    message.is_read = True
    db.session.commit()
    return redirect(url_for('admin_messages'))

@app.route('/admin/message/<int:id>/delete')
def admin_delete_message(id):
    if not session.get('is_admin'):
        return redirect(url_for('admin_login'))
    
    message = Contact.query.get_or_404(id)
    db.session.delete(message)
    db.session.commit()
    flash('Message deleted successfully!', 'success')
    return redirect(url_for('admin_messages'))

@app.route('/contact', methods=['POST'])
def contact():
    try:
        contact = Contact(
            name=request.form['name'],
            email=request.form['email'],
            subject=request.form['subject'],
            message=request.form['message']
        )
        
        db.session.add(contact)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Message sent successfully!'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to send message. Please try again.'})

@app.route('/api/project/<int:id>')
def api_project(id):
    project = Project.query.get_or_404(id)
    return jsonify({
        'id': project.id,
        'title': project.title,
        'description': project.description,
        'detailed_description': project.detailed_description,
        'technologies': json.loads(project.technologies) if project.technologies else [],
        'features': json.loads(project.features) if project.features else [],
        'images': json.loads(project.images) if project.images else [],
        'project_url': project.project_url,
        'github_url': project.github_url
    })

if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True)