"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createWorkshop, updateWorkshop } from "@/lib/actions/workshops";
import type { WorkshopWithDetails, WorkshopRoom } from "@/types";

interface WorkshopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  workshopRooms: WorkshopRoom[];
  workshops: WorkshopWithDetails[];
  workshop?: WorkshopWithDetails | null;
  onSuccess: () => void;
}

export function WorkshopDialog({
  open,
  onOpenChange,
  eventId,
  workshopRooms,
  workshops,
  workshop,
  onSuccess,
}: WorkshopDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("30");
  const [workshopRoomId, setWorkshopRoomId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!workshop;

  // Finde alle bereits zugewiesenen Workshop-Raum-IDs (außer dem aktuellen Workshop)
  const assignedRoomIds = workshops
    .filter((w) => w.workshopRoomId && w.id !== workshop?.id)
    .map((w) => w.workshopRoomId as string);

  // Verfügbare Räume = alle Räume die nicht bereits zugewiesen sind
  const availableRooms = workshopRooms.filter(
    (room) => !assignedRoomIds.includes(room.id)
  );

  useEffect(() => {
    if (workshop) {
      setName(workshop.name);
      setDescription(workshop.description || "");
      setMaxParticipants(workshop.maxParticipants.toString());
      setWorkshopRoomId(workshop.workshopRoomId || "");
    } else {
      setName("");
      setDescription("");
      setMaxParticipants("30");
      setWorkshopRoomId("");
    }
  }, [workshop, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Bitte gib einen Namen ein");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && workshop) {
        await updateWorkshop(workshop.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          maxParticipants: parseInt(maxParticipants) || 30,
          workshopRoomId: workshopRoomId || null,
        });
        toast.success("Workshop aktualisiert");
      } else {
        await createWorkshop({
          name: name.trim(),
          description: description.trim() || undefined,
          maxParticipants: parseInt(maxParticipants) || 30,
          workshopRoomId: workshopRoomId || undefined,
          eventId,
        });
        toast.success("Workshop erstellt");
      }
      onSuccess();
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        toast.error("Ein Workshop mit diesem Namen oder Raum existiert bereits");
      } else {
        toast.error("Fehler beim Speichern");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Workshop bearbeiten" : "Neuer Workshop"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Bearbeite die Workshop-Details"
              : "Erstelle einen neuen Workshop für die Veranstaltung"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Kochen, Sport, Musik..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Optionale Beschreibung des Workshops..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Maximale Teilnehmer</Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              max="100"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Workshop-Raum</Label>
            <Select
              value={workshopRoomId || "none"}
              onValueChange={(value) => setWorkshopRoomId(value === "none" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Raum auswählen (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Raum</SelectItem>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                    {room.description && ` - ${room.description}`}
                  </SelectItem>
                ))}
                {/* Zeige den aktuellen Raum auch wenn er bereits zugewiesen ist (beim Bearbeiten) */}
                {isEdit && workshop?.workshopRoom && !availableRooms.find(r => r.id === workshop.workshopRoomId) && (
                  <SelectItem key={workshop.workshopRoom.id} value={workshop.workshopRoom.id}>
                    {workshop.workshopRoom.name}
                    {workshop.workshopRoom.description && ` - ${workshop.workshopRoom.description}`}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {assignedRoomIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {workshopRooms.length - availableRooms.length} von {workshopRooms.length} Räumen bereits vergeben
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Speichern..." : isEdit ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
