import type { ReactNode } from 'react';
import type { Resource } from '../api/useResource.js';

type Props = { title: string; description: string; children: ReactNode };
export function CapabilityCard({ title, description, children }: Props) {
  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p>{children}</div></section>;
}

export function ResourceView<T>({ resource, emptyText, children }: {
  resource: Resource<T[]>;
  emptyText: string;
  children: (items: T[]) => ReactNode;
}) {
  if (resource.status === 'loading') return <p role="status">Carregando...</p>;
  if (resource.status === 'error') return <p role="alert">Não foi possível carregar os dados. Tente novamente.</p>;
  if (resource.data.length === 0) return <p>{emptyText}</p>;
  return children(resource.data);
}
