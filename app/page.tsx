import Image from "next/image";
import Link from "next/link";

import { EmojiFloat } from "@/components/emoji-float";
import { CursorPresence } from "@/components/experiments/CursorPresence";
import { FooterLogo } from "@/components/footer-logo";
import { LedClock } from "@/components/led-clock";
import { MessageBoard } from "@/components/message-board";
import { MusicPlayer } from "@/components/music-player";
import { PenguinFollower } from "@/components/penguin-follower";
import { PhotoCarousel } from "@/components/photo-carousel";
import { PrivacyModal } from "@/components/privacy-modal";
import { ReactionStrip } from "@/components/reaction-strip";
import { TestimonialGrid } from "@/components/testimonial-grid";
import { VisualTile } from "@/components/visual-tile";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const withBasePath = (path: string) => `${basePath}${path}`;
const aiPromptCount = 287;

const visualTiles = [
  {
    label: "/home",
    className: "tile-home",
    videoSrc: withBasePath("/videos/homepage-1781752637431.mp4"),
  },
  {
    label: "/2025-year-in-review",
    className: "tile-review",
    videoSrc: withBasePath("/videos/yir-2025-1779680182485.mp4"),
  },
  {
    label: "/customers",
    className: "tile-customers",
    videoSrc: withBasePath("/videos/customers-1779762801746.mp4"),
  },
  {
    label: "/university",
    className: "tile-university",
    videoSrc: withBasePath("/videos/university-1779763091106.mp4"),
  },
  {
    label: "/plus",
    className: "tile-plus",
    videoSrc: withBasePath("/videos/plus-1779763231797.mp4"),
  },
  {
    label: "/resources/roi-calculator",
    className: "tile-calculator",
    videoSrc: withBasePath("/videos/roi-calc-1779762480547.mp4"),
  },
];

const freelanceProjects = [
  { label: "muuvment.com", href: "https://muuvment.com" },
  { label: "cawu.ca", href: "https://cawu.ca" },
  { label: "gale.agency", href: "https://gale.agency" },
];

const experiments = [
  {
    accent: "green",
    href: "/tools/keyframe-slicer",
    status: "WIP",
    title: "CSS Spritesheet Editor",
    description: "Slice sprite maps into CSS keyframes.",
  },
  {
    accent: "blue",
    href: "/tools/web-tools",
    status: "WIP",
    title: "My Toolset",
    description: "My personal growing directory of useful web tools.",
  },
];

const people = [
  { label: "Danny Pellissier, Video/Design", href: "https://www.dannypellissier.com/" },
  { label: "Ran Jing, Web", href: "https://www.ranjingdesign.com/" },
  { label: "Brad Cannady, Motion", href: "https://bradcannady.com/work" },
  { label: "Tim Choy, Art Director", href: "https://timchoy.com/" },
];

