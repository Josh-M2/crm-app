"use client";

import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import AnimatedGradientBackground from "./AnimatedGradientBackground";

const typewriterPhrases = [
  "Capture every lead before the moment passes.",
  "Move opportunities forward without spreadsheet clutter.",
  "Keep sales, marketing, and support working from one view.",
  "Turn customer conversations into confident next steps.",
];

export default function HeroSection() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [letterCount, setLetterCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = typewriterPhrases[phraseIndex];
    const isPhraseComplete = letterCount === currentPhrase.length;
    const isPhraseCleared = letterCount === 0;
    const timeout = window.setTimeout(
      () => {
        if (!isDeleting && isPhraseComplete) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && isPhraseCleared) {
          setIsDeleting(false);
          setPhraseIndex((currentIndex) =>
            (currentIndex + 1) % typewriterPhrases.length
          );
          return;
        }

        setLetterCount((currentCount) =>
          currentCount + (isDeleting ? -1 : 1)
        );
      },
      isPhraseComplete && !isDeleting ? 1300 : isDeleting ? 36 : 58
    );

    return () => window.clearTimeout(timeout);
  }, [isDeleting, letterCount, phraseIndex]);

  const animatedPhrase = typewriterPhrases[phraseIndex].slice(0, letterCount);

  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6 py-28 text-center sm:px-8">
      <AnimatedGradientBackground />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <p className="mb-4 text-sm font-semibold text-black uppercase tracking-[0.24em]  [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
          CRM built for focused revenue teams
        </p>

        <h1 className="max-w-3xl text-5xl font-bold leading-tight text-black sm:text-6xl lg:text-7xl [text-shadow:0_4px_24px_rgba(0,0,0,0.45)]">
          LeadNest
        </h1>

        <p className="mt-6 flex min-h-[4rem] max-w-2xl items-center justify-center text-lg leading-8 text-black/80 sm:min-h-[2.5rem] sm:text-xl [text-shadow:0_2px_16px_rgba(0,0,0,0.3)]">
          <span>{animatedPhrase}</span>
          <span className="ml-1 inline-block h-6 w-[2px] animate-pulse bg-black/70" />
        </p>
        <div className="mt-10">
          <Button
            as="a"
            href="/dashboard"
            size="lg"
            className="bg-[#2563EB] px-8 py-3 text-white shadow-2xl shadow-[#2563EB]/30 transition duration-300 hover:bg-[#2563EB]/90"
          >
            Start free
          </Button>
        </div>
      </div>
    </section>
  );
}
