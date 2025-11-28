"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ParticipantWithRoom } from "@/types";

interface RecentActivityProps {
  participants: ParticipantWithRoom[];
}

const roleLabels = {
  REGULAR: { label: "Teilnehmer", variant: "secondary" as const },
  HELPER: { label: "Helfer", variant: "default" as const },
  ABI: { label: "Abi", variant: "outline" as const },
};

export function RecentActivity({ participants }: RecentActivityProps) {
  const recentParticipants = participants.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Zuletzt hinzugefügt</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentParticipants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Noch keine Teilnehmer vorhanden.
            </p>
          ) : (
            recentParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                    {participant.firstName[0]}
                    {participant.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {participant.firstName} {participant.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {participant.city || "Keine Stadt"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={roleLabels[participant.role as keyof typeof roleLabels].variant}>
                    {roleLabels[participant.role as keyof typeof roleLabels].label}
                  </Badge>
                  {participant.hasPaid ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Bezahlt
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Offen</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
