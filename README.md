# Professional Portfolio Website

A modern, responsive portfolio website with a comprehensive admin panel for content management. Built with Flask, SQLite, and modern web technologies.

## Features

### Frontend
- **Responsive Design**: Mobile-first approach that works perfectly on all devices
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Interactive Elements**: Parallax scrolling, hover effects, and smooth animations
- **Performance Optimized**: Lazy loading, optimized assets, and efficient code

### Admin Panel
- **Complete Content Management**: Edit all website content through a user-friendly interface
- **Profile Management**: Update personal information, contact details, and statistics
- **Experience Management**: Add, edit, and reorder professional experiences
- **Skills Management**: Manage technical skills with proficiency levels and categories
- **Project Portfolio**: Add projects with images, technologies, and detailed descriptions
- **Certifications**: Manage professional certifications and credentials
- **Contact Messages**: View and manage messages from the contact form
- **Secure Authentication**: Admin login with session management

### Technical Features
- **SQLite Database**: Lightweight, file-based database for easy deployment
- **RESTful API**: Clean API endpoints for data management
- **Form Validation**: Client and server-side validation
- **Responsive Admin**: Admin panel works on all devices
- **Data Export**: Easy backup and migration capabilities

## Technology Stack

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Database engine
- **Werkzeug**: Security utilities

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **JavaScript ES6+**: Interactive functionality
- **Font Awesome**: Icon library
- **Google Fonts**: Typography

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Setup Instructions

1. **Clone or Download the Project**
   ```bash
   # If using git
   git clone <repository-url>
   cd profile
   
   # Or download and extract the ZIP file
   ```

2. **Create Virtual Environment** (Recommended)
   ```bash
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Copy Static Assets**
   Copy your existing images from `public/` to `static/images/`:
   ```bash
   # Create the images directory
   mkdir static\images
   
   # Copy your images
   copy public\*.jpg static\images\
   copy public\*.png static\images\
   ```

5. **Run the Application**
   ```bash
   python app.py
   ```

6. **Access the Website**
   - Main website: http://localhost:5000
   - Admin panel: http://localhost:5000/admin/login

## Default Admin Credentials

- **Username**: admin
- **Password**: admin123

**⚠️ Important**: Change these credentials immediately after first login!

## Project Structure

```
profile/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── portfolio.db          # SQLite database (created automatically)
├── templates/            # HTML templates
│   ├── base.html
│   ├── index.html
│   └── admin/           # Admin panel templates
├── static/              # Static assets
│   ├── css/
│   │   ├── style.css    # Main stylesheet
│   │   └── admin.css    # Admin panel styles
│   ├── js/
│   │   ├── script.js    # Main JavaScript
│   │   └── admin.js     # Admin panel JavaScript
│   ├── images/          # Image assets
│   └── uploads/         # User uploaded files
└── public/              # Original files (can be removed after migration)
```

## Configuration

### Database
The application uses SQLite by default. The database file (`portfolio.db`) is created automatically on first run.

### Environment Variables
You can set these environment variables for production:

```bash
export FLASK_ENV=production
export SECRET_KEY=your-very-secure-secret-key
```

### Customization
1. **Colors and Styling**: Edit `static/css/style.css` and `static/css/admin.css`
2. **Content**: Use the admin panel to update all content
3. **Images**: Upload images to `static/images/` and reference them in the admin panel

## Admin Panel Usage

### First Time Setup
1. Go to http://localhost:5000/admin/login
2. Login with default credentials (admin/admin123)
3. Update your profile information
4. Add your experiences, skills, and projects
5. Customize the content to match your profile

### Managing Content
- **Profile**: Update personal information and statistics
- **Experience**: Add work history with detailed responsibilities
- **Skills**: Organize skills by category with proficiency levels
- **Projects**: Showcase your work with images and descriptions
- **Certifications**: Display professional credentials
- **Messages**: View contact form submissions

## Deployment

### Local Development
The application runs on http://localhost:5000 by default.

### Production Deployment
For production deployment, consider:

1. **Use a production WSGI server** (like Gunicorn)
2. **Set environment variables** for security
3. **Use a reverse proxy** (like Nginx)
4. **Enable HTTPS**
5. **Regular database backups**

Example with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## Security Considerations

1. **Change default admin credentials**
2. **Use strong secret keys**
3. **Enable HTTPS in production**
4. **Regular security updates**
5. **Input validation and sanitization**

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Features

- **Responsive Images**: Optimized for different screen sizes
- **Lazy Loading**: Images load as needed
- **Minified Assets**: Compressed CSS and JavaScript
- **Efficient Database Queries**: Optimized data retrieval
- **Caching Headers**: Browser caching for static assets

## Troubleshooting

### Common Issues

1. **Database Errors**
   - Delete `portfolio.db` and restart the application
   - Check file permissions

2. **Static Files Not Loading**
   - Ensure files are in the correct `static/` directories
   - Check file paths in templates

3. **Admin Panel Access Issues**
   - Verify credentials
   - Check session configuration

4. **Mobile Display Issues**
   - Clear browser cache
   - Test in different browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support and questions:
1. Check the troubleshooting section
2. Review the code documentation
3. Create an issue in the repository

---

**Note**: This portfolio website is designed to be easily customizable and deployable. The admin panel makes it simple to update content without touching code, making it perfect for professionals who want a modern web presence with easy content management.