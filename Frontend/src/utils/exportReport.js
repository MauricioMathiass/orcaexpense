import { formatReportValue } from './report'

const REPORT_TITLE = 'Relatório Financeiro - ORÇAFY EXPENSE'
const EXCEL_CURRENCY_FORMAT = '"R$" #,##0.00'

function dateStamp(date) {
  return date.toISOString().slice(0, 10)
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function createPdfBlob(report, generatedAt = new Date()) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  const pageHeight = doc.internal.pageSize.getHeight()
  const headStyles = { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold' }
  const footStyles = { fillColor: [241, 245, 249], textColor: [31, 41, 55], fontStyle: 'bold' }
  const baseStyles = { fontSize: 9, cellPadding: 5 }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(REPORT_TITLE, margin, 50)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(110)
  doc.text(`Gerado em ${generatedAt.toLocaleString('pt-BR')}`, margin, 66)
  doc.setTextColor(0)

  let y = 84

  function drawHeading(text) {
    if (y > pageHeight - 140) {
      doc.addPage()
      y = 50
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(text, margin, y)
    y += 8
  }

  function finishTable() {
    y = (doc.lastAutoTable?.finalY ?? y) + 24
  }

  drawHeading('Resumo Geral')
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Indicador', 'Valor']],
    body: report.summary.map((item) => [item.label, formatReportValue(item.type, item.value)]),
    headStyles,
    styles: baseStyles,
    columnStyles: { 1: { halign: 'right' } },
  })
  finishTable()

  report.tables.forEach((table) => {
    drawHeading(table.title)

    const rightAligned = {}
    table.columns.forEach((column, index) => {
      if (column.type === 'currency' || column.type === 'percent') {
        rightAligned[index] = { halign: 'right' }
      }
    })

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [table.columns.map((column) => column.label)],
      body:
        table.rows.length === 0
          ? [[{ content: 'Sem registros', colSpan: table.columns.length, styles: { halign: 'center', textColor: 120 } }]]
          : table.rows.map((row) =>
              table.columns.map((column) => {
                const content = formatReportValue(column.type, row[column.key])
                return row.subtotal
                  ? { content, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }
                  : content
              }),
            ),
      foot: [table.columns.map((column) => formatReportValue(column.type, table.totals[column.key]))],
      showFoot: 'lastPage',
      headStyles: table.compact ? { ...headStyles, fontSize: 7 } : headStyles,
      footStyles,
      styles: table.compact ? { fontSize: 7, cellPadding: 3 } : baseStyles,
      columnStyles: rightAligned,
    })
    finishTable()
  })

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(130)
    doc.text(
      `Página ${page} de ${pageCount}`,
      doc.internal.pageSize.getWidth() - margin,
      pageHeight - 20,
      { align: 'right' },
    )
  }

  return doc.output('blob')
}

function excelCell(column, value, bold = false) {
  const style = bold ? { fontWeight: 'bold', backgroundColor: '#f1f5f9' } : {}

  if (value === null || value === undefined || value === '') {
    return bold ? { value: '', ...style } : null
  }
  if (column.type === 'currency') {
    return { value, type: Number, format: EXCEL_CURRENCY_FORMAT, align: 'right', ...style }
  }
  if (column.type === 'percent') {
    return { value: value / 100, type: Number, format: '0%', align: 'right', ...style }
  }
  if (column.type === 'number') {
    return { value, type: Number, ...style }
  }
  return { value: String(value), type: String, ...style }
}

export async function createExcelBlob(report, generatedAt = new Date()) {
  const { default: writeXlsxFile } = await import('write-excel-file/browser')

  const headerStyle = { fontWeight: 'bold', textColor: '#ffffff', backgroundColor: '#1f2937' }

  const summaryData = [
    [{ value: REPORT_TITLE, fontWeight: 'bold', fontSize: 14 }],
    [{ value: `Gerado em ${generatedAt.toLocaleString('pt-BR')}`, textColor: '#6b7280' }],
    [],
    [
      { value: 'Indicador', ...headerStyle },
      { value: 'Valor', align: 'right', ...headerStyle },
    ],
    ...report.summary.map((item) => [
      { value: item.label, type: String },
      excelCell({ type: item.type }, item.value),
    ]),
  ]

  const sheets = [
    {
      data: summaryData,
      sheet: 'Resumo',
      columns: [{ width: 40 }, { width: 20 }],
    },
    ...report.tables.map((table) => ({
      data: [
        table.columns.map((column) => ({
          value: column.label,
          align: column.type === 'text' ? 'left' : 'right',
          ...headerStyle,
        })),
        ...table.rows.map((row) =>
          table.columns.map((column) => excelCell(column, row[column.key], !!row.subtotal)),
        ),
        table.columns.map((column) => excelCell(column, table.totals[column.key], true)),
      ],
      sheet: table.sheet,
      columns: table.columns.map((column) => ({ width: column.type === 'text' ? 28 : 18 })),
    })),
  ]

  return writeXlsxFile(sheets).toBlob()
}

export async function exportPdf(report) {
  const generatedAt = new Date()
  const blob = await createPdfBlob(report, generatedAt)
  downloadBlob(blob, `relatorio-orcafy-${dateStamp(generatedAt)}.pdf`)
}

export async function exportExcel(report) {
  const generatedAt = new Date()
  const blob = await createExcelBlob(report, generatedAt)
  downloadBlob(blob, `relatorio-orcafy-${dateStamp(generatedAt)}.xlsx`)
}
