import { useMemo, useState } from "react";
import { MapPin, Building2, Layers } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocations } from "@/hooks/queries";
import { formatNumber } from "@/lib/format";

export function LocationsPage() {
  const { data: locations, isLoading } = useLocations();
  const [search, setSearch] = useState("");

  const buildings = useMemo(() => {
    const list = locations ?? [];
    const filtered = list.filter(
      (l) => !search || `${l.building} ${l.floor} ${l.room}`.toLowerCase().includes(search.toLowerCase())
    );
    const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, l) => {
      (acc[l.building] ??= []).push(l);
      return acc;
    }, {});
    return Object.entries(grouped);
  }, [locations, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description="Buildings, floors and rooms where assets live."
        actions={<Badge variant="muted">{locations ? formatNumber(locations.length) : "—"} rooms</Badge>}
      />

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search buildings, floors or rooms…"
        className="max-w-sm"
      />

      <div className="space-y-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
          : buildings.map(([building, rooms]) => (
              <div key={building}>
                <div className="mb-3 flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold">{building}</h2>
                  <Badge variant="muted">{rooms.length} rooms</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {rooms.map((room) => (
                    <Card key={room.id} className="flex items-center gap-3 p-3 transition-colors hover:bg-secondary/40">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                        <MapPin className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{room.room}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Layers className="size-3" /> {room.floor}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
