import Image from "next/image";

import { EmojiFloat } from "@/components/emoji-float";
import { LedClock } from "@/components/led-clock";

const visualTiles = [
  {
    label: "/home",
    className: "tile-home",
  },
  {
    label: "/2025-year-in-review",
    className: "tile-review",
  },
  {
    label: "/customers",
    className: "tile-customers",
  },
  {
    label: "/university",
    className: "tile-university",
  },
  {
    label: "/plus",
    className: "tile-plus",
  },
  {
    label: "/resources/roi-calculator",
    className: "tile-calculator",
  },
];

const freelanceProjects = ["muuvment.com", "cawu.ca", "gale.agency"];

const people = [
  "Danny Pellissier, Video/Design",
  "Ran Jing, Web",
  "Brad Cunningham, Motion",
  "KG, Design",
];

const testimonials = [
  ["“It was an absolute pleasure to work with Rock”", "Olivia Terceros, Founder", "LATAM Professionals"],
  ["“It was an absolute pleasure to work with Rock”", "Ohad Tzur, Founder", "Kahoona"],
  ["“It was an absolute pleasure to work with Rock”", "Jimmy Cabral, Creative Director", "Qualified"],
  ["“It was an absolute pleasure to work with Rock”", "Yonnas Masfariam, Program Manager", "Webflow"],
];

export default function Home() {
  return (
    <main className="portfolio-shell">
      <aside aria-label="Page controls" className="page-rail">
        <a href="#top">↑</a>
        <a href="#work">⌘</a>
        <a href="#bottom">↓</a>
      </aside>

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

        <div className="marquee" aria-hidden="true">
          <span>SHOW ME WORK SHOW ME WORK SHOW ME WORK SHOW ME WORK</span>
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
              <figure key={tile.label} className={`visual-tile ${tile.className}`}>
                <div className="tile-art" />
                <figcaption>{tile.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="notes" id="bottom">
          <div className="freelance-list">
            {freelanceProjects.map((project) => (
              <div key={project} className="freelance-row">
                <span>{project}</span>
                <span className="title-sub">Freelance</span>
              </div>
            ))}
          </div>

          <div className="message-marquee" aria-hidden="true">
            <span>leave a message leave a message leave a message</span>
          </div>

          <div className="reaction-strip" aria-label="Reactions">
            <span>😁</span>
            <span>💩</span>
            <span>😮</span>
            <span>💀</span>
            <span>😊</span>
            <span>😖</span>
            <span>😅</span>
            <span>😁</span>
            <span>👍</span>
            <span>🤑</span>
            <span>👀</span>
            <span className="reaction-count">10</span>
            <span>😄</span>
            <span>👏</span>
            <span>😠</span>
            <span>🤣</span>
            <span>🙏</span>
            <span>🥹</span>
            <span>😘</span>
            <span>🤯</span>
            <span>✌️</span>
            <span>😍</span>
            <span>☝️</span>
            <span className="reaction-count">1</span>
            <span>😡</span>
          </div>

          <div className="message-grid">
            <section className="people-card">
              <h2>Some awesome people you should stalk</h2>
              <ul>
                {people.map((person) => (
                  <li key={person}>{person}</li>
                ))}
              </ul>
            </section>

            <section className="chat-card" aria-label="Message preview">
              <div className="bubble incoming">Yo, love you.</div>
              <div className="bubble outgoing">Whatcha been watching lately?</div>
              <div className="message-input">Share a message...</div>
            </section>
          </div>
                
          <div className="testimonial-grid">
            {testimonials.map(([quote, name, company]) => (
              <blockquote key={`${name}-${company}`} className="testimonial">
                <p>{quote}</p>
                <footer>
                  <span>{name}</span>
                  <span>{company}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="life-section">
          <div className="about-marquee" aria-hidden="true">
            <span>NOW MORE ABOUT ME? HERE? SATISFIED? NOW MORE ABOUT ME?</span>
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
