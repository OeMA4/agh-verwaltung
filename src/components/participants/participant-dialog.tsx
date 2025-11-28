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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createParticipant, updateParticipant } from "@/lib/actions/participants";
import { toast } from "sonner";
import type { ParticipantWithRoom, ParticipantRole } from "@/types";

interface ParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: ParticipantWithRoom | null;
  eventId: string;
  onSuccess: () => void;
}

export function ParticipantDialog({
  open,
  onOpenChange,
  participant,
  eventId,
  onSuccess,
}: ParticipantDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    notes: "",
    role: "REGULAR" as ParticipantRole,
  });

  useEffect(() => {
    if (participant) {
      setFormData({
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email || "",
        phone: participant.phone || "",
        street: participant.street || "",
        houseNumber: participant.houseNumber || "",
        postalCode: participant.postalCode || "",
        city: participant.city || "",
        notes: participant.notes || "",
        role: participant.role,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        street: "",
        houseNumber: "",
        postalCode: "",
        city: "",
        notes: "",
        role: "REGULAR",
      });
    }
  }, [participant, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (participant) {
        await updateParticipant(participant.id, {
          ...formData,
          email: formData.email || null,
          phone: formData.phone || null,
          street: formData.street || null,
          houseNumber: formData.houseNumber || null,
          postalCode: formData.postalCode || null,
          city: formData.city || null,
          notes: formData.notes || null,
        });
        toast.success("Teilnehmer aktualisiert");
      } else {
        await createParticipant({
          ...formData,
          eventId,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          street: formData.street || undefined,
          houseNumber: formData.houseNumber || undefined,
          postalCode: formData.postalCode || undefined,
          city: formData.city || undefined,
          notes: formData.notes || undefined,
        });
        toast.success("Teilnehmer hinzugefügt");
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {participant ? "Teilnehmer bearbeiten" : "Neuer Teilnehmer"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="street">Straße</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="houseNumber">Hausnr.</Label>
              <Input
                id="houseNumber"
                value={formData.houseNumber}
                onChange={(e) =>
                  setFormData({ ...formData, houseNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">PLZ</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Stadt</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <Select
                value={formData.role}
                onValueChange={(value: ParticipantRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGULAR">Teilnehmer</SelectItem>
                  <SelectItem value="HELPER">Helfer</SelectItem>
                  <SelectItem value="ABI">Abi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
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
