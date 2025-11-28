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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4 text-primary" />
          Teilnehmer nach Stadt
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                    <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                    {city.city}
                  </span>
                  <span className="text-muted-foreground">
                    {city.count} ({city.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={city.percentage} className="h-1.5" />
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
