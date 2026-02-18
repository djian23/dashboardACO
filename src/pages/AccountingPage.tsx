import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  FileText,
  Download,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { InvoiceFormModal } from '@/components/accounting/InvoiceFormModal'
import { InvoicePreview } from '@/components/accounting/InvoicePreview'
import { useInvoices, useDeleteInvoice } from '@/hooks/useInvoices'
import { useProfile } from '@/hooks/useProfile'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types'

const STATUS_CONFIG: Record<
  Invoice['status'],
  { label: string; className: string }
> = {
  draft: {
    label: 'Brouillon',
    className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
  sent: {
    label: 'Envoyee',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  paid: {
    label: 'Payee',
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  overdue: {
    label: 'En retard',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  cancelled: {
    label: 'Annulee',
    className: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
}

export default function AccountingPage() {
  const { t } = useTranslation('accounting')

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [taxPeriod, setTaxPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  const { data: invoices = [] } = useInvoices(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  )
  const { data: profile } = useProfile()
  const deleteInvoice = useDeleteInvoice()

  // Tax summary computations
  const taxSummary = useMemo(() => {
    const allInvoices = invoices.filter((inv) => inv.status === 'paid')

    const grouped: Record<string, { revenue: number; tax: number; count: number }> = {}

    allInvoices.forEach((inv) => {
      let key: string
      const date = new Date(inv.issue_date)

      if (taxPeriod === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      } else if (taxPeriod === 'quarter') {
        const quarter = Math.ceil((date.getMonth() + 1) / 3)
        key = `${date.getFullYear()}-Q${quarter}`
      } else {
        key = String(date.getFullYear())
      }

      if (!grouped[key]) grouped[key] = { revenue: 0, tax: 0, count: 0 }
      grouped[key].revenue += inv.subtotal
      grouped[key].tax += inv.tax_amount ?? 0
      grouped[key].count += 1
    })

    const periods = Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([period, data]) => ({ period, ...data }))

    const totalRevenue = allInvoices.reduce((s, i) => s + i.subtotal, 0)
    const totalTax = allInvoices.reduce((s, i) => s + (i.tax_amount ?? 0), 0)

    return { periods, totalRevenue, totalTax }
  }, [invoices, taxPeriod])

  const handleExportCSV = () => {
    const headers = [
      'Numero',
      'Client',
      'Date emission',
      'Date echeance',
      'Sous-total',
      'TVA',
      'Total',
      'Statut',
    ]
    const rows = invoices.map((inv) => [
      inv.invoice_number,
      inv.buyer_name ?? '',
      inv.issue_date,
      inv.due_date ?? '',
      inv.subtotal,
      inv.tax_amount ?? 0,
      inv.total,
      inv.status,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((v) => `"${v}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `factures_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    window.print()
  }

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv)
    setInvoiceModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {t('title', 'Comptabilite')}
        </h1>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a]">
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="tax">Resume TVA</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-[#1a1a1a] border-[#2a2a2a] text-white">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="all" className="text-white">Tous les statuts</SelectItem>
                <SelectItem value="draft" className="text-white">Brouillon</SelectItem>
                <SelectItem value="sent" className="text-white">Envoyee</SelectItem>
                <SelectItem value="paid" className="text-white">Payee</SelectItem>
                <SelectItem value="overdue" className="text-white">En retard</SelectItem>
                <SelectItem value="cancelled" className="text-white">Annulee</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setEditingInvoice(null)
                setInvoiceModalOpen(true)
              }}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Creer une facture
            </Button>
          </div>

          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead className="text-gray-400">Numero</TableHead>
                    <TableHead className="text-gray-400">Client</TableHead>
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Echeance</TableHead>
                    <TableHead className="text-gray-400">Statut</TableHead>
                    <TableHead className="text-gray-400 text-right">Total</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow className="border-[#2a2a2a]">
                      <TableCell
                        colSpan={7}
                        className="text-center text-gray-500 py-8"
                      >
                        Aucune facture trouvee
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv) => {
                      const statusConf = STATUS_CONFIG[inv.status]
                      return (
                        <TableRow key={inv.id} className="border-[#2a2a2a]">
                          <TableCell className="text-white font-mono text-sm">
                            {inv.invoice_number}
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm">
                            {inv.buyer_name ?? '-'}
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm">
                            {formatDate(inv.issue_date)}
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm">
                            {inv.due_date ? formatDate(inv.due_date) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConf.className}>
                              {statusConf.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-white font-medium text-sm">
                            {formatCurrency(inv.total)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-white"
                                onClick={() => setPreviewInvoice(inv)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-white"
                                onClick={() => handleEditInvoice(inv)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-500"
                                onClick={() => deleteInvoice.mutate(inv.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Summary Tab */}
        <TabsContent value="tax" className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400 mb-1">Chiffre d'affaires total</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(taxSummary.totalRevenue)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardContent className="p-6">
                <p className="text-sm text-gray-400 mb-1">TVA collectee totale</p>
                <p className="text-2xl font-bold text-[#7c3aed]">
                  {formatCurrency(taxSummary.totalTax)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Afficher par :</span>
            <Select
              value={taxPeriod}
              onValueChange={(v) => setTaxPeriod(v as 'month' | 'quarter' | 'year')}
            >
              <SelectTrigger className="w-[160px] bg-[#1a1a1a] border-[#2a2a2a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="month" className="text-white">Mois</SelectItem>
                <SelectItem value="quarter" className="text-white">Trimestre</SelectItem>
                <SelectItem value="year" className="text-white">Annee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tax periods table */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead className="text-gray-400">Periode</TableHead>
                    <TableHead className="text-gray-400 text-right">Factures</TableHead>
                    <TableHead className="text-gray-400 text-right">Chiffre d'affaires</TableHead>
                    <TableHead className="text-gray-400 text-right">TVA collectee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxSummary.periods.length === 0 ? (
                    <TableRow className="border-[#2a2a2a]">
                      <TableCell
                        colSpan={4}
                        className="text-center text-gray-500 py-8"
                      >
                        Aucune facture payee
                      </TableCell>
                    </TableRow>
                  ) : (
                    taxSummary.periods.map((period) => (
                      <TableRow key={period.period} className="border-[#2a2a2a]">
                        <TableCell className="text-white font-medium">
                          {period.period}
                        </TableCell>
                        <TableCell className="text-gray-300 text-right">
                          {period.count}
                        </TableCell>
                        <TableCell className="text-gray-300 text-right">
                          {formatCurrency(period.revenue)}
                        </TableCell>
                        <TableCell className="text-[#7c3aed] text-right font-medium">
                          {formatCurrency(period.tax)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="text-white text-base">
                Exporter les donnees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-400">
                Exportez vos factures et donnees comptables dans le format de votre choix.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter en CSV
                </Button>
                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  className="border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exporter en PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice form modal */}
      <InvoiceFormModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        invoice={editingInvoice}
      />

      {/* Invoice preview modal */}
      <Dialog
        open={!!previewInvoice}
        onOpenChange={(open) => !open && setPreviewInvoice(null)}
      >
        <DialogContent className="bg-[#0f0f0f] border-[#2a2a2a] sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Apercu de la facture</DialogTitle>
            <DialogDescription className="text-gray-400">
              {previewInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          {previewInvoice && profile && (
            <InvoicePreview invoice={previewInvoice} profile={profile} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
