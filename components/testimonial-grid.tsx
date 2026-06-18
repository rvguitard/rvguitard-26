"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  company: string;
};

const testimonials: Testimonial[] = [
  {
    quote: "“His reliability, technical expertise, and professionalism make him an invaluable partner.”",
    name: "Olivia Terceros, Business & Delivery Lead",
    company: "Frameworks & Co.",
  },
  {
    quote: "“It was an absolute pleasure to work with Rock”",
    name: "Ohad Tzur, Founder",
    company: "Kahoona",
  },
  {
    quote: "“Rock gets it done with hustle and integrity. The best part also is he does it with a smile.”",
    name: "Jimmy Cabral, Creative Director",
    company: "Qualified",
  },
  {
    quote: "“Rock consistently delivers polished, high-quality work with fast turnarounds and sharp communication.”",
    name: "Yonnas Tesfamariam, Sr. Partner Solutions Engineer",
    company: "Webflow",
  },
  {
    quote: "“Rock is extremely detail oriented and communicates with stakeholders flawlessly.”",
    name: "Todd Swain, Program Manager",
    company: "Qualified",
  },
  {
    quote: "“... the student has become the teacher”",
    name: "Nelson Abalos Jr., Founder",
    company: "PixelGeek, ThatOneCouple",
  },
];

const panelCount = 4;
const rotationDelay = 3200;
const fadeDelay = 320;
const panelStagger = 2400;

export function TestimonialGrid() {
  const [panelIndexes, setPanelIndexes] = useState(
    Array.from({ length: panelCount }, (_, panelIndex) => panelIndex),
  );
  const [fadingPanel, setFadingPanel] = useState<number | null>(null);

  useEffect(() => {
    let activePanel = 0;
    const timers: number[] = [];

    const rotatePanel = () => {
      const panelToRotate = activePanel;
      activePanel = (activePanel + 1) % panelCount;

      setFadingPanel(panelToRotate);

      const swapTimer = window.setTimeout(() => {
        setPanelIndexes((currentIndexes) => {
          const nextIndexes = [...currentIndexes];
          nextIndexes[panelToRotate] = (nextIndexes[panelToRotate] + panelCount) % testimonials.length;
          return nextIndexes;
        });
        setFadingPanel(null);
      }, fadeDelay);

      timers.push(swapTimer);
    };

    const startTimer = window.setTimeout(() => {
      rotatePanel();
      timers.push(window.setInterval(rotatePanel, panelStagger));
    }, rotationDelay);

    return () => {
      window.clearTimeout(startTimer);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="testimonial-grid">
      {Array.from({ length: panelCount }, (_, panelIndex) => {
        const testimonial = testimonials[panelIndexes[panelIndex] % testimonials.length];
        const isFading = fadingPanel === panelIndex;

        return (
          <blockquote key={panelIndex} className="testimonial">
            <div className={`testimonial-content${isFading ? " is-fading" : ""}`}>
              <p>{testimonial.quote}</p>
              <footer>
                <span className="testimonial-name">{testimonial.name}</span>
                <span>{testimonial.company}</span>
              </footer>
            </div>
          </blockquote>
        );
      })}
    </div>
  );
}
