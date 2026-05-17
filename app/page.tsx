import Image from "next/image";

import { EmojiFloat } from "@/components/emoji-float";
import { LedClock } from "@/components/led-clock";
import { MessageBoard } from "@/components/message-board";
import { MusicPlayer } from "@/components/music-player";
import { ReactionStrip } from "@/components/reaction-strip";
import { TestimonialGrid } from "@/components/testimonial-grid";
import { VisualTile } from "@/components/visual-tile";

const visualTiles = [
  {
    label: "/home",
    className: "tile-home",
    videoSrc: "/videos/qualified-hp-1778982945862.mp4",
  },
  {
    label: "/2025-year-in-review",
    className: "tile-review",
    videoSrc: "/videos/qualified-hp-1778982945862.mp4",
  },
  {
    label: "/customers",
    className: "tile-customers",
    videoSrc: "/videos/qualified-hp-1778982945862.mp4",
  },
  {
    label: "/university",
    className: "tile-university",
    videoSrc: "/videos/qualified-hp-1778982945862.mp4",
  },
  {
    label: "/plus",
    className: "tile-plus",
    videoSrc: "/videos/qualified-hp-1778982945862.mp4",
  },
  {
    label: "/resources/roi-calculator",
    className: "tile-calculator",
    videoSrc: "/videos/qualified-hp-1778982945862.mp4",
  },
];

const freelanceProjects = [
  { label: "muuvment.com", href: "https://muuvment.com" },
  { label: "cawu.ca", href: "https://cawu.ca" },
  { label: "gale.agency", href: "https://gale.agency" },
];

const people = [
  { label: "Danny Pellissier, Video/Design", href: "#" },
  { label: "Ran Jing, Web", href: "#" },
  { label: "Brad Cunningham, Motion", href: "#" },
  { label: "KG, Design", href: "#" },
];

export default function Home() {
  return (
    <main className="portfolio-shell">
      <aside aria-label="Page controls" className="page-rail">
        <a href="#top">↑</a>
        <a href="#work">⌘</a>
        <a href="#bottom">↓</a>
      </aside>
      <MusicPlayer />

      <article id="top" className="portfolio-page">
        <section className="clock-panel" aria-label="Current focus">
          <LedClock />
        </section>

        <header className="intro-panel">
          <div>
            <h1>Rock Vincent Guitard</h1>
            <p>Figuring out AI and pushing things to the web.</p>
          </div>
          <span className="title-sub">🇨🇦 Gatineau, QC</span>
        </header>

        <div className="section-marquee work-marquee" aria-hidden="true">
          <div className="marquee-track marquee-left">
            <span>SHOW ME WORK SHOW ME WORK SHOW ME WORK</span>
            <span>SHOW ME WORK SHOW ME WORK SHOW ME WORK</span>
          </div>
          <div className="marquee-track marquee-right">
            <span>SHOW ME WORK SHOW ME WORK SHOW ME WORK</span>
            <span>SHOW ME WORK SHOW ME WORK SHOW ME WORK</span>
          </div>
        </div>

        <section id="work" className="project-card">
          <a href="https://qualified.com" className="project-topline">
            <span className="title-link">qualified.com</span>
            <span className="title-sub">Since 2022</span>
          </a>

          <div className="project-copy">
            <p>
              Together with our internet crew, we built the Qualified marketing website from the ground up. This ever evolving site was made of 3 Webflow projects and 2 external portals, amassing hundreds of different pages: from live events, year in reviews, content libraries, infographics, to roi calculators, playbooks, guides and much more.
            </p>
          </div>

          <div className="visual-grid">
            {visualTiles.map((tile) => (
              <VisualTile
                className={tile.className}
                key={tile.label}
                label={tile.label}
                videoSrc={tile.videoSrc}
              />
            ))}
          </div>
        </section>

        <section className="notes" id="bottom">
          <div className="freelance-list">
            {freelanceProjects.map((project) => (
              <a key={project.label} className="freelance-row" href={project.href}>
                <span className="freelance-url">{project.label}</span>
                <span className="title-sub">Freelance</span>
              </a>
            ))}
          </div>

          <div className="section-marquee message-marquee" aria-hidden="true">
            <div className="marquee-track marquee-left">
              <span>LEAVE A MESSAGE LEAVE A MESSAGE LEAVE A MESSAGE</span>
              <span>LEAVE A MESSAGE LEAVE A MESSAGE LEAVE A MESSAGE</span>
            </div>
            <div className="marquee-track marquee-right">
              <span>LEAVE A MESSAGE LEAVE A MESSAGE LEAVE A MESSAGE</span>
              <span>LEAVE A MESSAGE LEAVE A MESSAGE LEAVE A MESSAGE</span>
            </div>
          </div>

          <ReactionStrip />

          <div className="message-grid">
            <section className="people-card">
              <h2>Some awesome people you should stalk</h2>
              <ul>
                {people.map((person) => (
                  <li key={person.label}>
                    <a href={person.href} className="people-link">
                      {person.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <MessageBoard />
          </div>
                
          <TestimonialGrid />
        </section>

        <section className="life-section">
          <div className="section-marquee about-marquee" aria-hidden="true">
            <div className="marquee-track marquee-right">
              <span>NOW MORE ABOUT ME? HERE? SATISFIED?</span>
              <span>NOW MORE ABOUT ME? HERE? SATISFIED?</span>
            </div>
            <div className="marquee-track marquee-left">
              <span>NOW MORE ABOUT ME? HERE? SATISFIED?</span>
              <span>NOW MORE ABOUT ME? HERE? SATISFIED?</span>
            </div>
          </div>

          <EmojiFloat initialCount={0} />

          <div className="photo-strip" aria-label="Personal photos">
            <figure className="photo-card photo-japan">
              <Image
                src="/photos/japan.webp"
                alt="Rock smiling by Mount Fuji in Japan"
                width={233}
                height={146}
              />
              <figcaption>Japan walks</figcaption>
            </figure>
            <figure className="photo-card photo-lighthouse">
              <Image
                src="/photos/vancouver.webp"
                alt="A misty lighthouse view in Vancouver"
                width={233}
                height={146}
              />
              <figcaption>Coastal weather</figcaption>
            </figure>
            <figure className="photo-card photo-dog">
              <Image
                src="/photos/tuna.webp"
                alt="Tuna the dog sitting in a laundry basket"
                width={233}
                height={146}
              />
              <figcaption>Small assistant</figcaption>
            </figure>
          </div>

          <footer className="site-footer">
            <p>More coming soon...</p>
            <Image
              className="footer-mark"
              src="/assets/R.svg"
              alt="Rock Vincent Guitard mark"
              width={31}
              height={34}
            />
            <nav aria-label="Social links">
              <a href="https://instagram.com">Instagram ↗</a>
              <a href="https://twitter.com">Twitter ↗</a>
              <a href="https://linkedin.com">LinkedIn ↗</a>
            </nav>
            <a href="mailto:rvguitard@gmail.com">rvguitard@gmail.com</a>
            <small>© Rock Vincent Guitard 2026</small>
          </footer>
        </section>
      </article>
    </main>
  );
}
