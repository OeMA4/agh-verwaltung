"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateNotes } from "@/lib/actions/participants";
import { toast } from "sonner";
import type { ParticipantWithRoom } from "@/types";
import { StickyNote, Save, Loader2 } from "lucide-react";

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: ParticipantWithRoom | null;
  onSuccess: () => void;
}

export function NotesDialog({
  open,
  onOpenChange,
  participant,
  onSuccess,
}: NotesDialogProps) {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (participant) {
      setNotes(participant.notes || "");
    }
  }, [participant]);

  const handleSave = async () => {
    if (!participant) return;

    setIsLoading(true);
    try {
      await updateNotes(participant.id, notes.trim() || null);
      toast.success("Bemerkung gespeichert");
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setIsLoading(false);
    }
  };

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-amber-500" />
            Bemerkung für {participant.firstName} {participant.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <textarea
            placeholder="Bemerkung eingeben..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            autoFocus
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
