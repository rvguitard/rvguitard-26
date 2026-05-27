"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  company: string;
};

const testimonials: Testimonial[] = [
  {
    quote: "“It was an absolute pleasure to work with Rock”",
    name: "Olivia Terceros, Founder",
    company: "LATAM Professionals",
  },
  {
    quote: "“It was an absolute pleasure to work with Rock”",
    name: "Ohad Tzur, Founder",
    company: "Kahoona",
  },
  {
    quote: "“He brings taste, momentum, and a calm hand to messy web work”",
    name: "Jimmy Cabral, Creative Director",
    company: "Qualified",
  },
  {
    quote: "“Rock consistently delivers polished, high-quality work with fast turnarounds and sharp communication. Reliable people are rare. Rock's one of them.”",
    name: "Yonnas Tesfamariam, Sr. Partner Solutions Engineer",
    company: "Webflow",
  },
  {
    quote: "“Rock is extremely detail oriented and communicates with stakeholders flawlessly.”",
    name: "Todd Swain, Program Manager",
    company: "Qualified",
  },
  {
    quote: "“He can translate a loose idea into something real very quickly”",
    name: "Maya Chen, Brand Director",
    company: "Studio Atlas",
  },
  {
    quote: "“Every iteration got sharper, cleaner, and easier to use”",
    name: "Noah Patel, Product Lead",
    company: "Orbit",
  },
  {
    quote: "“Rock is the person you want when the launch window is close”",
    name: "Elena Morris, Growth",
    company: "Brightline",
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
