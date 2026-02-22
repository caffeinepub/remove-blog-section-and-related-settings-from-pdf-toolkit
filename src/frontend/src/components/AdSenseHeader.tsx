import { useGetAdSenseConfig } from '../hooks/useQueries';
import AdSenseAd from './AdSenseAd';
import AdSpace from './AdSpace';

export default function AdSenseHeader() {
  const { data: config, isLoading } = useGetAdSenseConfig();

  if (isLoading) {
    return null;
  }

  if (!config || !config.enableHeaderBanner || !config.headerAdUnitId || !config.publisherId) {
    return <AdSpace size="banner" label="Header Advertisement" />;
  }

  return (
    <div className="w-full mb-6">
      <AdSenseAd
        adClient={config.publisherId}
        adSlot={config.headerAdUnitId}
        adFormat="horizontal"
        className="flex justify-center"
      />
    </div>
  );
}
