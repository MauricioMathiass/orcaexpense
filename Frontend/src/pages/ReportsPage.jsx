import { useMemo, useState } from 'react'
import { DownloadIcon } from '../components/icons'
import { buildReport, formatReportValue } from '../utils/report'
import { exportExcel, exportPdf } from '../utils/exportReport'
import './ReportsPage.css'

export function ReportsPage({ cardsState, expenses, receivables }) {
  const [exporting, setExporting] = useState(null)
  const [error, setError] = useState('')

  const report = useMemo(
    () => buildReport({ cards: cardsState, expenses, receivables }),
    [cardsState, expenses, receivables],
  )

  async function handleExport(format) {
    setExporting(format)
    setError('')
    try {
      await (format === 'pdf' ? exportPdf(report) : exportExcel(report))
    } catch {
      setError('Não foi possível gerar o arquivo. Tente novamente.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <>
      <section className="panel cards-panel">
        <div className="panel-heading">
          <div>
            <h2>Relatórios</h2>
            <p>Resumo geral de tudo que consta na aplicação, pronto para download.</p>
          </div>

          <div className="report-actions">
            <button
              className="pill-button"
              type="button"
              disabled={exporting !== null}
              onClick={() => handleExport('pdf')}
            >
              <DownloadIcon />
              <span>{exporting === 'pdf' ? 'Gerando...' : 'Exportar PDF'}</span>
            </button>
            <button
              className="pill-button"
              type="button"
              disabled={exporting !== null}
              onClick={() => handleExport('excel')}
            >
              <DownloadIcon />
              <span>{exporting === 'excel' ? 'Gerando...' : 'Exportar Excel'}</span>
            </button>
          </div>
        </div>

        {error && (
          <p className="report-error" role="alert">
            {error}
          </p>
        )}

        <div className="report-stats">
          {report.summary.map((item) => (
            <div className="report-stat" key={item.label}>
              <span>{item.label}</span>
              <strong>{formatReportValue(item.type, item.value)}</strong>
            </div>
          ))}
        </div>
      </section>

      {report.tables.map((table) => (
        <section className="panel cards-panel" key={table.id}>
          <div className="panel-heading">
            <div>
              <h2>{table.title}</h2>
            </div>
          </div>

          {table.rows.length === 0 ? (
            <p className="checklist-empty">Sem registros.</p>
          ) : (
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    {table.columns.map((column) => (
                      <th key={column.key} className={column.type === 'text' ? '' : 'numeric'}>
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, index) => (
                    <tr key={index} className={row.subtotal ? 'report-row-subtotal' : ''}>
                      {table.columns.map((column) => (
                        <td key={column.key} className={column.type === 'text' ? '' : 'numeric'}>
                          {formatReportValue(column.type, row[column.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    {table.columns.map((column) => (
                      <td key={column.key} className={column.type === 'text' ? '' : 'numeric'}>
                        {formatReportValue(column.type, table.totals[column.key])}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      ))}
    </>
  )
}
