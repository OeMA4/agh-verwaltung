"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  Banknote,
  CreditCard,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

interface EventLight {
  id: string;
  name: string;
  year: number;
}

interface FinanceStats {
  total: number;
  paidCount: number;
  unpaidCount: number;
  paidPercentage: number;
  fullyPaidCount: number;
  partiallyPaidCount: number;
  paidWithoutAmountCount: number;
  totalPaidAmount: number;
  totalCashAmount: number;
  totalTransferAmount: number;
  totalUnknownAmount: number;
  cashCount: number;
  transferCount: number;
  unknownMethodCount: number;
  regularPaidCount: number;
  helperPaidCount: number;
  abiPaidCount: number;
  regularUnpaidCount: number;
  helperUnpaidCount: number;
  abiUnpaidCount: number;
  unpaidList: { id: string; name: string; role: string }[];
  partiallyPaidList: { id: string; name: string; amount: number; role: string }[];
  fullPaymentThreshold: number;
}

interface FinanzenContentProps {
  event: EventLight;
  stats: FinanceStats;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function getRoleBadgeColor(role: string) {
  switch (role) {
    case "HELPER":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "ABI":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "HELPER":
      return "Helfer";
    case "ABI":
      return "Abi-Gast";
    default:
      return "Teilnehmer";
  }
}

export function FinanzenContent({ event, stats }: FinanzenContentProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Finanzen
        </h1>
        <p className="text-muted-foreground mt-1">
          Finanzübersicht für {event.name}
        </p>
      </div>

      {/* Gesamtübersicht */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Gesamteinnahmen */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Gesamteinnahmen
            </CardTitle>
            <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(stats.totalPaidAmount)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              von {stats.paidCount} Teilnehmern
            </p>
          </CardContent>
        </Card>

        {/* Bezahlt */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Bezahlt
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {stats.paidCount} / {stats.total}
            </div>
            <Progress value={stats.paidPercentage} className="mt-2 h-2" />
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {stats.paidPercentage.toFixed(1)}% bezahlt
            </p>
          </CardContent>
        </Card>

        {/* Vollständig bezahlt */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Vollständig bezahlt
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {stats.fullyPaidCount}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              mind. {formatCurrency(stats.fullPaymentThreshold)}
            </p>
          </CardContent>
        </Card>

        {/* Unbezahlt */}
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
              Unbezahlt
            </CardTitle>
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800 dark:text-red-200">
              {stats.unpaidCount}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {stats.total > 0 ? ((stats.unpaidCount / stats.total) * 100).toFixed(1) : 0}% ausstehend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Zahlungsmethoden */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Barzahlung */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-600" />
              Barzahlung
            </CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              {stats.cashCount} Zahlungen
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(stats.totalCashAmount)}
            </div>
            {stats.paidCount > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Anteil Bar</span>
                  <span>{((stats.cashCount / stats.paidCount) * 100).toFixed(1)}%</span>
                </div>
                <Progress
                  value={(stats.cashCount / stats.paidCount) * 100}
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Überweisung */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Überweisung
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {stats.transferCount} Zahlungen
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(stats.totalTransferAmount)}
            </div>
            {stats.paidCount > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Anteil Überweisung</span>
                  <span>{((stats.transferCount / stats.paidCount) * 100).toFixed(1)}%</span>
                </div>
                <Progress
                  value={(stats.transferCount / stats.paidCount) * 100}
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zahlungsstatus nach Rolle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Zahlungsstatus nach Rolle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Reguläre Teilnehmer */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Teilnehmer</span>
                <Badge variant="outline">
                  {stats.regularPaidCount + stats.regularUnpaidCount}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">Bezahlt:</span>
                  <span className="font-medium">{stats.regularPaidCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Unbezahlt:</span>
                  <span className="font-medium">{stats.regularUnpaidCount}</span>
                </div>
              </div>
            </div>

            {/* Helfer */}
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-700 dark:text-purple-300">Helfer</span>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                  {stats.helperPaidCount + stats.helperUnpaidCount}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">Bezahlt:</span>
                  <span className="font-medium">{stats.helperPaidCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Unbezahlt:</span>
                  <span className="font-medium">{stats.helperUnpaidCount}</span>
                </div>
              </div>
            </div>

            {/* Abi-Gäste */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-amber-700 dark:text-amber-300">Abi-Gäste</span>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                  {stats.abiPaidCount + stats.abiUnpaidCount}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">Bezahlt:</span>
                  <span className="font-medium">{stats.abiPaidCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Unbezahlt:</span>
                  <span className="font-medium">{stats.abiUnpaidCount}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listen */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Unbezahlte Teilnehmer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <XCircle className="h-5 w-5" />
              Unbezahlt ({stats.unpaidList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.unpaidList.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Alle Teilnehmer haben bezahlt!
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {stats.unpaidList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950/20"
                  >
                    <span className="font-medium">{p.name}</span>
                    <Badge className={getRoleBadgeColor(p.role)} variant="secondary">
                      {getRoleLabel(p.role)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teilweise bezahlt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
              Teilweise bezahlt ({stats.partiallyPaidList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.partiallyPaidList.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Keine Teilzahlungen vorhanden
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {stats.partiallyPaidList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20"
                  >
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <p className="text-sm text-amber-600">
                        {formatCurrency(p.amount)} von {formatCurrency(stats.fullPaymentThreshold)}
                      </p>
                    </div>
                    <Badge className={getRoleBadgeColor(p.role)} variant="secondary">
                      {getRoleLabel(p.role)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hinweis für unbekannte Zahlungsmethoden */}
      {stats.unknownMethodCount > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {stats.unknownMethodCount} Zahlungen ohne Methode
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {formatCurrency(stats.totalUnknownAmount)} wurden ohne Angabe der Zahlungsmethode erfasst.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
