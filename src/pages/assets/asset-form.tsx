import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Boxes } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assetSchema, type AssetInput } from "@/schemas";
import { useCreateAsset } from "@/hooks/queries";
import { useLookups } from "@/hooks/use-lookups";
import { ASSET_STATUS_META, ASSET_CATEGORY_META, ASSET_CONDITION_META } from "@/constants";

export function AssetFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { departments, users } = useLookups();
  const create = useCreateAsset();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssetInput>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      status: "AVAILABLE",
      condition: "GOOD",
      category: "IT_EQUIPMENT",
      purchasePrice: 0,
    },
  });

  const onSubmit = async (data: AssetInput) => {
    try {
      await create.mutateAsync(data);
      toast.success("Asset registered", { description: `${data.name} added to inventory.` });
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Boxes className="size-4" />
            </div>
            Register new asset
          </DialogTitle>
          <DialogDescription>Assets get an auto-generated ID, QR code and timeline on creation.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input placeholder="MacBook Pro 16" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Serial number *</Label>
              <Input placeholder="SN-123456" {...register("serialNumber")} />
              {errors.serialNumber && <p className="text-xs text-destructive">{errors.serialNumber.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input placeholder="MK-7.2" {...register("model")} />
            </div>
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Input placeholder="Ingram Micro" {...register("supplier")} />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={watch("category")} onValueChange={(v) => setValue("category", v as AssetInput["category"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_CATEGORY_META).map(([v, m]) => (
                    <SelectItem key={v} value={v}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as AssetInput["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_STATUS_META).map(([v, m]) => (
                    <SelectItem key={v} value={v}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Condition *</Label>
              <Select value={watch("condition")} onValueChange={(v) => setValue("condition", v as AssetInput["condition"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_CONDITION_META).map(([v, m]) => (
                    <SelectItem key={v} value={v}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department *</Label>
              <Select value={watch("departmentId")} onValueChange={(v) => setValue("departmentId", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId && <p className="text-xs text-destructive">{errors.departmentId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Location *</Label>
              <Select value={watch("locationId")} onValueChange={(v) => setValue("locationId", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i} value={`loc_${String(i + 1).padStart(3, "0")}`}>
                      HQ Tower · L{((i % 5) + 1)} · {((i % 5) + 1)}-{String((i % 4) + 1).padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.locationId && <p className="text-xs text-destructive">{errors.locationId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Select value={watch("ownerId")} onValueChange={(v) => setValue("ownerId", v)}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  {users.slice(0, 40).map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Purchase date *</Label>
              <Input type="date" {...register("purchaseDate")} />
              {errors.purchaseDate && <p className="text-xs text-destructive">{errors.purchaseDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Purchase price *</Label>
              <Input type="number" {...register("purchasePrice")} />
              {errors.purchasePrice && <p className="text-xs text-destructive">{errors.purchasePrice.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Warranty expiry</Label>
              <Input type="date" {...register("warrantyExpiry")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending}>
              {create.isPending && <Loader2 className="size-4 animate-spin" />} Register asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
