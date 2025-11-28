"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Coffee, UtensilsCrossed, Moon, Play, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef, useMemo } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ScheduleItem {
  time: string;
  activity: string;
  isHighlight?: boolean;
  isParallel?: boolean;
  parallelNote?: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  title: string;
  items: ScheduleItem[];
}

const scheduleData: DaySchedule[] = [
  {
    date: "2025-12-22",
    dayName: "Pazartesi",
    title: "Mekana Giriş",
    items: [
      { time: "10:00 – 12:30", activity: "Oberwesel – Mekana giriş – Oda taksimatı – Çay/Simit ikramı" },
      { time: "12:45 – 13:15", activity: "Öğle Namazı", isHighlight: true },
      { time: "13:15 – 14:00", activity: "Açılış konuşması – Program hakkında bilgilendirme", isHighlight: true },
      { time: "14:30 – 15:00", activity: "İkindi Namazı", isHighlight: true },
      { time: "15:00 – 16:00", activity: "Şener Dilek Ağabey ile - Umumi Ders – 1", isHighlight: true },
      { time: "16:00 – 16:45", activity: "Çay ve çerez / Muhabbet-i İhvan" },
      { time: "16:45 – 17:15", activity: "Akşam Namazı", isHighlight: true },
      { time: "17:15 – 18:00", activity: "Hüseyin Yazıcı Hoca – Umumi Ders – 2", isHighlight: true },
      { time: "17:15 – 18:00", activity: "Şener Dilek Ağabey ile – Hizmet Tezekkürü (Ehli Hizmet)", isParallel: true, parallelNote: "Barla Salonu" },
      { time: "18:00 – 18:45", activity: "Akşam yemeği" },
      { time: "18:45 – 19:15", activity: "Teneffüs ve namaza hazırlık" },
      { time: "19:15 – 19:45", activity: "Yatsı Namazı", isHighlight: true },
      { time: "19:45 – 20:45", activity: "Şener Dilek Ağabey ile - Umumi Ders – 3", isHighlight: true },
      { time: "20:45 – 21:15", activity: "Çay ve çerez / Muhabbet-i İhvan" },
      { time: "21:15 – 22:15", activity: "Şener Dilek Ağabey ile - Umumi Ders – 4", isHighlight: true },
      { time: "22:15 – 22:45", activity: "Meyve ikramı / Muhabbet-i İhvan" },
      { time: "22:45 – 23:45", activity: "Ahmed Çolak Ağabey ile – Sorularla İslamiyet", isHighlight: true },
      { time: "00:00", activity: "Kapanış" },
    ],
  },
  {
    date: "2025-12-23",
    dayName: "Salı",
    title: "Ders Günü",
    items: [
      { time: "06:00", activity: "Teheccüd" },
      { time: "07:15", activity: "Kalkış ve abdest" },
      { time: "07:30 / 07:45", activity: "Sabah Ezanı / Sabah Namazı - \"FARZ'ına\" duruş", isHighlight: true },
      { time: "08:30 – 09:30", activity: "Cemaat ile şahsî okuma – 1", isHighlight: true },
      { time: "08:30 – 09:30", activity: "Gençler → Workshop odalarında (okuma / mütalaa) – 1", isParallel: true },
      { time: "09:30 – 10:15", activity: "Kahvaltı" },
      { time: "10:30 – 11:30", activity: "Cemaat ile şahsî okuma 2 / Workshop 2", isHighlight: true },
      { time: "11:30 – 11:45", activity: "Kısa teneffüs" },
      { time: "11:45 – 12:30", activity: "Şener Dilek Ağabey ile - Umumi Ders – 1", isHighlight: true },
      { time: "11:45 – 12:30", activity: "Gençler → Workshop odalarında (okuma / mütalaa) – 3", isParallel: true },
      { time: "12:30 – 12:45", activity: "Abdest molası" },
      { time: "12:45 – 13:15", activity: "Öğle Namazı", isHighlight: true },
      { time: "13:15 – 14:00", activity: "Cemaat ile şahsî okuma 3 / Workshop 4", isHighlight: true },
      { time: "14:00 – 14:30", activity: "Çay ve çerez / teneffüs" },
      { time: "14:30 – 15:00", activity: "İkindi Namazı", isHighlight: true },
      { time: "15:00 – 16:00", activity: "Şener Dilek Ağabey ile - Umumi Ders – 2 (tüm sınıflar dahil)", isHighlight: true },
      { time: "16:00 – 16:15", activity: "Abdest molası" },
      { time: "16:15 – 16:45", activity: "İhlas & Uhuvvet – dönerli okuma (tüm sınıflar)", isHighlight: true },
      { time: "16:45 – 17:15", activity: "Akşam Namazı", isHighlight: true },
      { time: "17:15 – 18:00", activity: "Ahmed Ç. / Bekir D. – Umumi Ders – 3 (tüm sınıflar dahil)", isHighlight: true },
      { time: "17:15 – 18:00", activity: "Şener Dilek Ağabey ile – Hizmet Tezekkürü (Ehli Hizmet)", isParallel: true, parallelNote: "Barla Salonu" },
      { time: "18:00 – 18:45", activity: "Akşam yemeği" },
      { time: "18:45 – 19:30", activity: "Teneffüs ve namaza hazırlık" },
      { time: "19:30 – 20:00", activity: "Yatsı Namazı", isHighlight: true },
      { time: "20:00 – 21:00", activity: "Şener Dilek Ağabey ile - Umumi Ders – 4", isHighlight: true },
      { time: "21:00 – 21:30", activity: "Çay ve çerez / Muhabbet-i İhvan" },
      { time: "21:30 – 22:30", activity: "Şener Dilek Ağabey ile - Umumi Ders – 5", isHighlight: true },
      { time: "22:30 – 23:00", activity: "Meyve ikramı / Muhabbet-i İhvan" },
      { time: "23:00 – 23:45", activity: "Ahmed Çolak Ağabey ile – Sorularla İslamiyet", isHighlight: true },
      { time: "00:00", activity: "Kapanış" },
    ],
  },
  {
    date: "2025-12-24",
    dayName: "Çarşamba",
    title: "Ders Günü",
    items: [
      { time: "06:00", activity: "Teheccüd" },
      { time: "07:15", activity: "Kalkış ve abdest" },
      { time: "07:30 / 07:45", activity: "Sabah Ezanı / Sabah Namazı - \"FARZ'ına\" duruş", isHighlight: true },
      { time: "08:30 – 09:30", activity: "Cemaat ile şahsî okuma – 1", isHighlight: true },
      { time: "08:30 – 09:30", activity: "Gençler → Workshop odalarında (okuma / mütalaa) – 1", isParallel: true },
      { time: "09:30 – 10:15", activity: "Kahvaltı" },
      { time: "10:30 – 11:30", activity: "Cemaat ile şahsî okuma 2 / Workshop 2", isHighlight: true },
      { time: "11:30 – 11:45", activity: "Kısa teneffüs" },
      { time: "11:45 – 12:30", activity: "Şener Dilek Ağabey ile - Umumi Ders – 1", isHighlight: true },
      { time: "11:45 – 12:30", activity: "Gençler → Workshop odalarında (okuma / mütalaa) – 3", isParallel: true },
      { time: "12:30 – 12:45", activity: "Abdest molası" },
      { time: "12:45 – 13:15", activity: "Öğle Namazı", isHighlight: true },
      { time: "13:15 – 14:00", activity: "Cemaat ile şahsî okuma 3 / Workshop 4", isHighlight: true },
      { time: "14:00 – 14:30", activity: "Çay ve çerez / teneffüs" },
      { time: "14:30 – 15:00", activity: "İkindi Namazı", isHighlight: true },
      { time: "15:00 – 16:00", activity: "Şener Dilek Ağabey ile - Umumi Ders – 2 (tüm sınıflar dahil)", isHighlight: true },
      { time: "16:00 – 16:15", activity: "Abdest molası" },
      { time: "16:15 – 16:45", activity: "İhlas & Uhuvvet – dönerli okuma (tüm sınıflar)", isHighlight: true },
      { time: "16:45 – 17:15", activity: "Akşam Namazı", isHighlight: true },
      { time: "17:15 – 18:00", activity: "Ahmed Ç. / Bekir D. – Umumi Ders – 3 (tüm sınıflar dahil)", isHighlight: true },
      { time: "17:15 – 18:00", activity: "Şener Dilek Ağabey ile – Hizmet Tezekkürü (Ehli Hizmet)", isParallel: true, parallelNote: "Barla Salonu" },
      { time: "18:00 – 18:45", activity: "Akşam yemeği" },
      { time: "18:45 – 19:30", activity: "Teneffüs ve namaza hazırlık" },
      { time: "19:30 – 20:00", activity: "Yatsı Namazı", isHighlight: true },
      { time: "20:00 – 21:00", activity: "Şener Dilek Ağabey ile - Umumi Ders – 4", isHighlight: true },
      { time: "21:00 – 21:30", activity: "Çay ve çerez / Muhabbet-i İhvan" },
      { time: "21:30 – 22:30", activity: "Şener Dilek Ağabey ile - Umumi Ders – 5", isHighlight: true },
      { time: "22:30 – 23:00", activity: "Meyve ikramı / Muhabbet-i İhvan" },
      { time: "23:00 – 23:45", activity: "Ahmed Çolak Ağabey ile – Sorularla İslamiyet", isHighlight: true },
      { time: "00:00", activity: "Kapanış" },
    ],
  },
  {
    date: "2025-12-25",
    dayName: "Perşembe",
    title: "Regaib Gecesi",
    items: [
      { time: "05:30 – 06:20", activity: "Sahur & Teheccüd", isHighlight: true },
      { time: "06:28", activity: "İmsak", isHighlight: true },
      { time: "06:45 – 07:15", activity: "Sabah Namazı", isHighlight: true },
      { time: "07:15 – 09:30", activity: "Dinlenme" },
      { time: "09:30 – 10:15", activity: "Kahvaltı (oruç tutamayanlar için küçük bir kahvaltı)" },
      { time: "10:30 – 11:30", activity: "Cemaat ile şahsî okuma 1 / Workshop 1", isHighlight: true },
      { time: "11:30 – 11:45", activity: "Kısa Teneffüs" },
      { time: "11:45 – 12:30", activity: "Şener Dilek Ağabey ile – Umumî Ders 1 / Workshop 2", isHighlight: true },
      { time: "12:30 – 12:45", activity: "Abdest molası" },
      { time: "12:45 – 13:15", activity: "Öğle Namazı", isHighlight: true },
      { time: "13:15 – 14:00", activity: "Cemaat ile şahsî okuma 2 / Workshop 3", isHighlight: true },
      { time: "14:00 – 14:30", activity: "Çay ve Teneffüs" },
      { time: "14:30 – 15:00", activity: "İkindi Namazı", isHighlight: true },
      { time: "15:00 – 16:00", activity: "Şener Dilek Ağabey ile – Umumî Ders 2", isHighlight: true },
      { time: "16:00 – 16:15", activity: "Abdest Molası" },
      { time: "16:15 – 16:45", activity: "İhlas & Uhuvvet – dönerli okuma", isHighlight: true },
      { time: "16:45 – 17:15", activity: "Akşam Namazı", isHighlight: true },
      { time: "17:15 – 18:00", activity: "İftar", isHighlight: true },
      { time: "18:00 – 18:45", activity: "Çay & Muhabbet" },
      { time: "18:45 – 19:00", activity: "Namaz hazırlığı" },
      { time: "19:00 – 19:30", activity: "Yatsı Namazı", isHighlight: true },
      { time: "19:30 – 20:30", activity: "Şener Dilek Ağabey ile – Umumî Ders 3", isHighlight: true },
      { time: "20:30 – 21:00", activity: "Çay & Muhabbet" },
      { time: "21:00 – 22:00", activity: "Şener Dilek Ağabey ile – Umumî Ders 4", isHighlight: true },
      { time: "22:00 – 22:30", activity: "Meyve ikramı" },
      { time: "22:30 – 00:00", activity: "Kur'an & Cevşen", isHighlight: true },
      { time: "00:00 – 00:30", activity: "Teneffüs" },
      { time: "00:30 – 01:00", activity: "Hizbul Hakaik 1 - Evrâd-ı Kudsiyye", isHighlight: true },
      { time: "01:00 – 01:30", activity: "Hizbul Hakaik 2 - Delâilin Nûr", isHighlight: true },
      { time: "01:30 – 02:00", activity: "Teneffüs" },
      { time: "02:00 – 03:00", activity: "Hizbul Hakaik 3 / Umumi Ders 5 / Münâcât Risalesi", isHighlight: true },
      { time: "03:00 – 03:15", activity: "Teneffüs" },
      { time: "03:15 – 04:00", activity: "Hizbul Hakaik 4 ve hâtime", isHighlight: true },
      { time: "04:00", activity: "Hatim ve şahsî ibadet", isHighlight: true },
      { time: "05:15", activity: "Hatim duâsı", isHighlight: true },
      { time: "05:30", activity: "Sahur", isHighlight: true },
      { time: "06:30", activity: "İmsak ve Sabah Namazı", isHighlight: true },
    ],
  },
  {
    date: "2025-12-26",
    dayName: "Cuma",
    title: "Kapanış Günü",
    items: [
      { time: "12:00", activity: "Kalkış ve toplanma" },
      { time: "13:00", activity: "Cuma Namazı", isHighlight: true },
      { time: "13:30 – 14:30", activity: "Şener Dilek Ağabey ile - Umumi Ders – 1", isHighlight: true },
      { time: "14:30 – 15:00", activity: "İkindi Namazı", isHighlight: true },
      { time: "15:00 – 15:45", activity: "Cemaat ile şahsî okuma 1 / Workshop 1", isHighlight: true },
      { time: "16:00 – 16:45", activity: "Şener Dilek Ağabey ile - Umumi Ders – 2 / Workshop 2", isHighlight: true },
      { time: "16:45 – 17:15", activity: "Akşam Namazı", isHighlight: true },
      { time: "17:15 – 18:00", activity: "İftar", isHighlight: true },
      { time: "18:00 – 18:45", activity: "Çay & Muhabbet" },
      { time: "18:45 – 19:00", activity: "Namaz hazırlığı" },
      { time: "19:00 – 19:30", activity: "Yatsı Namazı", isHighlight: true },
      { time: "19:30 – 20:30", activity: "Şener Dilek Ağabey ile – Umumî Ders 3", isHighlight: true },
      { time: "20:30 – 21:00", activity: "Çay & Muhabbet" },
      { time: "21:00", activity: "Kapanış", isHighlight: true },
    ],
  },
];

