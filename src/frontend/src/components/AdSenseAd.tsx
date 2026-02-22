import { useEffect, useRef } from 'react';
import AdSpace from './AdSpace';

interface AdSenseAdProps {
  adSlot: string;
  adClient: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidthResponsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSenseAd({
  adSlot,
  adClient,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
}: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isScriptLoaded = useRef(false);

  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!isScriptLoaded.current && adClient && adSlot) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-client', adClient);
      
      script.onerror = () => {
        console.error('Failed to load AdSense script');
      };

      document.head.appendChild(script);
      isScriptLoaded.current = true;
    }
  }, [adClient, adSlot]);

  useEffect(() => {
    // Initialize ad after component mounts
    if (adRef.current && adClient && adSlot) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [adClient, adSlot]);

  // Show placeholder if ad is not configured
  if (!adClient || !adSlot) {
    return <AdSpace size="banner" label="Advertisement" />;
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}
