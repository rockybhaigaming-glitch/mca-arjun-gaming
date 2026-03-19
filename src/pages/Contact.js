import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Send, Mail, MessageSquare, User as UserIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mca-arjun-gaming.onrender.com";
const API = `${BACKEND_URL}/api`;

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/contact`, formData);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen py-24 px-4" data-testid="contact-page">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold uppercase mb-4" data-testid="contact-title">
            <span className="text-neon-orange">Contact Us</span>
          </h1>
          <p className="text-xl text-gray-400" data-testid="contact-subtitle">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="stat-card tech-corner p-6" data-testid="contact-info-email">
            <Mail className="text-neon-orange mb-3" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Email</h3>
            <p className="text-gray-400">mcaytbusiness@gmail.com</p>
          </div>
          <div className="stat-card tech-corner p-6" data-testid="contact-info-social">
            <MessageSquare className="text-neon-yellow mb-3" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Social Media</h3>
            <p className="text-gray-400">Follow us on Discord & WhatsApp</p>
          </div>
        </div>

        <div className="stat-card tech-corner p-8" data-testid="contact-form-container">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">
                <UserIcon size={16} className="inline mr-2" />
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full"
                placeholder="Your name"
                required
                data-testid="contact-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field w-full"
                placeholder="your.email@example.com"
                required
                data-testid="contact-email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">
                <MessageSquare size={16} className="inline mr-2" />
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field w-full"
                rows="6"
                placeholder="Your message..."
                required
                data-testid="contact-message-input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="primary-btn w-full skew-button"
              data-testid="contact-submit-button"
            >
              <span className="skew-button-text flex items-center justify-center gap-2">
                <Send size={20} />
                {submitting ? 'Sending...' : 'Send Message'}
              </span>
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-neon-yellow mb-4" data-testid="join-community-title">Join Our Community</h3>
          <div className="flex justify-center gap-6">
            <a
              href="https://whatsapp.com/channel/0029VajJpHH7tkjICaohNy3E"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn skew-button"
              data-testid="whatsapp-button"
            >
              <span className="skew-button-text">WhatsApp</span>
            </a>
            <a
              href="https://discord.gg/EP6sHqb6Ny"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn skew-button"
              data-testid="discord-button"
            >
              <span className="skew-button-text">Discord</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
