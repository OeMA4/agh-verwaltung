"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Euro,
  BedDouble,
  Search,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import type { ParticipantWithRoom, RoomWithParticipants, ParticipantRole } from "@/types";
import { ParticipantDialog } from "./participant-dialog";
import { RoomAssignDialog } from "./room-assign-dialog";
import {
  deleteParticipant,
  markAsPaid,
  markAsUnpaid,
  checkIn,
  checkOut,
} from "@/lib/actions/participants";
import { toast } from "sonner";

interface ParticipantTableProps {
  participants: ParticipantWithRoom[];
  rooms: RoomWithParticipants[];
  eventId: string;
  onRefresh: () => void;
}

const roleLabels: Record<ParticipantRole, { label: string; variant: "secondary" | "default" | "outline" }> = {
  REGULAR: { label: "Teilnehmer", variant: "secondary" },
  HELPER: { label: "Helfer", variant: "default" },
  ABI: { label: "Abi", variant: "outline" },
};

// Länder aus der Stadt ableiten (basierend auf PLZ-Muster)
function getCountryFromParticipant(p: ParticipantWithRoom): string {
  if (!p.postalCode) return "Unbekannt";

  // Deutsche PLZ: 5-stellig, nur Zahlen
  if (/^\d{5}$/.test(p.postalCode)) return "Deutschland";
  // Niederländische PLZ: 4 Zahlen + optional 2 Buchstaben
  if (/^\d{4}[A-Z]{0,2}$/.test(p.postalCode)) return "Niederlande";
  // Belgische PLZ: 4 Zahlen
  if (/^\d{4}$/.test(p.postalCode) && p.city?.includes("Hasselt")) return "Belgien";
  // Türkische PLZ: 5 Zahlen
  if (/^\d{5}$/.test(p.postalCode) && (p.city === "Istanbul" || p.city === "Ankara" || p.city === "Izmir")) return "Türkei";
  // Österreichische PLZ: 4 Zahlen
  if (/^\d{4}$/.test(p.postalCode) && p.city === "Wien") return "Österreich";
  // Schweizer PLZ: 4 Zahlen
  if (/^\d{4}$/.test(p.postalCode) && p.city === "Zürich") return "Schweiz";

  return "Unbekannt";
}

