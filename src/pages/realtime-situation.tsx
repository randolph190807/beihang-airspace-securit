import { DemoControls } from "@/features/monitoring/components/demo-controls";
import { MapCanvas } from "@/features/monitoring/components/map-canvas";
import { StatusBar } from "@/features/monitoring/components/status-bar";
import { TargetList } from "@/features/monitoring/components/target-list";
import { JudgmentPanel } from "@/features/judgment/components/judgment-panel";
import {
  MonitoringProvider,
  useMonitoring,
} from "@/features/monitoring/monitoring-context";

function RealtimeContent() {
  const { loading, error } = useMonitoring();

  if (loading) {
    return (
      <div className="flex min-h-[480px] items-center justify-center text-blue-100/55">
        加载监控场景…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-950/30 p-6 text-red-200">
        加载失败：{error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <StatusBar />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_minmax(300px,360px)]">
        <div className="flex flex-col gap-3">
          <MapCanvas />
          <DemoControls />
        </div>
        <TargetList />
        <JudgmentPanel />
      </div>
    </div>
  );
}

export function RealtimeSituationPage() {
  return (
    <MonitoringProvider>
      <RealtimeContent />
    </MonitoringProvider>
  );
}
