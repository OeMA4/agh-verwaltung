"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, Coffee, UtensilsCrossed, Moon, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

interface ScheduleItem {
  time: string;
  activity: string;
  type: "prayer" | "lesson" | "break" | "meal" | "other";
  subItems?: string[];
}

const scheduleData: ScheduleItem[] = [
  { time: "06:00", activity: "Teheccüd", type: "prayer" },
  { time: "07:15", activity: "Kalkis ve abdest", type: "other" },
  { time: "07:30 - 08:15", activity: "Sabah Ezani - Sabah Namazi - \"FARZ'ina\" durus", type: "prayer" },
  {
    time: "08:30 - 09:30",
    activity: "Cemaat ile sahsi okuma - 1",
    type: "lesson",
    subItems: ["Gencler: Workshop odalarinda (okuma / mütalaa) - 1"]
  },
  { time: "09:30 - 10:15", activity: "Kahvalti", type: "meal" },
  {
    time: "10:30 - 11:30",
    activity: "Cemaat ile sahsi okuma - 2",
    type: "lesson",
    subItems: ["Gencler: Workshop odalarinda (okuma / mütalaa) - 2"]
  },
  { time: "11:30 - 11:45", activity: "Kisa teneffüs", type: "break" },
  {
    time: "11:45 - 12:45",
    activity: "Sener Dilek Agabey ile - Umumi Ders - 1",
    type: "lesson",
    subItems: ["Gencler: Workshop odalarinda (okuma / mütalaa) - 3"]
  },
  { time: "12:45 - 13:15", activity: "Ögle Namazi", type: "prayer" },
  {
    time: "13:15 - 14:00",
    activity: "Cemaat ile sahsi okuma - 3",
    type: "lesson",
    subItems: ["Gencler: Workshop odalarinda (okuma / mütalaa) - 4"]
  },
  { time: "14:00 - 14:30", activity: "Cay ve cerez / teneffüs", type: "break" },
  { time: "14:30 - 15:00", activity: "Ikindi Namazi", type: "prayer" },
  { time: "15:00 - 16:00", activity: "Sener Dilek Agabey ile - Umumi Ders - 2 (tüm siniflar dahil)", type: "lesson" },
  { time: "16:00 - 16:15", activity: "Abdest molasi", type: "break" },
  { time: "16:15 - 16:45", activity: "Ihlas & Uhuvvet - dönerli okuma (tüm siniflar)", type: "lesson" },
  { time: "16:45 - 17:15", activity: "Aksam Namazi", type: "prayer" },
  {
    time: "17:15 - 18:00",
    activity: "Burhan Sabaz / Bekir Dogan - Umumi Ders - 3",
    type: "lesson",
    subItems: ["Sener Dilek Agabey ile - Hizmet Tezekkürü (Ehli Hizmet - Barla Salonu)"]
  },
  { time: "18:00 - 18:45", activity: "Aksam yemegi", type: "meal" },
  { time: "18:45 - 19:30", activity: "Teneffüs ve namaza hazirlik", type: "break" },
  { time: "19:30 - 20:00", activity: "Yatsi Namazi", type: "prayer" },
  { time: "20:00 - 21:00", activity: "Sener Dilek Agabey ile - Umumi Ders - 4", type: "lesson" },
  { time: "21:00 - 21:30", activity: "Cay ve cerez / Muhabbet-i Ihvan", type: "break" },
  { time: "21:30 - 22:30", activity: "Sener Dilek Agabey ile - Umumi Ders - 5", type: "lesson" },
  { time: "22:30 - 23:00", activity: "Meyve ikrami / Muhabbet-i Ihvan", type: "break" },
  {
    time: "23:00 - 23:45",
    activity: "Burhan Sabaz Agabey ile - Sorularla Risale-i Nur",
    type: "lesson",
    subItems: ["(Pazartesi ve Sali)", "Ahmet Kaya Agabey ile - Canakkale (Carsamba)"]
  },
  { time: "00:00", activity: "Kapanis", type: "other" },
];

const typeConfig = {
  prayer: {
    icon: Moon,
    bg: "bg-primary/10",
    border: "border-l-primary",
    text: "text-primary",
    label: "Namaz",
    activeBg: "bg-primary",
    activeText: "text-white",
    dotColor: "bg-primary",
  },
  lesson: {
    icon: BookOpen,
    bg: "bg-primary/5",
    border: "border-l-primary/60",
    text: "text-primary/80",
    label: "Ders",
    activeBg: "bg-primary/90",
    activeText: "text-white",
    dotColor: "bg-primary/80",
  },
  break: {
    icon: Coffee,
    bg: "bg-gray-100 dark:bg-gray-800/50",
    border: "border-l-gray-400",
    text: "text-gray-600 dark:text-gray-400",
    label: "Mola",
    activeBg: "bg-gray-500",
    activeText: "text-white",
    dotColor: "bg-gray-500",
  },
  meal: {
    icon: UtensilsCrossed,
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-l-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    label: "Yemek",
    activeBg: "bg-amber-500",
    activeText: "text-white",
    dotColor: "bg-amber-500",
  },
  other: {
    icon: Clock,
    bg: "bg-gray-50 dark:bg-gray-800/30",
    border: "border-l-gray-300",
    text: "text-gray-500",
    label: "Diger",
    activeBg: "bg-gray-400",
    activeText: "text-white",
    dotColor: "bg-gray-400",
  },
};

