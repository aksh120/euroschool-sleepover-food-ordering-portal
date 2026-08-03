import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = (await createClient()) as any;

  // Server-side auth verification
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Verify admin privileges in database using service role client
  const adminSupabase = createAdminClient();
  const { data: adminUser } = await adminSupabase
    .from('admin_users')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen gradient-dark flex">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden glass border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-40">
          <span className="font-bold text-xs text-white">Project Cheesecake Admin</span>
          <Sheet>
            <SheetTrigger className="p-2 text-white hover:bg-white/10 rounded-lg">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 glass-strong border-white/10">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
