import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, AdSenseConfig, ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { getCurrentLanguage } from '../i18n/storage';
import { translations } from '../i18n/translations';

// Helper to get translated message
function t(key: keyof typeof translations.en): string {
  const lang = getCurrentLanguage() as 'en' | 'es';
  return translations[lang][key] || translations.en[key];
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('Profile save error:', error);
      toast.error(t('profile.saveError'));
    },
  });
}

// Admin Check Query
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// File Management Queries
export function useGetCallerFiles() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileName, blob }: { fileName: string; blob: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadFile(fileName, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success(t('myFiles.toast.uploadSuccess'));
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error(t('myFiles.toast.uploadError'));
    },
  });
}

export function useDeleteFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteFile(fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success(t('myFiles.toast.deleteSuccess'));
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error(t('myFiles.toast.deleteError'));
    },
  });
}

// AdSense Configuration Queries
export function useGetAdSenseConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<AdSenseConfig>({
    queryKey: ['adSenseConfig'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdSenseConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateAdSenseConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: AdSenseConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAdSenseConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adSenseConfig'] });
      toast.success(t('monetization.toast.configSaved'));
    },
    onError: (error) => {
      console.error('Config update error:', error);
      toast.error(t('monetization.toast.configError'));
    },
  });
}

// Traffic Counter Queries
export function useGetTrafficCounter() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['trafficCounter'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTrafficCounter();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useIncrementTrafficCounter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementAndGetTrafficCounter();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trafficCounter'] });
    },
  });
}
