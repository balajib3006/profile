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

function downloadVCard() {
  const blob = new Blob([vcardData], { type: "text/vcard" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Balaji_B.vcf";
  link.click();
}

function shareCard() {
  if (navigator.share) {
    navigator.share({
      title: 'Balaji B - Digital Card',
      text: 'Check out my digital visiting card',
      url: window.location.href
    });
  } else {
    alert("Sharing not supported on this browser. Copy the link manually.");
  }
}

// Generate QR Code
window.onload = function() {
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(vcardData);
  document.getElementById("qrCode").src = qrUrl;
};
