"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { RoomWithParticipants } from "@/types";

interface RoomOverviewProps {
  rooms: RoomWithParticipants[];
}

export function RoomOverview({ rooms }: RoomOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Zimmerübersicht</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Noch keine Zimmer angelegt.
            </p>
          ) : (
            rooms.slice(0, 6).map((room) => {
              const occupancy = room.participants.length;
              const percentage = (occupancy / room.capacity) * 100;
              const isFull = occupancy >= room.capacity;

              return (
                <div key={room.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{room.name}</span>
                      {room.floor !== null && (
                        <span className="text-xs text-muted-foreground">
                          Etage {room.floor}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {occupancy}/{room.capacity}
                      </span>
                      {isFull && (
                        <Badge variant="secondary" className="text-xs">
                          Voll
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className={isFull ? "[&>div]:bg-orange-500" : ""}
                  />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
