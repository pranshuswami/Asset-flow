import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assetsService } from "@/services/assets.service";
import { departmentsService, employeesService, locationsService } from "@/services/organization.service";
import { allocationsService } from "@/services/allocations.service";
import { bookingsService } from "@/services/bookings.service";
import { maintenanceService } from "@/services/maintenance.service";
import { auditsService } from "@/services/audits.service";
import { dashboardService } from "@/services/dashboard.service";
import { searchService } from "@/services/search.service";
import { notificationsService } from "@/services/notifications.service";
import { useDebounce } from "@/hooks/use-debounce";
import type { Query } from "@/services/http";

// --- Dashboard -------------------------------------------------------------
export const useDashboardMetrics = () =>
  useQuery({ queryKey: ["dashboard", "metrics"], queryFn: dashboardService.metrics });

export const useActivity = () =>
  useQuery({ queryKey: ["dashboard", "activity"], queryFn: dashboardService.activity });

export const useInsights = () =>
  useQuery({ queryKey: ["dashboard", "insights"], queryFn: dashboardService.insights });

// --- Assets -----------------------------------------------------------------
export function useAssets(query: Query) {
  const q = useDebounce(query, 250);
  return useQuery({
    queryKey: ["assets", q],
    queryFn: () => assetsService.list(q),
    placeholderData: (prev) => prev,
  });
}

export function useAsset(id: string | undefined) {
  return useQuery({
    queryKey: ["asset", id],
    queryFn: () => assetsService.get(id!),
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assetsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => assetsService.update(id, patch),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.setQueryData(["asset", data.id], data);
    },
  });
}

// --- Organization -----------------------------------------------------------
export const useDepartments = (query: Query = {}) =>
  useQuery({ queryKey: ["departments", query], queryFn: () => departmentsService.list(query) });

export const useLocations = () =>
  useQuery({ queryKey: ["locations"], queryFn: () => locationsService.list() });

export function useEmployees(query: Query) {
  const q = useDebounce(query, 250);
  return useQuery({
    queryKey: ["employees", q],
    queryFn: () => employeesService.list(q),
    placeholderData: (prev) => prev,
  });
}

// --- Allocations ------------------------------------------------------------
export function useAllocations(query: Query) {
  const q = useDebounce(query, 200);
  return useQuery({ queryKey: ["allocations", q], queryFn: () => allocationsService.list(q) });
}

export const useCreateAllocation = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: allocationsService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ["allocations"] }) });
};
export const useTransferAllocation = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: allocationsService.transfer, onSuccess: () => qc.invalidateQueries({ queryKey: ["allocations"] }) });
};
export const useReturnAllocation = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: allocationsService.return, onSuccess: () => qc.invalidateQueries({ queryKey: ["allocations"] }) });
};

// --- Bookings ---------------------------------------------------------------
export function useBookings(query: Query = {}) {
  return useQuery({ queryKey: ["bookings", query], queryFn: () => bookingsService.list(query) });
}
export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: bookingsService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }) });
};

// --- Maintenance ------------------------------------------------------------
export function useMaintenance(query: Query) {
  return useQuery({ queryKey: ["maintenance", query], queryFn: () => maintenanceService.list(query) });
}
export const useCreateMaintenance = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: maintenanceService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] }) });
};
export const useResolveMaintenance = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, cost }: { id: string; cost?: number }) => maintenanceService.resolve(id, cost), onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] }) });
};

// --- Audits -----------------------------------------------------------------
export function useAudits(query: Query = {}) {
  return useQuery({ queryKey: ["audits", query], queryFn: () => auditsService.list(query) });
}
export function useAudit(id: string | undefined) {
  return useQuery({ queryKey: ["audit", id], queryFn: () => auditsService.get(id!), enabled: !!id });
}
export const useVerifyAuditItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; assetId: string; status: "VERIFIED" | "MISSING" | "DAMAGED"; note?: string }) => auditsService.verifyItem(v.id, v.assetId, v.status, v.note),
    onSuccess: (data) => {
      qc.setQueryData(["audit", data.id], data);
      qc.invalidateQueries({ queryKey: ["audits"] });
    },
  });
};
export const useStartAudit = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => auditsService.start(id), onSuccess: (data) => qc.setQueryData(["audit", data.id], data) });
};
export const useCloseAudit = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => auditsService.close(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["audits"] }) });
};
export const useCreateAudit = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: auditsService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ["audits"] }) });
};

// --- Search -----------------------------------------------------------------
export function useGlobalSearch(query: string) {
  const q = useDebounce(query, 200);
  return useQuery({
    queryKey: ["search", q],
    queryFn: () => searchService.global(q),
    enabled: q.length > 1,
    placeholderData: (prev) => prev,
  });
}

// --- Notifications ----------------------------------------------------------
export const useNotificationsQuery = () =>
  useQuery({ queryKey: ["notifications"], queryFn: notificationsService.list });
