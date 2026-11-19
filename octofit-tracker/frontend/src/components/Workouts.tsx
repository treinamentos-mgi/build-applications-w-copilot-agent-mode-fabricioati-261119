import { useState } from 'react';
import { getJson } from '../api/client.js';
import { selectItems, useResource } from '../api/useResource.js';
import { CapabilityCard, ResourceView } from './CapabilityCard.js';

type Suggestion = { _id?: string; title: string; reason: string };

export default function Workouts() {
  const [email, setEmail] = useState('mona@example.com');
  const [requestedEmail, setRequestedEmail] = useState(email);
  const resource = useResource(`/api/workouts/suggestions/${encodeURIComponent(requestedEmail)}`, getJson<{ suggestions: Suggestion[] }>);
  return <CapabilityCard title="Sugestões de treino" description="Receba recomendações de treino com base nos seus padrões de atividade.">
    <form onSubmit={(event) => { event.preventDefault(); setRequestedEmail(email.trim()); }} className="mb-3">
      <label htmlFor="workout-email" className="form-label">E-mail da pessoa</label>
      <input id="workout-email" className="form-control" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <button className="btn btn-primary mt-2" type="submit">Buscar sugestões</button>
    </form>
    <ResourceView resource={selectItems(resource, 'suggestions')} emptyText="Nenhuma sugestão disponível.">
      {(suggestions) => <ul>{suggestions.map((suggestion, index) => <li key={suggestion._id ?? index}><strong>{suggestion.title}</strong>: {suggestion.reason}</li>)}</ul>}
    </ResourceView>
  </CapabilityCard>;
}
