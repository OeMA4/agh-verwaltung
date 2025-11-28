"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PaymentStatistic } from "@/types";
import { Euro, CheckCircle, Clock } from "lucide-react";

interface PaymentOverviewProps {
  data: PaymentStatistic;
}

export function PaymentOverview({ data }: PaymentOverviewProps) {
  const total = data.paid + data.unpaid;
  const paidPercentage = total > 0 ? (data.paid / total) * 100 : 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent opacity-60" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-2 rounded-xl bg-emerald-500/15">
            <Euro className="h-5 w-5 text-emerald-600" />
          </div>
          Zahlungsübersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="font-medium">
              {data.paid} von {total} ({paidPercentage.toFixed(0)}%)
            </span>
          </div>
          <Progress value={paidPercentage} className="h-2.5 [&>div]:bg-emerald-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200/50 bg-emerald-50/80 p-4 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/15">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{data.paid}</p>
              <p className="text-xs text-emerald-600 font-medium">Bezahlt</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-amber-200/50 bg-amber-50/80 p-4 shadow-sm">
            <div className="p-2 rounded-lg bg-amber-500/15">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{data.unpaid}</p>
              <p className="text-xs text-amber-600 font-medium">Ausstehend</p>
            </div>
          </div>
        </div>

        {data.totalAmount > 0 && (
          <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/10 p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {data.totalAmount.toFixed(2)} EUR
            </p>
            <p className="text-xs text-muted-foreground font-medium">Gesamteinnahmen</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
