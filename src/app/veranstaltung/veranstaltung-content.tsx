"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createEvent, deleteEvent } from "@/lib/actions/events";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Plus, Trash2, Calendar, MapPin } from "lucide-react";
import type { Event, EventWithDetails } from "@/types";

interface VeranstaltungContentProps {
  events: Event[];
  currentEvent: EventWithDetails | null;
}

export function VeranstaltungContent({
  events: initialEvents,
  currentEvent,
}: VeranstaltungContentProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear().toString(),
    startDate: "",
    endDate: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newEvent = await createEvent({
        name: formData.name,
        year: parseInt(formData.year),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        location: formData.location,
      });

      setEvents([newEvent, ...events]);
      setDialogOpen(false);
      setFormData({
        name: "",
        year: new Date().getFullYear().toString(),
        startDate: "",
        endDate: "",
        location: "",
      });
      toast.success("Veranstaltung erstellt");
      router.refresh();
    } catch {
      toast.error("Fehler beim Erstellen");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Veranstaltung wirklich löschen? Alle Teilnehmer und Zimmer werden ebenfalls gelöscht."
      )
    ) {
      return;
    }

    try {
      await deleteEvent(id);
      setEvents(events.filter((e) => e.id !== id));
      toast.success("Veranstaltung gelöscht");
      router.refresh();
    } catch {
      toast.error("Fehler beim Löschen");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Veranstaltungen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre jährlichen Veranstaltungen
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Veranstaltung
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Noch keine Veranstaltung
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Erstellen Sie Ihre erste Veranstaltung, um Teilnehmer und Zimmer
              zu verwalten.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              Erste Veranstaltung erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const isCurrent = currentEvent?.id === event.id;

            return (
              <Card
                key={event.id}
                className={isCurrent ? "ring-2 ring-primary" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      {isCurrent && (
                        <Badge variant="default" className="mt-1">
                          Aktiv
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(event.startDate), "d. MMM", {
                        locale: de,
                      })}{" "}
                      -{" "}
                      {format(new Date(event.endDate), "d. MMM yyyy", {
                        locale: de,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Veranstaltung</DialogTitle>
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
                placeholder="z.B. AGH Winterfreizeit 2024"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Jahr *</Label>
                <Input
                  id="year"
                  type="number"
                  min="2020"
                  max="2100"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ort *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="z.B. Jugendherberge XY"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Startdatum *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Enddatum *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Erstellen..." : "Erstellen"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
