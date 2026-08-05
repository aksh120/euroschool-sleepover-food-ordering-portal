import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-guard';

function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (/^[=+@-]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'orders';

    const adminClient = createAdminClient() as any;

    let csvContent = '';

    if (reportType === 'orders') {
      const { data: orders } = await adminClient
        .from('orders')
        .select(`
          order_id,
          status,
          dinner_total,
          breakfast_total,
          grand_total,
          created_at,
          student:students(full_name, class, section, phone, house)
        `)
        .order('created_at', { ascending: false });

      csvContent = 'Order ID,Student Name,Class,Section,Phone,House,Dinner Total,Breakfast Total,Grand Total,Status,Submitted At\n';
      (orders as any[])?.forEach((o: any) => {
        const student = o.student || {};
        csvContent += `"${sanitizeCsvCell(o.order_id)}","${sanitizeCsvCell(student.full_name)}","${sanitizeCsvCell(student.class)}","${sanitizeCsvCell(student.section)}","${sanitizeCsvCell(student.phone)}","${sanitizeCsvCell(student.house)}",${o.dinner_total},${o.breakfast_total},${o.grand_total},"${sanitizeCsvCell(o.status)}","${sanitizeCsvCell(o.created_at)}"\n`;
      });
    } else if (reportType === 'kitchen') {
      const { data: approvedOrders } = await adminClient
        .from('orders')
        .select('id')
        .eq('status', 'approved');

      const orderIds = (approvedOrders as any[])?.map((o) => o.id) || [];

      const { data: dinnerItems } = await adminClient
        .from('order_dinner_items')
        .select('item_name, quantity')
        .in('order_id', orderIds);

      const dinnerMap = new Map<string, number>();
      (dinnerItems as any[])?.forEach((i) => dinnerMap.set(i.item_name, (dinnerMap.get(i.item_name) || 0) + i.quantity));

      const { data: breakfastItems } = await adminClient
        .from('order_breakfast_items')
        .select('item_name, quantity')
        .in('order_id', orderIds);

      const breakfastMap = new Map<string, number>();
      (breakfastItems as any[])?.forEach((i) => breakfastMap.set(i.item_name, (breakfastMap.get(i.item_name) || 0) + i.quantity));

      csvContent = 'Meal,Item Name,Quantity Needed\n';
      dinnerMap.forEach((qty, name) => {
        csvContent += `"Dinner (McDonald's)","${sanitizeCsvCell(name)}",${qty}\n`;
      });
      breakfastMap.forEach((qty, name) => {
        csvContent += `"Breakfast","${sanitizeCsvCell(name)}",${qty}\n`;
      });
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="euroschool_${reportType}_report.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
