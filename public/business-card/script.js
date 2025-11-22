// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '' // Use relative paths for same-origin requests in development
  : (window.API_URL || ''); // Use window.API_URL if set (production), otherwise relative

let vcardData = ''; // Will be populated dynamically

async function loadBusinessCardData() {
  try {
    // Fetch personal details and all portfolio data (for experience) in parallel
    const [personalResponse, allDataResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/public/personal-details`),
      fetch(`${API_BASE_URL}/api/data`)
    ]);

    const personalData = await personalResponse.json();
    const allData = await allDataResponse.json();

    if (personalData && Object.keys(personalData).length > 0) {
      // Extract current job from experience
      let currentJob = { title: '', company: '' };
      if (allData.experience && allData.experience.length > 0) {
        // Assuming experience is sorted by ID DESC (latest first) as per API
        currentJob = allData.experience[0];
      }

      updateCardUI(personalData, currentJob);
      generateVCard(personalData, currentJob);
      generateQRCode();
    }
  } catch (error) {
    console.error('Error loading business card data:', error);
  }
}

function updateCardUI(data, job) {
  // Name
  if (data.name) document.getElementById('card-name').textContent = data.name;

  // Title and Company
  const titleElement = document.getElementById('card-title');
  if (job.title && job.company) {
    titleElement.innerHTML = `${job.title}<br>${job.company}`;
  } else if (data.bio) {
    // Fallback to bio if no experience data
    titleElement.innerHTML = data.bio.replace(/\n/g, '<br>');
  }

  // Profile Picture
  if (data.profile_picture) {
    const img = document.getElementById('card-profile-picture');
    img.src = `/uploads/profile/${data.profile_picture}`;
    img.alt = data.name || 'Profile Picture';
  }

  // Contact Actions
  if (data.phone) {
    const phoneBtn = document.getElementById('card-phone-btn');
    phoneBtn.href = `tel:${data.phone.replace(/\s+/g, '')}`;

    const whatsappBtn = document.getElementById('card-whatsapp-btn');
    whatsappBtn.href = `https://wa.me/${data.phone.replace(/\D/g, '')}`;
  }

  if (data.email) {
    const emailBtn = document.getElementById('card-email-btn');
    emailBtn.href = `mailto:${data.email}`;
  }

  if (data.linkedin_url) {
    const linkedinBtn = document.getElementById('card-linkedin-btn');
    linkedinBtn.href = data.linkedin_url;
  }

  // Contact Info Text
  if (data.phone) {
    document.getElementById('card-phone-text').innerHTML = `<i class="fas fa-phone"></i> ${data.phone}`;
  }

  if (data.email) {
    document.getElementById('card-email-text').innerHTML = `<i class="fas fa-envelope"></i> ${data.email}`;
  }

  if (data.work_contact) {
    document.getElementById('card-work-email-text').innerHTML = `<i class="fas fa-envelope"></i> ${data.work_contact}`;
  } else {
    document.getElementById('card-work-email-text').style.display = 'none';
  }

  if (data.location) {
    document.getElementById('card-location-text').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.location}`;
  }
}

function generateVCard(data, job) {
  // Construct vCard string dynamically
  const nameParts = (data.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Use job title/company if available, else fallback to bio
  const title = job.title || (data.bio || '').split('\n')[0];
  const org = job.company || 'Rangsons Aerospace Private Limited'; // Default or fallback

  vcardData = `BEGIN:VCARD
VERSION:3.0
FN:${data.name || ''}
N:${lastName};${firstName};;;
ORG:${org}
TITLE:${title}
TEL;TYPE=WORK,VOICE:${data.phone || ''}
EMAIL;TYPE=HOME,INTERNET:${data.email || ''}
${data.work_contact ? `EMAIL;TYPE=WORK,INTERNET:${data.work_contact}` : ''}
ADR;TYPE=WORK:;;${data.location || ''}
URL;TYPE=LinkedIn:${data.linkedin_url || ''}
URL;TYPE=GitHub:${data.github_url || ''}
URL;TYPE=WhatsApp:https://wa.me/${(data.phone || '').replace(/\D/g, '')}
REV:${new Date().toISOString()}
END:VCARD`;
}

function handleContact(e) {
  if (e) e.preventDefault();

  // Check if running on mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    // On mobile, try to add to contacts directly
    const contactUri = `begin:vcard${encodeURIComponent(vcardData.substring(10))}`;
    window.location.href = `contacts:${contactUri}`;
  } else {
    // On desktop, show confirmation dialog
    if (confirm('Download contact card (vCard)?')) {
      const blob = new Blob([vcardData], { type: "text/vcard" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${(document.getElementById('card-name').textContent || 'contact').replace(/\s+/g, '_')}.vcf`;
      link.click();
    }
  }
}

function shareCard() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      text: 'Check out my digital visiting card',
      url: window.location.href
    }).catch(err => {
      console.log('Error sharing:', err);
      copyToClipboard(window.location.href);
    });
  } else {
    copyToClipboard(window.location.href);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => alert('Link copied to clipboard!'))
    .catch(() => alert('Please copy this link manually: ' + text));
}

function generateQRCode() {
  if (!vcardData) return;
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(vcardData);
  const qrImg = document.getElementById("qrCode");
  if (qrImg) qrImg.src = qrUrl;
}

// Initialize
window.onload = function () {
  loadBusinessCardData();
};