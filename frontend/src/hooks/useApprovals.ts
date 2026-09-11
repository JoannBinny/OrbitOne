import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveApproval, listApprovals, rejectApproval } from "../api/approvals";
import type { ApprovalStatus } from "../types/api";

export function useApprovals(status?: ApprovalStatus) {
  return useQuery({
    queryKey: ["approvals", status ?? "all"],
    queryFn: () => listApprovals(status),
  });
}

function useApprovalInvalidation() {
  const queryClient = useQueryClient();
  return (eventId: number) => {
    queryClient.invalidateQueries({ queryKey: ["approvals"] });
    queryClient.invalidateQueries({ queryKey: ["activity"] });
    queryClient.invalidateQueries({ queryKey: ["events", eventId] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };
}

export function useApproveApproval() {
  const invalidate = useApprovalInvalidation();
  return useMutation({
    mutationFn: (approvalId: number) => approveApproval(approvalId),
    onSuccess: (approval) => invalidate(approval.event_id),
  });
}

export function useRejectApproval() {
  const invalidate = useApprovalInvalidation();
  return useMutation({
    mutationFn: (approvalId: number) => rejectApproval(approvalId),
    onSuccess: (approval) => invalidate(approval.event_id),
  });
}
