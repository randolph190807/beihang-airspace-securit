import {
  MapPin,
  Camera,
  Check,
  Zap,
  Navigation,
  ClipboardList,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import ProcessStep from "../components/ProcessStep";
import NavigationMapCard from "@/components/NavigationMapCard";
import {
  actionBtnVariants,
  cn,
  mobileCardVariants,
  tagVariants,
} from "../components/ui/mobile-variants";
import { useProcessStep } from "../hooks/useProcessStep";
import { useState, useRef } from "react";

// 工单模拟数据
const orderData = {
  unit: "现场处置单元 王伟",
  orderNo: "OD-439386",
  targetId: "U-004 · 四旋翼",
  plan: "网捕缓降",
  equipment: "网捕炮",
  commander: "指挥官",
  distance: 20,
  direction: "东北 · 会展中心核心舞台",
  arriveTime: "≈ 1 分钟",
  targetStatus: "目标在核心区上空80m，向舞台逼近",
};

// 处置全流程步骤
const processSteps = [
  "接收派单 · 自动接令",
  "导航前往目标位置",
  "到位执行处置",
  "拍照取证 · 效果回传",
];

export function MobileDisposeOrder() {
  // 分步交互控制
  const [currentStep, setCurrentStep] = useState(1);
  const [ enableDynamic, setEnableDynamic ] = useState(true);
  const next = (flag = true) => {
    if (currentStep < processSteps.length) {
      setCurrentStep(currentStep + 1);
    }
    setEnableDynamic(flag);
  };

  // 组件内
  const fileInputRef = useRef<HTMLInputElement>(null)
  // 操作指引折叠面板开关
  // const [guideOpen, setGuideOpen] = useState(true);

  // 文件上传处理函数
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    alert('文件上传成功')
    // 清空input值，避免选同一个文件不触发change
    if (fileInputRef.current) fileInputRef.current.value = ''
    next(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-safe max-w-md mx-auto">
      {/* 顶部人员状态栏 */}
      <div className="flex items-center justify-center gap-2 mb-2 py-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        <span className="text-lg text-slate-200">{orderData.unit}</span>
      </div>

      {/* 模块1：高危处置派单卡片 label左 内容右对齐 */}
      <div className={cn(mobileCardVariants({ theme: "danger" }), "mb-4")}>
        <div className="flex items-center justify-between mb-4">
          <div className={tagVariants({ mode: "danger" })}>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            高危处置派单
          </div>
          <span className="text-slate-400">{orderData.orderNo}</span>
        </div>
        <div className="space-y-3 text-base">
          <div className="grid grid-cols-[auto_1fr] items-center">
            <span className="text-slate-400">目标</span>
            <span className="text-red-400 text-right">
              {orderData.targetId}
            </span>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-center">
            <span className="text-slate-400">处置方案</span>
            <span className="text-right">{orderData.plan}</span>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-center">
            <span className="text-slate-400">手段 / 装备</span>
            <span className="text-right">{orderData.equipment}</span>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-center">
            <span className="text-slate-400">下令</span>
            <span className="text-right">{orderData.commander}</span>
          </div>
        </div>
      </div>

      {/* 模块2：导航地图卡片 label左 内容右对齐 + 导航箭头替换点位 */}
      <div className={cn(mobileCardVariants(), "mb-4")}>
        <NavigationMapCard
          targetName={orderData.targetId.split("·")[0]} // U-004 目标
          distance={orderData.distance}
          directionText={orderData.direction}
          enableDynamic={enableDynamic} // 开启飞行物动态晃动
        />
      </div>

      {/* 模块3：执行处置红色操作栏（仅当前步骤≥2才展示） */}
      {currentStep == 1 && (
        <div className={cn(actionBtnVariants({ type: "danger" }), "mb-4")} onClick={()=>next()}>
          <Zap size={28} />
          <div className="text-center">
            <div>已抵达 · 执行处置（举炮瞄准 → 发射缓降网弹）</div>
          </div>
        </div>
      )}

      {/* 模块4：拍照取证模块（仅当前步骤≥3才展示） */}
      {currentStep == 2 && (
        <div className={cn(mobileCardVariants())}>
          <div className="h-40 border border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center mb-4">
            <Camera size={48} className="text-slate-500 mb-3" />
            <span className="text-slate-400">对准目标拍照取证</span>
          </div>
          {/* 隐藏原生文件选择框 */}
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*" // 只允许图片，按需修改，如 "image/*,.pdf"
            onChange={handleFileUpload}
          />
          <button className={cn(actionBtnVariants({ type: "success" }))} onClick={()=>fileInputRef.current?.click()}>
            <Camera size={24} />
            拍照取证并回传效果
          </button>
        </div>
      )}

      {/* 模块5：取证完成回执卡片（全部步骤完成才展示） */}
      {currentStep == 3 && (
        <div className={cn(mobileCardVariants({ theme: "success" }))}>
          <div className="h-24 border border-emerald-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-emerald-400 text-lg">
              ✓ 已取证 · GPS+时间戳已嵌入
            </span>
          </div>
          <div className="text-emerald-300 text-lg space-y-2" onClick={()=>next()}>
            <div className="flex items-center gap-2">
              <Check size={20} />
              处置完成 · 效果已回传指挥端
            </div>
            <div className="pl-7">已处置 · 航迹消失</div>
          </div>
        </div>
      )}

      {/* ========== 操作指引折叠面板（内部包含动态步骤条 + 下一步按钮） ========== */}
      <div>
        {/* 折叠头部 */}
        {/* <button
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full flex items-center justify-between py-2"
        >
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-slate-400" />
            <span className="text-slate-300 text-lg">操作指引 · 怎么干</span>
          </div>
          {guideOpen ? (
            <ChevronDown size={20} className="text-slate-400" />
          ) : (
            <ChevronRight size={20} className="text-slate-400" />
          )}
        </button> */}

        {/* 折叠内容：动态步骤条 + 下一步交互按钮 */}
        {/* {guideOpen && (
          <div className={cn(mobileCardVariants(), "mt-3 space-y-6")}>
            <h3 className="text-slate-300 text-xl">处置进度</h3>
            <div className="space-y-4">
              {processSteps.map((step, idx) => (
                <ProcessStep
                  key={idx}
                  label={step}
                  finished={isFinished(idx)}
                  active={isActive(idx)}
                />
              ))}
            </div>

            {currentStep < processSteps.length && (
              <button
                onClick={next}
                className="w-full py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                下一步
                <ChevronRight size={20} />
              </button>
            )}
            {currentStep >= processSteps.length && (
              <div className="text-center text-emerald-400 text-lg py-2">
                全部处置流程已完成
              </div>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
}