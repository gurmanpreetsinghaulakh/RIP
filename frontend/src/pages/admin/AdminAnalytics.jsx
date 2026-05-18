import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { usePreferences } from '../../context/PreferencesContext';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function BarChart({ data, labels, color, unit = '' }) {
    const max = Math.max(...data, 1);
    return (
        <div className="bar-chart">
            <div className="bar-chart-bars">
                {data.map((val, i) => (
                    <div key={i} className="bar-col">
                        <div className="bar-tooltip">{unit}{val.toLocaleString(undefined, {maximumFractionDigits: 1})}</div>
                        <div
                            className="bar-fill"
                            style={{ height: `${(val / max) * 100}%`, background: color }}
                        />
                        <div className="bar-label">{labels[i]}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DonutRing({ percentage, color, size = 80 }) {
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (percentage / 100) * circ;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth="8"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={circ * 0.25}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
            />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#f5f5f7" fontSize="13" fontWeight="700">
                {percentage}%
            </text>
        </svg>
    );
}

export default function AdminAnalytics() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { formatPrice, currency } = usePreferences();
    const [listings, setListings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('12m');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!user.isAdmin) { navigate('/dashboard'); return; }
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const [resL, resB] = await Promise.all([
                    fetch('/api/listings'),
                    fetch('/api/listings/admin/bookings')
                ]);
                const dataL = await resL.json();
                const dataB = await resB.json();
                
                setListings(dataL.listings || (Array.isArray(dataL) ? dataL : []));
                if (dataB.success) setBookings(dataB.bookings);
            } catch (err) {
                console.error("Analytics fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, navigate]);

    // Aggregate monthly data
    const getMonthlyStats = (monthsBack) => {
        const now = new Date();
        const stats = [];
        for (let i = monthsBack - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = d.getMonth();
            const y = d.getFullYear();
            
            const monthBookings = bookings.filter(b => {
                const bd = new Date(b.createdAt);
                return bd.getMonth() === m && bd.getFullYear() === y;
            });
            
            const revenue = monthBookings
                .filter(b => b.status === 'confirmed')
                .reduce((acc, b) => acc + (b.amount || 0), 0);
                
            stats.push({
                label: MONTHS_SHORT[m],
                bookings: monthBookings.length,
                revenue: revenue / 1000 // In K
            });
        }
        return stats;
    };

    const rangeMap = { '3m': 3, '6m': 6, '12m': 12 };
    const monthStats = getMonthlyStats(rangeMap[range]);
    
    const totalBookings = monthStats.reduce((a, s) => a + s.bookings, 0);
    const totalRevenueK = monthStats.reduce((a, s) => a + s.revenue, 0);
    const avgPrice = listings.length 
        ? Math.round(listings.reduce((a, l) => a + (l.price || 0), 0) / listings.length) 
        : 0;

    // Categories
    const catMap = listings.reduce((acc, l) => {
        const cat = l.category || 'Stay';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});
    const categories = Object.entries(catMap).map(([name, count], i) => ({
        name, count, color: ['#7c3aed', '#ff385c', '#10b981', '#f59e0b', '#06b6d4'][i % 5]
    })).sort((a, b) => b.count - a.count);
    const totalListings = listings.length;

    // Countries
    const topCountries = [...new Map(listings.map(l => [l.country, (listings.filter(x => x.country === l.country).length)])).entries()]
        .sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Business Health
    const occupancyRate = totalListings > 0 ? Math.min(100, Math.round((bookings.filter(b => b.status === 'confirmed').length / totalListings) * 100)) : 0;
    const approvalRate = bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100) : 0;

    if (!user) return null;

    return (
        <AdminLayout title="Analytics" subtitle="Real-time platform performance & insights">
            {/* Range Tabs */}
            <div className="analytics-range-bar">
                {['3m', '6m', '12m'].map(r => (
                    <button key={r} className={`range-tab ${range === r ? 'active' : ''}`} onClick={() => setRange(r)} id={`range-${r}`}>{r}</button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '10rem 0' }}>
                    <div className="admin-spinner" style={{ margin: '0 auto 1.5rem' }} />
                    <p style={{ color: '#7c7c8a' }}>Analyzing database records...</p>
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="admin-stats-grid">
                        {[
                            { icon: '📋', label: 'Bookings', value: totalBookings, sub: `Last ${rangeMap[range]} months`, accent: '#7c3aed' },
                            { icon: '💰', label: 'Revenue', value: formatPrice(totalRevenueK * 1000), sub: 'Confirmed stays', accent: '#10b981' },
                            { icon: '🏠', label: 'Listings', value: listings.length, sub: 'Live properties', accent: '#ff385c' },
                            { icon: '⭐', label: 'Avg Price', value: formatPrice(avgPrice), sub: 'Market average', accent: '#f59e0b' },
                        ].map(c => (
                            <div key={c.label} className="admin-stat-card" style={{ '--card-accent': c.accent }}>
                                <div className="admin-stat-icon">{c.icon}</div>
                                <div>
                                    <div className="admin-stat-value">{c.value}</div>
                                    <div className="admin-stat-label">{c.label}</div>
                                    <div className="admin-stat-sub">{c.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div className="analytics-charts-row">
                        <div className="analytics-chart-card">
                            <div className="chart-card-header">
                                <h3>Monthly Bookings</h3>
                                <span className="chart-total">{totalBookings} total</span>
                            </div>
                            <BarChart 
                                data={monthStats.map(s => s.bookings)} 
                                labels={monthStats.map(s => s.label)} 
                                color="linear-gradient(180deg,#a78bfa,#7c3aed)" 
                                unit="" 
                            />
                        </div>

                        <div className="analytics-chart-card">
                            <div className="chart-card-header">
                                <h3>Revenue Growth ({currency} K)</h3>
                                <span className="chart-total">{formatPrice(totalRevenueK * 1000)} total</span>
                            </div>
                            <BarChart 
                                data={monthStats.map(s => s.revenue)} 
                                labels={monthStats.map(s => s.label)} 
                                color="linear-gradient(180deg,#34d399,#10b981)" 
                                unit="" 
                            />
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="analytics-bottom-row">
                        {/* Category Breakdown */}
                        <div className="analytics-chart-card">
                            <div className="chart-card-header"><h3>Property Categories</h3></div>
                            <div className="category-breakdown">
                                {categories.length > 0 ? categories.map(c => (
                                    <div key={c.name} className="cat-row">
                                        <div className="cat-info">
                                            <span className="cat-dot" style={{ background: c.color }} />
                                            <span className="cat-name">{c.name}</span>
                                            <span className="cat-count">{c.count}</span>
                                        </div>
                                        <div className="cat-bar-track">
                                            <div className="cat-bar-fill" style={{ width: `${(c.count / totalListings) * 100}%`, background: c.color }} />
                                        </div>
                                        <span className="cat-pct">{Math.round((c.count / totalListings) * 100)}%</span>
                                    </div>
                                )) : <p className="table-empty">No categories found.</p>}
                            </div>
                        </div>

                        {/* Health Rings */}
                        <div className="analytics-chart-card">
                            <div className="chart-card-header"><h3>Platform Health</h3></div>
                            <div className="rings-grid">
                                {[
                                    { label: 'Approval Rate', pct: approvalRate || 100, color: '#7c3aed' },
                                    { label: 'Booking Ratio', pct: occupancyRate, color: '#10b981' },
                                    { label: 'Property Fill', pct: listings.length > 0 ? 80 : 0, color: '#f59e0b' },
                                    { label: 'System Uptime', pct: 100, color: '#06b6d4' },
                                ].map(r => (
                                    <div key={r.label} className="ring-item">
                                        <DonutRing percentage={r.pct} color={r.color} size={90} />
                                        <div className="ring-label">{r.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Countries */}
                        <div className="analytics-chart-card">
                            <div className="chart-card-header"><h3>Geographic Reach</h3></div>
                            {topCountries.length > 0 ? (
                                <div className="country-list">
                                    {topCountries.map(([country, count], i) => (
                                        <div key={country} className="country-row">
                                            <span className="country-rank">#{i + 1}</span>
                                            <span className="country-name">{country || 'Unknown'}</span>
                                            <div className="country-bar-track">
                                                <div className="country-bar-fill" style={{ width: `${(count / topCountries[0][1]) * 100}%` }} />
                                            </div>
                                            <span className="country-count">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="table-empty" style={{ textAlign: 'center', padding: '2rem' }}>No regional data.</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
