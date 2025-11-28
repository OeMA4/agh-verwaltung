"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoleStatistic } from "@/types";
import { Users, HardHat, GraduationCap } from "lucide-react";

interface RoleDistributionProps {
  data: RoleStatistic;
}

export function RoleDistribution({ data }: RoleDistributionProps) {
  const total = data.regular + data.helper + data.abi;

  const roles = [
    {
      label: "Teilnehmer",
      count: data.regular,
      color: "bg-primary",
      borderColor: "border-primary/20",
      bgColor: "bg-primary/5",
      textColor: "text-primary",
      icon: Users,
    },
    {
      label: "Helfer",
      count: data.helper,
      color: "bg-violet-500",
      borderColor: "border-violet-200",
      bgColor: "bg-violet-50/50",
      textColor: "text-violet-600",
      icon: HardHat,
    },
    {
      label: "Abi",
      count: data.abi,
      color: "bg-slate-500",
      borderColor: "border-slate-200",
      bgColor: "bg-slate-50/50",
      textColor: "text-slate-600",
      icon: GraduationCap,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Rollenverteilung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
          {roles.map((role) => {
            const percentage = total > 0 ? (role.count / total) * 100 : 0;
            if (percentage === 0) return null;
            return (
              <div
                key={role.label}
                className={`${role.color} transition-all first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${percentage}%` }}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {roles.map((role) => {
            const percentage = total > 0 ? ((role.count / total) * 100).toFixed(0) : 0;
            return (
              <div
                key={role.label}
                className={`rounded-lg border ${role.borderColor} ${role.bgColor} p-3 text-center`}
              >
                <role.icon className={`h-5 w-5 mx-auto mb-1 ${role.textColor}`} />
                <p className={`text-xl font-bold ${role.textColor}`}>
                  {role.count}
                </p>
                <p className={`text-xs ${role.textColor}`}>{role.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