function isToday(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
}

function getCurrentScheduleIndex(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < scheduleData.length; i++) {
    const scheduleDate = new Date(scheduleData[i].date);
    scheduleDate.setHours(0, 0, 0, 0);

    if (scheduleDate.getTime() === today.getTime()) {
      return i;
    }
  }

  // Wenn heute nicht im Programm ist, zeige den nächsten kommenden Tag
  for (let i = 0; i < scheduleData.length; i++) {
    const scheduleDate = new Date(scheduleData[i].date);
    scheduleDate.setHours(0, 0, 0, 0);

    if (scheduleDate > today) {
      return i;
    }
  }

  // Wenn alle Tage vorbei sind, zeige den letzten Tag
  return scheduleData.length - 1;
}

function parseTime(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

function getCurrentActivityIndex(items: ScheduleItem[]): number {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // Parse start time - handle both "10:00" and "10:00 – 11:00" formats
    const timeParts = item.time.split(/\s*[–-]\s*/);
    const startTime = parseTime(timeParts[0]);

    let endTime: number;
    if (timeParts.length > 1) {
      endTime = parseTime(timeParts[1]);
    } else {
      // Single time entry - use next non-parallel item's start time as end
      const nextItem = items.find((it, idx) => idx > i && !it.isParallel);
      if (nextItem) {
        endTime = parseTime(nextItem.time.split(/\s*[–-]\s*/)[0]);
      } else {
        endTime = 24 * 60;
      }
    }

    // Handle midnight crossing
    if (endTime < startTime) {
      if (currentMinutes >= startTime || currentMinutes < endTime) {
        return i;
      }
    } else {
      if (currentMinutes >= startTime && currentMinutes < endTime) {
        return i;
      }
    }
  }

  return -1;
}

