import { useEffect, useState } from 'react';

export type Resource<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: T };

export function useResource<T>(path: string, load: (path: string) => Promise<T>): Resource<T> {
  const [resource, setResource] = useState<Resource<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setResource({ status: 'loading' });
    load(path).then(
      (data) => { if (active) setResource({ status: 'success', data }); },
      () => { if (active) setResource({ status: 'error' }); },
    );
    return () => { active = false; };
  }, [path, load]);

  return resource;
}

export function selectItems<T, K extends string>(resource: Resource<Record<K, T[]>>, key: K): Resource<T[]> {
  return resource.status === 'success' ? { status: 'success', data: resource.data[key] } : resource;
}
