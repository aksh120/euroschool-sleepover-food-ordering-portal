import { HeroSection } from '@/components/landing/hero-section';
import { getSettings } from '@/actions/settings';
import { getDinnerMenu } from '@/actions/menu';

export default async function LandingPage() {
  const settings = await getSettings();
  const menuItems = await getDinnerMenu();

  const orderingDeadline = settings.ordering_deadline || '2026-08-20T23:59:59+05:30';
  const isOrderingOpen = settings.ordering_open !== 'false';

  return (
    <main>
      <HeroSection
        orderingDeadline={orderingDeadline}
        isOrderingOpen={isOrderingOpen}
        menuItems={menuItems}
      />
    </main>
  );
}
