"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Banknote, CreditCard } from "lucide-react";
import type { ParticipantWithRoom, PaymentMethod } from "@/types";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: ParticipantWithRoom | null;
  onConfirm: (amount: number | undefined, method: PaymentMethod) => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  participant,
  onConfirm,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [amount, setAmount] = useState<string>("");

  const handleConfirm = () => {
    const parsedAmount = amount ? parseFloat(amount) : undefined;
    onConfirm(parsedAmount, paymentMethod);
    // Reset state
    setPaymentMethod("CASH");
    setAmount("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPaymentMethod("CASH");
      setAmount("");
    }
    onOpenChange(newOpen);
  };

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zahlung erfassen</DialogTitle>
          <DialogDescription>
            {participant.firstName} {participant.lastName} als bezahlt markieren
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label>Zahlungsmethode</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  paymentMethod === "CASH"
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                    : "border-muted hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className={`h-6 w-6 ${paymentMethod === "CASH" ? "text-green-600" : "text-muted-foreground"}`} />
                  <div>
                    <p className={`font-semibold ${paymentMethod === "CASH" ? "text-green-700" : ""}`}>Bar</p>
                    <p className="text-xs text-muted-foreground">Barzahlung</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("TRANSFER")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  paymentMethod === "TRANSFER"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-muted hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className={`h-6 w-6 ${paymentMethod === "TRANSFER" ? "text-blue-600" : "text-muted-foreground"}`} />
                  <div>
                    <p className={`font-semibold ${paymentMethod === "TRANSFER" ? "text-blue-700" : ""}`}>Überweisung</p>
                    <p className="text-xs text-muted-foreground">Banküberweisung</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Betrag (optional)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="z.B. 80"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleConfirm}>
            Als bezahlt markieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
