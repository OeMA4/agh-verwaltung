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
      iconBg: "bg-primary/15",
      textColor: "text-primary",
      icon: Users,
    },
    {
      label: "Helfer",
      count: data.helper,
      color: "bg-gray-500",
      borderColor: "border-gray-200/50",
      bgColor: "bg-gray-50/80",
      iconBg: "bg-gray-500/15",
      textColor: "text-gray-600",
      icon: HardHat,
    },
    {
      label: "Abi",
      count: data.abi,
      color: "bg-slate-500",
      borderColor: "border-slate-200/50",
      bgColor: "bg-slate-50/80",
      iconBg: "bg-slate-500/15",
      textColor: "text-slate-600",
      icon: GraduationCap,
    },
  ];

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent opacity-60" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          Rollenverteilung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        <div className="flex h-3 overflow-hidden rounded-full bg-muted/50 shadow-inner">
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
                className={`rounded-xl border ${role.borderColor} ${role.bgColor} p-4 text-center shadow-sm`}
              >
                <div className={`w-10 h-10 mx-auto mb-2 rounded-lg ${role.iconBg} flex items-center justify-center`}>
                  <role.icon className={`h-5 w-5 ${role.textColor}`} />
                </div>
                <p className={`text-2xl font-bold ${role.textColor}`}>
                  {role.count}
                </p>
                <p className={`text-xs font-medium ${role.textColor}`}>{role.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
