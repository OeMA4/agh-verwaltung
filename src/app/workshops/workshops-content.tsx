"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Users,
  UserCheck,
  Presentation,
  Trash2,
  Edit,
  UserPlus,
  DoorOpen,
} from "lucide-react";
import { toast } from "sonner";
import type { WorkshopWithDetails, ParticipantWithRoom, WorkshopRoom } from "@/types";
import { WorkshopDialog } from "@/components/workshops/workshop-dialog";
import { WorkshopDetailDialog } from "@/components/workshops/workshop-detail-dialog";
import { deleteWorkshop } from "@/lib/actions/workshops";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EventLight {
  id: string;
  name: string;
  year: number;
}

interface WorkshopsContentProps {
  event: EventLight;
  workshops: WorkshopWithDetails[];
  allParticipants: ParticipantWithRoom[];
  abis: ParticipantWithRoom[];
  workshopRooms: WorkshopRoom[];
}

export function WorkshopsContent({
  event,
  workshops,
  allParticipants,
  abis,
  workshopRooms,
}: WorkshopsContentProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editWorkshop, setEditWorkshop] = useState<WorkshopWithDetails | null>(null);
  const [detailWorkshop, setDetailWorkshop] = useState<WorkshopWithDetails | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteWorkshop(deleteConfirmId);
      toast.success("Workshop gelöscht");
      router.refresh();
    } catch {
      toast.error("Fehler beim Löschen");
    }
    setDeleteConfirmId(null);
  };

  const totalParticipants = workshops.reduce(
    (sum, w) => sum + w.participants.length,
    0
  );
  const totalLeaders = workshops.reduce((sum, w) => sum + w.leaders.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Workshops
          </h1>
          <p className="text-muted-foreground mt-1">
            Workshop-Verwaltung für {event.name}
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Workshop
        </Button>
      </div>

      {/* Übersicht */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Workshops</CardTitle>
            <Presentation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workshops.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Betreuer (ABIs)</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeaders}</div>
            <p className="text-xs text-muted-foreground">
              {abis.length} ABIs verfügbar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teilnehmer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              in allen Workshops
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workshop-Liste */}
      {workshops.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Presentation className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Workshops</h3>
            <p className="text-muted-foreground text-center mb-4">
              Es wurden noch keine Workshops erstellt.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ersten Workshop erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workshops.map((workshop) => {
            const participantCount = workshop.participants.length;
            const leaderCount = workshop.leaders.length;
            const fillPercentage = (participantCount / workshop.maxParticipants) * 100;
            const isFull = participantCount >= workshop.maxParticipants;

            return (
              <Card
                key={workshop.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setDetailWorkshop(workshop)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{workshop.name}</CardTitle>
                      {workshop.workshopRoom && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <DoorOpen className="h-3.5 w-3.5" />
                          <span>{workshop.workshopRoom.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditWorkshop(workshop);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(workshop.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {workshop.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {workshop.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Betreuer */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Betreuer ({leaderCount})</span>
                    </div>
                    {leaderCount > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {workshop.leaders.slice(0, 3).map((l) => (
                          <Badge
                            key={l.id}
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          >
                            {l.participant.firstName} {l.participant.lastName}
                          </Badge>
                        ))}
                        {leaderCount > 3 && (
                          <Badge variant="outline">+{leaderCount - 3}</Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Keine Betreuer</p>
                    )}
                  </div>

                  {/* Teilnehmer */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Teilnehmer ({participantCount}/{workshop.maxParticipants})
                        </span>
                      </div>
                      {isFull && (
                        <Badge variant="destructive" className="text-xs">
                          Voll
                        </Badge>
                      )}
                    </div>
                    <Progress value={fillPercentage} className="h-2" />
                  </div>

                  {/* Action */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailWorkshop(workshop);
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Teilnehmer verwalten
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialoge */}
      <WorkshopDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        eventId={event.id}
        workshopRooms={workshopRooms}
        workshops={workshops}
        onSuccess={() => {
          setCreateDialogOpen(false);
          router.refresh();
        }}
      />

      <WorkshopDialog
        open={!!editWorkshop}
        onOpenChange={(open) => !open && setEditWorkshop(null)}
        eventId={event.id}
        workshopRooms={workshopRooms}
        workshops={workshops}
        workshop={editWorkshop}
        onSuccess={() => {
          setEditWorkshop(null);
          router.refresh();
        }}
      />

      <WorkshopDetailDialog
        open={!!detailWorkshop}
        onOpenChange={(open) => !open && setDetailWorkshop(null)}
        workshop={detailWorkshop}
        allParticipants={allParticipants}
        abis={abis}
        onUpdate={() => router.refresh()}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Workshop löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du diesen Workshop wirklich löschen? Alle Zuweisungen von
              Betreuern und Teilnehmern werden ebenfalls entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
