import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, MapPin, Building2, ShieldCheck, Globe } from 'lucide-react';

export const FarmerProfile = () => {
  const { farmerUser, language, t } = useApp();

  if (!farmerUser) return null;

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{t('profileTitle')}</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Farmer account credentials and banking details</p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            border: '2px solid #FCD34D',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800
          }}>
            {farmerUser.name.charAt(0)}
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#111827' }}>{farmerUser.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className="badge badge-green">Verified Farmer</span>
              <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>ID: <strong>{farmerUser.id}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={20} color="#D97706" />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{t('farmerId')}</div>
              <div style={{ fontWeight: 700, color: '#111827' }}>{farmerUser.id}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Phone size={20} color="#D97706" />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{t('mobile')}</div>
              <div style={{ fontWeight: 700, color: '#111827' }}>+91 {farmerUser.mobile}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={20} color="#D97706" />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{t('location')}</div>
              <div style={{ fontWeight: 700, color: '#111827' }}>{farmerUser.location}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Globe size={20} color="#D97706" />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Selected Language:</div>
              <div style={{ fontWeight: 700, color: '#111827' }}>
                {language === 'EN' ? 'English' : language === 'TE' ? 'తెలుగు (Telugu)' : 'हिंदी (Hindi)'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', backgroundColor: '#FFFBEB', padding: '1rem', borderRadius: '10px', border: '1px solid #FCD34D' }}>
            <Building2 size={22} color="#B45309" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>{t('bankAccount')}</div>
              <div style={{ fontSize: '0.9rem', color: '#B45309', margin: '0.25rem 0' }}>
                {farmerUser.bankDetails}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#92400E', fontStyle: 'italic' }}>
                {t('bankNotice')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
