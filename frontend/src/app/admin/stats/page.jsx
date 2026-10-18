'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  fetchHomepageStats, 
  saveHomepageStats, 
  resetHomepageStats, 
  initialHomepageStats 
} from '../../../lib/api';
import { 
  Sparkles, 
  Save, 
  RotateCcw, 
  Check, 
  ExternalLink, 
  Eye, 
  Plus, 
  Trash2, 
  Zap, 
  Layers, 
  TrendingUp, 
  HelpCircle 
} from 'lucide-react';

export default function AdminHomepageStatsPage() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchHomepageStats();
        setStatsData(data);
      } catch (err) {
        console.error('Error loading stats config:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSave = () => {
    if (!statsData) return;
    saveHomepageStats(statsData);
    showToast('Homepage "At a glance" stats successfully updated!');
  };

  const handleReset = () => {
    if (confirm('Reset all "At a glance" stats to original system defaults?')) {
      resetHomepageStats();
      setStatsData(JSON.parse(JSON.stringify(initialHomepageStats)));
      showToast('Reset to system defaults completed.');
    }
  };

  const handleItemChange = (index, field, value) => {
    setStatsData((prev) => {
      const copy = { ...prev };
      const updatedItems = [...copy.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      // Auto update formatted value if rawNumber or suffix changed
      if (field === 'rawNumber' || field === 'suffix') {
        const raw = field === 'rawNumber' ? Number(value) || 0 : updatedItems[index].rawNumber;
        const suf = field === 'suffix' ? value : (updatedItems[index].suffix || '');
        updatedItems[index].value = `${raw}${suf}`;
      }

      copy.items = updatedItems;
      return copy;
    });
  };

  const handleAddItem = () => {
    if (!statsData) return;
    if (statsData.items.length >= 6) {
      alert('You can display a maximum of 6 highlight metrics.');
      return;
    }
    const newItem = {
      id: 'stat_' + Date.now(),
      key: 'custom_' + Date.now(),
      value: '100+',
      rawNumber: 100,
      suffix: '+',
      label: 'New Metric',
      autoSync: false,
    };
    setStatsData({
      ...statsData,
      items: [...statsData.items, newItem],
    });
  };

  const handleDeleteItem = (index) => {
    if (!statsData || statsData.items.length <= 2) {
      alert('At least 2 metrics are required for balanced display.');
      return;
    }
    setStatsData({
      ...statsData,
      items: statsData.items.filter((_, i) => i !== index),
    });
  };

  if (loading || !statsData) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: '#6B7280' }}>
        <div style={{ 
          width: 42, 
          height: 42, 
          border: '3px solid #E5E7EB', 
          borderTopColor: '#7F51FF', 
          borderRadius: '50%', 
          animation: 'spin 0.8s linear infinite', 
          margin: '0 auto 16px' 
        }}></div>
        <p>Loading "At a glance" stats configuration...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: '#111112',
          color: '#ffffff',
          padding: '12px 22px',
          borderRadius: 4,
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.9rem',
          borderLeft: '4px solid #10B981',
          animation: 'fadeIn 0.2s ease',
        }}>
          <Check size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{
              background: '#F3E8FF',
              color: '#7F51FF',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              padding: '3px 8px',
              borderRadius: 4,
            }}>
              Homepage Section
            </span>
            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              PropertyStats.jsx Component
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111112', margin: 0, letterSpacing: '-0.5px' }}>
            "At a glance" Statistics
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.9rem' }}>
            Control dynamic metrics, headings, and animated counters displayed on the Baytora public landing page.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              color: '#4B5563',
              padding: '9px 15px',
              borderRadius: 4,
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>

          <Link
            href="/#stats"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              color: '#4B5563',
              padding: '9px 15px',
              borderRadius: 4,
              fontSize: '0.86rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={15} />
            <span>View Live</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#7F51FF',
              border: 'none',
              color: '#FFFFFF',
              padding: '9px 20px',
              borderRadius: 4,
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(127, 81, 255, 0.3)',
            }}
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Mode Switch Card: Auto-Sync vs Manual Override */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        padding: '20px 24px',
        marginBottom: 24,
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: statsData.autoSync ? '#F3E8FF' : '#F3F4F6',
            color: statsData.autoSync ? '#7F51FF' : '#6B7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: '1rem', color: '#111112' }}>
                Live Database Auto-Calculation
              </strong>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: 4,
                background: statsData.autoSync ? '#DEF7EC' : '#F3F4F6',
                color: statsData.autoSync ? '#0E9F6E' : '#6B7280',
              }}>
                {statsData.autoSync ? 'Active' : 'Manual Override'}
              </span>
            </div>
            <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '0.84rem' }}>
              Automatically aggregates closed deals from all registered agents, verified residences count, and satisfaction ratings.
            </p>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>
            {statsData.autoSync ? 'Auto-Sync Enabled' : 'Manual Values'}
          </span>
          <input
            type="checkbox"
            checked={!!statsData.autoSync}
            onChange={(e) => setStatsData({ ...statsData, autoSync: e.target.checked })}
            style={{ width: 18, height: 18, accentColor: '#7F51FF', cursor: 'pointer' }}
          />
        </label>
      </div>

      {/* Live Visual Preview Section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={16} color="#7F51FF" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111112', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Live Homepage Preview
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
            Real-time appearance with obsidian styling
          </span>
        </div>

        {/* Dark Preview Canvas matching PropertyStats exactly */}
        <div style={{
          background: '#111112',
          borderRadius: 8,
          padding: '48px 36px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
        }}>
          {/* Subtle Background gradient */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(17,17,18,0.98) 0%, rgba(17,17,18,0.92) 50%, rgba(17,17,18,0.97) 100%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            {/* Eyebrow */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 16,
            }}>
              <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.14)' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7F51FF', boxShadow: '0 0 0 3px rgba(127, 81, 255, 0.2)' }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontWeight: 500 }}>
                {statsData.eyebrow || 'At a glance'}
              </span>
              <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.14)' }} />
            </div>

            {/* Heading */}
            <h2 style={{
              margin: '0 0 44px',
              color: '#ffffff',
              fontSize: 'clamp(22px, 2.2vw, 36px)',
              fontWeight: 400,
              letterSpacing: '-1.2px',
            }}>
              {statsData.heading || 'Providing clarity, every step forward'}
            </h2>

            {/* Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${statsData.items.length}, minmax(0, 1fr))`,
              gap: 16,
              alignItems: 'center',
            }}>
              {statsData.items.map((stat, idx) => (
                <div
                  key={stat.id || idx}
                  style={{
                    borderRight: idx < statsData.items.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                    padding: '0 16px',
                  }}
                >
                  <div style={{
                    fontSize: 'clamp(36px, 4.2vw, 64px)',
                    fontWeight: 400,
                    lineHeight: 1.1,
                    letterSpacing: '-2px',
                    color: '#ffffff',
                    marginBottom: 4,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    color: '#b3b3b3',
                    fontSize: 'clamp(13px, 1.1vw, 17px)',
                    fontWeight: 400,
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Controls */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        padding: '24px 28px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111112', marginTop: 0, marginBottom: 20 }}>
          Section Headers Configuration
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 28 }}>
          {/* Eyebrow Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Eyebrow Badge Text
            </label>
            <input
              type="text"
              value={statsData.eyebrow}
              onChange={(e) => setStatsData({ ...statsData, eyebrow: e.target.value })}
              placeholder="At a glance"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: 4,
                fontSize: '0.92rem',
                color: '#111112',
                outline: 'none',
              }}
            />
          </div>

          {/* Main Heading Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Section Main Heading
            </label>
            <input
              type="text"
              value={statsData.heading}
              onChange={(e) => setStatsData({ ...statsData, heading: e.target.value })}
              placeholder="Providing clarity, every step forward"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: 4,
                fontSize: '0.92rem',
                color: '#111112',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Individual Stat Metrics Editor */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111112', margin: 0 }}>
            Highlighted Metrics Cards ({statsData.items.length})
          </h3>
          <button
            type="button"
            onClick={handleAddItem}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#F3E8FF',
              color: '#7F51FF',
              border: '1px solid #E9D5FF',
              padding: '6px 12px',
              borderRadius: 4,
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            <span>Add Metric</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {statsData.items.map((stat, idx) => (
            <div
              key={stat.id || idx}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                padding: '16px 20px',
                background: '#F9FAFB',
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr 2fr auto',
                gap: 14,
                alignItems: 'center',
              }}
            >
              {/* Value Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>
                  Display Value
                </label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => handleItemChange(idx, 'value', e.target.value)}
                  placeholder="320+"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #D1D5DB',
                    borderRadius: 4,
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: '#111112',
                    background: '#FFFFFF',
                  }}
                />
              </div>

              {/* Counter Animation Target */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>
                  Target Number
                </label>
                <input
                  type="number"
                  value={stat.rawNumber ?? 0}
                  onChange={(e) => handleItemChange(idx, 'rawNumber', Number(e.target.value))}
                  placeholder="320"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #D1D5DB',
                    borderRadius: 4,
                    fontSize: '0.92rem',
                    color: '#111112',
                    background: '#FFFFFF',
                  }}
                />
              </div>

              {/* Suffix */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>
                  Suffix
                </label>
                <input
                  type="text"
                  value={stat.suffix || ''}
                  onChange={(e) => handleItemChange(idx, 'suffix', e.target.value)}
                  placeholder="+ / % / k"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #D1D5DB',
                    borderRadius: 4,
                    fontSize: '0.92rem',
                    color: '#111112',
                    background: '#FFFFFF',
                  }}
                />
              </div>

              {/* Label Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>
                  Metric Label
                </label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => handleItemChange(idx, 'label', e.target.value)}
                  placeholder="Deals completed"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #D1D5DB',
                    borderRadius: 4,
                    fontSize: '0.92rem',
                    color: '#111112',
                    background: '#FFFFFF',
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ paddingTop: 18 }}>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(idx)}
                  title="Remove this metric"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Save Bar */}
        <div style={{
          marginTop: 28,
          paddingTop: 20,
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
        }}>
          <button
            type="button"
            onClick={handleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#7F51FF',
              border: 'none',
              color: '#FFFFFF',
              padding: '11px 24px',
              borderRadius: 4,
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(127, 81, 255, 0.3)',
            }}
          >
            <Save size={16} />
            <span>Save &amp; Publish Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
}
