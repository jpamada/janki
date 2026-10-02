import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useOptimisticToggle<T extends boolean>(
  serverValue: T | undefined,
  mutate: (value: T) => Promise<void>,
  queryKey: readonly unknown[],
) {
  const queryClient = useQueryClient();
  const [localValue, setLocalValue] = useState(serverValue ?? (false as T));

  const mutation = useMutation({
    mutationFn: mutate,
    onError: (_err, newValue) => setLocalValue((!newValue) as T),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  useEffect(() => {
    if (serverValue !== undefined && !mutation.isPending) {
      setLocalValue(serverValue);
    }
  }, [serverValue, mutation.isPending]);

  const toggle = (value: T) => {
    setLocalValue(value);
    mutation.mutate(value);
  };

  return [localValue, toggle] as const;
}