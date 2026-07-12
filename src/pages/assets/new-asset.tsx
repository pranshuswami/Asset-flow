import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetFormDialog } from "./asset-form";

export function NewAssetPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/assets")}>
        <ArrowLeft className="size-4" /> Back to assets
      </Button>
      <AssetFormDialog open onOpenChange={(o) => !o && navigate("/assets")} />
    </div>
  );
}
