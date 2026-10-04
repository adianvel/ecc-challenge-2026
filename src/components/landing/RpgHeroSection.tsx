import { ArrowRight, Sparkle } from '@phosphor-icons/react';

interface RpgHeroSectionProps {
  isLoggedIn: boolean;
}

export function RpgHeroSection({ isLoggedIn }: RpgHeroSectionProps) {
  return (
    <section className="landing-screen landing-hero-screen" id="hero">
      {/* Background Scenic Visual */}
      <div className="rpg-hero-bg-layer" />

      {/* Atmospheric Soft Light Overlay */}
      <div className="landing-hero-overlay" />

      {/* Lightweight GPU-accelerated Pixel Art Drifting Clouds */}
      <div className="rpg-pixel-clouds-layer" aria-hidden="true">
        <img
          src="/assets/landing/pixel_cloud_big.png"
          alt=""
          className="rpg-pixel-cloud cloud-1"
          width="420"
          height="186"
          loading="eager"
        />
        <img
          src="/assets/landing/pixel_cloud_med.png"
          alt=""
          className="rpg-pixel-cloud cloud-2"
          width="250"
          height="155"
          loading="eager"
        />
        <img
          src="/assets/landing/pixel_cloud_small.png"
          alt=""
          className="rpg-pixel-cloud cloud-3"
          width="190"
          height="110"
          loading="eager"
        />
        <img
          src="/assets/landing/pixel_cloud_big.png"
          alt=""
          className="rpg-pixel-cloud cloud-4"
          width="360"
          height="160"
          loading="eager"
        />
        <img
          src="/assets/landing/pixel_cloud_med.png"
          alt=""
          className="rpg-pixel-cloud cloud-5"
          width="220"
          height="136"
          loading="eager"
        />
      </div>

      {/* Main RPG Hero Content */}
      <div className="rpg-hero-container">
        {/* Organizer Logos: ECC (far left) -> Kemendukbangga (center) -> SIAP IMPACT (right) */}
        <div className="rpg-organizers-pill" role="region" aria-label="Logo Penyelenggara">
          <div className="rpg-organizers-logos">
            {/* 1. ECC (Far Left) */}
            <div className="rpg-org-item" title="ECC - Engineering Career Center">
              <img
                src="/assets/ecc-logo.png"
                alt="Logo ECC"
                className="rpg-org-logo ecc"
                width="44"
                height="44"
              />
            </div>

            <div className="rpg-org-divider" />

            {/* 2. Kemendukbangga / BKKBN (Center) */}
            <div className="rpg-org-item" title="Kementerian Kependudukan dan Pembangunan Keluarga / BKKBN">
              <img
                src="/assets/landing/kemendukbangga-logo.svg"
                alt="Logo Kemendukbangga / BKKBN"
                className="rpg-org-logo kemendukbangga"
                width="190"
                height="44"
              />
            </div>

            <div className="rpg-org-divider" />

            {/* 3. SIAP IMPACT (Right) */}
            <div className="rpg-org-item" title="SIAP IMPACT 2026">
              <img
                src="/assets/landing/siap-impact-logo.png"
                alt="Logo SIAP IMPACT"
                className="rpg-org-logo siap-impact"
                width="96"
                height="42"
              />
            </div>
          </div>
        </div>

        {/* Title Group */}
        <div className="rpg-title-group">
          <span className="rpg-eyebrow">
            <Sparkle size={14} weight="fill" /> Program SIAP IMPACT 2026
          </span>
          <h1 className="rpg-main-title">Future Quest</h1>
          <p className="rpg-subtitle">
            Perjalanan belajar yang bisa kamu jelajahi. Temukan masalah, bangun prototipe solusi, dan jelajahi dampakmu.
          </p>
        </div>

        {/* RPG Hanging Menu Plaque Stack */}
        <div className="rpg-menu-stack" role="navigation" aria-label="Menu Utama Petualangan">
          <a className="rpg-menu-plaque rpg-plaque-primary" href="/demo">
            <span>Mulai Perjalanan</span>
            <ArrowRight size={20} weight="bold" className="rpg-plaque-icon" />
          </a>
          <div className="rpg-menu-chain" />
          <a className="rpg-menu-plaque" href={isLoggedIn ? "/play" : "/login"}>
            <span>Lanjutkan Perjalanan</span>
            <ArrowRight size={20} weight="bold" className="rpg-plaque-icon" />
          </a>
          <div className="rpg-menu-chain" />
          <a className="rpg-menu-plaque" href="/login">
            <span>Login</span>
            <ArrowRight size={20} weight="bold" className="rpg-plaque-icon" />
          </a>
        </div>

        {/* Footer Hint */}
        <p className="rpg-footer-hint">
          <span>Demo terbuka untuk semua · Akun peserta melalui undangan resmi ECC</span>
        </p>
      </div>
    </section>
  );
}
