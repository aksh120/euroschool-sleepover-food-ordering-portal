'use client';

import { useQuery } from '@tanstack/react-query';
import { Printer, RefreshCw, Utensils, Coffee } from 'lucide-react';
import { getKitchenSummary } from '@/actions/orders';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function KitchenSummaryPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['kitchen-summary'],
    queryFn: () => getKitchenSummary(),
  });

  const dinnerItems = data?.dinner || [];
  const breakfastItems = data?.breakfast || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] text-white">Kitchen Order Summary</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Aggregated preparation quantities for approved orders</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm" className="border-white/10 text-xs">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
          <Button onClick={handlePrint} size="sm" className="gradient-orange text-white text-xs font-semibold">
            <Printer className="h-4 w-4 mr-1.5" /> Print Sheet
          </Button>
        </div>
      </div>

      {/* Printable Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-black">Project Cheesecake Senior Sleepover 2026 - Kitchen Preparation Summary</h1>
        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleString('en-IN')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dinner Summary Card */}
        <Card className="glass-card border-white/10 print:border-gray-300 print:bg-white print:text-black">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5 print:border-gray-200">
            <CardTitle className="text-base font-bold text-white print:text-black flex items-center gap-2">
              <Utensils className="h-5 w-5 text-red-400 print:text-black" /> Dinner (McDonald&apos;s)
            </CardTitle>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 print:border-gray-300 print:bg-gray-100 print:text-black text-xs">
              {dinnerItems.reduce((sum, item) => sum + item.quantity, 0)} total units
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <p className="text-xs text-muted-foreground py-8 text-center">Calculating quantities...</p>
            ) : dinnerItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No approved dinner orders yet.</p>
            ) : (
              <div className="space-y-2">
                {dinnerItems.map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 print:bg-gray-50 border border-white/5 print:border-gray-200"
                  >
                    <span className="text-sm font-semibold text-white print:text-black flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6 font-mono">#{idx + 1}</span>
                      {item.name}
                    </span>
                    <span className="text-base font-bold font-mono text-gradient-orange print:text-black bg-orange-500/10 px-3 py-1 rounded-lg">
                      × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breakfast Summary Card */}
        <Card className="glass-card border-white/10 print:border-gray-300 print:bg-white print:text-black">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5 print:border-gray-200">
            <CardTitle className="text-base font-bold text-white print:text-black flex items-center gap-2">
              <Coffee className="h-5 w-5 text-green-400 print:text-black" /> Breakfast
            </CardTitle>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 print:border-gray-300 print:bg-gray-100 print:text-black text-xs">
              {breakfastItems.reduce((sum, item) => sum + item.quantity, 0)} total units
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <p className="text-xs text-muted-foreground py-8 text-center">Calculating quantities...</p>
            ) : breakfastItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No approved breakfast orders yet.</p>
            ) : (
              <div className="space-y-2">
                {breakfastItems.map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 print:bg-gray-50 border border-white/5 print:border-gray-200"
                  >
                    <span className="text-sm font-semibold text-white print:text-black flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6 font-mono">#{idx + 1}</span>
                      {item.name}
                    </span>
                    <span className="text-base font-bold font-mono text-gradient-orange print:text-black bg-orange-500/10 px-3 py-1 rounded-lg">
                      × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
