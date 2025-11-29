"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserCheck,
  Users,
  Plus,
  X,
  Search,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import type { WorkshopWithDetails, ParticipantWithRoom } from "@/types";
import {
  addWorkshopLeader,
  removeWorkshopLeader,
  addWorkshopParticipant,
  removeWorkshopParticipant,
} from "@/lib/actions/workshops";

interface WorkshopDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshop: WorkshopWithDetails | null;
  allParticipants: ParticipantWithRoom[];
  abis: ParticipantWithRoom[];
  onUpdate: () => void;
}

export function WorkshopDetailDialog({
  open,
  onOpenChange,
  workshop,
  allParticipants,
  abis,
  onUpdate,
}: WorkshopDetailDialogProps) {
  const [leaderSearch, setLeaderSearch] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  if (!workshop) return null;

  const currentLeaderIds = workshop.leaders.map((l) => l.participantId);
  const currentParticipantIds = workshop.participants.map((p) => p.participantId);

  // Available ABIs (not yet leaders)
  const availableAbis = abis.filter(
    (a) => !currentLeaderIds.includes(a.id)
  );

  // Available participants (not yet in workshop)
  const availableParticipants = allParticipants.filter(
    (p) => !currentParticipantIds.includes(p.id)
  );

  // Filter by search
  const filteredAbis = availableAbis.filter((a) =>
    `${a.firstName} ${a.lastName}`.toLowerCase().includes(leaderSearch.toLowerCase())
  );

  const filteredParticipants = availableParticipants.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(participantSearch.toLowerCase())
  );

  const handleAddLeader = async (participantId: string) => {
    setLoading(participantId);
    try {
      await addWorkshopLeader(workshop.id, participantId);
      toast.success("Betreuer hinzugefügt");
      onUpdate();
    } catch {
      toast.error("Fehler beim Hinzufügen");
    }
    setLoading(null);
  };

  const handleRemoveLeader = async (participantId: string) => {
    setLoading(participantId);
    try {
      await removeWorkshopLeader(workshop.id, participantId);
      toast.success("Betreuer entfernt");
      onUpdate();
    } catch {
      toast.error("Fehler beim Entfernen");
    }
    setLoading(null);
  };

  const handleAddParticipant = async (participantId: string) => {
    if (workshop.participants.length >= workshop.maxParticipants) {
      toast.error("Workshop ist voll");
      return;
    }
    setLoading(participantId);
    try {
      await addWorkshopParticipant(workshop.id, participantId);
      toast.success("Teilnehmer hinzugefügt");
      onUpdate();
    } catch {
      toast.error("Fehler beim Hinzufügen");
    }
    setLoading(null);
  };

  const handleRemoveParticipant = async (participantId: string) => {
    setLoading(participantId);
    try {
      await removeWorkshopParticipant(workshop.id, participantId);
      toast.success("Teilnehmer entfernt");
      onUpdate();
    } catch {
      toast.error("Fehler beim Entfernen");
    }
    setLoading(null);
  };

  const isFull = workshop.participants.length >= workshop.maxParticipants;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{workshop.name}</DialogTitle>
          {workshop.description && (
            <p className="text-sm text-muted-foreground">{workshop.description}</p>
          )}
        </DialogHeader>

        <Tabs defaultValue="leaders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leaders" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Betreuer ({workshop.leaders.length})
            </TabsTrigger>
            <TabsTrigger value="participants" className="gap-2">
              <Users className="h-4 w-4" />
              Teilnehmer ({workshop.participants.length}/{workshop.maxParticipants})
            </TabsTrigger>
          </TabsList>

          {/* Betreuer Tab */}
          <TabsContent value="leaders" className="space-y-4">
            {/* Aktuelle Betreuer */}
            <div>
              <h4 className="text-sm font-medium mb-2">Aktuelle Betreuer</h4>
              {workshop.leaders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Noch keine Betreuer zugewiesen
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {workshop.leaders.map((l) => (
                    <Badge
                      key={l.id}
                      variant="secondary"
                      className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 gap-1 pr-1"
                    >
                      {l.participant.firstName} {l.participant.lastName}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-purple-200 dark:hover:bg-purple-800"
                        onClick={() => handleRemoveLeader(l.participantId)}
                        disabled={loading === l.participantId}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* ABIs hinzufügen */}
            <div>
              <h4 className="text-sm font-medium mb-2">ABI hinzufügen</h4>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ABI suchen..."
                  value={leaderSearch}
                  onChange={(e) => setLeaderSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <ScrollArea className="h-48 border rounded-md">
                {filteredAbis.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">
                    {availableAbis.length === 0
                      ? "Alle ABIs sind bereits Betreuer"
                      : "Keine ABIs gefunden"}
                  </p>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredAbis.map((abi) => (
                      <div
                        key={abi.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                      >
                        <span className="text-sm">
                          {abi.firstName} {abi.lastName}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddLeader(abi.id)}
                          disabled={loading === abi.id}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Teilnehmer Tab */}
          <TabsContent value="participants" className="space-y-4">
            {/* Aktuelle Teilnehmer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Aktuelle Teilnehmer</h4>
                {isFull && (
                  <Badge variant="destructive">Workshop voll</Badge>
                )}
              </div>
              {workshop.participants.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Noch keine Teilnehmer zugewiesen
                </p>
              ) : (
                <ScrollArea className="h-32 border rounded-md">
                  <div className="p-2 space-y-1">
                    {workshop.participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {p.participant.firstName} {p.participant.lastName}
                          </span>
                          {p.participant.role === "HELPER" && (
                            <Badge variant="outline" className="text-xs">
                              Helfer
                            </Badge>
                          )}
                          {p.participant.city && (
                            <span className="text-xs text-muted-foreground">
                              ({p.participant.city})
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveParticipant(p.participantId)}
                          disabled={loading === p.participantId}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Teilnehmer hinzufügen */}
            <div>
              <h4 className="text-sm font-medium mb-2">Teilnehmer hinzufügen</h4>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Teilnehmer suchen..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <ScrollArea className="h-48 border rounded-md">
                {filteredParticipants.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">
                    {availableParticipants.length === 0
                      ? "Alle Teilnehmer sind bereits im Workshop"
                      : "Keine Teilnehmer gefunden"}
                  </p>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredParticipants.slice(0, 50).map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {participant.firstName} {participant.lastName}
                          </span>
                          {participant.role === "HELPER" && (
                            <Badge variant="outline" className="text-xs bg-purple-50">
                              Helfer
                            </Badge>
                          )}
                          {participant.role === "ABI" && (
                            <Badge variant="outline" className="text-xs bg-amber-50">
                              ABI
                            </Badge>
                          )}
                          {participant.city && (
                            <span className="text-xs text-muted-foreground">
                              ({participant.city})
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddParticipant(participant.id)}
                          disabled={loading === participant.id || isFull}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {filteredParticipants.length > 50 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        +{filteredParticipants.length - 50} weitere - Suche verfeinern
                      </p>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
