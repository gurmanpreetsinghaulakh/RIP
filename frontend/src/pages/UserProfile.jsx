import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGlobalModal } from '../context/ModalContext';
import { usePreferences } from '../context/PreferencesContext';
import UserLayout from '../components/UserLayout';

export default function UserProfile() {
    const { user, logout, login } = useAuth();
    const { updatePreferences, t } = usePreferences();
    const { showModal } = useGlobalModal();
    const navigate = useNavigate();
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    // Password States
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // 2FA States
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
    const [tfaLoading, setTfaLoading] = useState(false);

    const [profile, setProfile] = useState({
        username: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        notifications: true,
        marketing: false,
        language: 'English',
        currency: 'INR'
    });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.isAdmin) { navigate('/admin-dashboard'); return; }
        
        setTwoFactorEnabled(user.twoFactorEnabled || false);
        const storedProfile = localStorage.getItem(`homigo_user_profile_${user.email}`);
        if (storedProfile) {
            try {
                const parsed = JSON.parse(storedProfile);
                setProfile(prev => ({ ...prev, ...parsed, avatarUrl: parsed.avatarUrl || user.avatarUrl || '' }));
            } catch {}
        } else {
            setProfile(prev => ({
                ...prev,
                username: user.username || '',
                email: user.email || '',
                avatarUrl: user.avatarUrl || ''
            }));
        }
    }, [user, navigate]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: profile.username,
                    notifications: profile.notifications
                })
            });
            const data = await res.json();
            
            if (user) {
                localStorage.setItem(`homigo_user_profile_${user.email}`, JSON.stringify(profile));
                localStorage.setItem(`homigo_currency`, profile.currency || 'INR');
                localStorage.setItem(`homigo_language`, profile.language || 'English');
                updatePreferences(profile.currency, profile.language);
                
                const updatedUser = data.success && data.user ? data.user : {};
                login({ 
                    ...user, 
                    username: profile.username, 
                    avatarUrl: profile.avatarUrl,
                    notifications: profile.notifications,
                    ...updatedUser
                });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
            showModal({
                title: 'Error Saving Settings',
                message: 'Failed to update user profile in the database.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Data = reader.result;
                    setProfile(prev => ({ ...prev, avatarUrl: base64Data }));
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            showModal({ title: 'Validation Warning', message: 'Please fill in all password fields.', type: 'error' });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            showModal({ title: 'Validation Warning', message: 'New password and confirmation password do not match.', type: 'error' });
            return;
        }
        if (newPassword.length < 6) {
            showModal({ title: 'Validation Warning', message: 'Password must be at least 6 characters long.', type: 'error' });
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await res.json();
            if (data.success) {
                showModal({
                    title: 'Password Updated',
                    message: 'Your password has been changed successfully!',
                    type: 'success'
                });
                setOldPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setShowPasswordForm(false);
            } else {
                showModal({
                    title: 'Password Change Failed',
                    message: data.error || 'Failed to update your password.',
                    type: 'error'
                });
            }
        } catch (err) {
            console.error(err);
            showModal({
                title: 'Error',
                message: 'An unexpected network error occurred.',
                type: 'error'
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleToggle2FA = async () => {
        setTfaLoading(true);
        try {
            const res = await fetch('/api/user/toggle-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                setTwoFactorEnabled(data.twoFactorEnabled);
                login({ ...user, twoFactorEnabled: data.twoFactorEnabled });
                showModal({
                    title: 'Two-Factor Authentication',
                    message: data.twoFactorEnabled 
                        ? 'Two-Factor Authentication has been successfully enabled for your account!' 
                        : 'Two-Factor Authentication has been successfully disabled.',
                    type: 'success'
                });
            } else {
                showModal({
                    title: 'Authentication Error',
                    message: data.error || 'Failed to update 2FA settings.',
                    type: 'error'
                });
            }
        } catch (err) {
            console.error(err);
            showModal({
                title: 'Error',
                message: 'An unexpected network error occurred.',
                type: 'error'
            });
        } finally {
            setTfaLoading(false);
        }
    };

    if (!user) return null;

    const sections = [
        { id: 'personal', label: `👤 ${t('profile.personal_info')}` },
        { id: 'security', label: `🔒 ${t('profile.security')}` },
        { id: 'preferences', label: `⚙️ ${t('profile.preferences')}` },
    ];

    const [activeSection, setActiveSection] = useState('personal');

    return (
        <UserLayout
            title="Profile Settings"
            subtitle="Manage your account information and preferences"
            actions={
                <button
                    className="admin-add-btn"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : (saved ? '✓ Updated' : t('profile.save'))}
                </button>
            }
        >
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', marginTop: '1rem' }}>

                {/* Side Navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{
                        background: 'var(--db-surface)',
                        border: '1px solid var(--db-border)',
                        borderRadius: '1.25rem',
                        padding: '2rem 1.5rem',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            position: 'relative',
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: profile.avatarUrl ? `url(${profile.avatarUrl}) center/cover` : 'linear-gradient(135deg, var(--db-brand), #7c3aed)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            color: '#fff',
                            boxShadow: '0 8px 24px rgba(255, 56, 92, 0.3)'
                        }}>
                            {!profile.avatarUrl && (profile.username || user.username || 'U')[0].toUpperCase()}
                            <button
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#fff',
                                    border: 'none',
                                    color: '#222',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onClick={handlePhotoUpload}
                            >
                                📷
                            </button>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>{user.username}</h3>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--db-muted)' }}>Verified Explorer</p>
                        </div>
                        <div style={{
                            marginTop: '0.5rem',
                            padding: '0.4rem 0.8rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '2rem',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            color: 'var(--db-muted)',
                            textTransform: 'uppercase'
                        }}>
                            Member Since Mar 2026
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {sections.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    padding: '0.9rem 1.2rem',
                                    borderRadius: '0.8rem',
                                    border: 'none',
                                    background: activeSection === s.id ? 'rgba(255, 56, 92, 0.1)' : 'transparent',
                                    color: activeSection === s.id ? 'var(--db-brand)' : 'var(--db-muted)',
                                    fontWeight: activeSection === s.id ? '700' : '500',
                                    fontSize: '0.9rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span>{s.label}</span>
                                {activeSection === s.id && <span style={{ marginLeft: 'auto' }}>›</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Side */}
                <div style={{
                    background: 'var(--db-surface)',
                    border: '1px solid var(--db-border)',
                    borderRadius: '1.25rem',
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem'
                }}>

                    {activeSection === 'personal' && (
                        <>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Personal Information</h3>
                                <p style={{ fontSize: '0.88rem', color: 'var(--db-muted)' }}>Update your name and bio to personalise your profile.</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--db-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.display_name')}</label>
                                    <input
                                        className="search-input"
                                        style={{ height: '3rem', width: '100%' }}
                                        value={profile.username}
                                        onChange={e => setProfile({ ...profile, username: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--db-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.email')}</label>
                                    <input
                                        className="search-input"
                                        style={{ height: '3rem', width: '100%', opacity: 0.6 }}
                                        value={profile.email}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--db-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.about')}</label>
                                <textarea
                                    className="search-input"
                                    style={{ height: '120px', width: '100%', paddingTop: '1rem', resize: 'none' }}
                                    placeholder="Write a few lines about your travel style..."
                                    value={profile.bio}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--db-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.phone')}</label>
                                    <input
                                        className="search-input"
                                        style={{ height: '3rem', width: '100%' }}
                                        placeholder="+91 00000 00000"
                                        value={profile.phone}
                                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--db-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.location')}</label>
                                    <input
                                        className="search-input"
                                        style={{ height: '3rem', width: '100%' }}
                                        placeholder="Mumbai, India"
                                        value={profile.location}
                                        onChange={e => setProfile({ ...profile, location: e.target.value })}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {activeSection === 'security' && (
                        <>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Security & Auth</h3>
                                <p style={{ fontSize: '0.88rem', color: 'var(--db-muted)' }}>Secure your account with multi-factor authentication.</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    padding: '1.2rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '1rem',
                                    border: '1px solid var(--stays-border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Change Password</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--db-muted)' }}>Update your security credentials regularly</div>
                                        </div>
                                        <button 
                                            className="tbl-btn tbl-btn-view" 
                                            style={{ padding: '0.5rem 1rem', border: 'none' }}
                                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                                        >
                                            {showPasswordForm ? 'Cancel' : 'Change'}
                                        </button>
                                    </div>

                                    {showPasswordForm && (
                                        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--db-muted)' }}>Current Password</label>
                                                <input
                                                    type="password"
                                                    className="search-input"
                                                    style={{ height: '2.8rem', width: '100%', padding: '0 0.8rem' }}
                                                    placeholder="Enter current password"
                                                    value={oldPassword}
                                                    onChange={e => setOldPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--db-muted)' }}>New Password</label>
                                                    <input
                                                        type="password"
                                                        className="search-input"
                                                        style={{ height: '2.8rem', width: '100%', padding: '0 0.8rem' }}
                                                        placeholder="At least 6 chars"
                                                        value={newPassword}
                                                        onChange={e => setNewPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--db-muted)' }}>Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        className="search-input"
                                                        style={{ height: '2.8rem', width: '100%', padding: '0 0.8rem' }}
                                                        placeholder="Confirm new password"
                                                        value={confirmNewPassword}
                                                        onChange={e => setConfirmNewPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                className="admin-add-btn"
                                                style={{ height: '2.8rem', marginTop: '0.5rem', width: '100%', border: 'none', cursor: 'pointer' }}
                                                disabled={passwordLoading}
                                            >
                                                {passwordLoading ? 'Updating Password...' : 'Save Password'}
                                            </button>
                                        </form>
                                    )}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1.2rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '1rem',
                                    border: '1px solid var(--stays-border)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Two-Factor Authentication</div>
                                        <div style={{ fontSize: '0.8rem', color: twoFactorEnabled ? '#10b981' : 'var(--db-muted)', fontWeight: twoFactorEnabled ? '600' : 'normal' }}>
                                            {twoFactorEnabled ? '✓ Enabled for your account' : 'Currently disabled for your account'}
                                        </div>
                                    </div>
                                    <button 
                                        className={twoFactorEnabled ? 'tbl-btn tbl-btn-delete' : 'tbl-btn tbl-btn-edit'} 
                                        style={{ padding: '0.5rem 1rem', border: 'none', minWidth: '80px', cursor: 'pointer' }}
                                        onClick={handleToggle2FA}
                                        disabled={tfaLoading}
                                    >
                                        {tfaLoading ? '...' : (twoFactorEnabled ? 'Disable' : 'Enable')}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(255, 56, 92, 0.05)', borderRadius: '1rem', border: '1px solid rgba(255, 56, 92, 0.1)' }}>
                                <div style={{ color: 'var(--db-brand)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>⚠️ Danger Zone</div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--db-muted)', marginBottom: '1rem' }}>Deleting your account will remove all your data and historical bookings. This action cannot be undone.</p>
                                <button
                                    style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.6rem 1.2rem', borderRadius: '0.6rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                                    onClick={() => showModal({ 
                                        title: 'Delete Account', 
                                        message: 'Proceed with extreme caution. This will permanently delete your explorer profile.', 
                                        type: 'delete', 
                                        confirmText: 'Request Deletion',
                                        onConfirm: async () => {
                                            if (logout) {
                                                await logout();
                                                navigate('/');
                                            }
                                        }
                                    })}
                                >
                                    Delete My Account
                                </button>
                            </div>
                        </>
                    )}

                    {activeSection === 'preferences' && (
                        <>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Global Preferences</h3>
                                <p style={{ fontSize: '0.88rem', color: 'var(--db-muted)' }}>Customise your browsing and notification experience.</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--db-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('profile.currency')}</label>
                                    <select
                                        className="search-input"
                                        style={{ height: '3rem', width: '100%', padding: '0 1rem' }}
                                        value={profile.currency}
                                        onChange={e => setProfile({ ...profile, currency: e.target.value })}
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t('profile.notifications')}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--db-muted)' }}>Receive updates about your bookings</div>
                                    </div>
                                    <div
                                        style={{ width: '44px', height: '24px', background: profile.notifications ? 'var(--db-brand)' : '#333', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => setProfile({ ...profile, notifications: !profile.notifications })}
                                    >
                                        <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: profile.notifications ? '23px' : '3px', transition: 'all 0.2s' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t('profile.marketing')}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--db-muted)' }}>Get travel tips and exclusive deals</div>
                                    </div>
                                    <div
                                        style={{ width: '44px', height: '24px', background: profile.marketing ? 'var(--db-brand)' : '#333', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => setProfile({ ...profile, marketing: !profile.marketing })}
                                    >
                                        <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: profile.marketing ? '23px' : '3px', transition: 'all 0.2s' }} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {saved && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#10b981',
                    color: '#fff',
                    padding: '0.8rem 2rem',
                    borderRadius: '2rem',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                    zIndex: 1000,
                    animation: 'fadeIn 0.3s ease'
                }}>
                    ✓ Profile preferences updated!
                </div>
            )}
        </UserLayout>
    );
}