const typeIcons = {
  prayer: Moon,
  lesson: BookOpen,
  break: Coffee,
  meal: UtensilsCrossed,
  other: Clock,
};

function getActivityType(activity: string): keyof typeof typeIcons {
  const lowerActivity = activity.toLowerCase();
  if (lowerActivity.includes("namaz") || lowerActivity.includes("teheccüd") || lowerActivity.includes("imsak") || lowerActivity.includes("ezan")) {
    return "prayer";
  }
  if (lowerActivity.includes("ders") || lowerActivity.includes("okuma") || lowerActivity.includes("workshop") || lowerActivity.includes("hizbul") || lowerActivity.includes("ihlas") || lowerActivity.includes("kur'an") || lowerActivity.includes("cevşen") || lowerActivity.includes("hatim")) {
    return "lesson";
  }
  if (lowerActivity.includes("kahvalt") || lowerActivity.includes("yemek") || lowerActivity.includes("iftar") || lowerActivity.includes("sahur") || lowerActivity.includes("meyve")) {
    return "meal";
  }
  if (lowerActivity.includes("teneffüs") || lowerActivity.includes("mola") || lowerActivity.includes("çay") || lowerActivity.includes("muhabbet") || lowerActivity.includes("dinlenme")) {
    return "break";
  }
  return "other";
}

