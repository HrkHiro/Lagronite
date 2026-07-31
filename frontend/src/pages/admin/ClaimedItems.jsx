import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { deleteReport, fetchAdminClaimedReports } from '../../services/reportsService.js'
import {
  MdAssignmentTurnedIn,
  MdCalendarToday,
  MdCategory,
  MdColorLens,
  MdDescription,
  MdDelete,
  MdDownload,
  MdError,
  MdFileDownload,
  MdPerson,
  MdSearchOff,
} from 'react-icons/md'

const statusStyles = {
  Claimed: {
    dark: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
    light: 'border-amber-400/30 bg-amber-50 text-amber-700',
  },
}

export function AdminClaimedItems() {
  const [reports, setReports] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { theme } = useOutletContext() || {}

  const isDark = theme === undefined ? true : theme === 'dark'

  const fetchClaimedReports = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchAdminClaimedReports()
      setReports(data.reports || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const categories = useMemo(() => {
    return ['All', ...new Set(reports.map((item) => item.category).filter(Boolean))]
  }, [reports])

  const filteredReports = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'All') {
      return reports
    }

    return reports.filter((item) => item.category === selectedCategory)
  }, [reports, selectedCategory])

  useEffect(() => {
    fetchClaimedReports()
  }, [fetchClaimedReports])

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this claimed record permanently?')) return

    try {
      await deleteReport(item.reportType, item.id)
      await fetchClaimedReports()
    } catch (err) {
      alert(err.message)
    }
  }

  const exportExcel = () => {
    const exportRows = filteredReports.map((item) => ({
      ReportType: item.reportType,
      ItemName: item.itemName,
      Category: item.category,
      Color: item.color,
      Description: item.description,
      ClaimedBy: item.claimerName || 'Unknown',
      Reporter: item.reporter?.name || 'Unknown',
      ReporterEmail: item.reporter?.email || 'N/A',
      Date: new Date(item.createdAt).toLocaleDateString(),
      Location: item.location || 'N/A',
      Status: item.status,
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Claimed Items')
    XLSX.writeFile(workbook, `claimed-items-${selectedCategory === 'All' ? 'all' : selectedCategory.toLowerCase()}.xlsx`)
  }

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' })
    const title = selectedCategory === 'All' ? 'Lagronite Claimed Items Report' : `Lagronite Claimed Items Report - ${selectedCategory}`

    doc.setFontSize(17)
    doc.text(title, 14, 16)

    const rows = filteredReports.map((item) => [
      item.reportType,
      item.itemName,
      item.category,
      item.color,
      item.claimerName || 'Unknown',
      item.reporter?.name || 'Unknown',
      new Date(item.createdAt).toLocaleDateString(),
      item.location || 'N/A',
    ])

    doc.autoTable({
      head: [['Type', 'Item Name', 'Category', 'Color', 'Claimed By', 'Reporter', 'Date', 'Location']],
      body: rows,
      startY: 24,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] },
      alternateRowStyles: { fillColor: [243, 244, 246] },
    })

    doc.save(`claimed-items-${selectedCategory === 'All' ? 'all' : selectedCategory.toLowerCase()}.pdf`)
  }

  const getStatusClass = (status) => {
    const style = statusStyles[status] || { dark: 'border-white/10 bg-white/5 text-slate-200', light: 'border-gray-200 bg-gray-50 text-gray-600' }
    return isDark ? style.dark : style.light
  }

  return (
    <section className={`relative overflow-hidden min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        <div className={`mb-8 overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg`}>
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-2">
              <MdAssignmentTurnedIn className={`text-2xl ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
                Claimed Items
              </p>
            </div>
            <h2 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recorded item claims
            </h2>
            <p className={`mt-3 max-w-xl text-base leading-6 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              This page keeps all previously claimed reports in one monitored list for easier follow-up and record keeping.
            </p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 opacity-80" />
        </div>

        <div className={`mb-6 rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-5 shadow-lg`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Filter by category
              </label>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className={`rounded-xl border px-4 py-3 text-base outline-none ${
                  isDark
                    ? 'border-white/10 bg-slate-900/60 text-white'
                    : 'border-gray-200 bg-white text-gray-900'
                }`}
              >
                {categories.map((category) => (
                  <option key={category} value={category} className={isDark ? 'bg-slate-900' : 'bg-white'}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportExcel}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                  isDark
                    ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'
                    : 'border-emerald-400/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <MdFileDownload className="text-lg" />
                Export Excel
              </button>
              <button
                type="button"
                onClick={exportPdf}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                  isDark
                    ? 'border-cyan-400/20 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
                    : 'border-cyan-400/30 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                <MdDownload className="text-lg" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={`flex h-48 items-center justify-center rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl`}>
            <div className={`h-10 w-10 animate-spin rounded-full border-3 ${isDark ? 'border-white/10 border-t-amber-400' : 'border-gray-200 border-t-amber-500'}`} />
            <p className={`ml-4 text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Loading claimed items...
            </p>
          </div>
        ) : error ? (
          <div className={`rounded-xl border ${isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-100' : 'border-rose-400/30 bg-rose-50 text-rose-800'} p-8 backdrop-blur-xl`}>
            <div className="flex items-center gap-3 mb-3">
              <MdError className="text-3xl" />
              <h3 className="text-xl font-bold">Error</h3>
            </div>
            <p className="text-base">{error}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-12 text-center backdrop-blur-xl`}>
            <MdSearchOff className={`text-6xl mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              No claimed items found for this filter
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredReports.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-6 backdrop-blur-xl shadow-lg`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.itemName}
                    </h3>
                    <p className={`mt-1.5 text-sm flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1.5">
                        <MdCategory className="text-lg" />
                        {item.category}
                      </span>
                      <span className={isDark ? 'text-slate-600' : 'text-gray-300'}>•</span>
                      <span className="flex items-center gap-1.5">
                        <MdColorLens className="text-lg" />
                        {item.color}
                      </span>
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold uppercase ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <p className={`mt-3 line-clamp-2 text-sm flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  <MdDescription className="text-lg mt-0.5 shrink-0" />
                  {item.description}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-gray-50'} px-4 py-3`}>
                    <p className={`text-sm font-medium uppercase tracking-[0.2em] flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      <MdPerson className="text-lg" />
                      Claimed by
                    </p>
                    <p className={`mt-1.5 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.claimerName || 'Unknown'}
                    </p>
                  </div>
                  <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-gray-50'} px-4 py-3`}>
                    <p className={`text-sm font-medium uppercase tracking-[0.2em] flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      <MdCalendarToday className="text-lg" />
                      Posted
                    </p>
                    <p className={`mt-1.5 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                      isDark
                        ? 'border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
                        : 'border-rose-400/30 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <MdDelete className="text-lg" />
                    Delete Record
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
