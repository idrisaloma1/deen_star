import './footer.css';

// Converts a local Nigerian number like "08037945608" to WhatsApp's
// expected international format "2348037945608" (no leading +).
function toWhatsAppNumber(local) {
  const digits = local.replace(/\D/g, '');
  return digits.startsWith('0') ? `234${digits.slice(1)}` : digits;
}

function toTelHref(local) {
  const digits = local.replace(/\D/g, '');
  return `tel:+${digits.startsWith('0') ? `234${digits.slice(1)}` : digits}`;
}

export default function Footer() {
  const phones = ['08037945608', '08072889844'];
  const whatsapp = '08037945608';

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-block">
          <span className="footer-mark">DEEN-STAR</span>
          <p className="footer-tagline">Everything the mall has, delivered across Lagos.</p>
        </div>

        <div className="footer-block">
          <h3>Contact us</h3>
          <dl className="footer-contact">
            <dt>Business name</dt>
            <dd>DEEN-STAR SHOPPING MALL</dd>

            <dt>Address</dt>
            <dd>15, Kehinde Street, Anjorin Amikanle Road, Lagos</dd>

            <dt>Phone number</dt>
            <dd>
              {phones.map((p, i) => (
                <span key={p}>
                  <a href={toTelHref(p)}>{p}</a>
                  {i < phones.length - 1 && ', '}
                </span>
              ))}
            </dd>

            <dt>WhatsApp</dt>
            <dd>
              <a
                href={`https://wa.me/${toWhatsAppNumber(whatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {whatsapp}
              </a>
            </dd>
          </dl>
        </div>

        <div className="footer-block">
          <h3>Join us on</h3>
          <div className="footer-social">
            <span className="footer-social-icon" title="Facebook page coming soon" aria-label="Facebook (coming soon)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.86.24-1.45 1.48-1.45H16.5V4.36C16.2 4.32 15.19 4.24 14 4.24c-2.47 0-4.16 1.51-4.16 4.28V10.5H7.3v3H9.84V21h3.66z" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        DEEN-STAR SHOPPING MALL — Lagos, Nigeria
      </div>
    </footer>
  );
}
