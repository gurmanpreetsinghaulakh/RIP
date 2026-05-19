import React from 'react';
import { useGlobalModal } from '../context/ModalContext';
import '../styles/admin.css';

const GlobalModal = () => {
    const { modal, closeModal } = useGlobalModal();

    if (!modal.isOpen) return null;

    const handleConfirm = async () => {
        if (modal.onConfirm) {
            await modal.onConfirm();
        }
        closeModal();
    };

    const handleCancel = () => {
        if (modal.onCancel) {
            modal.onCancel();
        }
        closeModal();
    };

    const getTypeStyles = () => {
        switch (modal.type) {
            case 'delete':
                return { icon: '🗑️', color: '#ff385c', btnClass: 'tbl-btn-delete' };
            case 'error':
                return { icon: '⚠️', color: '#ef4444', btnClass: 'tbl-btn-delete' };
            case 'success':
                return { icon: '✅', color: '#10b981', btnClass: 'tbl-btn-activate' };
            case 'warning':
                return { icon: '🚧', color: '#f59e0b', btnClass: 'tbl-btn-suspend' };
            case 'confirm':
                return { icon: '❓', color: '#7c3aed', btnClass: 'admin-add-btn' };
            default:
                return { icon: 'ℹ️', color: '#7c3aed', btnClass: 'admin-add-btn' };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="admin-modal-overlay" onClick={handleCancel}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header" style={{ justifyContent: 'center', border: 'none', paddingBottom: '0.5rem' }}>
                    <div style={{
                        fontSize: '3rem',
                        background: `${styles.color}15`,
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '1rem'
                    }}>
                        {styles.icon}
                    </div>
                </div>

                <div className="modal-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem', color: '#fff' }}>{modal.title}</h3>
                    <p style={{ color: 'var(--db-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{modal.message}</p>
                </div>

                <div className="modal-actions" style={{ padding: '1.5rem', justifyContent: 'center', gap: '1rem', border: 'none' }}>
                    {(modal.onCancel || modal.type === 'confirm' || modal.type === 'delete' || modal.type === 'warning') && (
                        <button
                            className="settings-reset-btn"
                            onClick={handleCancel}
                            disabled={modal.isLoading}
                            style={{ flex: 1, padding: '0.75rem' }}
                        >
                            {modal.cancelText}
                        </button>
                    )}
                    <button
                        className={styles.btnClass}
                        onClick={handleConfirm}
                        disabled={modal.isLoading}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: 'none',
                            borderRadius: '0.6rem',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {modal.isLoading ? (
                            <div className="admin-spinner" style={{ width: '18px', height: '18px', borderWeight: '2px', borderTopColor: '#fff' }} />
                        ) : (
                            modal.confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalModal;
