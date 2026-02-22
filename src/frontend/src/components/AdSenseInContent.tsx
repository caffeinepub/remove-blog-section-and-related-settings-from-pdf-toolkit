import { useGetAdSenseConfig } from '../hooks/useQueries';
import AdSenseAd from './AdSenseAd';
import AdSpace from './AdSpace';

export default function AdSenseInContent() {
  const { data: config, isLoading } = useGetAdSenseConfig();

  if (isLoading) {
    return null;
  }

  if (!config || !config.enableInContentAds || !config.inContentAdUnitId || !config.publisherId) {
    return (
      <div className="my-6">
        <AdSpace size="medium" label="Advertisement" />
      </div>
    );
  }

  return (
    <div className="my-6 flex justify-center">
      <AdSenseAd
        adClient={config.publisherId}
        adSlot={config.inContentAdUnitId}
        adFormat="auto"
      />
    </div>
  );
}
