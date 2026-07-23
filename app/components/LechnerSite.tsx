"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent, MouseEvent, ReactNode } from "react";

const navigation = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const services = [
  {
    number: "01",
    title: "Strategie",
    text: "Positionierung, Seitenstruktur und Inhalte, die Orientierung geben und Entscheidungen leichter machen.",
  },
  {
    number: "02",
    title: "Design",
    text: "Eigenständige digitale Auftritte, die Ästhetik, Klarheit und Markencharakter präzise verbinden.",
  },
  {
    number: "03",
    title: "Entwicklung",
    text: "Performante, zugängliche Websites mit sauberer Technik und einem verlässlichen Fundament.",
  },
];

const projects = [
  {
    slug: "atelier",
    studio: "ATELIER NOIR",
    kicker: "KLARE FORM. ZEITLOSE WIRKUNG.",
    title: "Marken, die bleiben.",
    text: "Markenstrategie und digitale Erlebnisse mit Substanz, Ästhetik und Haltung.",
    tag: "Brand Studio · Wien",
  },
  {
    slug: "auree",
    studio: "AURÉE",
    kicker: "RITUALE FÜR JEDEN TAG.",
    title: "Pflege, neu gedacht.",
    text: "Ein ruhiger E-Commerce-Auftritt für wirksame Pflege und bewusste Routinen.",
    tag: "Skincare · Salzburg",
  },
  {
    slug: "forma",
    studio: "FORMA",
    kicker: "RÄUME MIT RELEVANZ.",
    title: "Architektur, die wirkt.",
    text: "Ein reduziertes Portfolio, das Räume sprechen lässt und Projekte klar inszeniert.",
    tag: "Architecture · Graz",
  },
];

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "filled" | "outline" | "text";
  onClick?: () => void;
};

function useSectionNavigation(afterNavigation?: () => void) {
  const router = useRouter();

  return (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (
      !href.startsWith("#") ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      afterNavigation?.();
      return;
    }

    const section = document.getElementById(href.slice(1));
    if (!section) {
      afterNavigation?.();
      return;
    }

    event.preventDefault();
    afterNavigation?.();

    if (window.location.hash !== href) {
      router.push(href, { scroll: false });
    }

    section.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };
}

function Arrow() {
  return (
    <span className="arrow" aria-hidden="true">
      →
    </span>
  );
}

function ButtonLink({
  href,
  children,
  variant = "filled",
  onClick,
}: ButtonLinkProps) {
  const navigateToSection = useSectionNavigation(onClick);

  return (
    <a
      className={`button button--${variant}`}
      href={href}
      onClick={(event) => navigateToSection(event, href)}
    >
      <span>{children}</span>
      <Arrow />
    </a>
  );
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: 1 | 2 | 3;
};

