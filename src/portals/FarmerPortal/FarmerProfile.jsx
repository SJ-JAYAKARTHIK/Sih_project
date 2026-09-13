import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, MapPin, Building2, Globe } from 'lucide-react';

export const FarmerProfile = () => {
  const { farmerUser, language, t } = useApp();

  if (!farmerUser) return null;

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
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{t('profileTitle')}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Farmer account credentials and banking details
        </p>
      </div>

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

        {/* Profile fields */}
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
      </div>
    </div>
  );
};
