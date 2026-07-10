import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import {
  getPassports,
  getPassport,
  createPassport,
  updatePassport,
  submitPassport,
  approvePassport,
  rejectPassport,
  publishPassport,
  deletePassport,
  BatteryPassport,
  PassportFilters,
  PaginatedPassports,
} from '@/lib/api/passports';

// Query Keys
export const passportKeys = {
  all: ['passports'] as const,
  lists: () => [...passportKeys.all, 'list'] as const,
  list: (filters: PassportFilters) => [...passportKeys.lists(), filters] as const,
  details: () => [...passportKeys.all, 'detail'] as const,
  detail: (id: string) => [...passportKeys.details(), id] as const,
};

// List passports
export function usePassports(filters: PassportFilters = {}): UseQueryResult<PaginatedPassports> {
  return useQuery({
    queryKey: passportKeys.list(filters),
    queryFn: () => getPassports(filters),
    staleTime: 1000 * 30,
  });
}

// Single passport
export function usePassport(id: string): UseQueryResult<BatteryPassport> {
  return useQuery({
    queryKey: passportKeys.detail(id),
    queryFn: () => getPassport(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

// Create passport
export function useCreatePassport(): UseMutationResult<BatteryPassport, Error, Partial<BatteryPassport>> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPassport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: passportKeys.lists() });
    },
  });
}

// Update passport
export function useUpdatePassport(): UseMutationResult<BatteryPassport, Error, { id: string; data: Partial<BatteryPassport> }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BatteryPassport> }) =>
      updatePassport(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: passportKeys.detail(result.id) });
      queryClient.invalidateQueries({ queryKey: passportKeys.lists() });
    },
  });
}

// Submit passport
export function useSubmitPassport(): UseMutationResult<BatteryPassport, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitPassport,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: passportKeys.detail(result.id) });
      queryClient.invalidateQueries({ queryKey: passportKeys.lists() });
    },
  });
}

// Approve passport
export function useApprovePassport(): UseMutationResult<BatteryPassport, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approvePassport,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: passportKeys.detail(result.id) });
      queryClient.invalidateQueries({ queryKey: passportKeys.lists() });
    },
  });
}

// Reject passport
export function useRejectPassport(): UseMutationResult<BatteryPassport, Error, { id: string; reason: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectPassport(id, reason),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: passportKeys.detail(result.id) });
      queryClient.invalidateQueries({ queryKey: passportKeys.lists() });
    },
  });
}

// Publish passport
export function usePublishPassport(): UseMutationResult<BatteryPassport, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishPassport,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: passportKeys.detail(result.id) });
      queryClient.invalidateQueries({ queryKey: passportKeys.lists() });
    },
  });
}

// Delete passport
export function useDeletePassport(): UseMutationResult<any, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePassport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passports'] });
    },
  });
}