function parseTime(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

function getCurrentActivity(): { item: ScheduleItem; index: number } | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < scheduleData.length; i++) {
    const item = scheduleData[i];
    const timeParts = item.time.split(" - ");
    const startTime = parseTime(timeParts[0]);

    let endTime: number;
    if (timeParts.length > 1) {
      endTime = parseTime(timeParts[1]);
    } else {
      // Single time entry - use next item's start time as end
      const nextItem = scheduleData[i + 1];
      if (nextItem) {
        endTime = parseTime(nextItem.time.split(" - ")[0]);
      } else {
        endTime = 24 * 60; // End of day
      }
    }

    // Handle midnight crossing (e.g., 23:00 - 00:00)
    if (endTime < startTime) {
      if (currentMinutes >= startTime || currentMinutes < endTime) {
        return { item, index: i };
      }
    } else {
      if (currentMinutes >= startTime && currentMinutes < endTime) {
        return { item, index: i };
      }
    }
  }

  return null;
}

export function DailySchedule() {
  const [currentActivity, setCurrentActivity] = useState<{ item: ScheduleItem; index: number } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateActivity = () => {
      setCurrentActivity(getCurrentActivity());
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }));
    };

    updateActivity();
    const interval = setInterval(updateActivity, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Scroll to active item after render
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentActivity]);

  const activeConfig = currentActivity ? typeConfig[currentActivity.item.type] : null;
  const ActiveIcon = activeConfig?.icon;

  return (
    <Card className="col-span-full">
      {/* Current Activity Banner */}
      {currentActivity && activeConfig && ActiveIcon && (
        <div className={cn(
          "mx-6 mt-6 mb-2 p-4 rounded-2xl flex items-center gap-4",
          activeConfig.activeBg
        )}>
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <ActiveIcon className={cn("h-6 w-6", activeConfig.activeText)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-semibold uppercase tracking-wider opacity-80", activeConfig.activeText)}>
                Jetzt aktiv
              </span>
              <div className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
              </div>
            </div>
            <p className={cn("text-lg font-bold mt-0.5", activeConfig.activeText)}>
              {currentActivity.item.activity}
            </p>
            <p className={cn("text-sm opacity-80 mt-0.5", activeConfig.activeText)}>
              {currentActivity.item.time} Uhr
            </p>
          </div>
          <div className={cn("text-right", activeConfig.activeText)}>
            <p className="text-3xl font-bold">{currentTime}</p>
            <p className="text-xs uppercase tracking-wider opacity-80">{activeConfig.label}</p>
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <span>Tagesplan</span>
          </CardTitle>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            Pazartesi - Persembe
          </span>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(typeConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <div className={cn("w-2.5 h-2.5 rounded-full", config.dotColor)} />
              <span className="text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 max-h-[500px] overflow-y-auto overflow-x-hidden">
          {scheduleData.map((item, index) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            const isActive = currentActivity?.index === index;
            return (
              <div
                key={index}
                ref={isActive ? activeItemRef : null}
                className={cn(
                  "flex items-start gap-4 py-3 px-4 rounded-xl border-l-4 transition-colors",
                  config.bg,
                  config.border,
                  isActive && "ring-2 ring-primary ring-offset-2 shadow-lg bg-primary/15"
                )}
              >
                <div className="w-24 shrink-0 flex items-center gap-2">
                  {isActive && (
                    <Play className="h-3 w-3 shrink-0 text-primary fill-primary animate-pulse" />
                  )}
                  <Icon className={cn("h-4 w-4 shrink-0", config.text)} />
                  <span className={cn("text-sm font-mono font-medium", isActive ? "text-primary font-bold" : "text-foreground/80")}>
                    {item.time}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn("text-sm font-medium", isActive && "text-primary font-semibold")}>{item.activity}</span>
                  {item.subItems && (
                    <div className="mt-1.5 space-y-1">
                      {item.subItems.map((sub, subIndex) => (
                        <p key={subIndex} className="text-xs text-muted-foreground pl-3 border-l-2 border-muted-foreground/20">
                          {sub}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
