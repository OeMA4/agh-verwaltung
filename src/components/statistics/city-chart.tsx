"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CityStatistic } from "@/types";
import { MapPin } from "lucide-react";

interface CityChartProps {
  data: CityStatistic[];
}

export function CityChart({ data }: CityChartProps) {
  const topCities = data.slice(0, 10);
  const total = data.reduce((sum, c) => sum + c.count, 0);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-400/15 via-gray-400/5 to-transparent opacity-60" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-2 rounded-xl bg-gray-400/15">
            <MapPin className="h-5 w-5 text-gray-600" />
          </div>
          Teilnehmer nach Stadt
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {topCities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Keine Daten vorhanden
          </p>
        ) : (
          <div className="space-y-3">
            {topCities.map((city, index) => (
              <div key={city.city} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <span className="text-xs bg-muted rounded-full w-5 h-5 flex items-center justify-center text-muted-foreground">{index + 1}</span>
                    {city.city}
                  </span>
                  <span className="text-muted-foreground font-medium">
                    {city.count} ({city.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={city.percentage} className="h-2" />
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
