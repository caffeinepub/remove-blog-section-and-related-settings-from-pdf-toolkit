import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useI18n } from '../i18n/useI18n';
import { Loader2 } from 'lucide-react';

export default function ProfileSetupDialog() {
  const [name, setName] = useState('');
  const { actor, isFetching: actorFetching } = useActor();
  const saveProfile = useSaveCallerUserProfile();
  const { t } = useI18n();

  const isActorReady = !!actor && !actorFetching;
  const isSubmitting = saveProfile.isPending;
  const isDisabled = !isActorReady || isSubmitting || !name.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guard: only submit if actor is ready and name is valid
    if (!isActorReady || !name.trim()) {
      return;
    }
    
    saveProfile.mutate({ name: name.trim() });
  };

  // Determine button text based on state
  let buttonText = t('profile.continue');
  if (!isActorReady) {
    buttonText = t('profile.connecting');
  } else if (isSubmitting) {
    buttonText = t('profile.saving');
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('profile.welcome')}</DialogTitle>
          <DialogDescription>{t('profile.enterName')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('profile.yourName')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.namePlaceholder')}
              required
              autoFocus
              disabled={!isActorReady}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isDisabled}
          >
            {(isSubmitting || !isActorReady) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {buttonText}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
