"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRoom, updateRoom } from "@/lib/actions/rooms";
import { toast } from "sonner";
import type { Room } from "@/types";

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  eventId: string;
  onSuccess: () => void;
}

export function RoomDialog({
  open,
  onOpenChange,
  room,
  eventId,
  onSuccess,
}: RoomDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    floor: "",
    capacity: "4",
    description: "",
  });

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        floor: room.floor?.toString() || "",
        capacity: room.capacity.toString(),
        description: room.description || "",
      });
    } else {
      setFormData({
        name: "",
        floor: "",
        capacity: "4",
        description: "",
      });
    }
  }, [room, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        capacity: parseInt(formData.capacity),
        description: formData.description || undefined,
      };

      if (room) {
        await updateRoom(room.id, {
          ...data,
          floor: formData.floor ? parseInt(formData.floor) : null,
          description: formData.description || null,
        });
        toast.success("Zimmer aktualisiert");
      } else {
        await createRoom({ ...data, eventId });
        toast.success("Zimmer erstellt");
      }
      onSuccess();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {room ? "Zimmer bearbeiten" : "Neues Zimmer"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="z.B. Zimmer 101"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">Etage</Label>
              <Input
                id="floor"
                type="number"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                placeholder="z.B. 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Kapazität *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optionale Beschreibung"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
