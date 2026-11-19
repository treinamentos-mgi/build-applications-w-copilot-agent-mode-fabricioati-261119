import { selectItems, useResource } from '../api/useResource.js';
import { CapabilityCard, ResourceView } from './CapabilityCard.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };
const activityNames: Record<string, string> = { run: 'Corrida', walk: 'Caminhada', cycle: 'Ciclismo', strength: 'Força' };

export default function Activities() {
  const resource = useResource('/api/activities', getJson<{ activities: Activity[] }>);
  return <CapabilityCard title="Atividades" description="Acompanhe os minutos de atividade e os pontos das pessoas participantes.">
    <ResourceView resource={selectItems(resource, 'activities')} emptyText="Nenhuma atividade registrada.">
      {(activities) => <ul>{activities.map((activity, index) => <li key={activity._id ?? index}>{activityNames[activity.type] ?? activity.type}: {activity.minutes} minutos, {activity.points} pontos</li>)}</ul>}
    </ResourceView>
  </CapabilityCard>;
}
import { getJson } from '../api/client.js';
