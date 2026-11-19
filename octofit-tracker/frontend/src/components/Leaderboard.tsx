import { selectItems, useResource } from '../api/useResource.js';
import { CapabilityCard, ResourceView } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const resource = useResource('/api/leaderboard', getJson<{ leaderboard: Entry[] }>);
  return <CapabilityCard title="Placar" description="Compare a pontuação total das equipes.">
    <ResourceView resource={selectItems(resource, 'leaderboard')} emptyText="Sem classificação disponível.">
      {(entries) => <ol>{entries.map((entry) => <li key={entry.rank}>{entry.teamName}: {entry.totalPoints} pontos</li>)}</ol>}
    </ResourceView>
  </CapabilityCard>;
}
import { getJson } from '../api/client.js';