const typeConfig = {
  prayer: {
    bg: "bg-primary/10",
    border: "border-l-primary",
    text: "text-primary",
    activeBg: "bg-primary",
  },
  lesson: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-l-blue-500",
    text: "text-blue-600",
    activeBg: "bg-blue-500",
  },
  break: {
    bg: "bg-gray-100 dark:bg-gray-800/50",
    border: "border-l-gray-400",
    text: "text-gray-500",
    activeBg: "bg-gray-500",
  },
  meal: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-l-amber-500",
    text: "text-amber-600",
    activeBg: "bg-amber-500",
  },
  other: {
    bg: "bg-gray-50 dark:bg-gray-800/30",
    border: "border-l-gray-300",
    text: "text-gray-500",
    activeBg: "bg-gray-400",
  },
};

export function DailySchedule() {
  const initialIndex = useMemo(() => getCurrentScheduleIndex(), []);
  const [currentDayIndex, setCurrentDayIndex] = useState(initialIndex);
  const [currentTime, setCurrentTime] = useState<string>("");
  const activeItemRef = useRef<HTMLDivElement>(null);

  const currentSchedule = scheduleData[currentDayIndex];
  const isTodaySchedule = isToday(currentSchedule.date);

  const [currentActivityIdx, setCurrentActivityIdx] = useState(-1);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }));

      if (isTodaySchedule) {
        setCurrentActivityIdx(getCurrentActivityIndex(currentSchedule.items));
      } else {
        setCurrentActivityIdx(-1);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [currentSchedule, isTodaySchedule]);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentActivityIdx, currentDayIndex]);

  const formattedDate = useMemo(() => {
    const date = new Date(currentSchedule.date);
    return format(date, "EEEE, d. MMMM yyyy", { locale: de });
  }, [currentSchedule.date]);

  const currentActivity = currentActivityIdx >= 0 ? currentSchedule.items[currentActivityIdx] : null;
  const currentType = currentActivity ? getActivityType(currentActivity.activity) : null;
  const activeConfig = currentType ? typeConfig[currentType] : null;
  const ActiveIcon = currentType ? typeIcons[currentType] : null;

  return (
    <Card className="col-span-full">
      {/* Current Activity Banner - nur wenn heute */}
      {isTodaySchedule && currentActivity && activeConfig && ActiveIcon && (
        <div className={cn(
          "mx-6 mt-6 mb-2 p-4 rounded-2xl flex items-center gap-4",
          activeConfig.activeBg
        )}>
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <ActiveIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                Jetzt aktiv
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            </div>
            <p className="text-lg font-bold mt-0.5 text-white">
              {currentActivity.activity}
            </p>
            <p className="text-sm text-white/80 mt-0.5">
              {currentActivity.time}
            </p>
          </div>
          <div className="text-right text-white">
            <p className="text-3xl font-bold">{currentTime}</p>
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Tagesplan</CardTitle>
            {isTodaySchedule && (
              <Badge variant="default" className="ml-2">Heute</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDayIndex(currentDayIndex - 1)}
              disabled={currentDayIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDayIndex(currentDayIndex + 1)}
              disabled={currentDayIndex === scheduleData.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day info */}
        <div className="mt-2">
          <p className="text-sm font-medium text-primary">
            {currentSchedule.dayName} – {currentSchedule.title}
          </p>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>

        {/* Day navigation buttons */}
        <div className="flex gap-1 mt-3 flex-wrap">
          {scheduleData.map((day, index) => (
            <Button
              key={day.date}
              variant={index === currentDayIndex ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 px-2 text-xs",
                isToday(day.date) && index !== currentDayIndex && "border-primary"
              )}
              onClick={() => setCurrentDayIndex(index)}
            >
              {day.dayName.slice(0, 3)}
              {isToday(day.date) && (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-green-400" />
              )}
            </Button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(typeConfig).map(([key, config]) => {
            const Icon = typeIcons[key as keyof typeof typeIcons];
            const labels: Record<string, string> = {
              prayer: "Namaz",
              lesson: "Ders",
              break: "Mola",
              meal: "Yemek",
              other: "Diğer",
            };
            return (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                <Icon className={cn("h-3 w-3", config.text)} />
                <span className="text-muted-foreground">{labels[key]}</span>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-1 max-h-[500px] overflow-y-auto overflow-x-hidden pr-2">
          {currentSchedule.items.map((item, index) => {
            const type = getActivityType(item.activity);
            const config = typeConfig[type];
            const Icon = typeIcons[type];
            const isActive = isTodaySchedule && currentActivityIdx === index;

            return (
              <div
                key={index}
                ref={isActive ? activeItemRef : null}
                className={cn(
                  "flex items-start gap-3 py-2.5 px-3 rounded-xl border-l-4 transition-all",
                  item.isParallel ? "ml-6 bg-amber-50/50 border-l-amber-400" : config.bg,
                  !item.isParallel && config.border,
                  isActive && "ring-2 ring-primary ring-offset-2 shadow-lg"
                )}
              >
                <div className="w-[100px] shrink-0 flex items-center gap-2">
                  {isActive && (
                    <Play className="h-3 w-3 shrink-0 text-primary fill-primary animate-pulse" />
                  )}
                  <Icon className={cn("h-4 w-4 shrink-0", item.isParallel ? "text-amber-600" : config.text)} />
                  <span className={cn(
                    "text-xs font-mono",
                    isActive ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    {item.time}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "text-sm",
                    item.isHighlight ? "font-medium" : "",
                    isActive && "text-primary font-semibold"
                  )}>
                    {item.isParallel && <span className="text-amber-600 mr-1">↳</span>}
                    {item.activity}
                  </span>
                  {item.parallelNote && (
                    <p className="text-xs text-amber-600 mt-0.5">
                      {item.parallelNote}
                    </p>
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
