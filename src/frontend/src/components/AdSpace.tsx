import { cn } from '@/lib/utils';

interface AdSpaceProps {
  className?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large' | 'banner';
}

export default function AdSpace({ className, label = 'Advertisement', size = 'medium' }: AdSpaceProps) {
  const sizeClasses = {
    small: 'p-4 min-h-[100px]',
    medium: 'p-6 min-h-[150px]',
    large: 'p-8 min-h-[250px]',
    banner: 'p-6 min-h-[90px]',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20',
        sizeClasses[size],
        className
      )}
    >
      <div className="text-center space-y-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <p className="text-xs text-muted-foreground/60">AdSense Placeholder</p>
      </div>
    </div>
  );
}
