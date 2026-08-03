'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Plus, Edit2, Trash2, CheckCircle2, Code, Zap, Upload, FileText } from 'lucide-react';
import { getAdminDinnerMenu, addDinnerItem, updateDinnerItem, deleteDinnerItem } from '@/actions/menu';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { VegBadge } from '@/components/shared/veg-badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminDinnerMenuPage() {
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: menuItems = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-dinner-menu'],
    queryFn: () => getAdminDinnerMenu(),
  });

  const handleRefreshLive = async () => {
    setIsRefreshingLive(true);
    toast.info("Fetching latest McDonald's Wakad menu...");

    try {
      const res = await fetch('/api/admin/refresh-menu', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        refetch();
      } else {
        toast.warning(data.message);
        setIsJsonDialogOpen(true);
      }
    } catch {
      toast.error("Failed to connect to live scraper. Use JSON import.");
      setIsJsonDialogOpen(true);
    } finally {
      setIsRefreshingLive(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
        toast.success(`Loaded JSON from ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleJsonSync = async () => {
    if (!jsonText.trim()) {
      toast.error("Please paste or upload the Swiggy DAPI JSON payload");
      return;
    }

    try {
      const parsed = JSON.parse(jsonText.trim());
      setIsRefreshingLive(true);
      toast.info("Syncing items, prices & images from Swiggy DAPI JSON...");

      const res = await fetch('/api/admin/refresh-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: parsed }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Successfully synced ${data.itemCount || 'all'} live menu items!`);
        setIsJsonDialogOpen(false);
        setJsonText('');
        setFileName(null);
        refetch();
      } else {
        toast.error(data.message || 'JSON sync failed');
      }
    } catch {
      toast.error("Invalid JSON format. Make sure to copy the full response from Swiggy DAPI URL.");
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

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const itemData = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      veg_status: formData.get('veg_status') as 'veg' | 'non-veg',
      image_url: (formData.get('image_url') as string) || undefined,
      available: true,
    };

    let res;
    if (editingItem) {
      res = await updateDinnerItem(editingItem.id, itemData);
    } else {
      res = await addDinnerItem(itemData);
    }

    if (res.error) toast.error(res.error);
    else {
      toast.success(editingItem ? 'Item updated' : 'Item added');
      setIsDialogOpen(false);
      setEditingItem(null);
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-[var(--font-heading)] text-white tracking-tight">
            Dinner Menu Management
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            McDonald&apos;s Wakad (Rest ID: 772299) items, live pricing, and images
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setIsJsonDialogOpen(true)}
            variant="outline"
            size="sm"
            className="border-white/10 text-zinc-300 hover:text-white text-xs"
          >
            <Code className="h-4 w-4 mr-1.5 text-orange-400" /> Sync Swiggy JSON
          </Button>

          <Button
            onClick={handleRefreshLive}
            disabled={isRefreshingLive}
            variant="outline"
            size="sm"
            className="border-white/10 text-zinc-300 hover:text-white text-xs"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshingLive ? 'animate-spin' : ''}`} />
            Sync Swiggy API
          </Button>

          <Button
            onClick={() => {
              setEditingItem(null);
              setIsDialogOpen(true);
            }}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Custom Item
          </Button>
        </div>
      </div>

      {/* Menu Table */}
      <div className="glass-card overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-white/5 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-white/5">
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
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" /> Loading menu items...
                  </td>
                </tr>
              ) : (menuItems as any[]).length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No dinner items configured. Click &quot;Sync Swiggy API&quot; or add custom items.
                  </td>
                </tr>
              ) : (
                (menuItems as any[]).map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <VegBadge status={item.veg_status} size="sm" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="border-white/10 text-zinc-400 text-[10px]">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="p-4 capitalize">{item.veg_status}</td>
                    <td className="p-4 font-mono font-bold text-white">{formatCurrency(Number(item.price))}</td>
                    <td className="p-4">
                      <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px]">
                        Swiggy Wakad
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Switch
                        checked={item.available}
                        onCheckedChange={() => handleToggleAvailable(item.id, item.available)}
                      />
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <Button
                        onClick={() => {
                          setEditingItem(item);
                          setIsDialogOpen(true);
                        }}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-zinc-400 hover:text-white"
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

      {/* Item Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-strong text-white border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveItem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">Item Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingItem?.name || ''}
                required
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs">Price (₹) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingItem?.price || ''}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs">Category *</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={editingItem?.category || 'Burgers'}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="veg_status" className="text-xs">Dietary Type *</Label>
              <Select name="veg_status" defaultValue={editingItem?.veg_status || 'veg'}>
                <SelectTrigger className="bg-white/5 border-white/10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Veg</SelectItem>
                  <SelectItem value="non-veg">Non-Veg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-xs">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                defaultValue={editingItem?.image_url || ''}
                placeholder="https://media-assets.swiggy.com/..."
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Input
                id="description"
                name="description"
                defaultValue={editingItem?.description || ''}
                className="bg-white/5 border-white/10"
              />
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Swiggy DAPI JSON Import Modal - Fixed Heights & Containment */}
      <Dialog open={isJsonDialogOpen} onOpenChange={setIsJsonDialogOpen}>
        <DialogContent className="glass-strong text-white border-white/10 max-w-lg w-[95vw] max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="shrink-0 pb-2">
            <DialogTitle className="flex items-center gap-2 text-orange-400 text-base sm:text-lg">
              <Zap className="h-5 w-5" /> Live Swiggy DAPI Payload Importer
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Upload `.json` file or paste the raw JSON response from Swiggy DAPI URL:
              <code className="text-orange-400 font-mono text-[10px] block mt-1 truncate">
                <a href="https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=18.5987&lng=73.7684&restaurantId=772299" target="_blank">https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU...</a>
              </code>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2 my-2 pr-1">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-white/10 hover:border-orange-500/40 rounded-xl p-4 text-center transition-all bg-white/5">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                id="json-file-input"
                className="hidden"
              />
              <label htmlFor="json-file-input" className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                <Upload className="h-6 w-6 text-orange-400" />
                <span className="text-xs font-semibold text-white">
                  {fileName ? `Loaded: ${fileName}` : 'Click to Upload JSON File (.json)'}
                </span>
                <span className="text-[10px] text-zinc-500">Fastest method for large payloads</span>
              </label>
            </div>

            <div className="flex items-center gap-2 my-2">
              <div className="h-[1px] bg-white/10 flex-1" />
              <span className="text-[10px] uppercase font-mono text-zinc-500">OR PASTE JSON TEXT</span>
              <div className="h-[1px] bg-white/10 flex-1" />
            </div>

            {/* Textarea with fixed max-height */}
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste raw Swiggy DAPI JSON response here (Ctrl + V)..."
              className="bg-white/5 border-white/10 font-mono text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-orange-500/50 h-40 max-h-40 overflow-y-auto resize-none"
            />
          </div>

          <DialogFooter className="shrink-0 pt-3 border-t border-white/10 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsJsonDialogOpen(false)}
              className="border-white/10 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJsonSync}
              disabled={isRefreshingLive || !jsonText.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
            >
              {isRefreshingLive ? <RefreshCw className="h-4 w-4 animate-spin mr-1.5" /> : <Zap className="h-4 w-4 mr-1.5" />}
              Import &amp; Sync All Live Swiggy Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
