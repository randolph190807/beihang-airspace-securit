import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { DemoControls } from "@/features/monitoring/components/demo-controls";
import { MapCanvas } from "@/features/monitoring/components/map-canvas";
import { StatusBar } from "@/features/monitoring/components/status-bar";
import { TargetList } from "@/features/monitoring/components/target-list";
import { JudgmentPanel } from "@/features/judgment/components/judgment-panel";
import { MonitoringProvider, useMonitoring } from "@/features/monitoring/monitoring-context";
import { useState } from "react";

function RealtimeContent() {
  const { loading, error, selectTarget, targets } = useMonitoring();
  const [panelOpen, setPanelOpen] = useState(false);

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

  const openJudgmentPanel = (targetId: string) => {
    const target = targets.find((item) => item.targetId === targetId);
    if (target?.visible && target.role === "demo") {
      setPanelOpen(true);
    }
  };

  const handleThreatProcess = (targetId: string) => {
    const target = targets.find((item) => item.targetId === targetId);
    if (!target?.visible || target.role !== "demo") return;

    selectTarget(targetId);
    setPanelOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-3 overflow-hidden">
      <StatusBar />
      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
        <MapCanvas onTargetSelect={openJudgmentPanel}>
          <DemoControls onProcessTarget={handleThreatProcess} />
        </MapCanvas>
        <TargetList onTargetSelect={openJudgmentPanel} />
      </div>
      <Drawer
        open={panelOpen}
        onOpenChange={(open) => {
          setPanelOpen(open);
        }}
      >
        <DrawerContent>
          <div className="min-h-0 flex-1">
            <JudgmentPanel className="h-full rounded-none border-0 bg-transparent" />
          </div>
        </DrawerContent>
      </Drawer>
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
