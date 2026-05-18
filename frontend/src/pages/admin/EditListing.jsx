import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGlobalModal } from '../../context/ModalContext';
import AdminLayout from '../../components/AdminLayout';
import { usePreferences } from '../../context/PreferencesContext';

export default function EditListing() {
    const { id } = useParams();
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
    const [originalImages, setOriginalImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const { showModal } = useGlobalModal();
    const navigate = useNavigate();
    const { formatPrice, currency, adminSettings } = usePreferences();
    const maxImages = adminSettings?.maxListingImages || 5;
    const maxPriceLimit = adminSettings?.maxPriceLimit || 100000;

    useEffect(() => {
        setFetching(true);
        fetch(`/api/listings/${id}/edit`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const { title, description, price, location, country, category, roomType, totalRooms, availableRooms } = data.listings;
                    const standardRoomTypes = ['Single Room', 'Double Room', 'Suite', 'Family Room', 'Studio', 'Dormitory'];
                    const isStandardRoom = standardRoomTypes.includes(roomType);
                    setFormData({
                        title: title || '',
                        description: description || '',
                        price: price || '',
                        location: location || '',
                        country: country || '',
                        category: category || 'Stay',
                        roomType: isStandardRoom ? roomType : 'Other',
                        customRoomType: isStandardRoom ? '' : (roomType || ''),
                        totalRooms: totalRooms || 1,
                        availableRooms: availableRooms !== undefined ? availableRooms : 1
                    });
                    const existingImages = data.listings.images || (data.listings.Image ? [data.listings.Image] : []);
                    setOriginalImages(existingImages);
                    setImagePreviews(existingImages.map(img => img.url));
                } else {
                    console.error(data.error);
                }
            })
            .catch(console.error)
            .finally(() => setFetching(false));
    }, [id]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (files.length + selectedFiles.length > maxImages) {
            showModal({
                title: 'Too Many Images',
                message: `You can only have a maximum of ${maxImages} images.`,
                type: 'error',
                confirmText: 'Understood'
            });
            return;
        }

        const newFiles = [...files, ...selectedFiles];
        setFiles(newFiles);
        
        const newPreviews = [...imagePreviews];
        let processedCount = 0;
        
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result);
                processedCount++;
                if (processedCount === selectedFiles.length) {
                    setImagePreviews(newPreviews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
        
        if (files.length > 0) {
            files.forEach(f => {
                data.append('listing[Image]', f);
            });
        }

        try {
            const res = await fetch(`/api/listings/${id}?_method=PUT`, {
                method: 'POST',
                body: data,
            });
            const result = await res.json();
            if (result.success) {
                navigate('/admin/listings');
            } else {
                showModal({
                    title: 'Update Failed',
                    message: result.error || 'Something went wrong while updating the listing.',
                    type: 'error',
                    confirmText: 'Try Again'
                });
            }
        } catch (err) {
            console.error(err);
            showModal({
                title: 'Network Error',
                message: 'Failed to update listing. Please check your connection.',
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
            message: 'Are you sure you want to discard your edits? All unsaved changes will be lost.',
            type: 'warning',
            confirmText: 'Discard',
            cancelText: 'Keep Editing',
            onConfirm: () => navigate('/admin/listings')
        });
    };

    const actions = (
        <Link to="/admin/listings" className="settings-reset-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>←</span> Back
        </Link>
    );

    return (
        <AdminLayout title="Edit Listing" subtitle={`Refining property details for ID: ${id.slice(-6)}`} actions={actions}>
            {fetching ? (
                <div className="admin-loading">
                    <div className="admin-spinner" />
                    <p>Fetching listing details…</p>
                </div>
            ) : (
                <div className="edit-listing-container" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* ── CORE DETAILS ── */}
                        <div className="settings-section">
                            <h3 className="settings-section-title">Property Information</h3>
                            <div className="settings-fields">
                                <div className="settings-field" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.6rem' }}>
                                    <div className="settings-field-label">
                                        <span>Title</span>
                                    </div>
                                    <div className="settings-field-control">
                                        <input
                                            name="title"
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
                                        <span>Description</span>
                                    </div>
                                    <div className="settings-field-control">
                                        <textarea
                                            name="description"
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
                            <h3 className="settings-section-title">Pricing & Connectivity</h3>
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
                            <button onClick={handleDiscard} className="settings-reset-btn" style={{ textDecoration: 'none', border: 'none' }}>Cancel</button>
                            <button className="settings-save-btn" type="submit" disabled={loading} style={{ minWidth: '160px' }}>
                                {loading ? 'Saving...' : '💾 Save Changes'}
                            </button>
                        </div>
                    </form>

                    {/* ── IMAGE SECTION ── */}
                    <div className="preview-aside" style={{ position: 'sticky', top: '2rem' }}>
                        <div className="settings-section">
                            <h3 className="settings-section-title">Listing Media</h3>
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
                                                        const newPreviews = [...imagePreviews];
                                                        newPreviews.splice(index, 1);
                                                        setImagePreviews(newPreviews);
                                                        
                                                        // If it was a newly added file
                                                        const previewIndexInFiles = index - originalImages.length;
                                                        if (previewIndexInFiles >= 0) {
                                                            const newFiles = [...files];
                                                            newFiles.splice(previewIndexInFiles, 1);
                                                            setFiles(newFiles);
                                                        } else {
                                                            // If it was an original image, we might want to track deletions
                                                            // For now, let's just remove from preview
                                                            const newOriginals = [...originalImages];
                                                            newOriginals.splice(index, 1);
                                                            setOriginalImages(newOriginals);
                                                        }
                                                    }}
                                                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >✕</button>
                                            </div>
                                        ))}
                                        {imagePreviews.length < maxImages && (
                                            <div style={{ marginTop: '1.2rem' }}>
                                                <p style={{ fontSize: '0.82rem', color: 'var(--db-muted)', marginBottom: '0.8rem' }}>
                                                    Upload up to {maxImages - imagePreviews.length} more photo(s).
                                                </p>
                                                <label className="tbl-btn tbl-btn-edit" style={{ cursor: 'pointer', display: 'inline-block', padding: '0.6rem 1.2rem' }}>
                                                    Add Photo
                                                    <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                                                </label>
                                            </div>
                                        )}
                                        {files.length > 0 && (
                                            <button
                                                type="button"
                                                className="settings-reset-btn"
                                                style={{ marginTop: '0.5rem', padding: '0.5rem 0.8rem', fontSize: '0.75rem' }}
                                                onClick={() => { 
                                                    setFiles([]); 
                                                    setImagePreviews(originalImages.map(img => img.url)); 
                                                }}
                                            >Reset New Photos</button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem' }}>
                                    <p style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--db-muted)', textTransform: 'uppercase', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>Live Card Preview</p>
                                    <div className="db-listing-card" style={{ cursor: 'default', opacity: 0.8 }}>
                                        <div className="db-listing-img-wrap">
                                            <img
                                                src={imagePreviews[0]}
                                                className="db-listing-img"
                                                alt="Preview"
                                            />
                                            <div className="db-listing-badge">{formData.category}</div>
                                        </div>
                                        <div className="db-listing-info">
                                            <h3 style={{ fontSize: '0.85rem' }}>{formData.title}</h3>
                                            <p style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>{formData.location}, {formData.country}</p>
                                            <strong>{formatPrice(Number(formData.price) || 0)} <span>/ night</span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