function Reveal({ children, className = "", delay }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const frame = window.requestAnimationFrame(() => setReady(true));
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(node);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${ready ? "reveal--ready" : ""} ${
        visible ? "is-visible" : ""
      } ${delay ? `reveal--delay-${delay}` : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const navigateToSection = useSectionNavigation(closeMenu);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="header-inner">
        <a
          className="wordmark"
          href="#top"
          aria-label="Lechner Webdesign – Startseite"
          onClick={(event) => navigateToSection(event, "#top")}
        >
          <span>LECHNER</span>
          <span>WEBDESIGN</span>
        </a>

        <nav
          id="mobile-navigation"
          className={`main-nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Hauptnavigation"
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => navigateToSection(event, item.href)}
            >
              {item.label}
            </a>
          ))}
          <ButtonLink href="#contact" onClick={closeMenu}>
            Projekt anfragen
          </ButtonLink>
        </nav>

        <button
          className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function HeroArtwork() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-glow" />
      <div className="silk silk--one" />
      <div className="silk silk--two" />
      <div className="silk silk--three" />
      <div className="hero-grain" />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero" id="top">
      <HeroArtwork />
      <div className="site-shell hero-inner">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">Independent creative studio</p>
          <h1>
            Websites
            <br />
            with character.
          </h1>
          <p className="hero-lead">
            Wir gestalten und entwickeln Premium-Websites, die Vertrauen schaffen,
            Marken stärken und Kunden überzeugen.
          </p>
          <div className="hero-actions">
            <ButtonLink href="#contact">Kostenloses Erstgespräch</ButtonLink>
            <ButtonLink href="#work" variant="outline">
              Projekte ansehen
            </ButtonLink>
          </div>
          <div className="hero-meta" aria-label="Unsere Schwerpunkte und Standort">
            <span>Strategie · Design · Entwicklung</span>
            <span>Based in Austria</span>
          </div>
        </div>
      </div>
      
    </section>
  );
}

function AboutSection() {
  return (
    <section className="about-section section" id="about">
      <div className="about-light" aria-hidden="true" />
      <div className="site-shell">
        <Reveal>
          <p className="eyebrow">Was wir tun</p>
          <div className="about-grid">
            <h2>
              Klare Marken.
              <br />
              Starke Websites.
              <br />
              Echte Ergebnisse.
            </h2>
            <div className="about-copy">
              <p>
                Gutes Webdesign ist mehr als Ästhetik. Es ist Strategie, Struktur
                und Erfahrung. Wir verbinden Design, Technologie und Fokus auf
                Conversion zu digitalen Lösungen, die messbar Wirkung zeigen.
              </p>
              <ButtonLink href="#services" variant="text">
                Mehr über uns
              </ButtonLink>
            </div>
          </div>
        </Reveal>

        <div className="services" id="services">
          <div className="services-heading">
            <p className="eyebrow">Leistungen</p>
            <p>Von der ersten Idee bis zum souveränen digitalen Auftritt.</p>
          </div>
          <div className="service-list">
            {services.map((service, index) => (
              <Reveal key={service.title} delay={(index + 1) as 1 | 2 | 3}>
                <article className="service-item">
                  <span className="service-number">{service.number}</span>
                  <div className="service-mark" aria-hidden="true">
                    <i />
                    <i />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <a href="#contact">
                    Mehr erfahren <Arrow />
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectVisual({ slug }: { slug: string }) {
  if (slug === "auree") {
    return (
      <div className="screen-visual visual-auree" aria-hidden="true">
        <div className="auree-orbit" />
        <div className="auree-stone" />
        <div className="auree-bottle"><span>AURÉE</span></div>
      </div>
    );
  }

  if (slug === "forma") {
    return (
      <div className="screen-visual visual-forma" aria-hidden="true">
        <div className="forma-plane forma-plane--one" />
        <div className="forma-plane forma-plane--two" />
        <div className="forma-sun" />
      </div>
    );
  }

  return (
    <div className="screen-visual visual-atelier" aria-hidden="true">
      <div className="atelier-moon" />
      <div className="atelier-mountain atelier-mountain--back" />
      <div className="atelier-mountain atelier-mountain--front" />
    </div>
  );
}

function LaptopShowcase() {
  const [activeProject, setActiveProject] = useState(0);
  const [paused, setPaused] = useState(false);

  const showPreviousProject = () => {
    setActiveProject((current) =>
      (current - 1 + projects.length) % projects.length,
    );
  };

  const showNextProject = () => {
    setActiveProject((current) => (current + 1) % projects.length);
  };

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveProject((current) => (current + 1) % projects.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="showcase-stage"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="stage-aura" aria-hidden="true" />
      <div className="macbook">
        <div className="macbook-asset">
          <div className="macbook-shadow" aria-hidden="true" />
          {/* Keep the transparent photographic cutout unoptimized. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="macbook-photo"
            src="/macbook-cutout.png"
            width={1667}
            height={943}
            alt="Freigestelltes Space-Grey MacBook"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
          <div className="project-viewport macbook-display">
            {projects.map((project, index) => (
              <article
                key={project.slug}
                className={`project-screen project-screen--${project.slug} ${
                  activeProject === index ? "is-active" : ""
                }`}
                aria-hidden={activeProject !== index}
              >
                <div className="screen-nav">
                  <span>{project.studio}</span>
                  <span>Studio&nbsp;&nbsp; Work&nbsp;&nbsp; Contact</span>
                </div>
                <div className="screen-copy">
                  <p>{project.kicker}</p>
                  <h3>{project.title}</h3>
                  <span>{project.text}</span>
                  <b>
                    Projekt entdecken <Arrow />
                  </b>
                </div>
                <ProjectVisual slug={project.slug} />
                <small>{project.tag}</small>
              </article>
            ))}
            <div
              className="screen-switcher"
              role="group"
              aria-label="Projekt im MacBook wechseln"
            >
              <button
                type="button"
                onClick={showPreviousProject}
                aria-label="Vorheriges Projekt"
              >
                <span aria-hidden="true">&larr;</span>
              </button>
              <output aria-live="polite">
                0{activeProject + 1} / 0{projects.length}
              </output>
              <button
                type="button"
                onClick={showNextProject}
                aria-label="Naechstes Projekt"
              >
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function ShowcaseSection() {
  return (
    <section className="showcase-section section" id="work">
      <div className="site-shell showcase-shell">
        <Reveal className="showcase-intro">
          <p className="eyebrow">Ausgewählte Projekte</p>
          <div className="showcase-intro-grid">
            <h2>
              Digitale Erlebnisse,
              <br />
              die Eindruck hinterlassen.
            </h2>
            <p>
              Eine Auswahl an Projekten, die wir mit Leidenschaft, Strategie und
              höchstem Anspruch umgesetzt haben.
            </p>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <LaptopShowcase />
        </Reveal>
      </div>
    </section>
  );
}

type FieldName =
  | "name"
  | "email"
  | "company"
  | "project"
  | "budget"
  | "message"
  | "privacy";
type FormErrors = Partial<Record<FieldName, string>>;

function InquirySection() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);

  const clearError = (field: FieldName) => {
    setSent(false);
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: FormErrors = {};
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const project = String(data.get("project") ?? "");
    const budget = String(data.get("budget") ?? "");
    const message = String(data.get("message") ?? "").trim();

    if (name.length < 2) nextErrors.name = "Bitte gib deinen Namen ein.";
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein.";
    }
    if (!project) nextErrors.project = "Bitte wähle eine Projektart aus.";
    if (!budget) nextErrors.budget = "Bitte wähle einen Budgetrahmen aus.";
    if (message.length < 20) {
      nextErrors.message = "Erzähl uns bitte in mindestens 20 Zeichen von deinem Projekt.";
    }
    if (data.get("privacy") !== "on") {
      nextErrors.privacy = "Bitte bestätige den Datenschutzhinweis.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSent(false);
      const firstField = Object.keys(nextErrors)[0] as FieldName;
      window.requestAnimationFrame(() => {
        const firstInvalid = form.elements.namedItem(firstField) as HTMLElement | null;
        firstInvalid?.focus();
      });
      return;
    }

    setErrors({});
    setSent(true);
    form.reset();
  };

  const fieldState = (field: FieldName) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  return (
    <section className="inquiry-section section" id="contact">
      <div className="inquiry-glow" aria-hidden="true" />
      <div className="site-shell inquiry-grid">
        <Reveal className="inquiry-copy">
          <p className="eyebrow">Projekt anfragen</p>
          <h2>
            Bereit deinen Umsatzt
            <br />
            zu steigern?
          </h2>
          <p>
            Buche ein kostenloses Erstgespräch 
            und erhalte ein unverbindliches Angebot.
          </p>
          <div className="contact-direct">
            <span>Lieber direkt?</span>
            <a href="mailto:contact@lechner-webdesign.at">
              contact@lechner-webdesign.at <Arrow />
            </a>
          </div>
        </Reveal>

        <Reveal delay={1} className="form-wrap">
          <form className="inquiry-form" noValidate onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="name">Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Dein Name"
                  onChange={() => clearError("name")}
                  {...fieldState("name")}
                />
                {errors.name && <span id="name-error">{errors.name}</span>}
              </div>
              <div className="field">
                <label htmlFor="email">E-Mail *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@unternehmen.at"
                  onChange={() => clearError("email")}
                  {...fieldState("email")}
                />
                {errors.email && <span id="email-error">{errors.email}</span>}
              </div>
              <div className="field">
                <label htmlFor="company">Unternehmen</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Unternehmen / Marke"
                  onChange={() => clearError("company")}
                />
              </div>
              <div className="field">
                <label htmlFor="project">Art des Projekts *</label>
                <select
                  id="project"
                  name="project"
                  defaultValue=""
                  onChange={() => clearError("project")}
                  {...fieldState("project")}
                >
                  <option value="" disabled>Bitte auswählen</option>
                  <option value="landingpage">Landingpage</option>
                  <option value="company">Unternehmenswebsite</option>
                  <option value="redesign">Redesign</option>
                  <option value="development">Webentwicklung</option>
                  <option value="other">Sonstiges</option>
                </select>
                {errors.project && <span id="project-error">{errors.project}</span>}
              </div>
              <div className="field field--full">
                <label htmlFor="budget">Budget *</label>
                <select
                  id="budget"
                  name="budget"
                  defaultValue=""
                  onChange={() => clearError("budget")}
                  {...fieldState("budget")}
                >
                  <option value="" disabled>Budgetrahmen auswählen</option>
                  <option value="3-5">€ 3.000 – 5.000</option>
                  <option value="5-10">€ 5.000 – 10.000</option>
                  <option value="10-20">€ 10.000 – 20.000</option>
                  <option value="20+">€ 20.000+</option>
                  <option value="open">Noch offen</option>
                </select>
                {errors.budget && <span id="budget-error">{errors.budget}</span>}
              </div>
              <div className="field field--full">
                <label htmlFor="message">Nachricht *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Worum geht es und was soll die neue Website erreichen?"
                  onChange={() => clearError("message")}
                  {...fieldState("message")}
                />
                {errors.message && <span id="message-error">{errors.message}</span>}
              </div>
            </div>

            <label className="privacy-check">
              <input
                type="checkbox"
                name="privacy"
                onChange={() => clearError("privacy")}
                {...fieldState("privacy")}
              />
              <i aria-hidden="true" />
              <span>
                Ich stimme zu, dass meine Angaben zur Bearbeitung der Anfrage
                verwendet werden. *
              </span>
            </label>
            {errors.privacy && (
              <span className="privacy-error" id="privacy-error">
                {errors.privacy}
              </span>
            )}

            <div className="form-footer">
              <button className="button button--filled" type="submit">
                <span>Anfrage senden</span>
                <Arrow />
              </button>
              <p>Antwort in der Regel innerhalb von 1–2 Werktagen.</p>
            </div>

            {sent && (
              <div className="success-message" role="status" tabIndex={-1}>
                <span aria-hidden="true">✓</span>
                <div>
                  <strong>Danke für deine Anfrage.</strong>
                  <p>
                    Die Demo-Übermittlung war erfolgreich. Ein Backend kann hier
                    direkt angeschlossen werden.
                  </p>
                </div>
              </div>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const navigateToSection = useSectionNavigation();

  return (
    <footer className="site-footer">
      <div className="site-shell">
        <div className="footer-top">
          <a
            className="wordmark wordmark--footer"
            href="#top"
            onClick={(event) => navigateToSection(event, "#top")}
          >
            <span>LECHNER</span>
            <span>WEBDESIGN</span>
          </a>
          <nav aria-label="Footer-Navigation">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => navigateToSection(event, item.href)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="footer-contact">
            <span>Projekt im Kopf?</span>
            <a href="mailto:contact@lechner-webdesign.at">
              contact@lechner-webdesign.at
            </a>
          </div>
        </div>
        <div className="footer-bottom" id="legal">
          <p>© {year} Lechner Webdesign</p>
          <p>Based in Austria</p>
          <div>
            <a href="#legal">Impressum</a>
            <a href="#legal">Datenschutz</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function LechnerSite() {
  return (
    <>
      <a className="skip-link" href="#main-content">Zum Inhalt springen</a>
      <Header />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <ShowcaseSection />
        <InquirySection />
      </main>
      <Footer />
    </>
  );
}
