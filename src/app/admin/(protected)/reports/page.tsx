'use client';

import { FileBarChart, Download, FileText, Utensils, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PrintableReportsPage() {
  const reports = [
    {
      title: 'Student Orders Master List',
      description: 'Complete student roster, meal choices, total cost, and payment approval status',
      icon: Users,
      type: 'orders',
      color: 'text-blue-400',
    },
    {
      title: 'Kitchen Preparation Summary',
      description: 'Aggregated item totals for McDonald’s dinner & breakfast kitchen staff',
      icon: Utensils,
      type: 'kitchen',
      color: 'text-orange-400',
    },
    {
      title: 'Payment Verification Audit',
      description: 'List of transaction IDs, uploaded proof links, and verification status',
      icon: CreditCard,
      type: 'orders',
      color: 'text-green-400',
    },
  ];

  const handleDownload = (type: string) => {
    window.open(`/api/admin/export?type=${type}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)] text-white">Printable Reports & Exports</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Download formatted CSV sheets for kitchen staff, finance, or record keeping</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.title} className="glass-card border-white/10 flex flex-col justify-between p-6">
            <div className="space-y-4">
              <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center ${report.color}`}>
                <report.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{report.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{report.description}</p>
              </div>
            </div>

            <Button
              onClick={() => handleDownload(report.type)}
              className="w-full gradient-orange text-white text-xs font-semibold mt-6"
            >
              <Download className="h-4 w-4 mr-2" /> Download CSV
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
