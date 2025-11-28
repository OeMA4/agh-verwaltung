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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Euro className="h-4 w-4 text-primary" />
          Zahlungsübersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="font-medium">
              {data.paid} von {total} ({paidPercentage.toFixed(0)}%)
            </span>
          </div>
          <Progress value={paidPercentage} className="h-2 [&>div]:bg-emerald-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-xl font-bold text-emerald-700">{data.paid}</p>
              <p className="text-xs text-emerald-600">Bezahlt</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-xl font-bold text-amber-700">{data.unpaid}</p>
              <p className="text-xs text-amber-600">Ausstehend</p>
            </div>
          </div>
        </div>

        {data.totalAmount > 0 && (
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
            <p className="text-xl font-bold text-primary">
              {data.totalAmount.toFixed(2)} EUR
            </p>
            <p className="text-xs text-muted-foreground">Gesamteinnahmen</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
