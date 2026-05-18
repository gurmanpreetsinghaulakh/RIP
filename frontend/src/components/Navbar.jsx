import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t, adminSettings } = usePreferences();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery) {
            navigate(`/listings/search?q=${searchQuery}`);
        }
    };

    const handleInputChange = async (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.length > 0) {
            try {
                const res = await fetch(`/api/listings/suggestions?q=${val}`);
                const data = await res.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (err) {
                console.error(err);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-md sticky-top">
            <div className="container-fluid sticky-top">
                <Link className="navbar-brand" to={user?.isAdmin ? '/admin-dashboard' : user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--stays-brand)' }}>
                    <span style={{ fontSize: '1.25rem' }}><i className="fa-solid fa-house" /></span> <b>{adminSettings?.siteName || 'HomiGo'}</b>
                </Link>
                <button className="navbar-toggler bg-body-light" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse bg-body-light" id="navbarNav">
                    <div className="navbar-nav ms-auto">
                        <form className="d-flex" role="search" onSubmit={handleSearch} style={{ position: 'relative' }}>
                            <div className="search-container" style={{ width: '100%' }}>
                                <input
                                    className="form-control me-2 search-input"
                                    type="search"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    placeholder="Search destinations"
                                    aria-label="Search"
                                    autoComplete="off"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="suggestions-dropdown show">
                                        {suggestions.map((s, idx) => (
                                            <div key={idx} className="suggestion-item" onClick={() => {
                                                setSearchQuery(s);
                                                setShowSuggestions(false);
                                            }}>
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="btn btn-search" type="submit">Search</button>
                        </form>
                    </div>
                    <div className="navbar-nav ms-auto">
                        {user?.isAdmin && (
                            <Link className="nav-link" to="/listings/new"><b>Add Listing</b></Link>
                        )}
                        {user ? (
                            <>
                                <Link
                                    className="nav-link"
                                    to={user.isAdmin ? '/admin-dashboard' : '/dashboard'}
                                >
                                    <b>
                                        {user.isAdmin ? (
                                            <><i className="fa-solid fa-shield-halved" /> {t('nav.admin')}</>
                                        ) : (
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>{user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--stays-border)' }} /> : <i className="fa-regular fa-user" />}{user.username}</div>
                                        )}
                                    </b>
                                </Link>
                                <button
                                    className="nav-link btn btn-link"
                                    style={{ textDecoration: 'none', border: '1px solid var(--stays-border)', background: 'none', padding: '0.4rem 1rem', cursor: 'pointer', borderRadius: '2rem', fontSize: '0.85rem', marginLeft: '0.5rem' }}
                                    onClick={handleLogout}
                                    id="navbar-logout-btn"
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link className="nav-link" to="/signup" style={{ fontWeight: '700' }}>{t('nav.signup')}</Link>
                                <Link className="nav-link" to="/login" style={{ fontWeight: '700' }}>{t('nav.login')}</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
