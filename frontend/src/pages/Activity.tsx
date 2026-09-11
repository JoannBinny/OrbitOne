import { useActivity } from "../hooks/useActivity";
import { useOrganization } from "../hooks/useOrganization";
import { GlassPanel } from "../components/shared/GlassPanel";
import { ErrorState } from "../components/shared/ErrorState";
import { ActivityTimeline } from "../components/activity/ActivityTimeline";
import "./Activity.css";

export default function ActivityPage() {
  const { organization } = useOrganization();
  const activity = useActivity(undefined, false, true, organization?.id);

  return (
    <div className="activity-page">
      <header className="activity-page__header">
        <p className="activity-page__eyebrow">RECENT ORBIT</p>
        <h1 className="activity-page__headline">Everything OrbitOne has done.</h1>
      </header>

      {activity.isError && <ErrorState error={activity.error} onRetry={() => activity.refetch()} />}

      <GlassPanel depth="crystal" className="activity-page__panel">
        <ActivityTimeline items={activity.data ?? []} />
      </GlassPanel>
    </div>
  );
}
