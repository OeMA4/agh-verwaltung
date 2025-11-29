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
import { toast } from "sonner";
import { createWorkshop, updateWorkshop } from "@/lib/actions/workshops";
import type { WorkshopWithDetails } from "@/types";

interface WorkshopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  workshop?: WorkshopWithDetails | null;
  onSuccess: () => void;
}

export function WorkshopDialog({
  open,
  onOpenChange,
  eventId,
  workshop,
  onSuccess,
}: WorkshopDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("30");
  const [loading, setLoading] = useState(false);

  const isEdit = !!workshop;

  useEffect(() => {
    if (workshop) {
      setName(workshop.name);
      setDescription(workshop.description || "");
      setMaxParticipants(workshop.maxParticipants.toString());
    } else {
      setName("");
      setDescription("");
      setMaxParticipants("30");
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
        });
        toast.success("Workshop aktualisiert");
      } else {
        await createWorkshop({
          name: name.trim(),
          description: description.trim() || undefined,
          maxParticipants: parseInt(maxParticipants) || 30,
          eventId,
        });
        toast.success("Workshop erstellt");
      }
      onSuccess();
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        toast.error("Ein Workshop mit diesem Namen existiert bereits");
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
