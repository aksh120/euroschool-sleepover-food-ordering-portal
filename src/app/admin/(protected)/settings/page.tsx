'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings as SettingsIcon, QrCode as QrIcon, Clock, Lock, Upload, Save, Check } from 'lucide-react';
import { getSettings, getActiveQRCode, updateSettings, uploadQRCode } from '@/actions/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [deadline, setDeadline] = useState('2026-08-20T23:59');
  const [orderingOpen, setOrderingOpen] = useState(true);

  const { data: currentSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => getSettings(),
  });

  const { data: activeQR, refetch: refetchQR } = useQuery({
    queryKey: ['active-qr'],
    queryFn: () => getActiveQRCode(),
  });

  useEffect(() => {
    if (currentSettings) {
      if (currentSettings.ordering_deadline) setDeadline(currentSettings.ordering_deadline.slice(0, 16));
      if (currentSettings.ordering_open) setOrderingOpen(currentSettings.ordering_open !== 'false');
    }
    if (activeQR) {
      if (activeQR.upi_id) setUpiId(activeQR.upi_id);
      if (activeQR.account_holder) setAccountHolder(activeQR.account_holder);
    }
  }, [currentSettings, activeQR]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const res = await updateSettings({
      ordering_deadline: new Date(deadline).toISOString(),
      ordering_open: orderingOpen ? 'true' : 'false',
    });
    setIsSaving(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Settings updated successfully!');
      refetchSettings();
    }
  };

  const handleQrUpload = async () => {
    if (!qrFile && !upiId && !accountHolder) {
      toast.error('No QR image or details provided');
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    if (qrFile) formData.append('qr_file', qrFile);
    if (upiId) formData.append('upi_id', upiId);
    if (accountHolder) formData.append('account_holder', accountHolder);
    if (activeQR?.image_url) formData.append('existing_image_url', activeQR.image_url);

    const res = await uploadQRCode(formData);
    setIsSaving(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('QR Code & payment details updated!');
      setQrFile(null);
      setQrPreview(null);
      refetchQR();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)] text-white">System Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage UPI QR code, ordering deadlines, and portal access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code Management */}
        <Card className="glass-card border-white/10 p-6 space-y-4">
          <CardHeader className="p-0 border-b border-white/5 pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <QrIcon className="h-5 w-5 text-orange-400" /> UPI QR Code Management
            </CardTitle>
          </CardHeader>

          <div className="space-y-4 text-xs">
            <div className="text-center">
              {qrPreview || activeQR?.image_url ? (
                <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden bg-white p-3 border border-white/10 mb-2">
                  <Image src={qrPreview || activeQR!.image_url} alt="QR Code" fill className="object-contain" />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto rounded-xl bg-white/5 flex items-center justify-center border border-dashed border-white/10 mb-2">
                  <p className="text-muted-foreground">No QR Code Uploaded</p>
                </div>
              )}

              <Button
                onClick={() => document.getElementById('qr-file-input')?.click()}
                variant="outline"
                size="sm"
                className="border-white/10 text-xs"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Select New QR Image
              </Button>
              <input
                id="qr-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setQrFile(file);
                    const reader = new FileReader();
                    reader.onload = (ev) => setQrPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">UPI ID</Label>
              <Input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="euroschool@upi"
                className="bg-white/5 border-white/10 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Account Holder Name</Label>
              <Input
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Euroschool Wakad ICSE"
                className="bg-white/5 border-white/10 text-xs"
              />
            </div>

            <Button onClick={handleQrUpload} disabled={isSaving} className="w-full gradient-orange text-white text-xs font-semibold py-5">
              Save QR & Payment Info
            </Button>
          </div>
        </Card>

        {/* Ordering Deadline & Access */}
        <Card className="glass-card border-white/10 p-6 space-y-4">
          <CardHeader className="p-0 border-b border-white/5 pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-400" /> Deadline & Portal Status
            </CardTitle>
          </CardHeader>

          <div className="space-y-6 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Ordering Deadline Date & Time</Label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-white/5 border-white/10 text-xs text-white"
              />
              <p className="text-[11px] text-muted-foreground">Students cannot place or edit orders after this time unless reopened.</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div>
                <p className="font-semibold text-white">Ordering Portal Open</p>
                <p className="text-[11px] text-muted-foreground">Toggle off to immediately lock all student ordering</p>
              </div>
              <Switch checked={orderingOpen} onCheckedChange={setOrderingOpen} />
            </div>

            <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full gradient-orange text-white text-xs font-semibold py-5">
              <Save className="h-3.5 w-3.5 mr-1.5" /> Save Portal Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
