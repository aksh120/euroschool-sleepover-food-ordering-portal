'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CheckCircle2, XCircle, Trash2, Eye, RefreshCw } from 'lucide-react';
import { getAdminOrders, bulkUpdateOrderStatus, deleteOrder } from '@/actions/orders';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { ORDER_STATUS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders', statusFilter, searchQuery],
    queryFn: () => getAdminOrders({ status: statusFilter, search: searchQuery }),
  });

  const orders = data?.orders || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(orders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds((prev) => [...prev, id]);
    } else {
      setSelectedOrderIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsBulkProcessing(true);
    const res = await bulkUpdateOrderStatus(selectedOrderIds, 'approved');
    setIsBulkProcessing(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Approved ${selectedOrderIds.length} orders`);
      setSelectedOrderIds([]);
      refetch();
    }
  };

  const handleBulkReject = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsBulkProcessing(true);
    const res = await bulkUpdateOrderStatus(selectedOrderIds, 'rejected');
    setIsBulkProcessing(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Rejected ${selectedOrderIds.length} orders`);
      setSelectedOrderIds([]);
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    const res = await deleteOrder(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Order deleted');
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-[var(--font-heading)] text-white tracking-tight">Order Management</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Filter, search, approve, or reject student orders</p>
        </div>

        {/* Bulk Action Buttons */}
        {selectedOrderIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 mr-1">{selectedOrderIds.length} selected</span>
            <Button
              onClick={handleBulkApprove}
              disabled={isBulkProcessing}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve Selected
            </Button>
            <Button
              onClick={handleBulkReject}
              disabled={isBulkProcessing}
              size="sm"
              variant="destructive"
              className="text-xs font-semibold"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Selected
            </Button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-xs sm:text-sm h-11 text-white"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
            <SelectTrigger className="w-full sm:w-44 bg-white/5 border-white/10 text-xs h-11 text-white">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => refetch()} variant="outline" size="icon" className="border-white/10 shrink-0 h-11 w-11">
            <RefreshCw className="h-4 w-4 text-zinc-400" />
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-white/5 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="p-4 w-10">
                  <Checkbox
                    checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                    className="border-white/20"
                  />
                </th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Class</th>
                <th className="p-4">Dinner Total</th>
                <th className="p-4">Breakfast Total</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-zinc-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" /> Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-zinc-500">
                    No orders match your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusInfo = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || { label: order.status, color: '' };
                  const isSelected = selectedOrderIds.includes(order.id);

                  return (
                    <tr key={order.id} className={`hover:bg-white/5 transition-colors ${isSelected ? 'bg-orange-500/10' : ''}`}>
                      <td className="p-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectOne(order.id, checked === true)}
                          className="border-white/20"
                        />
                      </td>
                      <td className="p-4 font-mono font-bold text-white">{order.order_id}</td>
                      <td className="p-4 font-medium text-white">{order.student?.full_name || 'N/A'}</td>
                      <td className="p-4">{order.student ? `${order.student.class}-${order.student.section}` : 'N/A'}</td>
                      <td className="p-4">{formatCurrency(Number(order.dinner_total))}</td>
                      <td className="p-4">{formatCurrency(Number(order.breakfast_total))}</td>
                      <td className="p-4 font-bold text-white">{formatCurrency(Number(order.grand_total))}</td>
                      <td className="p-4">
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                      </td>
                      <td className="p-4">{formatDateShort(order.created_at)}</td>
                      <td className="p-4 text-right space-x-1">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-white">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleDelete(order.id)}
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
