import { getDashboardStats, getAdminOrders } from '@/actions/orders';
import { DashboardCards } from '@/components/admin/dashboard-cards';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS } from '@/lib/constants';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const revalidate = 0; // Dynamic server component

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const { orders: recentOrders } = await getAdminOrders({ limit: 5 });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)] text-white">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">Real-time overview of orders, revenue, and verification status</p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/payments">
            <Button size="sm" className="gradient-orange text-white text-xs font-semibold rounded-xl">
              Verify Payments ({stats.pendingOrders})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardCards stats={stats} />

      {/* Quick Action Alert if pending */}
      {stats.pendingOrders > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">
                {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} awaiting payment verification
              </p>
              <p className="text-xs text-amber-400/80">Review uploaded QR screenshots and approve orders.</p>
            </div>
          </div>
          <Link href="/admin/payments">
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs">
              Go to Queue <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Orders Table */}
      <Card className="glass-card border-white/10">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-400" /> Recent Submissions
            </CardTitle>
          </div>
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white">
              View All Orders <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-muted-foreground">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No orders received yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusInfo = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || { label: order.status, color: '' };
                    return (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-white">{order.order_id}</td>
                        <td className="p-4 font-medium text-white">{order.student?.full_name || 'N/A'}</td>
                        <td className="p-4">{order.student ? `${order.student.class}-${order.student.section}` : 'N/A'}</td>
                        <td className="p-4 font-semibold text-white">{formatCurrency(Number(order.grand_total))}</td>
                        <td className="p-4">
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </td>
                        <td className="p-4">{formatDateShort(order.created_at)}</td>
                        <td className="p-4 text-right">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-white/10">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
