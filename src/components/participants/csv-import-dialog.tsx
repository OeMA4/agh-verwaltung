"use client";

import { useState, useRef } from "react";
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
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { importParticipantsFromCSV } from "@/lib/actions/participants";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onSuccess: () => void;
}

type ImportMode = "add" | "replace";

interface ImportResult {
  added: number;
  skipped: number;
  errors: string[];
}

export function CSVImportDialog({
  open,
  onOpenChange,
  eventId,
  onSuccess,
}: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportMode>("add");
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string[][]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    setMode("add");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Bitte eine CSV-Datei auswählen");
      return;
    }

    setFile(selectedFile);
    setResult(null);

    // Preview first few rows
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      const rows = lines.slice(0, 6).map((line) => parseCSVLine(line));
      setPreview(rows);
    };
    reader.readAsText(selectedFile, "UTF-8");
  };

  const parseCSVLine = (line: string): string[] => {
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
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const importResult = await importParticipantsFromCSV(eventId, text, mode);

      setResult(importResult);

      if (importResult.added > 0) {
        toast.success(`${importResult.added} Teilnehmer importiert`);
        onSuccess();
      }

      if (importResult.skipped > 0) {
        toast.info(`${importResult.skipped} Teilnehmer übersprungen (bereits vorhanden)`);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            CSV Import
          </DialogTitle>
          <DialogDescription>
            Importiere Teilnehmer aus einer CSV-Datei
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>CSV-Datei auswählen</Label>
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <FileSpreadsheet className="h-8 w-8" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p>Klicken zum Auswählen</p>
                  <p className="text-xs mt-1">oder Datei hierher ziehen</p>
                </div>
              )}
            </div>
          </div>

          {/* Expected Format Info */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-sm">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-300">Erwartetes Format:</p>
                <p className="text-blue-600 dark:text-blue-400 mt-1 font-mono text-xs">
                  Vorname, Nachname, Alter, Stadt, Aufenthalt, Rolle
                </p>
                <p className="text-blue-600/80 dark:text-blue-400/80 mt-1 text-xs">
                  Rolle: REGULAR, HELPER oder ABI<br />
                  Aufenthalt: z.B. &quot;22.12-26.12&quot; oder leer für gesamten Zeitraum
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Vorschau (erste {Math.min(preview.length, 5)} Zeilen)</Label>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className={i === 0 ? "bg-muted font-medium" : ""}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-2 py-1.5 border-b whitespace-nowrap">
                            {cell || <span className="text-muted-foreground">-</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Mode */}
          {file && (
            <div className="space-y-3">
              <Label>Import-Modus</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("add")}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    mode === "add"
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  <p className="font-medium text-sm">Hinzufügen</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bestehende Daten behalten, nur neue hinzufügen
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("replace")}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    mode === "replace"
                      ? "border-destructive bg-destructive/5"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  <p className="font-medium text-sm text-destructive">Ersetzen</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Alle bestehenden Daten löschen
                  </p>
                </button>
              </div>
              {mode === "replace" && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">
                    Achtung: Alle bestehenden Teilnehmer werden unwiderruflich gelöscht!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <p className="font-medium text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Import abgeschlossen
              </p>
              <div className="text-sm space-y-1">
                <p className="text-green-600">{result.added} Teilnehmer hinzugefügt</p>
                {result.skipped > 0 && (
                  <p className="text-amber-600">{result.skipped} übersprungen (bereits vorhanden)</p>
                )}
                {result.errors.length > 0 && (
                  <div className="text-destructive">
                    <p>{result.errors.length} Fehler:</p>
                    <ul className="text-xs mt-1 list-disc list-inside max-h-20 overflow-y-auto">
                      {result.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>... und {result.errors.length - 5} weitere</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-3 sm:gap-3">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            {result ? "Schließen" : "Abbrechen"}
          </Button>
          {!result && (
            <Button
              onClick={handleImport}
              disabled={!file || isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Importieren
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