export default function Home() {
  return (
    <main className="portfolio-shell">
      <CursorPresence />
      <PenguinFollower />
      <MusicPlayer />

      <article id="top" className="portfolio-page">
        <section className="clock-panel" aria-label="Current focus">
          <LedClock />
        </section>

        <div className="intro-reveal">
          <Image
            className="intro-profile"
            src={withBasePath("/assets/profile.webp")}
            alt="Rock Vincent Guitard"
            width={96}
            height={128}
            priority
          />
          <header className="intro-panel">
            <div>
              <h1>Rock Vincent Guitard</h1>
              <p>Webflow developer at Qualified</p>
            </div>
            <span className="title-sub">🍁 Gatineau, QC</span>
          </header>
        </div>

        <div className="intro-paragraph">
          <p>Welcome to my little corner of the internet, <br/>a digital scrapbook of various things I've built. <br />Poke around and enjoy your stay!</p>
        </div>

        <div className="section-marquee work-marquee" aria-hidden="true">
          <div className="marquee-field">
            <div className="marquee-track marquee-left">
              <span>SHOWMEWORK SHOWMEWORK SHOWMEWORK</span>
              <span>SHOWMEWORK SHOWMEWORK SHOWMEWORK</span>
            </div>
            <div className="marquee-track marquee-right">
              <span>SHOWMEWORK SHOWMEWORK SHOWMEWORK</span>
              <span>SHOWMEWORK SHOWMEWORK SHOWMEWORK</span>
            </div>
            <div className="marquee-track marquee-left">
              <span>SHOWMEWORK SHOWMEWORK SHOWMEWORK</span>
              <span>SHOWMEWORK SHOWMEWORK SHOWMEWORK</span>
            </div>
            <div className="marquee-track marquee-right">
              <span>SHOWMEWORK SHOWMEWORK SHOWMEWORK</span>
              <span>SHOWMEWORK SHOWMEWORK SHOWMEWORK</span>
            </div>
            <div className="marquee-track marquee-left">
              <span>SHOWMEWORK SHOWMEWORK SHOWMEWORK</span>
              <span>SHOWMEWORK SHOWMEWORK SHOWMEWORK</span>
            </div>
          </div>
        </div>

        <section id="work" className="project-card">
          <a href="https://qualified.com" className="project-topline">
            <svg
              className="project-topline-bg"
              viewBox="0 0 672 77"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <mask id="qualified-bg-mask" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="672" height="77">
                <rect width="672" height="77" fill="oklch(72.19% 0.1354 258.06)" />
              </mask>
              <g mask="url(#qualified-bg-mask)">
                <g filter="url(#qualified-bg-filter-soft)">
                  <mask id="qualified-bg-inner-mask" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="-44" y="-6" width="760" height="89">
                    <rect x="-43.8262" y="-5.02174" width="759.652" height="87.0435" fill="oklch(88.53% 0 89.88)" />
                  </mask>
                  <g mask="url(#qualified-bg-inner-mask)">
                    <g filter="url(#qualified-bg-filter-purple)">
                      <path d="M-168.174 71.2625C-168.174 28.4352 -133.455 -6.28324 -90.6281 -6.28324H41.6503C71.0865 -6.28324 98.789 7.63649 116.358 31.255C168.27 101.044 104.644 197.58 20.0397 177.392L-108.626 146.691C-143.54 138.36 -168.174 107.157 -168.174 71.2625Z" fill="oklch(61.56% 0.2338 305.75)" />
                    </g>
                    <g filter="url(#qualified-bg-filter-blue)">
                      <path d="M-88.4783 15.1541C-88.4783 -29.6048 -52.194 -65.8891 -7.4351 -65.8891H675.378C743.917 -65.8891 799.478 -10.3276 799.478 58.2109C799.478 126.75 743.917 182.311 675.378 182.311H41.5831C16.8263 182.311 10.9854 147.727 34.369 139.596C57.5254 131.545 52.0891 97.3576 27.5774 96.886L-52.8311 95.3389C-72.6284 94.958 -88.4783 78.8002 -88.4783 58.9992V15.1541Z" fill="oklch(73.66% 0.1261 255.97)" />
                    </g>
                    <path d="M308.85 -14.3189C199.356 -92.1617 35.4168 -16.6839 -32.866 30.7853C-55.5263 93.1204 128.475 107.817 216.396 56.6315C304.318 5.4458 467.472 140.758 675.039 175.727C882.607 210.695 759.336 7.47296 662.35 38.3871C565.364 69.3012 445.718 82.9846 308.85 -14.3189Z" fill="oklch(72.97% 0.2617 332.17)" />
                    <path d="M94.8121 120.658C132.364 178.615 255.86 151.94 312.915 131.358C348.168 97.0068 244.385 68.2137 174.402 88.8451C104.419 109.476 55.2342 11.7018 -55.3986 -31.6434C-166.031 -74.9887 -164.248 58.5483 -96.0006 50.8841C-27.7533 43.2199 47.8728 48.2123 94.8121 120.658Z" fill="oklch(58.67% 0.2321 300.71)" />
                    <path d="M756.451 11.3009C714.871 -45.7932 593.336 -16.4475 537.765 5.36208C504.943 40.4551 610.662 66.9647 679.148 44.8241C747.633 22.6835 803.624 119.312 917.207 160.213C1030.79 201.114 1019.66 67.7182 952.001 76.8638C884.343 86.0093 808.425 82.6687 756.451 11.3009Z" fill="oklch(58.67% 0.2321 300.71)" />
                    <path d="M637.826 110.538C661 44.6252 448.478 164.783 380.087 117.792C325.922 80.5761 439.382 78.4105 504.727 82.0427C492.584 28.317 550.217 51.248 646.87 23.495C743.522 -4.25795 777.435 102.023 747.478 152.168C717.522 202.313 614.652 176.452 637.826 110.538Z" fill="oklch(84.65% 0.1457 208.7)" />
                  </g>
                </g>
              </g>
              <defs>
                <filter id="qualified-bg-filter-soft" x="-92.5262" y="-53.7217" width="857.052" height="184.443" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feGaussianBlur stdDeviation="24.35" result="effect1_foregroundBlur" />
                </filter>
                <filter id="qualified-bg-filter-purple" x="-288.874" y="-126.983" width="544.68" height="427.795" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feGaussianBlur stdDeviation="60.35" result="effect1_foregroundBlur" />
                </filter>
                <filter id="qualified-bg-filter-blue" x="-118.978" y="-96.3891" width="948.957" height="309.2" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feGaussianBlur stdDeviation="15.25" result="effect1_foregroundBlur" />
                </filter>
              </defs>
            </svg>
            <span className="title-link">qualified.com</span>
            <span className="title-sub">Since 2022</span>
          </a>

          <div className="project-copy">
            <ul className="project-tools" aria-label="Tools used">
              {["Webflow", "Gainsight", "Skilljar"].map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
            <p>
              Together with our internet team, we built the Qualified marketing website from the ground up. The platform evolved into a large-scale ecosystem spanning three Webflow projects and two external portals, supporting hundreds of pages across live events, content libraries, infographics playbooks, guides, and more.
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
            <div className="marquee-field">
              <div className="marquee-track marquee-left">
                <span>WEBEXPERIMENTSWEBEXPERIMENTSWEBEXPERIMENTS</span>
                <span>UIEXPLORATIONSUIEXPLORATIONSUIEXPLORATIONS</span>
              </div>
              <div className="marquee-track marquee-right">
                <span>INTERACTICEDEMOSINTERACTICEDEMOSINTERACTICEDEMOS</span>
                <span>RANDOMAISTUFFRANDOMAISTUFFRANDOMAISTUFFRANDOMAISTUFF</span>
              </div>
              <div className="marquee-track marquee-left">
                <span>WEBEXPERIMENTSWEBEXPERIMENTSWEBEXPERIMENTS</span>
                <span>UIEXPLORATIONSUIEXPLORATIONSUIEXPLORATIONS</span>
              </div>
              <div className="marquee-track marquee-right">
                <span>INTERACTICEDEMOSINTERACTICEDEMOSINTERACTICEDEMOS</span>
                <span>RANDOMAISTUFFRANDOMAISTUFFRANDOMAISTUFFRANDOMAISTUFF</span>
              </div>
              <div className="marquee-track marquee-left">
                <span>WEBEXPERIMENTSWEBEXPERIMENTSWEBEXPERIMENTS</span>
                <span>UIEXPLORATIONSUIEXPLORATIONSUIEXPLORATIONS</span>
              </div>
              <div className="marquee-track marquee-left">
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
              </div>
            </div>
          </div>

<div className="experiments-list" aria-label="Experiments">
            {experiments.map((experiment) => (
              <Link
                key={experiment.title}
                className={`experiment-row experiment-row-${experiment.accent}`}
                href={experiment.href}
              >
                <span className="experiment-main">
                  <span className="experiment-copy">
                    <span className="experiment-title">{experiment.title}</span>
                    <span className="experiment-description">{experiment.description}</span>
                  </span>
                </span>
                <span className="experiment-status">{experiment.status}</span>
              </Link>
            ))}
          </div>

          <div className="section-marquee message-marquee" aria-hidden="true">
            <div className="marquee-field">
              <div className="marquee-track marquee-left">
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
              </div>
              <div className="marquee-track marquee-right">
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
              </div>
              <div className="marquee-track marquee-left">
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
              </div>
              <div className="marquee-track marquee-right">
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
              </div>
              <div className="marquee-track marquee-left">
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
                <span>LEAVEAMESSAGE LEAVEAMESSAGE LEAVEAMESSAGE</span>
              </div>
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
            <div className="marquee-field">
              <div className="marquee-track marquee-right">
                <span>ALILMOREABOUTME ALILMOREABOUTME</span>
                <span>ABITABOUTROCK,NOTTHEROCK</span>
              </div>
              <div className="marquee-track marquee-left">
                <span>ALILMOREABOUTME ALILMOREABOUTME</span>
                <span>ABITABOUTROCK,NOTTHEROCK</span>
              </div>
              <div className="marquee-track marquee-right">
                <span>ALILMOREABOUTME ALILMOREABOUTME</span>
                <span>ABITABOUTROCK,NOTTHEROCK</span>
              </div>
              <div className="marquee-track marquee-left">
                <span>ALILMOREABOUTME ALILMOREABOUTME</span>
                <span>ABITABOUTROCK,NOTTHEROCK</span>
              </div>
              <div className="marquee-track marquee-right">
                <span>ALILMOREABOUTME ALILMOREABOUTME</span>
                <span>ABITABOUTROCK,NOTTHEROCK</span>
              </div>
            </div>
          </div>

          <EmojiFloat initialCount={0} />

          <PhotoCarousel />

          <footer className="site-footer">
            <p className="coming-soon">
              <span>More coming soon</span>
              <span className="coming-soon-dots" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
            <FooterLogo />
            <nav aria-label="Social links">
              <a href="https://instagram.com">Instagram ↗</a>
              <a href="https://twitter.com">Twitter ↗</a>
              <a href="https://linkedin.com">LinkedIn ↗</a>
            </nav>
            <a href="mailto:rvguitard@gmail.com">rvguitard@gmail.com</a>
            <PrivacyModal />
            <small>Built by prompting AI, about {aiPromptCount.toLocaleString()} times.</small>
          </footer>
        </section>
      </article>
    </main>
  );
}
