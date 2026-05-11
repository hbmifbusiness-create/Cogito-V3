import React from "react";
import { WorkspaceEntity } from "../types";
import { AnalyticsView } from "./AnalyticsView";

export function MarketingView({
  entities,
  entity,
  onUpdate,
  onBack,
  initialTab = "analytics",
}: {
  entities?: WorkspaceEntity[];
  entity: WorkspaceEntity;
  onUpdate: (e: WorkspaceEntity) => void;
  onBack: () => void;
  initialTab?: string;
}) {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "analytics" && (
          <AnalyticsView entity={entity} onBack={onBack} />
        )}
        {activeTab === "schedule" && (
          <div className="p-8 text-center text-[var(--text-muted)]">
            Posting Schedule Placeholder. Tag items with this brand to see them
            appear here.
          </div>
        )}
        {activeTab === "crosspost" && (
          <div className="p-8 text-center text-[var(--text-muted)]">
            Cross-posting Plan Placeholder
          </div>
        )}
      </div>
    </div>
  );
}
