"use client";

import { useState, useEffect } from "react";
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
  DoorOpen,
  List,
  Phone,
  Star,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { WorkshopWithDetails, ParticipantWithRoom } from "@/types";
import {
  addWorkshopLeader,
  removeWorkshopLeader,
  addWorkshopParticipant,
  removeWorkshopParticipant,
  toggleWorkshopParticipantHelper,
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
  workshop: initialWorkshop,
  allParticipants,
  abis,
  onUpdate,
}: WorkshopDetailDialogProps) {
  const [leaderSearch, setLeaderSearch] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [workshop, setWorkshop] = useState<WorkshopWithDetails | null>(initialWorkshop);

  // Sync with prop changes
  useEffect(() => {
    setWorkshop(initialWorkshop);
  }, [initialWorkshop]);

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
      const result = await addWorkshopLeader(workshop.id, participantId);
      // Update local state immediately
      const participant = abis.find((a) => a.id === participantId);
      if (participant) {
        setWorkshop({
          ...workshop,
          leaders: [
            ...workshop.leaders,
            {
              id: result.id,
              workshopId: workshop.id,
              participantId,
              createdAt: new Date(),
              participant,
            },
          ],
        });
      }
      toast.success("ABI hinzugefügt");
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
      // Update local state immediately
      setWorkshop({
        ...workshop,
        leaders: workshop.leaders.filter(
          (l) => l.participantId !== participantId
        ),
      });
      toast.success("ABI entfernt");
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
      const result = await addWorkshopParticipant(workshop.id, participantId);
      // Update local state immediately
      const participant = allParticipants.find((p) => p.id === participantId);
      if (participant) {
        setWorkshop({
          ...workshop,
          participants: [
            ...workshop.participants,
            {
              id: result.id,
              workshopId: workshop.id,
              participantId,
              createdAt: new Date(),
              isHelper: false,
              participant,
            },
          ],
        });
      }
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
      // Update local state immediately
      setWorkshop({
        ...workshop,
        participants: workshop.participants.filter(
          (p) => p.participantId !== participantId
        ),
      });
      toast.success("Teilnehmer entfernt");
      onUpdate();
    } catch {
      toast.error("Fehler beim Entfernen");
    }
    setLoading(null);
  };

  const handleToggleHelper = async (participantId: string, currentIsHelper: boolean) => {
    setLoading(`helper-${participantId}`);
    try {
      await toggleWorkshopParticipantHelper(workshop.id, participantId, !currentIsHelper);
      // Update local state immediately
      setWorkshop({
        ...workshop,
        participants: workshop.participants.map((p) =>
          p.participantId === participantId
            ? { ...p, isHelper: !currentIsHelper }
            : p
        ),
      });
      toast.success(!currentIsHelper ? "Als ABI-Betreuer markiert" : "ABI-Betreuer entfernt");
      onUpdate();
    } catch {
      toast.error("Fehler beim Ändern");
    }
    setLoading(null);
  };

  const isFull = workshop.participants.length >= workshop.maxParticipants;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{workshop.name}</DialogTitle>
          <div className="space-y-1">
            {workshop.workshopRoom && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <DoorOpen className="h-4 w-4" />
                <span>Raum: {workshop.workshopRoom.name}</span>
              </div>
            )}
            {workshop.description && (
              <p className="text-sm text-muted-foreground">{workshop.description}</p>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <List className="h-4 w-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="leaders" className="gap-2">
              <UserCheck className="h-4 w-4" />
              ABIs ({workshop.leaders.length})
            </TabsTrigger>
            <TabsTrigger value="participants" className="gap-2">
              <Users className="h-4 w-4" />
              Teilnehmer ({workshop.participants.length}/{workshop.maxParticipants})
            </TabsTrigger>
          </TabsList>

          {/* Übersicht Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* ABIs Tabelle */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-purple-600" />
                ABIs ({workshop.leaders.length})
              </h4>
              {workshop.leaders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Keine ABIs zugewiesen
                </p>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Telefon
                          </div>
                        </TableHead>
                        <TableHead>Stadt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workshop.leaders.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="font-medium">
                            {l.participant.firstName} {l.participant.lastName}
                          </TableCell>
                          <TableCell>
                            {l.participant.phone ? (
                              <span className="text-blue-600">{l.participant.phone}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {l.participant.city || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* ABI-Betreuer Tabelle */}
            {workshop.participants.filter((p) => p.isHelper).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-600" />
                  ABI-Betreuer ({workshop.participants.filter((p) => p.isHelper).length})
                </h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Telefon
                          </div>
                        </TableHead>
                        <TableHead>Stadt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workshop.participants
                        .filter((p) => p.isHelper)
                        .map((p) => (
                          <TableRow key={p.id} className="bg-amber-50/50 dark:bg-amber-900/10">
                            <TableCell className="font-medium">
                              {p.participant.firstName} {p.participant.lastName}
                            </TableCell>
                            <TableCell>
                              {p.participant.phone ? (
                                <span className="text-blue-600">{p.participant.phone}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {p.participant.city || <span className="text-muted-foreground">-</span>}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Teilnehmer Tabelle */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Teilnehmer ({workshop.participants.length}/{workshop.maxParticipants})
              </h4>
              {workshop.participants.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Keine Teilnehmer zugewiesen
                </p>
              ) : (
                <ScrollArea className="h-[250px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 bg-background">Name</TableHead>
                        <TableHead className="sticky top-0 bg-background">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Telefon
                          </div>
                        </TableHead>
                        <TableHead className="sticky top-0 bg-background">Stadt</TableHead>
                        <TableHead className="sticky top-0 bg-background">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workshop.participants.map((p) => (
                        <TableRow key={p.id} className={p.isHelper ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}>
                          <TableCell className="font-medium">
                            {p.participant.firstName} {p.participant.lastName}
                          </TableCell>
                          <TableCell>
                            {p.participant.phone ? (
                              <span className="text-blue-600">{p.participant.phone}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {p.participant.city || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            {p.isHelper && (
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                ABI-Betreuer
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </div>
          </TabsContent>

          {/* ABIs Tab */}
          <TabsContent value="leaders" className="space-y-4">
            {/* Aktuelle ABIs */}
            <div>
              <h4 className="text-sm font-medium mb-2">Aktuelle ABIs</h4>
              {workshop.leaders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Noch keine ABIs zugewiesen
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

            {/* ABI hinzufügen */}
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
                      ? "Alle ABIs sind bereits zugewiesen"
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
          <TabsContent value="participants">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {workshop.participants.length}/{workshop.maxParticipants} Teilnehmer
              </span>
              {isFull && (
                <Badge variant="destructive">Workshop voll</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Linke Spalte: Aktuelle Teilnehmer */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Aktuelle Teilnehmer
                </h4>
                <ScrollArea className="h-[350px] border rounded-md">
                  {workshop.participants.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4 text-center">
                      Noch keine Teilnehmer
                    </p>
                  ) : (
                    <div className="p-2 space-y-1">
                      {workshop.participants.map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between p-2 rounded-md hover:bg-muted ${
                            p.isHelper ? "bg-amber-50 dark:bg-amber-900/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-sm truncate">
                              {p.participant.firstName} {p.participant.lastName}
                            </span>
                            {p.isHelper && (
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 shrink-0">
                                ABI-Betreuer
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              className={p.isHelper ? "text-amber-600" : "text-muted-foreground"}
                              onClick={() => handleToggleHelper(p.participantId, p.isHelper || false)}
                              disabled={loading === `helper-${p.participantId}`}
                              title={p.isHelper ? "ABI-Betreuer entfernen" : "Als ABI-Betreuer markieren"}
                            >
                              <Star className={`h-4 w-4 ${p.isHelper ? "fill-current" : ""}`} />
                            </Button>
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
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Rechte Spalte: Verfügbare Teilnehmer */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Verfügbare Teilnehmer
                </h4>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Suchen..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-[310px] border rounded-md">
                  {filteredParticipants.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4 text-center">
                      {availableParticipants.length === 0
                        ? "Alle Teilnehmer bereits im Workshop"
                        : "Keine Teilnehmer gefunden"}
                    </p>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filteredParticipants.slice(0, 100).map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-sm truncate">
                              {participant.firstName} {participant.lastName}
                            </span>
                            {participant.role === "HELPER" && (
                              <Badge variant="outline" className="text-xs bg-purple-50 shrink-0">
                                Helfer
                              </Badge>
                            )}
                            {participant.role === "ABI" && (
                              <Badge variant="outline" className="text-xs bg-amber-50 shrink-0">
                                ABI
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddParticipant(participant.id)}
                            disabled={loading === participant.id || isFull}
                            className="shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {filteredParticipants.length > 100 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          +{filteredParticipants.length - 100} weitere - Suche verfeinern
                        </p>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
