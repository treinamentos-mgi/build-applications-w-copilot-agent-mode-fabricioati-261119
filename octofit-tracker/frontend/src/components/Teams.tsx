import { selectItems, useResource } from '../api/useResource.js';
import { CapabilityCard, ResourceView } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot?: string; members: string[] };

export default function Teams() {
  const resource = useResource('/api/teams', getJson<{ teams: Team[] }>);
  return <CapabilityCard title="Equipes" description="Conheça as equipes e seus integrantes.">
    <ResourceView resource={selectItems(resource, 'teams')} emptyText="Nenhuma equipe cadastrada.">
      {(teams) => <ul>{teams.map((team, index) => <li key={team._id ?? index}>{team.name}{team.mascot && ` — mascote: ${team.mascot}`} ({team.members.length} integrantes)</li>)}</ul>}
    </ResourceView>
  </CapabilityCard>;
}
import { getJson } from '../api/client.js';
