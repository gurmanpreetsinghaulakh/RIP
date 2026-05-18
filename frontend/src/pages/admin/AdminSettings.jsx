import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGlobalModal } from '../../context/ModalContext';
import { usePreferences } from '../../context/PreferencesContext';
import AdminLayout from '../../components/AdminLayout';

const INITIAL_SETTINGS = {
    siteName: 'HomiGo',
    tagline: 'Your home away from home.',
    contactEmail: 'support@homigo.com',
    currency: 'INR',
    maxListingImages: 5,
    minNights: 1,
    maxNights: 30,
    enableReviews: true,
    enableBookings: false,
    requireEmailVerification: false,
    maintenanceMode: false,
    defaultCategory: 'Stay',
    commissionRate: 10,
    maxPriceLimit: 100000,
    timezone: 'Asia/Kolkata',
    language: 'en',
};

function Toggle({ checked, onChange, id }) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            id={id}
            className={`settings-toggle ${checked ? 'toggle-on' : 'toggle-off'}`}
            onClick={() => onChange(!checked)}
        >
            <span className="toggle-thumb" />
        </button>
    );
}

function SettingsSection({ title, children }) {
    return (
        <div className="settings-section">
            <h3 className="settings-section-title">{title}</h3>
            <div className="settings-fields">{children}</div>
        </div>
    );
}

function Field({ label, hint, children }) {
    return (
        <div className="settings-field">
            <div className="settings-field-label">
                <span>{label}</span>
                {hint && <span className="settings-hint">{hint}</span>}
            </div>
            <div className="settings-field-control">{children}</div>
        </div>
    );
}

