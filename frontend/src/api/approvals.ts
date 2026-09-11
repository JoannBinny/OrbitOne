import { apiGet, apiPost, buildQuery } from "./client";
import type { Approval, ApprovalStatus } from "../types/api";

export function listApprovals(status?: ApprovalStatus): Promise<Approval[]> {
  return apiGet<Approval[]>(`/approvals${buildQuery({ status })}`);
}

export function approveApproval(approvalId: number): Promise<Approval> {
  return apiPost<Approval>(`/approvals/${approvalId}/approve`);
}

export function rejectApproval(approvalId: number): Promise<Approval> {
  return apiPost<Approval>(`/approvals/${approvalId}/reject`);
}
