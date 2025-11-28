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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Teilnehmer nach Land
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                    <span>{countryFlags[country.country] || "🌍"}</span>
                    {country.country}
                  </span>
                  <span className="text-muted-foreground">
                    {country.count} ({country.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={country.percentage} />
              </div>
            ))}
            <div className="pt-2 border-t text-sm text-muted-foreground text-right">
              Gesamt: {total} Teilnehmer
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
