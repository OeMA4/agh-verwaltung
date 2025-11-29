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
  Calendar,
  Cake,
  User,
  MapPin,
  Users,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  StickyNote,
} from "lucide-react";
import type { ParticipantWithRoom, RoomWithParticipants, ParticipantRole } from "@/types";
import { ParticipantDialog } from "./participant-dialog";
import { RoomAssignDialog } from "./room-assign-dialog";
import { NotesDialog } from "./notes-dialog";
import { CSVImportDialog } from "./csv-import-dialog";
import { FileSpreadsheet } from "lucide-react";
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

// Berechnet das Alter aus dem Geburtsdatum
function calculateAge(birthDate: Date | null | undefined): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Formatiert das Datum im deutschen Format
function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

// Formatiert den Aufenthaltszeitraum
function formatStayPeriod(arrival: Date | null | undefined, departure: Date | null | undefined): string | null {
  if (!arrival && !departure) return null;
  const arrStr = formatDate(arrival);
  const depStr = formatDate(departure);
  if (arrStr && depStr) return `${arrStr} - ${depStr}`;
  if (arrStr) return `ab ${arrStr}`;
  if (depStr) return `bis ${depStr}`;
  return null;
}

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
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [editingParticipant, setEditingParticipant] =
    useState<ParticipantWithRoom | null>(null);
  const [assigningRoom, setAssigningRoom] =
    useState<ParticipantWithRoom | null>(null);
  const [notesParticipant, setNotesParticipant] =
    useState<ParticipantWithRoom | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  const [sortColumn, setSortColumn] = useState<"lastName" | "firstName" | "city" | "room">("room");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: "lastName" | "firstName" | "city" | "room") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: "lastName" | "firstName" | "city" | "room") => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    }
    return sortDirection === "asc"
      ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  };

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

  // Volltextsuche und Filterung
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

      // Zimmerfilter
      if (roomFilter === "no-room" && p.room) return false;
      if (roomFilter === "has-room" && !p.room) return false;

      return true;
    });
  }, [participants, search, roleFilter, cityFilter, countryFilter, paymentFilter, roomFilter]);

  // Sortierung nach gewählter Spalte
  const sortedParticipants = useMemo(() => {
    return [...filteredParticipants].sort((a, b) => {
      let compare = 0;
      const dir = sortDirection === "asc" ? 1 : -1;

      switch (sortColumn) {
        case "lastName":
          compare = a.lastName.localeCompare(b.lastName, "de");
          break;
        case "firstName":
          compare = a.firstName.localeCompare(b.firstName, "de");
          break;
        case "city":
          const cityA = a.city || "";
          const cityB = b.city || "";
          compare = cityA.localeCompare(cityB, "de");
          break;
        case "room":
          // Teilnehmer ohne Zimmer kommen ans Ende (unabhängig von der Sortierrichtung)
          if (!a.room && !b.room) return a.lastName.localeCompare(b.lastName, "de");
          if (!a.room) return 1;
          if (!b.room) return -1;
          compare = a.room.name.localeCompare(b.room.name, "de", { numeric: true });
          break;
      }

      // Sekundäre Sortierung nach Nachname bei Gleichheit
      if (compare === 0 && sortColumn !== "lastName") {
        compare = a.lastName.localeCompare(b.lastName, "de");
      }

      return compare * dir;
    });
  }, [filteredParticipants, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedParticipants.length / pageSize);
  const paginatedParticipants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedParticipants.slice(start, start + pageSize);
  }, [sortedParticipants, currentPage]);

  // Helper zum Setzen von Filtern mit automatischem Page-Reset
  const setSearchWithReset = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };
  const setRoleFilterWithReset = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };
  const setCityFilterWithReset = (value: string) => {
    setCityFilter(value);
    setCurrentPage(1);
  };
  const setCountryFilterWithReset = (value: string) => {
    setCountryFilter(value);
    setCurrentPage(1);
  };
  const setPaymentFilterWithReset = (value: string) => {
    setPaymentFilter(value);
    setCurrentPage(1);
  };
  const setRoomFilterWithReset = (value: string) => {
    setRoomFilter(value);
    setCurrentPage(1);
  };

  const hasActiveFilters = roleFilter !== "all" || cityFilter !== "all" || countryFilter !== "all" || paymentFilter !== "all" || roomFilter !== "all";

  // Zähle Teilnehmer ohne Zimmer
  const noRoomCount = useMemo(() => {
    return participants.filter(p => !p.room).length;
  }, [participants]);

  const clearFilters = () => {
    setRoleFilter("all");
    setCityFilter("all");
    setCountryFilter("all");
    setPaymentFilter("all");
    setRoomFilter("all");
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-full sm:max-w-md group">
          <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${search ? "text-rose-500" : "text-rose-300 group-focus-within:text-rose-500"}`} />
          <Input
            placeholder="Suche..."
            value={search}
            onChange={(e) => setSearchWithReset(e.target.value)}
            className={`pl-9 transition-all border-rose-200 focus:border-rose-400 focus:ring-rose-400/20 ${search ? "bg-rose-50 border-rose-300 text-rose-900 placeholder:text-rose-400" : "hover:bg-rose-50/30 hover:border-rose-300"}`}
          />
          {search && (
            <button
              onClick={() => setSearchWithReset("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setCsvDialogOpen(true)} className="flex-1 sm:flex-none">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">CSV Import</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="flex-1 sm:flex-none">
            <Users className="mr-2 h-4 w-4 sm:hidden" />
            <span className="sm:hidden">Hinzufügen</span>
            <span className="hidden sm:inline">Teilnehmer hinzufügen</span>
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Select value={roleFilter} onValueChange={setRoleFilterWithReset}>
          <SelectTrigger className={`w-[120px] sm:w-[160px] transition-all ${roleFilter !== "all" ? "bg-violet-50 border-violet-300 text-violet-700" : "hover:bg-violet-50/50"}`}>
            <span className="flex items-center gap-2">
              <Users className={`h-4 w-4 hidden sm:block ${roleFilter !== "all" ? "text-violet-600" : "text-violet-400"}`} />
              <SelectValue placeholder="Rolle" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Rollen</SelectItem>
            <SelectItem value="REGULAR">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                Teilnehmer
              </span>
            </SelectItem>
            <SelectItem value="HELPER">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                Helfer
              </span>
            </SelectItem>
            <SelectItem value="ABI">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Abi
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilterWithReset}>
          <SelectTrigger className={`w-[110px] sm:w-[160px] transition-all ${paymentFilter !== "all" ? (paymentFilter === "paid" ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700") : "hover:bg-green-50/50"}`}>
            <span className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 hidden sm:block ${paymentFilter === "paid" ? "text-green-600" : paymentFilter === "unpaid" ? "text-red-500" : "text-green-400"}`} />
              <SelectValue placeholder="Bezahlung" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="paid">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Bezahlt
              </span>
            </SelectItem>
            <SelectItem value="unpaid">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Offen
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={roomFilter} onValueChange={setRoomFilterWithReset}>
          <SelectTrigger className={`w-[130px] sm:w-[190px] transition-all ${roomFilter !== "all" ? (roomFilter === "has-room" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-amber-50 border-amber-300 text-amber-700") : "hover:bg-indigo-50/50"}`}>
            <span className="flex items-center gap-2">
              <BedDouble className={`h-4 w-4 hidden sm:block ${roomFilter === "has-room" ? "text-indigo-600" : roomFilter === "no-room" ? "text-amber-600" : "text-indigo-400"}`} />
              <SelectValue placeholder="Zimmer" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Zimmer</SelectItem>
            <SelectItem value="no-room">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Ohne Zimmer
                {noRoomCount > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full font-medium ml-1">
                    {noRoomCount}
                  </span>
                )}
              </span>
            </SelectItem>
            <SelectItem value="has-room">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                Mit Zimmer
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Stadt und Land nur auf Desktop */}
        <Select value={cityFilter} onValueChange={setCityFilterWithReset}>
          <SelectTrigger className={`hidden md:flex w-[180px] transition-all ${cityFilter !== "all" ? "bg-blue-50 border-blue-300 text-blue-700" : "hover:bg-blue-50/50"}`}>
            <span className="flex items-center gap-2">
              <MapPin className={`h-4 w-4 ${cityFilter !== "all" ? "text-blue-600" : "text-blue-400"}`} />
              <SelectValue placeholder="Stadt" />
            </span>
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

        <Select value={countryFilter} onValueChange={setCountryFilterWithReset}>
          <SelectTrigger className={`hidden md:flex w-[170px] transition-all ${countryFilter !== "all" ? "bg-teal-50 border-teal-300 text-teal-700" : "hover:bg-teal-50/50"}`}>
            <span className="flex items-center gap-2">
              <MapPin className={`h-4 w-4 ${countryFilter !== "all" ? "text-teal-600" : "text-teal-400"}`} />
              <SelectValue placeholder="Land" />
            </span>
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

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            <X className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Filter zurücksetzen</span>
          </Button>
        )}

        <div className="w-full sm:w-auto sm:ml-auto text-sm text-muted-foreground text-center sm:text-right">
          {sortedParticipants.length} von {participants.length}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginatedParticipants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {search ? "Keine Teilnehmer gefunden." : "Noch keine Teilnehmer vorhanden."}
          </div>
        ) : (
          paginatedParticipants.map((participant) => (
            <div
              key={participant.id}
              className="rounded-xl border bg-card p-4 shadow-sm cursor-pointer active:bg-muted/50 transition-colors"
              onDoubleClick={() => setNotesParticipant(participant)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium shrink-0">
                    {participant.firstName[0]}
                    {participant.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {participant.lastName}, {participant.firstName}
                    </p>
                    {participant.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {participant.city}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setNotesParticipant(participant)}>
                      <StickyNote className="mr-2 h-4 w-4" />
                      Bemerkung
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingParticipant(participant)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAssigningRoom(participant)}>
                      <BedDouble className="mr-2 h-4 w-4" />
                      Zimmer zuweisen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePaymentToggle(participant)}>
                      <Euro className="mr-2 h-4 w-4" />
                      {participant.hasPaid ? "Zahlung zurücksetzen" : "Als bezahlt markieren"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCheckInToggle(participant)}>
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
                    <DropdownMenuItem onClick={() => handleDelete(participant.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {participant.room ? (
                  <Badge variant="outline" className="bg-primary/5 border-primary/20">
                    <BedDouble className="mr-1 h-3 w-3" />
                    {participant.room.name}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                    Ohne Zimmer
                  </Badge>
                )}
                <Badge variant={roleLabels[participant.role as ParticipantRole].variant}>
                  {roleLabels[participant.role as ParticipantRole].label}
                </Badge>
                {participant.hasPaid ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Bezahlt
                  </Badge>
                ) : (
                  <Badge variant="destructive">Offen</Badge>
                )}
                {participant.checkedIn && <Badge variant="secondary">Anwesend</Badge>}
              </div>
              {participant.notes && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  <StickyNote className="inline h-3.5 w-3.5 mr-1 text-amber-500" />
                  {participant.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border border-border/50 overflow-hidden shadow-md shadow-primary/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort("lastName")}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <User className="h-4 w-4" />
                  Nachname
                  {getSortIcon("lastName")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("firstName")}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <User className="h-4 w-4" />
                  Vorname
                  {getSortIcon("firstName")}
                </button>
              </TableHead>
              <TableHead>
                <span className="flex items-center gap-1.5">
                  <Cake className="h-4 w-4" />
                  Alter
                </span>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("city")}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  Stadt
                  {getSortIcon("city")}
                </button>
              </TableHead>
              <TableHead>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Aufenthalt
                </span>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("room")}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <BedDouble className="h-4 w-4" />
                  Zimmer
                  {getSortIcon("room")}
                </button>
              </TableHead>
              <TableHead>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Rolle
                </span>
              </TableHead>
              <TableHead>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  Status
                </span>
              </TableHead>
              <TableHead>
                <span className="flex items-center gap-1.5">
                  <StickyNote className="h-4 w-4" />
                  Bemerkung
                </span>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedParticipants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <p className="text-muted-foreground">
                    {search
                      ? "Keine Teilnehmer gefunden."
                      : "Noch keine Teilnehmer vorhanden."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedParticipants.map((participant) => (
                <TableRow
                  key={participant.id}
                  className="cursor-pointer"
                  onDoubleClick={() => setNotesParticipant(participant)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium shrink-0">
                        {participant.firstName[0]}
                        {participant.lastName[0]}
                      </div>
                      <span className="font-medium">{participant.lastName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{participant.firstName}</span>
                      {participant.phone && (
                        <span className="text-xs text-muted-foreground">
                          {participant.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const age = calculateAge(participant.birthDate);
                      return age !== null ? (
                        <div className="flex items-center gap-1.5">
                          <Cake className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{age}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {participant.city || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const stay = formatStayPeriod(participant.arrivalDate, participant.departureDate);
                      return stay ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{stay}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Gesamter Zeitraum</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {participant.room ? (
                      <Badge variant="outline" className="bg-primary/5 border-primary/20">
                        <BedDouble className="mr-1 h-3 w-3" />
                        {participant.room.name}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                        Ohne Zimmer
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleLabels[participant.role as ParticipantRole].variant}>
                      {roleLabels[participant.role as ParticipantRole].label}
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
                    {participant.notes ? (
                      <span className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                        {participant.notes}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">-</span>
                    )}
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
                          onClick={() => setNotesParticipant(participant)}
                        >
                          <StickyNote className="mr-2 h-4 w-4" />
                          Bemerkung
                        </DropdownMenuItem>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, sortedParticipants.length)} von {sortedParticipants.length}
          </div>
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hidden sm:flex"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-1 sm:mx-2">
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 3) {
                  pageNum = i + 1;
                } else if (currentPage <= 2) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 1) {
                  pageNum = totalPages - 2 + i;
                } else {
                  pageNum = currentPage - 1 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 ${currentPage === pageNum ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hidden sm:flex"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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

      <NotesDialog
        open={!!notesParticipant}
        onOpenChange={(open) => {
          if (!open) setNotesParticipant(null);
        }}
        participant={notesParticipant}
        onSuccess={() => {
          setNotesParticipant(null);
          onRefresh();
        }}
      />

      <CSVImportDialog
        open={csvDialogOpen}
        onOpenChange={setCsvDialogOpen}
        eventId={eventId}
        onSuccess={onRefresh}
      />
    </div>
  );
}
