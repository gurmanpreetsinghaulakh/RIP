import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGlobalModal } from '../../context/ModalContext';
import AdminLayout from '../../components/AdminLayout';
import { usePreferences } from '../../context/PreferencesContext';

export default function NewListing() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        country: '',
        category: 'Stay',
        roomType: 'Single Room',
        customRoomType: '',
        totalRooms: 1,
        availableRooms: 1,
    });
    const [files, setFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showModal } = useGlobalModal();
    const navigate = useNavigate();
    const { formatPrice, currency, adminSettings } = usePreferences();
    const minImages = adminSettings?.minListingImages || 4;
    const maxImages = adminSettings?.maxListingImages || 5;
    const maxPriceLimit = adminSettings?.maxPriceLimit || 100000;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > maxImages) {
            showModal({
                title: 'Too Many Images',
                message: `You can only upload a maximum of ${maxImages} images.`,
                type: 'error',
                confirmText: 'Understood'
            });
            return;
        }

        setFiles(selectedFiles);
        const newPreviews = [];
        
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result);
                if (newPreviews.length === selectedFiles.length) {
                    setImagePreviews([...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });
        
        if (selectedFiles.length === 0) {
            setImagePreviews([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (files.length < minImages) {
            const remaining = minImages - files.length;
            showModal({
                title: 'More Photos Required',
                message: `Please upload remaining photos: ${minImages} required, upload ${remaining} more.`,
                type: 'error',
                confirmText: 'Understood'
            });
            return;
        }

        if (files.length > maxImages) {
            showModal({
                title: 'Too Many Images',
                message: `You can only upload a maximum of ${maxImages} images.`,
                type: 'error',
                confirmText: 'Understood'
            });
            return;
        }

        if (Number(formData.price) > maxPriceLimit) {
            showModal({
                title: 'Price Exceeds Limit',
                message: `The maximum price allowed is ${formatPrice(maxPriceLimit)}. Please adjust the price or update settings.`,
                type: 'error',
                confirmText: 'Understood'
            });
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('listing[title]', formData.title);
        data.append('listing[description]', formData.description);
        data.append('listing[price]', formData.price);
        data.append('listing[location]', formData.location);
        data.append('listing[country]', formData.country);
        data.append('listing[category]', formData.category);
        
        const finalRoomType = formData.roomType === 'Other' ? formData.customRoomType : formData.roomType;
        data.append('listing[roomType]', finalRoomType);
        data.append('listing[totalRooms]', formData.totalRooms);
        data.append('listing[availableRooms]', formData.availableRooms);
        if (files && files.length > 0) {
            files.forEach(file => {
                data.append('listing[Image]', file);
            });
        }

        try {
            const res = await fetch('/api/listings', {
                method: 'POST',
                body: data,
            });
            const result = await res.json();
            if (result.success) {
                navigate('/admin/listings');
            } else {
                showModal({
                    title: 'Creation Failed',
                    message: result.error || 'Something went wrong while creating the listing.',
                    type: 'error',
                    confirmText: 'Try Again'
                });
            }
        } catch (err) {
            console.error(err);
            showModal({
                title: 'Network Error',
                message: 'Failed to communicate with the server. Please check your connection.',
                type: 'error',
                confirmText: 'Understood'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDiscard = (e) => {
        e.preventDefault();
        showModal({
            title: 'Discard Changes',
            message: 'Are you sure you want to discard this new listing? All entered data will be lost.',
            type: 'warning',
            confirmText: 'Discard',
            cancelText: 'Keep Editing',
            onConfirm: () => navigate('/admin/listings')
        });
    };

    const actions = (
        <Link to="/admin/listings" className="settings-reset-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>←</span> Back to Listings
        </Link>
    );

    return (
        <AdminLayout title="Add New Listing" subtitle="Create a new property listing with rich details" actions={actions}>
            <div className="new-listing-container" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'start' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* ── CORE DETAILS ── */}
                    <div className="settings-section">
                        <h3 className="settings-section-title">Property Details</h3>
                        <div className="settings-fields">
                            <div className="settings-field" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.6rem' }}>
                                <div className="settings-field-label">
                                    <span>Listing Title</span>
                                    <span className="settings-hint">Make it catchy and descriptive</span>
                                </div>
                                <div className="settings-field-control">
                                    <input
                                        name="title"
                                        placeholder="e.g. Modern Cliffside Villa with Infinity Pool"
                                        type="text"
                                        className="settings-input"
                                        style={{ width: '100%' }}
                                        required
                                        onChange={handleInputChange}
                                        value={formData.title}
                                    />
                                </div>
                            </div>

                            <div className="settings-field" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.6rem' }}>
                                <div className="settings-field-label">
                                    <span>Detailed Description</span>
                                    <span className="settings-hint">Tell guests what makes this place unique</span>
                                </div>
                                <div className="settings-field-control">
                                    <textarea
                                        name="description"
                                        placeholder="Describe the area, amenities, and overall vibe..."
                                        className="settings-input"
                                        style={{ width: '100%', minHeight: '140px', lineHeight: '1.6' }}
                                        onChange={handleInputChange}
                                        value={formData.description}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="settings-field">
                                <div className="settings-field-label">
                                    <span>Category</span>
                                    <span className="settings-hint">Helps users find your listing</span>
                                </div>
                                <div className="settings-field-control">
                                    <select name="category" className="settings-input" onChange={handleInputChange} value={formData.category}>
                                        {['Stay', 'Beach', 'Mountain', 'City', 'Heritage', 'Forest', 'Farm', 'Desert'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── ROOM DETAILS ── */}
                    <div className="settings-section">
                        <h3 className="settings-section-title">Room Details</h3>
                        <div className="settings-fields">
                            <div className="settings-field">
                                <div className="settings-field-label">
                                    <span>Type of Room</span>
                                </div>
                                <div className="settings-field-control">
                                    <select name="roomType" className="settings-input" onChange={handleInputChange} value={formData.roomType}>
                                        {['Single Room', 'Double Room', 'Suite', 'Family Room', 'Studio', 'Dormitory', 'Other'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    {formData.roomType === 'Other' && (
                                        <input
                                            name="customRoomType"
                                            placeholder="Specify the type of room"
                                            type="text"
                                            className="settings-input"
                                            style={{ marginTop: '0.8rem' }}
                                            required
                                            onChange={handleInputChange}
                                            value={formData.customRoomType}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="settings-field">
                                <div className="settings-field-label">
                                    <span>Total Rooms</span>
                                </div>
                                <div className="settings-field-control">
                                    <input
                                        name="totalRooms"
                                        type="number"
                                        min="1"
                                        className="settings-input"
                                        required
                                        onChange={handleInputChange}
                                        value={formData.totalRooms}
                                    />
                                </div>
                            </div>

                            <div className="settings-field">
                                <div className="settings-field-label">
                                    <span>Available Rooms</span>
                                </div>
                                <div className="settings-field-control">
                                    <input
                                        name="availableRooms"
                                        type="number"
                                        min="0"
                                        className="settings-input"
                                        required
                                        onChange={handleInputChange}
                                        value={formData.availableRooms}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── LOCATION & PRICING ── */}
                    <div className="settings-section">
                        <h3 className="settings-section-title">Location & Pricing</h3>
                        <div className="settings-fields">
                            <div className="settings-field">
                                <div className="settings-field-label">
                                    <span>Price per Night ({currency})</span>
                                </div>
                                <div className="settings-field-control">
                                    <div className="settings-number-wrap">
                                        <span className="number-prefix" style={{ color: 'var(--db-brand)', fontWeight: '800' }}>{currency}</span>
                                        <input
                                            name="price"
                                            placeholder="2500"
                                            type="number"
                                            min="0"
                                            className="settings-input"
                                            style={{ fontWeight: '700', fontSize: '1rem' }}
                                            required
                                            onChange={handleInputChange}
                                            value={formData.price}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="settings-field">
                                <div className="settings-field-label">
                                    <span>Location / City</span>
                                </div>
                                <div className="settings-field-control">
                                    <input
                                        name="location"
                                        placeholder="Manali, Himachal Pradesh"
                                        type="text"
                                        className="settings-input"
                                        required
                                        onChange={handleInputChange}
                                        value={formData.location}
                                    />
                                </div>
                            </div>

                            <div className="settings-field">
                                <div className="settings-field-label">
                                    <span>Country</span>
                                </div>
                                <div className="settings-field-control">
                                    <input
                                        name="country"
                                        placeholder="India"
                                        type="text"
                                        className="settings-input"
                                        required
                                        onChange={handleInputChange}
                                        value={formData.country}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={handleDiscard} className="settings-reset-btn" style={{ textDecoration: 'none', border: 'none' }}>Discard</button>
                        <button className="settings-save-btn" type="submit" disabled={loading} style={{ minWidth: '160px' }}>
                            {loading ? 'Creating...' : '✦ Publish Listing'}
                        </button>
                    </div>
                </form>

                {/* ── IMAGE PREVIEW ASIDE ── */}
                <div className="preview-aside" style={{ position: 'sticky', top: '2rem' }}>
                    <div className="settings-section">
                        <h3 className="settings-section-title">Media Upload</h3>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <div
                                className="image-upload-zone"
                                style={{
                                    border: '2px dashed var(--db-border)',
                                    borderRadius: '1rem',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {imagePreviews.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} style={{ position: 'relative' }}>
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    style={{ width: '100%', borderRadius: '0.6rem', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', display: 'block' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newFiles = [...files];
                                                        newFiles.splice(index, 1);
                                                        setFiles(newFiles);
                                                        const newPreviews = [...imagePreviews];
                                                        newPreviews.splice(index, 1);
                                                        setImagePreviews(newPreviews);
                                                    }}
                                                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >✕</button>
                                            </div>
                                        ))}
                                        {files.length < maxImages && (
                                            <label className="tbl-btn tbl-btn-edit" style={{ cursor: 'pointer', display: 'inline-block', padding: '0.6rem 1.2rem', marginTop: '1rem' }}>
                                                Add Another Photo
                                                <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                                    const selected = Array.from(e.target.files);
                                                    if (files.length + selected.length > maxImages) {
                                                        showModal({ title: 'Too Many Images', message: `Maximum ${maxImages} images allowed.`, type: 'error', confirmText: 'Ok' });
                                                        return;
                                                    }
                                                    handleFileChange({ target: { files: [...files, ...selected] } });
                                                }} />
                                            </label>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ padding: '2rem 1rem' }}>
                                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' }}>🖼️</span>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--db-muted)', marginBottom: '1.2rem' }}>
                                            Upload between {minImages} and {maxImages} high-resolution images to represent this property.
                                        </p>
                                        <label className="tbl-btn tbl-btn-edit" style={{ cursor: 'pointer', display: 'inline-block', padding: '0.6rem 1.2rem' }}>
                                            Select Photos
                                            <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} required />
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* PREVIEW CARD MOCKUP */}
                            <div style={{ marginTop: '2rem', opacity: 0.6 }}>
                                <p style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--db-muted)', textTransform: 'uppercase', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>Card Preview</p>
                                <div className="db-listing-card" style={{ cursor: 'default' }}>
                                    <div className="db-listing-img-wrap">
                                        <img
                                            src={imagePreviews[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&auto=format&fit=crop'}
                                            className="db-listing-img"
                                            alt="Preview"
                                        />
                                        <div className="db-listing-badge">{formData.category}</div>
                                    </div>
                                    <div className="db-listing-info">
                                        <h3 style={{ fontSize: '0.85rem' }}>{formData.title || 'Untitled Property'}</h3>
                                        <p style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>{formData.location || 'Location'}, {formData.country || 'Country'}</p>
                                        <strong>{formatPrice(Number(formData.price) || 0)} <span>/ night</span></strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
