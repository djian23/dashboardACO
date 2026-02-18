import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice, Profile } from '@/types'

interface InvoicePreviewProps {
  invoice: Invoice
  profile: Profile
}

export function InvoicePreview({ invoice, profile }: InvoicePreviewProps) {
  return (
    <Card className="bg-white text-gray-900 border border-gray-200 max-w-[800px] mx-auto">
      <CardContent className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">FACTURE</h2>
            <p className="text-sm text-gray-500 mt-1">
              N: {invoice.invoice_number}
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold text-gray-900">
              {profile.business_name ?? profile.full_name ?? 'Mon entreprise'}
            </p>
            {profile.business_address && (
              <p className="whitespace-pre-line">{profile.business_address}</p>
            )}
            {profile.business_siret && <p>SIRET: {profile.business_siret}</p>}
            <p>{profile.email}</p>
          </div>
        </div>

        <Separator className="bg-gray-200 mb-6" />

        {/* Client and dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Facture a
            </p>
            <p className="font-medium text-gray-900">{invoice.buyer_name ?? '-'}</p>
            {invoice.buyer_address && (
              <p className="text-sm text-gray-600 whitespace-pre-line mt-1">
                {invoice.buyer_address}
              </p>
            )}
            {invoice.buyer_email && (
              <p className="text-sm text-gray-600 mt-1">{invoice.buyer_email}</p>
            )}
          </div>
          <div className="text-right">
            <div className="space-y-1 text-sm">
              <div className="flex justify-end gap-4">
                <span className="text-gray-500">Date d'emission :</span>
                <span className="font-medium">{formatDate(invoice.issue_date)}</span>
              </div>
              {invoice.due_date && (
                <div className="flex justify-end gap-4">
                  <span className="text-gray-500">Date d'echeance :</span>
                  <span className="font-medium">{formatDate(invoice.due_date)}</span>
                </div>
              )}
              <div className="flex justify-end gap-4">
                <span className="text-gray-500">Statut :</span>
                <span
                  className={`font-medium capitalize ${
                    invoice.status === 'paid'
                      ? 'text-emerald-600'
                      : invoice.status === 'overdue'
                        ? 'text-red-600'
                        : 'text-gray-900'
                  }`}
                >
                  {invoice.status === 'draft'
                    ? 'Brouillon'
                    : invoice.status === 'sent'
                      ? 'Envoyee'
                      : invoice.status === 'paid'
                        ? 'Payee'
                        : invoice.status === 'overdue'
                          ? 'En retard'
                          : 'Annulee'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Line items table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Description
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Quantite
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Prix unitaire
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                >
                  <td className="py-3 px-4 text-gray-900">{item.description || '-'}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-[280px] space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sous-total</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_rate != null && invoice.tax_rate > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>TVA ({invoice.tax_rate}%)</span>
                <span>{formatCurrency(invoice.tax_amount ?? 0)}</span>
              </div>
            )}
            <Separator className="bg-gray-200" />
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-1">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Notes
            </p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        {profile.tax_regime && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Regime fiscal : {profile.tax_regime}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
