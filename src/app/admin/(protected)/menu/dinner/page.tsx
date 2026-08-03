'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, Upload } from 'lucide-react';
import { getAdminDinnerMenu, addDinnerItem, updateDinnerItem, deleteDinnerItem } from '@/actions/menu';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VegBadge } from '@/components/shared/veg-badge';
import { toast } from 'sonner';

export default function AdminDinnerMenuPage() {
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: menuItems = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-dinner-menu'],
    queryFn: () => getAdminDinnerMenu(),
  });

  const handleRefreshLive = async () => {
    setIsRefreshingLive(true);
    toast.info("Scraping latest prices near Euroschool Wakad...");

    try {
      const res = await fetch('/api/admin/refresh-menu', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        refetch();
      } else {
        toast.warning(data.message);
      }
    } catch {
      toast.error("Failed to connect to live scraper. Stored menu remains active.");
    } finally {
      setIsRefreshingLive(false);
    }
  };

  const handleToggleAvailable = async (id: string, current: boolean) => {
    const res = await updateDinnerItem(id, { available: !current });
    if (res.error) toast.error(res.error);
    else {
      toast.success('Availability updated');
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    const res = await deleteDinnerItem(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Item deleted');
      refetch();
    }
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      veg_status: formData.get('veg_status') as 'veg' | 'non-veg',
      available: true,
    };

    if (editingItem) {
      const res = await updateDinnerItem(editingItem.id, itemData);
      if (res.error) toast.error(res.error);
      else toast.success('Item updated');
    } else {
      const res = await addDinnerItem(itemData);
      if (res.error) toast.error(res.error);
      else toast.success('Item added');
    }

    setIsDialogOpen(false);
    setEditingItem(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] text-white">Dinner Menu (McDonald&apos;s)</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage McDonald&apos;s items, prices, and live price refreshes</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRefreshLive}
            disabled={isRefreshingLive}
            variant="outline"
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs font-semibold"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshingLive ? 'animate-spin' : ''}`} />
            Refresh McDonald&apos;s Menu
          </Button>

          <Button
            onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}
            className="gradient-orange text-white text-xs font-semibold"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>
      </div>

      {/* Menu Table */}
      <div className="glass-card overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price</th>
                <th className="p-4">Source</th>
                <th className="p-4">Available</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-muted-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center"><RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" /> Loading menu...</td>
                </tr>
              ) : menuItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">No menu items found.</td>
                </tr>
              ) : (
                menuItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      {item.name}
                      {item.description && <p className="text-[10px] font-normal text-muted-foreground line-clamp-1">{item.description}</p>}
                    </td>
                    <td className="p-4"><Badge variant="outline" className="border-white/10 text-[10px]">{item.category}</Badge></td>
                    <td className="p-4"><VegBadge status={item.veg_status} size="sm" /></td>
                    <td className="p-4 font-bold text-white">{formatCurrency(Number(item.price))}</td>
                    <td className="p-4"><span className="text-[10px] text-muted-foreground uppercase">{item.platform || 'manual'}</span></td>
                    <td className="p-4">
                      <Switch
                        checked={item.available}
                        onCheckedChange={() => handleToggleAvailable(item.id, item.available)}
                      />
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <Button
                        onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{editingItem ? 'Edit Item' : 'Add New Dinner Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Item Name</Label>
              <Input name="name" defaultValue={editingItem?.name || ''} required className="bg-white/5 border-white/10 text-xs" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input name="description" defaultValue={editingItem?.description || ''} className="bg-white/5 border-white/10 text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Price (₹)</Label>
                <Input name="price" type="number" step="0.01" defaultValue={editingItem?.price || ''} required className="bg-white/5 border-white/10 text-xs" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select name="category" defaultValue={editingItem?.category || 'Burgers'}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Burgers">Burgers</SelectItem>
                    <SelectItem value="Wraps">Wraps</SelectItem>
                    <SelectItem value="Sides">Sides</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                    <SelectItem value="Desserts">Desserts</SelectItem>
                    <SelectItem value="Combos">Combos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Veg / Non-Veg</Label>
              <Select name="veg_status" defaultValue={editingItem?.veg_status || 'veg'}>
                <SelectTrigger className="bg-white/5 border-white/10 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Veg</SelectItem>
                  <SelectItem value="non-veg">Non-Veg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full gradient-orange text-white font-semibold text-xs py-5 mt-4">
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
