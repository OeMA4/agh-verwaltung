"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CountryStatistic } from "@/types";
import { Globe } from "lucide-react";

interface CountryChartProps {
  data: CountryStatistic[];
}

// Flaggen-Emoji für Länder
const countryFlags: Record<string, string> = {
  "Deutschland": "🇩🇪",
  "Niederlande": "🇳🇱",
  "Belgien": "🇧🇪",
  "Türkei": "🇹🇷",
  "Österreich": "🇦🇹",
  "Schweiz": "🇨🇭",
  "Unbekannt": "🌍",
};

export function CountryChart({ data }: CountryChartProps) {
  const total = data.reduce((sum, c) => sum + c.count, 0);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent opacity-60" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          Teilnehmer nach Land
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Keine Daten vorhanden
          </p>
        ) : (
          <div className="space-y-4">
            {data.map((country) => (
              <div key={country.country} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <span className="text-lg">{countryFlags[country.country] || "🌍"}</span>
                    {country.country}
                  </span>
                  <span className="text-muted-foreground font-medium">
                    {country.count} ({country.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={country.percentage} className="h-2" />
              </div>
            ))}
            <div className="pt-3 border-t text-sm text-muted-foreground text-right font-medium">
              Gesamt: {total} Teilnehmer
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
