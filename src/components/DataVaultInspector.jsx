import React, { useState } from 'react';
import { Database, Download, Network, Layers } from 'lucide-react';
import { MOCK_NETWORK_LOGS } from '../services/agentMockEngine';

export default function DataVaultInspector({ extractedData, parsedDOM }) {
  const [activeTab, setActiveTab] = useState('data');

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(extractedData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "extracted_agent_data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Get dynamic column headers from the extracted data object keys
  const getColumns = () => {
    if (!extractedData || extractedData.length === 0) return [];
    const keys = Object.keys(extractedData[0]).filter(k => k !== 'id');
    return ['#', ...keys];
  };

  const columns = getColumns();

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '240px', overflow: 'hidden' }}>
      {/* Tabs Header */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.4rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setActiveTab('data')}
            style={{
              background: activeTab === 'data' ? 'rgba(0, 245, 212, 0.15)' : 'transparent',
              border: `1px solid ${activeTab === 'data' ? 'var(--accent-emerald)' : 'transparent'}`,
              color: activeTab === 'data' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '0.3rem 0.6rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Database size={13} />
            <span>Extracted Data ({extractedData?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('dom')}
            style={{
              background: activeTab === 'dom' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              border: `1px solid ${activeTab === 'dom' ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === 'dom' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '0.3rem 0.6rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Layers size={13} />
            <span>Parsed DOM Tree ({parsedDOM?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('network')}
            style={{
              background: activeTab === 'network' ? 'rgba(79, 172, 254, 0.15)' : 'transparent',
              border: `1px solid ${activeTab === 'network' ? 'var(--accent-blue)' : 'transparent'}`,
              color: activeTab === 'network' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '0.3rem 0.6rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Network size={13} />
            <span>Network Traffic</span>
          </button>
        </div>

        {/* Action Export Button */}
        {extractedData?.length > 0 && (
          <button className="btn-secondary" onClick={downloadJSON} style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}>
            <Download size={13} />
            <span>Export JSON</span>
          </button>
        )}
      </div>

      {/* Tab Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem 0.8rem' }}>
        {/* Tab 1: Extracted Dynamic Structured Data Table */}
        {activeTab === 'data' && (
          (!extractedData || extractedData.length === 0) ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '1.5rem' }}>
              No extracted data payload available yet. Execute an extraction step to view structured output.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    {columns.map((col, idx) => (
                      <th key={idx} style={{ padding: '0.4rem 0.6rem', textTransform: 'capitalize' }}>
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {extractedData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {row.id || idx + 1}
                      </td>
                      {Object.keys(row).filter(k => k !== 'id').map((key, kIdx) => {
                        const val = row[key];
                        const isHighlight = key === 'price' || key === 'stars' || key === 'value';
                        return (
                          <td 
                            key={kIdx} 
                            style={{ 
                              padding: '0.4rem 0.6rem', 
                              color: isHighlight ? 'var(--accent-emerald)' : '#fff',
                              fontWeight: isHighlight ? 700 : 500,
                              fontFamily: isHighlight ? 'var(--font-mono)' : 'inherit'
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab 2: Parsed DOM Tree */}
        {activeTab === 'dom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {(!parsedDOM || parsedDOM.length === 0) ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '1rem' }}>No DOM elements parsed yet.</div>
            ) : (
              parsedDOM.map((node, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.3)', padding: '0.35rem 0.6rem', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>&lt;{node.tag || 'div'}&gt;</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>selector: {node.selector}</span>
                  <span style={{ color: '#fff', marginLeft: 'auto', fontStyle: 'italic', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    "{node.text}"
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Network Traffic */}
        {activeTab === 'network' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {MOCK_NETWORK_LOGS.map((log) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.2)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{log.method}</span>
                  <span style={{ color: 'var(--text-main)', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.url}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ color: 'var(--accent-emerald)' }}>{log.status} OK</span>
                  <span style={{ color: 'var(--text-muted)' }}>{log.time}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{log.size}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
