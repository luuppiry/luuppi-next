'use client';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface HeroProps {
  dictionary: Dictionary;
  lang: SupportedLanguage;
}

export default function Hero({ dictionary, lang }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const studyAreas = useMemo(
    () => [
      dictionary.pages_home.hero.computer_science,
      dictionary.pages_home.hero.mathematics,
      dictionary.pages_home.hero.data_analysis,
    ],
    [dictionary],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % studyAreas.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [studyAreas.length]);

  return (
    <section className="relative mx-auto flex max-w-[1200px] justify-center gap-8 px-4 pb-20 pt-28 max-2xl:overflow-hidden max-xl:flex-col max-xl:gap-20 max-md:pt-20">
      <div className="flex w-1/2 flex-col max-xl:w-full">
        <h1 className="mb-8 max-w-3xl leading-[3.8rem] max-md:leading-[3rem]">
          {dictionary.pages_home.hero.title_1}{' '}
          <span className="inline-grid overflow-hidden align-bottom">
            {studyAreas.map((area, i) => (
              <span
                key={area}
                aria-hidden={i !== activeIndex}
                className={`col-start-1 row-start-1 whitespace-nowrap bg-gradient-to-r from-secondary-400 to-text-300 bg-clip-text text-transparent transition-all duration-300 dark:from-secondary-700 dark:to-text-800 ${
                  i === activeIndex
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-full opacity-0'
                }`}
              >
                {area}
              </span>
            ))}
          </span>{' '}
          {dictionary.pages_home.hero.title_2}
        </h1>
        <p className="mb-8 max-w-2xl text-lg max-md:text-base">
          {dictionary.pages_home.hero.description}
        </p>
        <div>
          <Link
            className="btn btn-primary text-lg max-md:text-base"
            href={`/${lang}/organization`}
          >
            {dictionary.pages_home.hero.read_more}
          </Link>
        </div>
      </div>
      <div className="luuppi-hero-container relative flex w-1/2 max-xl:h-80 max-xl:w-full">
        <div className="luuppi-hero-cards flex h-full w-[100vw] items-center justify-center max-xl:max-w-[450px] max-md:max-w-[400px] max-sm:max-w-[380px]">
          <object
            className="h-full w-full"
            data="/luuppi-cards.svg"
            type="image/svg+xml"
          />
        </div>
      </div>
      <div className="absolute left-0 top-1/3 -z-10 h-96 w-96 scale-150 rounded-full bg-[#d4e1fc] bg-gradient-to-r opacity-30 blur-2xl dark:bg-background-300" />
      <div className="luuppi-pattern absolute -left-48 top-0 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:top-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </section>
  );
}
