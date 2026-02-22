import { useGetAdSenseConfig } from '../hooks/useQueries';
import AdSenseAd from './AdSenseAd';
import AdSpace from './AdSpace';

export default function AdSenseSidebar() {
  const { data: config, isLoading } = useGetAdSenseConfig();

  if (isLoading) {
    return null;
  }

  if (!config || !config.enableSidebarAds || !config.sidebarAdUnitId || !config.publisherId) {
    return (
      <div className="hidden lg:block">
        <AdSpace size="medium" label="Sidebar Advertisement" />
      </div>
    );
  }

  return (
    <div className="hidden lg:block sticky top-4">
      <AdSenseAd
        adClient={config.publisherId}
        adSlot={config.sidebarAdUnitId}
        adFormat="rectangle"
        className="w-[300px]"
      />
    </div>
  );
}
