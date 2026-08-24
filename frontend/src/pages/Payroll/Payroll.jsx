import { RefreshCw, Download } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/common/StatusBadge'
import DataTable from '@/components/tables/DataTable'
import { formatCurrency, formatDate } from '@/utils/format'
import { toast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/useAuthStore'
import { downloadPayslip } from '@/utils/payslipGenerator'

const PAYSLIPS = [
  { id: 'PS-0726', period: '2026-07-01', gross: 148000, net: 128000, status: 'synced' },
  { id: 'PS-0626', period: '2026-06-01', gross: 142000, net: 122000, status: 'synced' },
  { id: 'PS-0526', period: '2026-05-01', gross: 142000, net: 122000, status: 'synced' },
]

export default function Payroll() {
  const [syncing, setSyncing] = useState(false)
  const user = useAuthStore((s) => s.user)

  function handleDownload(payslip) {
    try {
      downloadPayslip(payslip, user || {})
      toast({
        title: 'Payslip generated',
        description: `Downloading payslip for ${formatDate(payslip.period, { month: 'long', year: 'numeric' })} (${payslip.id}).`,
        variant: 'success',
      })
    } catch (err) {
      toast({
        title: 'Download failed',
        description: 'Could not generate the payslip document.',
        variant: 'destructive',
      })
    }
  }

  function sync() {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      toast({ title: 'Payroll synced', description: 'Latest payroll data pulled successfully.', variant: 'success' })
    }, 1200)
  }

  const columns = [
    { key: 'id', label: 'Payslip' },
    { key: 'period', label: 'Period', render: (r) => formatDate(r.period, { month: 'long', year: 'numeric' }) },
    { key: 'gross', label: 'Gross', render: (r) => formatCurrency(r.gross) },
    { key: 'net', label: 'Net pay', render: (r) => formatCurrency(r.net) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'action',
      label: '',
      render: (r) => (
        <button
          onClick={() => handleDownload(r)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          title="Download official salary slip"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Payslip history and payroll sync status."
        actions={
          <Button variant="outline" onClick={sync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} /> Sync payroll
          </Button>
        }
      />
      <Card>
        <CardContent className="p-5">
          <DataTable columns={columns} data={PAYSLIPS} />
        </CardContent>
      </Card>
    </div>
  )
}

