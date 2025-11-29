"use client";

import { useState, useEffect } from "react";
import { Quote } from "lucide-react";

const quotes = [
  "Kur'an; kalplere kuvvet ve gıdadır, ruhlara şifadır.",
  "Kur'ân-ı Hakîmin eczane-i kutsiyetinde, umum dertlerinize şifa verecek ilâçları vardır.",
  "Beşerin âsâr ve kanunları değişiyor, fakat Kur'ân'ın hükümleri asırlar geçtikçe kuvvetini gösteriyor.",
  "Sünnet-i Seniye edeptir. Hiçbir meselesi yoktur ki, altında bir nur, bir edep bulunmasın!",
  "Sahabe, Peygamber'i tarif ederken 'Hulukuhu'l-Kur'ân' derlerdi: Kur'ân'ın ahlakının misalidir.",
  "Amelinizde rıza-yı İlâhî olmalı. Eğer O razı olsa, bütün dünya küssesi ehemmiyeti yok.",
  "Zaman gösterdi ki: Cennet ucuz değil, Cehennem dahi lüzumsuz değil.",
  "Ahirette seni kurtaracak bir eserin olmadığı takdirde, fâni dünyada bıraktığın eserlere kıymet verme.",
  "İman hem nurdur, hem kuvvettir. Hakikî imanı elde eden adam kâinata meydan okuyabilir.",
  "Sen 'Mesleğim haktır' demeye hakkın var, fakat 'Yalnız hak benim mesleğimdir' demeye hakkın yoktur.",
  "Dehşetli bir asırda insanın en büyük meselesi, imanını kurtarmak ya da kaybetmek davasıdır.",
  "Ey nefis! Takva ve amel-i sâlih ile Hâlıkını razı ettiysen, halkın rızasını tahsile lüzum yoktur.",
  "Her şey mânen 'Bismillâh' der. Allah nâmına nimetlerini veriyorlar. Biz dahi 'Bismillâh' demeliyiz.",
  "En bahtiyar odur ki, dünya için âhireti unutmasın, âhiretini dünyaya feda etmesin.",
  "İbadetin ruhu ihlastır. İhlas ise, yapılan ibadetin yalnız emredildiği için yapılmasıdır.",
  "Güzel gören, güzel düşünür. Güzel düşünen, hayatından lezzet alır.",
  "İnsan bir yolcudur. Sabavetten gençliğe, gençlikten ihtiyarlığa, kabirden haşre kadar yolculuk devam eder.",
  "Bütün ihtilallerin madeni bir kelimedir: 'Ben tok olayım; başkası açlıktan ölse bana ne!'",
  "'Sen çalış, ben yiyeyim.' Kur'ân bu kelimelerin esasını kalp eder, tedavi eder.",
  "Allah birdir. Başka şeylere müracaat edip yorulma. Sultan-ı Kâinat birdir.",
  "Mezaristana göçtüğünüz zaman feryad etmeyin. Herşeyiniz muhafaza ediliyor; ücret almaya gidiyorsunuz.",
];

const AUTHOR = "Said Nursi";
const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

function getQuoteIndex(): number {
  // Calculate which quote to show based on current time
  // This ensures the same quote is shown across page refreshes within the 15-min window
  const now = Date.now();
  const intervalNumber = Math.floor(now / INTERVAL_MS);
  return intervalNumber % quotes.length;
}

export function QuoteBanner() {
  const [currentIndex, setCurrentIndex] = useState(getQuoteIndex);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Update quote every 15 minutes
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex(getQuoteIndex());
        setIsVisible(true);
      }, 500);
    }, INTERVAL_MS);

    // Also check on mount in case the interval changed while away
    const checkInterval = setInterval(() => {
      const newIndex = getQuoteIndex();
      if (newIndex !== currentIndex) {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex(newIndex);
          setIsVisible(true);
        }, 500);
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(interval);
      clearInterval(checkInterval);
    };
  }, [currentIndex]);

  return (
    <div className="hidden lg:block relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 shadow-sm">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full -translate-x-16 -translate-y-16" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-orange-200/30 to-transparent rounded-full translate-x-12 translate-y-12" />

      {/* Content */}
      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Quote icon */}
          <div className="shrink-0 p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 backdrop-blur-sm">
            <Quote className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Quote text */}
          <div className="flex-1 min-w-0">
            <blockquote
              className={`text-sm sm:text-base text-amber-900/90 dark:text-amber-100/90 font-medium italic leading-relaxed transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
              }`}
            >
              &ldquo;{quotes[currentIndex]}&rdquo;
            </blockquote>

            {/* Author */}
            <div
              className={`mt-2 flex items-center gap-2 transition-all duration-500 delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-amber-300 to-transparent" />
              <span className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300">
                {AUTHOR}
              </span>
              <span className="text-[10px] sm:text-xs text-amber-600/70 dark:text-amber-400/70">
                Risale-i Nur
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
