// Footer component for Faith & Fashion Nairobi
export class Footer {
  constructor() {}

  // Initialize the footer
  init() {
    this.render();
  }

  // Render the footer HTML
  render() {
    const footerElement = document.getElementById('footer');
    if (!footerElement) return;

    footerElement.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <h4>Faith & Fashion Nairobi</h4>
            <p style="color:var(--text-light);font-size:0.9rem;margin-top:0.5rem;">
              Modest clothing & SDA books for the whole family. Delivered in Nairobi.
            </p>
          </div>
          <div class="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><a href="shop.html?category=clothes&subcategory=men">Men's</a></li>
              <li><a href="shop.html?category=clothes&subcategory=women">Women's</a></li>
              <li><a href="shop.html?category=clothes&subcategory=children">Kids</a></li>
              <li><a href="shop.html?category=books">SDA Books</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Info</h4>
            <ul>
              <li><a href="contact.html">Contact Us</a></li>
              <li><a href="contact.html#delivery">Delivery Policy</a></li>
              <li><a href="contact.html#returns">Returns Policy</a></li>
              <li><a href="contact.html#faq">FAQ</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="tel:+254712345678">📞 +254 712 345 678</a></li>
              <li><a href="mailto:faithandfashionnairobi@gmail.com">✉️ Email Us</a></li>
              <li><a href="https://wa.me/254712345678" target="_blank">💬 WhatsApp</a></li>
            </ul>
            <p style="font-size:0.85rem;color:var(--text-light);margin-top:0.75rem;">
              Mon–Sat: 9AM–6PM
            </p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2025 Faith & Fashion Nairobi. All rights reserved.</p>
          <p style="font-size:0.8rem;color:var(--text-light);">Pay via M-Pesa • Cash on Delivery • Secure Checkout</p>
        </div>
      </div>
    `;
  }
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.footer = new Footer();
  window.footer.init();
});