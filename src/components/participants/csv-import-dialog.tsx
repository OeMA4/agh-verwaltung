"use client";

import { useState, useRef, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  User,
  MapPin,
  Calendar,
  Users,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
} from "lucide-react";
import { importParticipantsFromData } from "@/lib/actions/participants";
import * as XLSX from "xlsx";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onSuccess: () => void;
}

type ImportMode = "add" | "replace";
type Step = "upload" | "preview" | "result";

interface ImportResult {
  added: number;
  skipped: number;
  errors: string[];
}

interface ParsedParticipant {
  firstName: string;
  lastName: string;
  age: number | null;
  city: string | null;
  phone: string | null;
  arrivalDate: string | null;
  departureDate: string | null;
  notes: string | null;
  role: "REGULAR" | "HELPER" | "ABI";
  isValid: boolean;
  error?: string;
  lineNumber: number;
}

export function CSVImportDialog({
  open,
  onOpenChange,
  eventId,
  onSuccess,
}: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<unknown[][]>([]);
  const [mode, setMode] = useState<ImportMode>("add");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setRawData([]);
    setMode("add");
    setStep("upload");
    setResult(null);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Detect column indices based on header row
  const detectColumnMapping = (headers: string[]): Record<string, number> => {
    const mapping: Record<string, number> = {};

    // Normalize Turkish characters for comparison
    const normalizeTurkish = (str: string): string => {
      return str
        .toLowerCase()
        .normalize("NFD") // Decompose characters
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/ı/g, "i") // Turkish dotless i
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/\r?\n/g, "")
        .trim();
    };

    headers.forEach((header, index) => {
      const h = normalizeTurkish((header || "").toString());

      // Turkish mappings (normalized)
      // IMPORTANT: Check "soyisminiz" BEFORE "isminiz" because "soyisminiz" contains "isminiz"
      if (h.includes("soyisminiz") || h === "soyisim" || h === "soyad") {
        mapping.lastName = index;
      } else if (h.includes("isminiz") || h === "isim" || h === "ad") {
        mapping.firstName = index;
      } else if (h.includes("yas") || h.includes("yasiniz")) {
        mapping.age = index;
      } else if (h.includes("sehir") || h.includes("hangi sehirden")) {
        mapping.city = index;
      } else if (h.includes("telefon")) {
        mapping.phone = index;
      } else if (h.includes("hangi geceler") || h.includes("konaklayacak")) {
        mapping.stay = index;
      } else if (h.includes("taleb") || h.includes("istek") || h.includes("baska")) {
        mapping.notes = index;
      }
      // German mappings
      else if (h === "vorname") {
        mapping.firstName = index;
      } else if (h === "nachname") {
        mapping.lastName = index;
      } else if (h === "alter") {
        mapping.age = index;
      } else if (h === "stadt" || h === "ort") {
        mapping.city = index;
      } else if (h === "aufenthalt") {
        mapping.stay = index;
      } else if (h === "rolle") {
        mapping.role = index;
      } else if (h === "bemerkungen" || h === "notizen") {
        mapping.notes = index;
      }
    });

    return mapping;
  };

  // Parse multiple dates from string like "22.12.2025;23.12.2025;24.12.2025;"
  const parseMultipleDates = (stayStr: string): { arrival: string | null; departure: string | null } => {
    if (!stayStr || stayStr.trim() === "") {
      return { arrival: null, departure: null };
    }

    // Split by semicolon and filter out empty strings
    const dates = stayStr.split(";").map(d => d.trim()).filter(Boolean);

    if (dates.length === 0) {
      return { arrival: null, departure: null };
    }

    // Sort dates to find first and last
    const parsedDates = dates.map(d => {
      const match = d.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})?$/);
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = match[3] ? parseInt(match[3], 10) : 2025;
        return { day, month, year, original: d };
      }
      return null;
    }).filter(Boolean) as { day: number; month: number; year: number; original: string }[];

    if (parsedDates.length === 0) {
      return { arrival: null, departure: null };
    }

    // Sort by date
    parsedDates.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });

    const first = parsedDates[0];
    const last = parsedDates[parsedDates.length - 1];

    return {
      arrival: `${first.day.toString().padStart(2, "0")}.${first.month.toString().padStart(2, "0")}.`,
      departure: `${last.day.toString().padStart(2, "0")}.${last.month.toString().padStart(2, "0")}.`,
    };
  };

  // Parse stay period in format "22.12-26.12"
  const parseStayRange = (stayStr: string): { arrival: string | null; departure: string | null } => {
    if (!stayStr || stayStr.trim() === "") {
      return { arrival: null, departure: null };
    }
    const parts = stayStr.split(/\s*[-–]\s*/);
    if (parts.length === 2) {
      const parseSimpleDate = (d: string) => {
        const match = d.match(/^(\d{1,2})\.(\d{1,2})\.?$/);
        if (match) {
          return `${match[1].padStart(2, "0")}.${match[2].padStart(2, "0")}.`;
        }
        return null;
      };
      return {
        arrival: parseSimpleDate(parts[0]),
        departure: parseSimpleDate(parts[1]),
      };
    }
    return { arrival: null, departure: null };
  };

  const mapRole = (roleStr: string): "REGULAR" | "HELPER" | "ABI" => {
    const role = (roleStr || "").toUpperCase().trim();
    if (role === "HELPER" || role === "HELFER") return "HELPER";
    if (role === "ABI") return "ABI";
    return "REGULAR";
  };

  const parsedData = useMemo((): ParsedParticipant[] => {
    if (rawData.length === 0) return [];

    const headers = rawData[0] as string[];
    const columnMapping = detectColumnMapping(headers);

    // Check if we have the required columns
    const hasFirstName = columnMapping.firstName !== undefined;
    const hasLastName = columnMapping.lastName !== undefined;

    // If no Turkish/German headers detected, fall back to positional mapping
    const usePositional = !hasFirstName && !hasLastName;

    const participants: ParsedParticipant[] = [];

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i] as (string | number | null | undefined)[];
      const lineNum = i + 1;

      try {
        let firstName: string;
        let lastName: string;
        let ageVal: string | number | null | undefined;
        let city: string | null;
        let phone: string | null;
        let stayStr: string;
        let roleStr: string;
        let notes: string | null;

        if (usePositional) {
          // Fallback: Positional mapping (old CSV format)
          firstName = String(row[0] || "").trim();
          lastName = String(row[1] || "").trim();
          ageVal = row[2];
          city = row[3] ? String(row[3]).trim() : null;
          phone = null;
          stayStr = String(row[4] || "");
          roleStr = String(row[5] || "REGULAR");
          notes = null;
        } else {
          // Use detected column mapping
          firstName = columnMapping.firstName !== undefined ? String(row[columnMapping.firstName] || "").trim() : "";
          lastName = columnMapping.lastName !== undefined ? String(row[columnMapping.lastName] || "").trim() : "";
          ageVal = columnMapping.age !== undefined ? row[columnMapping.age] : null;
          city = columnMapping.city !== undefined && row[columnMapping.city] ? String(row[columnMapping.city]).trim() : null;
          phone = columnMapping.phone !== undefined && row[columnMapping.phone] ? String(row[columnMapping.phone]).trim() : null;
          stayStr = columnMapping.stay !== undefined ? String(row[columnMapping.stay] || "") : "";
          roleStr = columnMapping.role !== undefined ? String(row[columnMapping.role] || "REGULAR") : "REGULAR";
          notes = columnMapping.notes !== undefined && row[columnMapping.notes] ? String(row[columnMapping.notes]).trim() : null;
        }

        let isValid = true;
        let error: string | undefined;

        if (!firstName || !lastName) {
          isValid = false;
          error = "Vor- oder Nachname fehlt";
        }

        let age: number | null = null;
        if (ageVal !== null && ageVal !== undefined && ageVal !== "") {
          age = typeof ageVal === "number" ? ageVal : parseInt(String(ageVal), 10);
          if (isNaN(age) || age < 0 || age > 120) {
            isValid = false;
            error = "Ungültiges Alter";
            age = null;
          }
        }

        // Try parsing as multiple dates first (Turkish format), then as range
        let stayResult = parseMultipleDates(stayStr);
        if (!stayResult.arrival && !stayResult.departure) {
          stayResult = parseStayRange(stayStr);
        }

        const role = mapRole(roleStr);

        participants.push({
          firstName,
          lastName,
          age,
          city,
          phone,
          arrivalDate: stayResult.arrival,
          departureDate: stayResult.departure,
          notes,
          role,
          isValid,
          error,
          lineNumber: lineNum,
        });
      } catch {
        participants.push({
          firstName: "",
          lastName: "",
          age: null,
          city: null,
          phone: null,
          arrivalDate: null,
          departureDate: null,
          notes: null,
          role: "REGULAR",
          isValid: false,
          error: "Parsing-Fehler",
          lineNumber: lineNum,
        });
      }
    }

    return participants;
  }, [rawData]);

  const validCount = parsedData.filter((p) => p.isValid).length;
  const invalidCount = parsedData.filter((p) => !p.isValid).length;

  // Shared file processing function for both input and drag & drop
  const processFile = (selectedFile: File) => {
    const isCSV = selectedFile.name.toLowerCase().endsWith(".csv");
    const isExcel = selectedFile.name.toLowerCase().endsWith(".xlsx") || selectedFile.name.toLowerCase().endsWith(".xls");

    if (!isCSV && !isExcel) {
      toast.error("Bitte eine CSV oder Excel-Datei auswählen");
      return;
    }

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (isExcel) {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
          setRawData(jsonData);
        } else {
          // CSV parsing
          const text = event.target?.result as string;
          const lines = text.split(/\r?\n/).filter(line => line.trim());
          const csvData = lines.map(line => {
            const result: string[] = [];
            let current = "";
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if ((char === "," || char === ";") && !inQuotes) {
                result.push(current.trim());
                current = "";
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          });
          setRawData(csvData);
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("Fehler beim Lesen der Datei");
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(selectedFile);
    } else {
      reader.readAsText(selectedFile, "UTF-8");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleContinueToPreview = () => {
    if (parsedData.length === 0) {
      toast.error("Keine Daten gefunden");
      return;
    }
    setStep("preview");
  };

  const handleBackToUpload = () => {
    setStep("upload");
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsLoading(true);

    try {
      // Convert parsed data to format expected by server action
      const validParticipants = parsedData
        .filter(p => p.isValid)
        .map(p => ({
          firstName: p.firstName,
          lastName: p.lastName,
          age: p.age,
          city: p.city,
          phone: p.phone,
          arrivalDate: p.arrivalDate,
          departureDate: p.departureDate,
          notes: p.notes,
          role: p.role,
        }));

      const importResult = await importParticipantsFromData(eventId, validParticipants, mode);

      setResult(importResult);
      setStep("result");

      if (importResult.added > 0) {
        toast.success(`${importResult.added} Teilnehmer importiert`);
        onSuccess();
      }

      if (importResult.skipped > 0) {
        toast.info(`${importResult.skipped} Teilnehmer übersprungen`);
      }

      if (importResult.errors.length > 0) {
        toast.error(`${importResult.errors.length} Fehler beim Import`);
      }
    } catch (error) {
      toast.error("Fehler beim Import");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Teilnehmer Import
            {step === "preview" && (
              <Badge variant="outline" className="ml-2">Vorschau</Badge>
            )}
            {step === "result" && (
              <Badge variant="default" className="ml-2 bg-green-500">Abgeschlossen</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Wähle eine CSV oder Excel-Datei zum Importieren"}
            {step === "preview" && "Überprüfe die geparsten Daten vor dem Import"}
            {step === "result" && "Import wurde durchgeführt"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <>
              {/* File Upload */}
              <div className="space-y-2">
                <Label>Datei auswählen (CSV oder Excel)</Label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/50 hover:bg-primary/5"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-3 text-primary">
                      <FileSpreadsheet className="h-10 w-10" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB • {parsedData.length} Einträge gefunden
                        </p>
                      </div>
                    </div>
                  ) : isDragging ? (
                    <div className="text-primary">
                      <Upload className="h-10 w-10 mx-auto mb-2 animate-bounce" />
                      <p className="font-medium">Datei hier ablegen</p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      <Upload className="h-10 w-10 mx-auto mb-2" />
                      <p className="font-medium">Klicken zum Auswählen</p>
                      <p className="text-sm mt-1">oder Datei hierher ziehen</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expected Format Info */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-sm">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-700 dark:text-blue-300">Unterstützte Formate:</p>
                    <p className="text-blue-600 dark:text-blue-400 mt-1 text-xs">
                      <strong>Türkisch:</strong> İsminiz, Soyisminiz, Yaşınız, Şehir, Telefon, Hangi geceler...
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 mt-1 text-xs">
                      <strong>Deutsch:</strong> Vorname, Nachname, Alter, Stadt, Aufenthalt, Rolle
                    </p>
                    <p className="text-blue-600/80 dark:text-blue-400/80 mt-1 text-xs">
                      Spalten werden automatisch erkannt
                    </p>
                  </div>
                </div>
              </div>

              {/* Import Mode Selection */}
              {file && (
                <div className="space-y-3">
                  <Label>Import-Modus</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMode("add")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        mode === "add"
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-muted hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className={`h-4 w-4 ${mode === "add" ? "text-primary" : "text-muted-foreground"}`} />
                        <p className="font-semibold text-sm">Hinzufügen</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Bestehende Daten behalten, nur neue hinzufügen. Duplikate werden übersprungen.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("replace")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        mode === "replace"
                          ? "border-destructive bg-destructive/5 shadow-sm"
                          : "border-muted hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`h-4 w-4 ${mode === "replace" ? "text-destructive" : "text-muted-foreground"}`} />
                        <p className={`font-semibold text-sm ${mode === "replace" ? "text-destructive" : ""}`}>Ersetzen</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Alle bestehenden Teilnehmer löschen und durch CSV-Daten ersetzen.
                      </p>
                    </button>
                  </div>
                  {mode === "replace" && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-xs text-destructive font-medium">
                        Achtung: Alle bestehenden Teilnehmer werden unwiderruflich gelöscht!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Stats */}
              {file && parsedData.length > 0 && (
                <div className="flex gap-3">
                  <div className="flex-1 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{validCount} gültig</span>
                    </div>
                  </div>
                  {invalidCount > 0 && (
                    <div className="flex-1 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">{invalidCount} ungültig</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Step 2: Preview */}
          {step === "preview" && (
            <>
              {/* Summary */}
              <div className="flex gap-3 flex-wrap">
                <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                  <Users className="h-3.5 w-3.5" />
                  {parsedData.length} Einträge
                </Badge>
                <Badge variant="outline" className="gap-1.5 py-1.5 px-3 bg-green-50 border-green-200 text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {validCount} gültig
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="outline" className="gap-1.5 py-1.5 px-3 bg-red-50 border-red-200 text-red-700">
                    <XCircle className="h-3.5 w-3.5" />
                    {invalidCount} ungültig
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                  Modus: {mode === "add" ? "Hinzufügen" : "Ersetzen"}
                </Badge>
              </div>

              {/* Parsed Data Table */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-3 py-2 border-b">
                  <p className="text-xs font-medium text-muted-foreground">
                    Geparste Daten - so werden sie importiert
                  </p>
                </div>
                <div className="max-h-[350px] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium text-xs">#</th>
                        <th className="px-2 py-2 text-left font-medium text-xs">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> Name
                          </span>
                        </th>
                        <th className="px-2 py-2 text-left font-medium text-xs">Alter</th>
                        <th className="px-2 py-2 text-left font-medium text-xs">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Stadt
                          </span>
                        </th>
                        <th className="px-2 py-2 text-left font-medium text-xs">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> Telefon
                          </span>
                        </th>
                        <th className="px-2 py-2 text-left font-medium text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Aufenthalt
                          </span>
                        </th>
                        <th className="px-2 py-2 text-left font-medium text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsedData.map((p, i) => (
                        <tr
                          key={i}
                          className={p.isValid ? "hover:bg-muted/30" : "bg-red-50/50 dark:bg-red-950/20"}
                        >
                          <td className="px-2 py-2 text-xs text-muted-foreground">{p.lineNumber}</td>
                          <td className="px-2 py-2">
                            {p.firstName || p.lastName ? (
                              <span className="font-medium">
                                {p.firstName} {p.lastName}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {p.age !== null ? p.age : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="px-2 py-2 text-xs">
                            {p.city || <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="px-2 py-2 text-xs">
                            {p.phone || <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="px-2 py-2 text-xs">
                            {p.arrivalDate && p.departureDate ? (
                              <span>{p.arrivalDate} - {p.departureDate}</span>
                            ) : (
                              <span className="text-muted-foreground">Gesamter Zeitraum</span>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {p.isValid ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="flex items-center gap-1">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-xs text-red-600">{p.error}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {invalidCount > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    {invalidCount} ungültige Einträge werden beim Import übersprungen.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Step 3: Result */}
          {step === "result" && result && (
            <div className="space-y-4">
              <div className="p-6 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-700">Import abgeschlossen</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{result.added}</p>
                  <p className="text-xs text-green-700">hinzugefügt</p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-600">{result.skipped}</p>
                  <p className="text-xs text-amber-700">übersprungen</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                  <p className="text-xs text-red-700">Fehler</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700 mb-2">Fehlerdetails:</p>
                  <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-3 sm:gap-3 border-t pt-4">
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Abbrechen
              </Button>
              <Button
                onClick={handleContinueToPreview}
                disabled={!file || parsedData.length === 0}
                className="w-full sm:w-auto"
              >
                Weiter zur Vorschau
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={handleBackToUpload} className="w-full sm:w-auto">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <Button
                onClick={handleImport}
                disabled={isLoading || validCount === 0}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {validCount} Teilnehmer importieren
              </Button>
            </>
          )}

          {step === "result" && (
            <Button onClick={handleClose} className="w-full sm:w-auto">
              Schließen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
