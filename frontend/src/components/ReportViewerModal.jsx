import { useState, useMemo } from 'react'
import './ReportViewerModal.css'

export default function ReportViewerModal({
  title,
  subtitle,
  reportCode,
  columns,
  data = [],
  kpis = [],
  summaryRows = [],
  csvFilename,
  onDownloadCSV,
  onClose,
  initialPrint = false,
}) {
  const [searchTerm, setSearchTerm] = useState('')

  // Trigger print if initialPrint is true
  useState(() => {
    if (initialPrint) {
      setTimeout(() => {
        window.print()
      }, 400)
    }
  })

  // Filtered rows based on on-screen search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    const lower = searchTerm.toLowerCase()
    return data.filter(row =>
      columns.some(col => {
        const val = row[col.key]
        if (val === null || val === undefined) return false
        return String(val).toLowerCase().includes(lower)
      })
    )
  }, [data, columns, searchTerm])

  const reportId = reportCode || `KNW-REP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`
  
  const generatedDateTime = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="report-modal-backdrop" onClick={onClose}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        {/* On-Screen Action Toolbar (Hidden when printing) */}
        <div className="report-toolbar no-print">
          <div className="report-toolbar__left">
            <span className="report-code-badge">{reportId}</span>
            <span className="report-row-count">
              {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
              {searchTerm && ` (filtered from ${data.length})`}
            </span>
          </div>

          <div className="report-toolbar__search">
            <input
              type="text"
              placeholder="🔍 Search records in this report..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="report-search-clear"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="report-toolbar__actions">
            <button
              type="button"
              className="report-action-btn report-action-btn--pdf"
              onClick={handlePrint}
              title="Download or Print PDF"
            >
              📥 Download PDF
            </button>
            {onDownloadCSV && (
              <button
                type="button"
                className="report-action-btn report-action-btn--csv"
                onClick={onDownloadCSV}
                title="Export CSV File"
              >
                📊 Download CSV
              </button>
            )}
            <button
              type="button"
              className="report-action-btn report-action-btn--close"
              onClick={onClose}
              title="Close Report Viewer"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Formal Printable Document Body */}
        <div className="report-document-wrapper">
          <div className="report-document" id="printable-report">
            {/* Header Banner */}
            <div className="report-header">
              <div className="report-header__brand">
                <div className="report-brand-badge">KNW</div>
                <div>
                  <h1 className="report-brand-name">KNW PRO REALTOR</h1>
                  <p className="report-brand-corp">
                    CORPORATE REAL ESTATE AUDIT & MANAGEMENT INFORMATION SYSTEM
                  </p>
                  <span className="report-brand-sub">
                    Certified Sri Lanka Property Market Operations • Official Audit Division
                  </span>
                </div>
              </div>

              <div className="report-header__meta">
                <div className="report-seal">
                  <span>OFFICIAL</span>
                  <strong>AUDIT VERIFIED</strong>
                </div>
                <div className="report-meta-grid">
                  <div><span>Document Ref:</span> <strong>{reportId}</strong></div>
                  <div><span>Generated On:</span> <strong>{generatedDateTime}</strong></div>
                  <div><span>Classification:</span> <strong className="report-confidential">CONFIDENTIAL</strong></div>
                  <div><span>Status:</span> <strong className="report-status-valid">CERTIFIED VALID</strong></div>
                </div>
              </div>
            </div>

            <div className="report-divider" />

            {/* Document Title Banner */}
            <div className="report-title-banner">
              <h2>{title}</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>

            {/* KPI Cards Row (if available) */}
            {kpis && kpis.length > 0 && (
              <div className="report-kpis-grid">
                {kpis.map((kpi, idx) => (
                  <div className="report-kpi-card" key={idx}>
                    <div className="report-kpi-icon">{kpi.icon || '📌'}</div>
                    <div className="report-kpi-info">
                      <span className="report-kpi-label">{kpi.label}</span>
                      <strong className="report-kpi-val">{kpi.value}</strong>
                      {kpi.sub && <small className="report-kpi-sub">{kpi.sub}</small>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Main Data Table */}
            <div className="report-table-container">
              {filteredData.length === 0 ? (
                <div className="report-empty">
                  <p>No records match the current filter or report criteria.</p>
                </div>
              ) : (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      {columns.map(col => (
                        <th
                          key={col.key}
                          style={{ textAlign: col.align || 'left', width: col.width || 'auto' }}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr key={row.id || index}>
                        <td className="report-row-num">{index + 1}</td>
                        {columns.map(col => {
                          const rawVal = row[col.key]
                          const rendered = col.render ? col.render(rawVal, row) : rawVal
                          return (
                            <td
                              key={col.key}
                              style={{ textAlign: col.align || 'left' }}
                            >
                              {rendered !== null && rendered !== undefined ? rendered : '-'}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                  {summaryRows && summaryRows.length > 0 && (
                    <tfoot>
                      {summaryRows.map((sRow, sIdx) => (
                        <tr key={sIdx} className="report-summary-row">
                          <td colSpan={sRow.colSpan || columns.length + 1}>
                            <div className="report-summary-content">
                              <span>{sRow.label}:</span>
                              <strong>{sRow.value}</strong>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tfoot>
                  )}
                </table>
              )}
            </div>

            {/* Document Footer & Sign-off */}
            <div className="report-footer">
              <div className="report-footer__disclaimer">
                <p>
                  <strong>CONFIDENTIALITY & AUDIT DISCLAIMER:</strong> This report is generated
                  directly from the verified database of KNW PRO REALTOR (PVT) LTD. It constitutes
                  an authentic record of platform operations, transactions, and property inventory.
                  Unauthorized duplication, tampering, or public dissemination is strictly prohibited
                  under Sri Lankan commercial law.
                </p>
              </div>

              <div className="report-footer__signatures">
                <div className="report-sig-block">
                  <div className="report-sig-line" />
                  <span>Prepared By: System Audit Officer</span>
                  <small>KNW PRO Operations Desk</small>
                </div>

                <div className="report-sig-seal">
                  <div className="report-seal-circle">
                    <span>KNW PRO</span>
                    <small>REALTOR</small>
                    <span>AUDIT SEAL</span>
                  </div>
                </div>

                <div className="report-sig-block">
                  <div className="report-sig-line" />
                  <span>Certified By: Operations Director</span>
                  <small>KNW PRO Executive Directorate</small>
                </div>
              </div>

              <div className="report-footer__bottom">
                <span>Page 1 of 1 • System Generated at {generatedDateTime}</span>
                <span>KNW PRO REALTOR • No. 42, Galle Road, Colombo 03, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
