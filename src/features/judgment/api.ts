import { apiGet, apiPost } from "@/lib/api-client";
import type { JudgmentSegment, JudgmentTemplate } from "@/features/judgment/types";

export function fetchJudgmentTemplate(segment: JudgmentSegment) {
  return apiGet<JudgmentTemplate>(`/api/v1/judgment/${segment}`);
}

export function postJudgmentDispatch(payload: {
  targetId: string;
  schemeId: string;
}) {
  return apiPost<{
    orderId: string;
    targetId: string;
    schemeId: string;
    status: string;
  }>("/api/v1/judgment/dispatch", payload);
}
