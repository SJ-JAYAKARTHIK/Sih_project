import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, MapPin, Building2, Globe, Edit2, Save, X, CheckCircle2 } from 'lucide-react';

export const FarmerProfile = () => {
  const { farmerUser, loginFarmer, language, changeLanguage, t } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: farmerUser?.name || '',
    mobile: farmerUser?.mobile || '',
    location: farmerUser?.location || '',
    bankDetails: farmerUser?.bankDetails || '',
    language: farmerUser?.language || language || 'EN'
  });

  if (!farmerUser) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/farmer/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmerUser.id,
          ...formData
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        loginFarmer(data.farmer);
        if (data.farmer.language) {
          changeLanguage(data.farmer.language);
        }
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setMessage(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error updating profile. Backend server may be offline.');
    } finally {
      setLoading(false);
    }
  };

  const profileItems = [
    {
      icon: User,
      label: t('farmerId'),
      value: farmerUser.id,
    },
    {
      icon: Phone,
      label: t('mobile'),
      value: `+91 ${farmerUser.mobile}`,
    },
    {
      icon: MapPin,
      label: t('location'),
      value: farmerUser.location,
    },
    {
      icon: Globe,
      label: 'Selected Language',
      value: language === 'EN' ? 'English' : language === 'TE' ? 'తెలుగు (Telugu)' : 'हिंदी (Hindi)',
    },
  ];

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{t('profileTitle')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Farmer account credentials, contact info and banking details
          </p>
        </div>
        {!isEditing && (
          <button
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => {
              setFormData({
                name: farmerUser.name,
                mobile: farmerUser.mobile,
                location: farmerUser.location,
                bankDetails: farmerUser.bankDetails,
                language: farmerUser.language || language || 'EN'
              });
              setIsEditing(true);
              setMessage('');
            }}
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div style={{
          backgroundColor: message.includes('success') ? 'var(--light-green)' : '#fef2f2',
          border: `1px solid ${message.includes('success') ? 'var(--green-border)' : '#fecaca'}`,
          color: message.includes('success') ? 'var(--primary)' : '#dc2626',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <div className="card card-lg">
        {/* Profile header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--light-green)',
            border: '2px solid var(--green-border)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            flexShrink: 0
          }}>
            {farmerUser.name.charAt(0)}
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text)' }}>
              {farmerUser.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
              <span className="badge badge-green">Verified Farmer</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                ID: <strong style={{ color: 'var(--text)' }}>{farmerUser.id}</strong>
              </span>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Full Name
              </label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Mobile Number
              </label>
              <input
                type="tel"
                className="input"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Location / District
              </label>
              <input
                type="text"
                className="input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Bank Account Details
              </label>
              <input
                type="text"
                className="input"
                value={formData.bankDetails}
                onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Preferred Portal Language
              </label>
              <select
                className="input"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="EN">English</option>
                <option value="TE">తెలుగు (Telugu)</option>
                <option value="HI">हिंदी (Hindi)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Profile fields display */
          <div style={{ display: 'grid', gap: '1.1rem' }}>
            {profileItems.map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--light-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  flexShrink: 0
                }}>
                  <Icon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                    {label}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}

            {/* Bank details */}
            <div style={{
              backgroundColor: 'var(--light-green)',
              border: '1px solid var(--green-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.875rem',
              marginTop: '0.25rem'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--soft-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}>
                <Building2 size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                  {t('bankAccount')}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                  {farmerUser.bankDetails}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {t('bankNotice')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