export default function AdminSettings() {
    const { user, logout } = useAuth();
    const { showModal, closeModal } = useGlobalModal();
    const navigate = useNavigate();
    const { formatPrice, currency, adminSettings, updateAdminSettings } = usePreferences();
    const [settings, setSettings] = useState(INITIAL_SETTINGS);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!user.isAdmin) { navigate('/dashboard'); return; }
        if (adminSettings) {
            let langShort = 'en';
            if (adminSettings.language === 'English') langShort = 'en';
            if (adminSettings.language === 'Hindi') langShort = 'hi';
            if (adminSettings.language === 'French') langShort = 'fr';
            if (adminSettings.language === 'Spanish') langShort = 'es';
            setSettings({ ...adminSettings, language: langShort });
        }
    }, [user, navigate, adminSettings]);

    const update = (key, val) => setSettings(s => ({ ...s, [key]: val }));

    const handleSave = () => {
        updateAdminSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        showModal({
            title: 'Reset All Settings',
            message: 'Are you sure you want to restore all settings to their factory defaults? This action cannot be undone.',
            type: 'delete',
            confirmText: 'Reset to Defaults',
            onConfirm: () => {
                setSettings(INITIAL_SETTINGS);
                updateAdminSettings(INITIAL_SETTINGS);
                closeModal();
            }
        });
    };

    const TABS = ['general', 'listings', 'bookings', 'security', 'advanced'];

    if (!user) return null;

    return (
        <AdminLayout
            title="Settings"
            subtitle="Configure platform preferences"
            actions={
                <div className="settings-header-btns">
                    <button className="settings-reset-btn" onClick={handleReset} id="settings-reset-btn">Reset</button>
                    <button className="settings-save-btn" onClick={handleSave} id="settings-save-btn">
                        {saved ? '✓ Saved!' : '💾 Save Changes'}
                    </button>
                </div>
            }
        >
            {saved && <div className="admin-toast toast-success">✓ Settings saved successfully!</div>}

            {/* Tab Bar */}
            <div className="settings-tab-bar">
                {TABS.map(t => (
                    <button
                        key={t}
                        className={`settings-tab ${activeTab === t ? 'active' : ''}`}
                        onClick={() => setActiveTab(t)}
                        id={`settings-tab-${t}`}
                    >
                        {{ general: '⚙️ General', listings: '🏠 Listings', bookings: '📋 Bookings', security: '🔒 Security', advanced: '🛠 Advanced' }[t]}
                    </button>
                ))}
            </div>

            <div className="settings-body">
                {/* ── GENERAL ── */}
                {activeTab === 'general' && (
                    <>
                        <SettingsSection title="Site Identity">
                            <Field label="Site Name" hint="Displayed in the navbar and browser tab">
                                <input className="settings-input" value={settings.siteName} onChange={e => update('siteName', e.target.value)} id="setting-site-name" />
                            </Field>
                            <Field label="Tagline" hint="Shown below the logo on the landing page">
                                <input className="settings-input" value={settings.tagline} onChange={e => update('tagline', e.target.value)} />
                            </Field>
                            <Field label="Contact Email" hint="Used for support and notifications">
                                <input className="settings-input" type="email" value={settings.contactEmail} onChange={e => update('contactEmail', e.target.value)} />
                            </Field>
                        </SettingsSection>

                        <SettingsSection title="Localisation">
                            <Field label="Currency" hint="Displayed across all listings">
                                <select className="settings-input" value={settings.currency} onChange={e => update('currency', e.target.value)} id="setting-currency">
                                    <option value="INR">₹ Indian Rupee (INR)</option>
                                    <option value="USD">$ US Dollar (USD)</option>
                                    <option value="EUR">€ Euro (EUR)</option>
                                    <option value="GBP">£ Pound Sterling (GBP)</option>
                                </select>
                            </Field>
                            <Field label="Timezone">
                                <select className="settings-input" value={settings.timezone} onChange={e => update('timezone', e.target.value)}>
                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                    <option value="America/New_York">America/New_York (EST)</option>
                                    <option value="Europe/London">Europe/London (GMT)</option>
                                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                                </select>
                            </Field>
                        </SettingsSection>

                        <SettingsSection title="Features">
                            <Field label="Enable Reviews" hint="Allow users to leave reviews on listings">
                                <Toggle checked={settings.enableReviews} onChange={v => update('enableReviews', v)} id="toggle-reviews" />
                            </Field>
                            <Field label="Maintenance Mode" hint="Show a maintenance page to all non-admin visitors">
                                <Toggle checked={settings.maintenanceMode} onChange={v => update('maintenanceMode', v)} id="toggle-maintenance" />
                            </Field>
                        </SettingsSection>
                    </>
                )}

                {/* ── LISTINGS ── */}
                {activeTab === 'listings' && (
                    <>
                        <SettingsSection title="Listing Rules">
                            <Field label="Max Images per Listing" hint="Maximum number of images an admin can upload">
                                <div className="settings-number-wrap">
                                    <input className="settings-input" type="number" min={1} max={20} value={settings.maxListingImages} onChange={e => update('maxListingImages', +e.target.value)} id="setting-max-images" />
                                    <span className="number-unit">images</span>
                                </div>
                            </Field>
                            <Field label="Default Category" hint="Applied when no category is specified">
                                <select className="settings-input" value={settings.defaultCategory} onChange={e => update('defaultCategory', e.target.value)} id="setting-default-category">
                                    {['Stay', 'Beach', 'Mountain', 'City', 'Heritage', 'Forest', 'Farm', 'Desert'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label={`Max Price Limit (${currency})`} hint="Listings above this price will require admin approval">
                                <div className="settings-number-wrap">
                                    <span className="number-prefix">{currency}</span>
                                    <input className="settings-input" type="number" min={1000} step={1000} value={settings.maxPriceLimit} onChange={e => update('maxPriceLimit', +e.target.value)} />
                                </div>
                            </Field>
                        </SettingsSection>

                        <SettingsSection title="Commission & Revenue">
                            <Field label="Commission Rate" hint="Percentage taken from each booking">
                                <div className="settings-number-wrap">
                                    <input className="settings-input" type="number" min={0} max={50} value={settings.commissionRate} onChange={e => update('commissionRate', +e.target.value)} id="setting-commission" />
                                    <span className="number-unit">%</span>
                                </div>
                            </Field>
                            <div className="settings-info-box">
                                💡 At {settings.commissionRate}% commission, a {formatPrice(10000)} booking earns HomiGo {formatPrice(10000 * settings.commissionRate / 100)}.
                            </div>
                        </SettingsSection>
                    </>
                )}

                {/* ── BOOKINGS ── */}
                {activeTab === 'bookings' && (
                    <>
                        <SettingsSection title="Booking Rules">
                            <Field label="Enable Bookings" hint="Allow users to make booking requests">
                                <Toggle checked={settings.enableBookings} onChange={v => update('enableBookings', v)} id="toggle-bookings" />
                            </Field>
                            <Field label="Minimum Nights" hint="Minimum stay duration allowed">
                                <div className="settings-number-wrap">
                                    <input className="settings-input" type="number" min={1} max={30} value={settings.minNights} onChange={e => update('minNights', +e.target.value)} id="setting-min-nights" />
                                    <span className="number-unit">nights</span>
                                </div>
                            </Field>
                            <Field label="Maximum Nights" hint="Maximum stay duration per booking">
                                <div className="settings-number-wrap">
                                    <input className="settings-input" type="number" min={1} max={365} value={settings.maxNights} onChange={e => update('maxNights', +e.target.value)} id="setting-max-nights" />
                                    <span className="number-unit">nights</span>
                                </div>
                            </Field>
                        </SettingsSection>

                        {!settings.enableBookings && (
                            <div className="settings-warning-box">
                                ⚠️ Bookings are currently <strong>disabled</strong>. Users can browse listings but cannot make booking requests.
                            </div>
                        )}
                    </>
                )}

                {/* ── SECURITY ── */}
                {activeTab === 'security' && (
                    <>
                        <SettingsSection title="Authentication">
                            <Field label="Require Email Verification" hint="New users must verify their email before accessing the platform">
                                <Toggle checked={settings.requireEmailVerification} onChange={v => update('requireEmailVerification', v)} id="toggle-email-verify" />
                            </Field>
                        </SettingsSection>

                        <SettingsSection title="Admin Account">
                            <div className="admin-account-card">
                                <div className="aac-avatar">{(user.username || 'A')[0].toUpperCase()}</div>
                                <div className="aac-info">
                                    <div className="aac-name">{user.username}</div>
                                    <div className="aac-role">Administrator</div>
                                    <div className="aac-email">{user.email || 'ketansingla3246@gmail.com'}</div>
                                </div>
                                <span className="role-pill role-admin" style={{ marginLeft: 'auto' }}>🛡 Admin</span>
                            </div>
                        </SettingsSection>

                        <SettingsSection title="Danger Zone">
                            <div className="settings-danger-box">
                                <div>
                                    <div className="danger-title">Clear All Sessions</div>
                                    <div className="danger-desc">Force all users (including admins) to log in again.</div>
                                </div>
                                <button
                                    className="danger-btn"
                                    onClick={() => showModal({
                                        title: 'Clear Sessions',
                                        message: 'This will invalidate your current session and log you out. Are you sure you want to proceed?',
                                        type: 'delete',
                                        confirmText: 'Log Out',
                                        onConfirm: async () => {
                                            closeModal();
                                            await logout();
                                            navigate('/login');
                                        }
                                    })}
                                >
                                    Clear Sessions
                                </button>
                            </div>
                        </SettingsSection>
                    </>
                )}

                {/* ── ADVANCED ── */}
                {activeTab === 'advanced' && (
                    <>
                        <SettingsSection title="API & Integration">
                            <div className="settings-info-box">
                                <strong>Backend URL:</strong> http://localhost:4000<br />
                                <strong>Frontend URL:</strong> http://localhost:5173<br />
                                <strong>API Proxy:</strong> /api → backend
                            </div>
                        </SettingsSection>

                        <SettingsSection title="Data Management">
                            <div className="settings-danger-box">
                                <div>
                                    <div className="danger-title">Export All Listings</div>
                                    <div className="danger-desc">Download all listing data as JSON.</div>
                                </div>
                                <button
                                    className="tbl-btn tbl-btn-view"
                                    style={{ padding: '0.5rem 1.3rem' }}
                                    onClick={async () => {
                                        try {
                                            const res = await fetch('/api/listings');
                                            const data = await res.json();
                                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url; a.download = 'homigo_listings.json'; a.click();
                                        } catch {
                                            showModal({
                                                title: 'Export Failed',
                                                message: 'We encountered an error while exporting your listings. Please try again.',
                                                type: 'info'
                                            });
                                        }
                                    }}
                                    id="export-listings-btn"
                                >
                                    Export JSON
                                </button>
                            </div>
                            <div className="settings-danger-box" style={{ marginTop: '0.8rem' }}>
                                <div>
                                    <div className="danger-title" style={{ color: '#f87171' }}>Reset Settings</div>
                                    <div className="danger-desc">Restore all settings to factory defaults.</div>
                                </div>
                                <button className="danger-btn" onClick={handleReset} id="advanced-reset-btn">Reset All</button>
                            </div>
                        </SettingsSection>

                        <SettingsSection title="Environment">
                            <div className="settings-info-box">
                                <div className="env-row"><span>Node Env</span><code>{import.meta.env.MODE}</code></div>
                                <div className="env-row"><span>Vite Dev</span><code>{import.meta.env.DEV ? 'true' : 'false'}</code></div>
                                <div className="env-row"><span>React Version</span><code>18.x</code></div>
                            </div>
                        </SettingsSection>
                    </>
                )}
            </div>

            {/* Sticky save footer */}
            <div className="settings-footer">
                <button className="settings-reset-btn" onClick={handleReset}>Reset to Defaults</button>
                <button className="settings-save-btn" onClick={handleSave} id="settings-save-footer-btn">
                    {saved ? '✓ Saved!' : '💾 Save Changes'}
                </button>
            </div>
        </AdminLayout>
    );
}