export function ParticipantTable({
  participants,
  rooms,
  eventId,
  onRefresh,
}: ParticipantTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [editingParticipant, setEditingParticipant] =
    useState<ParticipantWithRoom | null>(null);
  const [assigningRoom, setAssigningRoom] =
    useState<ParticipantWithRoom | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Extrahiere einzigartige Städte und Länder für Filter-Dropdowns
  const { cities, countries } = useMemo(() => {
    const citySet = new Set<string>();
    const countrySet = new Set<string>();

    participants.forEach((p) => {
      if (p.city) citySet.add(p.city);
      const country = getCountryFromParticipant(p);
      if (country !== "Unbekannt") countrySet.add(country);
    });

    return {
      cities: Array.from(citySet).sort(),
      countries: Array.from(countrySet).sort(),
    };
  }, [participants]);

  // Volltextsuche über alle Felder
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      // Volltextsuche über alle relevanten Felder
      if (search) {
        const searchLower = search.toLowerCase();
        const searchableFields = [
          p.firstName,
          p.lastName,
          p.email,
          p.phone,
          p.street,
          p.houseNumber,
          p.postalCode,
          p.city,
          p.notes,
          p.room?.name,
          roleLabels[p.role as ParticipantRole]?.label,
          p.hasPaid ? "bezahlt" : "offen",
          p.checkedIn ? "anwesend" : "",
        ].filter(Boolean);

        const matchesSearch = searchableFields.some(
          (field) => field?.toLowerCase().includes(searchLower)
        );

        if (!matchesSearch) return false;
      }

      // Rollenfilter
      if (roleFilter !== "all" && p.role !== roleFilter) return false;

      // Stadtfilter
      if (cityFilter !== "all" && p.city !== cityFilter) return false;

      // Länderfilter
      if (countryFilter !== "all" && getCountryFromParticipant(p) !== countryFilter) return false;

      // Bezahlungsfilter
      if (paymentFilter === "paid" && !p.hasPaid) return false;
      if (paymentFilter === "unpaid" && p.hasPaid) return false;

      return true;
    });
  }, [participants, search, roleFilter, cityFilter, countryFilter, paymentFilter]);

  const hasActiveFilters = roleFilter !== "all" || cityFilter !== "all" || countryFilter !== "all" || paymentFilter !== "all";

  const clearFilters = () => {
    setRoleFilter("all");
    setCityFilter("all");
    setCountryFilter("all");
    setPaymentFilter("all");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Teilnehmer wirklich löschen?")) return;
    try {
      await deleteParticipant(id);
      toast.success("Teilnehmer gelöscht");
      onRefresh();
    } catch {
      toast.error("Fehler beim Löschen");
    }
  };

  const handlePaymentToggle = async (participant: ParticipantWithRoom) => {
    try {
      if (participant.hasPaid) {
        await markAsUnpaid(participant.id);
        toast.success("Zahlung zurückgesetzt");
      } else {
        await markAsPaid(participant.id);
        toast.success("Als bezahlt markiert");
      }
      onRefresh();
    } catch {
      toast.error("Fehler bei der Aktualisierung");
    }
  };

  const handleCheckInToggle = async (participant: ParticipantWithRoom) => {
    try {
      if (participant.checkedIn) {
        await checkOut(participant.id);
        toast.success("Ausgecheckt");
      } else {
        await checkIn(participant.id);
        toast.success("Eingecheckt");
      }
      onRefresh();
    } catch {
      toast.error("Fehler bei der Aktualisierung");
    }
  };

  return (
    <div className="space-y-4">
      {/* Suchleiste und Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Volltextsuche (Name, Stadt, E-Mail, Telefon, Zimmer...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>Teilnehmer hinzufügen</Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Rolle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Rollen</SelectItem>
            <SelectItem value="REGULAR">Teilnehmer</SelectItem>
            <SelectItem value="HELPER">Helfer</SelectItem>
            <SelectItem value="ABI">Abi</SelectItem>
          </SelectContent>
        </Select>

        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stadt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Städte</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Land" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Länder</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Bezahlung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="paid">Bezahlt</SelectItem>
            <SelectItem value="unpaid">Offen</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            <X className="mr-1 h-4 w-4" />
            Filter zurücksetzen
          </Button>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredParticipants.length} von {participants.length} Teilnehmern
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Stadt</TableHead>
              <TableHead>Zimmer</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">
                    {search
                      ? "Keine Teilnehmer gefunden."
                      : "Noch keine Teilnehmer vorhanden."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                        {participant.firstName[0]}
                        {participant.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">
                          {participant.firstName} {participant.lastName}
                        </p>
                        {participant.phone && (
                          <p className="text-xs text-muted-foreground">
                            {participant.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {participant.city || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {participant.room ? (
                      <Badge variant="outline">{participant.room.name}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Nicht zugewiesen
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleLabels[participant.role].variant}>
                      {roleLabels[participant.role].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {participant.hasPaid ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          Bezahlt
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Offen</Badge>
                      )}
                      {participant.checkedIn && (
                        <Badge variant="secondary">Anwesend</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingParticipant(participant)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setAssigningRoom(participant)}
                        >
                          <BedDouble className="mr-2 h-4 w-4" />
                          Zimmer zuweisen
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePaymentToggle(participant)}
                        >
                          <Euro className="mr-2 h-4 w-4" />
                          {participant.hasPaid
                            ? "Zahlung zurücksetzen"
                            : "Als bezahlt markieren"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCheckInToggle(participant)}
                        >
                          {participant.checkedIn ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Auschecken
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Einchecken
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(participant.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ParticipantDialog
        open={dialogOpen || !!editingParticipant}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setEditingParticipant(null);
          }
        }}
        participant={editingParticipant}
        eventId={eventId}
        onSuccess={() => {
          setDialogOpen(false);
          setEditingParticipant(null);
          onRefresh();
        }}
      />

      <RoomAssignDialog
        open={!!assigningRoom}
        onOpenChange={(open) => {
          if (!open) setAssigningRoom(null);
        }}
        participant={assigningRoom}
        rooms={rooms}
        onSuccess={() => {
          setAssigningRoom(null);
          onRefresh();
        }}
      />
    </div>
  );
}
