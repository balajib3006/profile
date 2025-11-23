import re

# Read the HTML file
with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add IDs to social links
html = re.sub(
    r'<a href="#" target="_blank" aria-label="LinkedIn" class="social-link">',
    '<a href="#" target="_blank" aria-label="LinkedIn" class="social-link" id="social-link-linkedin">',
    html
)
html = re.sub(
    r'<a href="#" target="_blank" aria-label="GitHub" class="social-link">',
    '<a href="#" target="_blank" aria-label="GitHub" class="social-link" id="social-link-github">',
    html
)
html = re.sub(
    r'<a href="#" target="_blank" aria-label="GitLab" class="social-link">',
    '<a href="#" target="_blank" aria-label="GitLab" class="social-link" id="social-link-gitlab">',
    html
)
html = re.sub(
    r'<a href="#" target="_blank" aria-label="ORCID" class="social-link">',
    '<a href="#" target="_blank" aria-label="ORCID" class="social-link" id="social-link-orcid">',
    html
)
html = re.sub(
    r'<a href="#" target="_blank" aria-label="Google Scholar" class="social-link">',
    '<a href="#" target="_blank" aria-label="Google Scholar" class="social-link" id="social-link-scholar">',
    html
)

# Add hero badge placeholder after hero title
html = re.sub(
    r'(</h1>\s*<p class="hero-subtitle">)',
    r'</h1>\n          <div id="hero-badge" class="hero-badge"></div>\n          <p class="hero-subtitle">',
    html
)

# Write updated HTML
with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML updated successfully!")
