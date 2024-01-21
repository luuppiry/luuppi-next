'use client';
import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import './About.css';

export default function About() {
  const changingTextRef = useRef<HTMLSpanElement | null>(null);
  const studyAreas = useMemo(
    () => ['Computer Science', 'Data Analysis', 'Mathematics'],
    [],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const studyArea = changingTextRef.current;
      if (studyArea) {
        const currentText = studyArea.textContent;
        const currentIndex = studyAreas.indexOf(currentText || '');
        const nextIndex = (currentIndex + 1) % studyAreas.length;
        studyArea.style.transform = 'translateY(-100%)';
        studyArea.style.opacity = '0';
        setTimeout(() => {
          studyArea.textContent = studyAreas[nextIndex];
          studyArea.style.transform = 'translateY(0)';
          studyArea.style.opacity = '1';
        }, 100);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [studyAreas]);

  return (
    <section className="relative mx-auto flex max-w-screen-xl justify-center gap-8 px-4 pb-20 pt-28 max-xl:flex-col max-xl:gap-20 max-xl:overflow-x-hidden">
      <div className="flex w-1/2 flex-col max-xl:w-full">
        <h1 className="mb-8 max-w-3xl text-6xl font-extrabold leading-[4rem] max-md:text-4xl">
          Luuppi ry, connecting{' '}
          <span
            className="inline-block bg-gradient-to-r from-primary-400 to-text-300 bg-clip-text text-transparent transition-all duration-300"
            id="study-area"
            ref={changingTextRef}
          >
            {studyAreas[0]}
          </span>{' '}
          students since 1969.
        </h1>
        <p className="mb-8 text-xl">
          Luuppi ry is the student organization for computer science students at
          the University of Tampere. We are a non-profit organization that
          represents the students in the university&apos;s administration and
          offers a variety of services to our members.
        </p>
        <div>
          <button className="flex items-center rounded-lg bg-primary-400 px-4 py-2 text-xl font-bold text-white transition-all duration-300 max-md:text-xl">
            Read more
          </button>
        </div>
      </div>
      <div className="about-container relative flex w-1/2 max-xl:h-80 max-xl:w-full">
        <Image
          draggable={false}
          src="/luuppi-cards-01.svg"
          alt="Luuppi"
          layout="fill"
          className="about-image"
        />
      </div>
      <div
        className="bg-gradient-to-rC absolute left-0 top-1/3 -z-10 h-96 w-96 rounded-full bg-[#d4e1fc] blur-[200px]
  "
      ></div>
      <div
        className="about-pattern absolute -left-0 top-20 h-full w-full 
            
    "
      ></div>
    </section>
  );
}
