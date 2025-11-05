const vcardData = `BEGIN:VCARD
VERSION:3.0
FN:Balaji B
ORG:Rangsons Aerospace Private Limited
TITLE:Associate Enginner
TEL;TYPE=WORK,VOICE:+91 9159875082
EMAIL;TYPE=HOME,INTERNET:balaji3006@outlook.in
EMAIL;TYPE=WORK,INTERNET:balajib@rangsonsaerospace.com
ADR;TYPE=WORK:;;Bengaluru;Karnataka;5600278;India
URL;TYPE=LinkedIn:https://www.linkedin.com/in/balajib300602
URL;TYPE=GitHub:https://github.com/balajib3006
URL;TYPE=WhatsApp:https://wa.me/+919159875082
REV:2024-01-01T00:00:00Z
END:VCARD`;

function handleContact(e) {
  e.preventDefault();
  
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
      link.download = "Balaji_B.vcf";
      link.click();
    }
  }
}

function shareCard() {
  if (navigator.share) {
    navigator.share({
      title: 'Balaji B - Digital Card',
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

// Generate QR Code
window.onload = function() {
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(vcardData);
  document.getElementById("qrCode").src = qrUrl;
};
