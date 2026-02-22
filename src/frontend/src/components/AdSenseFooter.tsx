import { useGetAdSenseConfig } from '../hooks/useQueries';
import AdSenseAd from './AdSenseAd';
import AdSpace from './AdSpace';

export default function AdSenseFooter() {
  const { data: config, isLoading } = useGetAdSenseConfig();

  if (isLoading) {
    return null;
  }

  if (!config || !config.enableFooterBanner || !config.footerAdUnitId || !config.publisherId) {
    return <AdSpace size="banner" label="Footer Advertisement" />;
  }

  return (
    <div className="w-full mt-6">
      <AdSenseAd
        adClient={config.publisherId}
        adSlot={config.footerAdUnitId}
        adFormat="horizontal"
        className="flex justify-center"
      />
    </div>
  );
}
