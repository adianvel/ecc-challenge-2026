import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, MapTrifold, Hammer, PresentationChart, MapPin, EnvelopeSimple, ShieldCheck, Sparkle, Lightning, Trophy } from '@phosphor-icons/react';
import ScrollStack, { ScrollStackItem } from './ScrollStack';
import { AccountPage, type AccountMode } from './components/AccountPage';
import { authErrorMessage, useAuth } from './lib/auth';
import { supabase } from './lib/supabase';
import { navigate, useLocation } from './lib/navigation';
import { HERO_ROLES, type HeroRoleConfig } from './data/heroCharacters';
import { RpgHeroSection } from './components/landing/RpgHeroSection';

const ProgramApp = lazy(() => import('./ProgramApp'));

function TrackCharacters({ role }: { role: HeroRoleConfig }) {
  return <div className="track-characters" aria-label={`Karakter ${role.roleName}`}>
    {([role.male, role.female]).map((character) => <figure key={character.gender}>
      <img src={character.illustrationUrl} alt={`${character.label}: ${character.characterName}`} loading="lazy" />
      <figcaption>{character.label}</figcaption>
    </figure>)}
  </div>;
}

export function Brand({ linked = true }: { linked?: boolean } = {}) {
  const content = <><img src="/assets/ecc-logo.png" width="38" height="38" alt="" /><span>Future Quest<small>ECC · SIAP IMPACT 2026</small></span></>;
  return linked ? <a className="fq-brand" href="/" aria-label="Future Quest, beranda">{content}</a> : <div className="fq-brand">{content}</div>;
}

export default function App() {
  const location = useLocation();
  const path = location.split('?')[0];
  const auth = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const isDemo = path === '/demo' || path.startsWith('/demo/');
  const isParticipant = path === '/play' || path.startsWith('/play/');
  useEffect(() => { if (isParticipant && !auth.loading && !auth.session) navigate('/login', true); }, [isParticipant, auth.loading, auth.session]);
  const logout = async () => {
    if (!supabase || loggingOut) return;
    setLoggingOut(true);
    setLogoutError(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      navigate('/login', true);
    } catch (error) { setLogoutError(authErrorMessage(error)); }
    finally { setLoggingOut(false); }
  };
  if (isParticipant && (auth.loading || !auth.session)) return <div className="experience-loading" role="status">Memeriksa sesi…</div>;
  if (isDemo || isParticipant) return <div className={`experience-program ${/^\/(demo|play)\/stage\/[123]$/.test(path) ? 'is-playing' : ''}`}>
    <div className="experience-session"><a href="/" aria-label="Kembali ke beranda"><ArrowLeft size={15} /> Beranda</a><span>{isDemo ? 'Mode demo · progres simulasi' : `${auth.session?.user.email} ? progres simulasi`}</span>{isDemo ? <a href={auth.session ? "/play" : "/login"}>{auth.session ? "Lanjutkan perjalanan" : "Login peserta"}</a> : <button onClick={logout} disabled={loggingOut}>{loggingOut ? 'Keluar…' : 'Logout'}</button>}</div>
    {logoutError && <div className="session-error" role="alert">{logoutError}</div>}
    <div className="experience-program-body"><Suspense fallback={<div className="experience-loading" role="status">Menyiapkan ekspedisi…</div>}><ProgramApp key={isDemo ? 'demo' : auth.session!.user.id} mode={isDemo ? 'demo' : 'participant'} participantId={isDemo ? undefined : auth.session!.user.id} /></Suspense></div>
  </div>;
  const accountMode: AccountMode | null = path === '/login' ? 'login' : path === '/forgot-password' ? 'forgot' : path === '/auth/accept-invite' ? 'invite' : path === '/auth/reset-password' || path === '/auth/callback' ? 'recovery' : null;
  if (accountMode) return <div className="public-experience"><header className="public-nav"><Brand /><a href="/demo">Coba demo</a></header>{auth.loading ? <div className="account-loading" role="status">Memeriksa akun…</div> : <AccountPage key={accountMode} mode={accountMode} session={auth.session} callbackError={auth.error} linkKind={auth.linkKind} />}</div>;
  if (path !== '/') return <div className="public-experience"><header className="public-nav"><Brand /></header><main className="missing-page"><h1>Jalur ini belum ditemukan.</h1><p>Kembali ke beranda untuk login atau mencoba ekspedisi.</p><a className="entry-button entry-primary" href="/">Ke beranda</a></main></div>;
  return <div className="public-experience">
    <a className="skip-link" href="#journey">Langsung ke konten</a>
    <header className="public-nav">
      <Brand />
      <nav aria-label="Navigasi utama">
        <a href="#tracks">Pilihan track</a>
        <a href="#stages">Tentang perjalanan</a>
        <a className="entry-button entry-secondary" href={auth.session ? "/play" : "/login"}>{auth.session ? "Lanjutkan perjalanan" : "Login"}</a>
      </nav>
    </header>
    <main id="journey">
      {/* Screen 1: Hero - RPG Title Screen with Parallax, Drifting Clouds & Organizers */}
      <RpgHeroSection isLoggedIn={!!auth.session} />

      {/* Screen 2: Tracks */}
      <section className="landing-screen landing-stages landing-tracks-screen" id="tracks" aria-labelledby="track-heading">
        <div className="stage-content-wrap">
          <div className="stage-intro">
            <h2 id="track-heading">Tiga track. Pilih peranmu.</h2>
            <p>Setiap jalur memiliki fokus tantangan dan karakter di dalam game sendiri. Pilih peran yang paling sesuai dengan minat dan tujuan belajarmu.</p>
          </div>
          <ol className="landing-route track-route">
            <li>
              <ShieldCheck size={28} weight="duotone" />
              <div>
                <span className="pixel-label">Track 01 · Profesional</span>
                <h3>Ksatria (Knight)</h3>
                <p>Tantangan tata kelola, kepemimpinan kerja, dan pemecahan masalah operasional industri.</p>
                <TrackCharacters role={HERO_ROLES.professional} />
              </div>
            </li>
            <li>
              <Sparkle size={28} weight="duotone" />
              <div>
                <span className="pixel-label">Track 02 · Social Impact</span>
                <h3>Mistikus (Mage)</h3>
                <p>Tantangan pemberdayaan masyarakat, advokasi komunitas, dan dampak sosial nyata.</p>
                <TrackCharacters role={HERO_ROLES.social_impact} />
              </div>
            </li>
            <li>
              <Lightning size={28} weight="duotone" />
              <div>
                <span className="pixel-label">Track 03 · Bisnis</span>
                <h3>Assassin (Rogue)</h3>
                <p>Tantangan validasi model bisnis, inovasi produk, dan strategi pasar yang siap tumbuh.</p>
                <TrackCharacters role={HERO_ROLES.business} />
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Screen 3: Stages */}
      <section className="landing-screen landing-stages" id="stages" aria-labelledby="stage-heading">
        <div className="stage-content-wrap">
          <div className="stage-intro">
            <h2 id="stage-heading">Empat stage. Satu perjalanan milikmu.</h2>
            <p>Bergerak di peta, temukan papan misi, dan kerjakan tantangan sesuai jalur programmu. Kembali ke peta ekspedisi kapan pun untuk berpindah stage.</p>
          </div>
          <ScrollStack className="stage-scroll-stack">
            <ScrollStackItem itemClassName="stage-card-preview">
              <div className="stage-card-content">
                <span className="stage-card-step">Langkah berikutnya</span>
                <h2 className="stage-card-title">Stage 1 Discover</h2>
                <p className="stage-card-desc">Temukan akar masalah dari pengalaman nyata.</p>
                <span className="stage-card-pill">Misi: Observasi Masalah</span>
              </div>
              <div className="stage-card-map-wrap">
                <img
                  src="/assets/dungeon/map_stage1.png"
                  alt="Peta Stage 1 Discover"
                  className="stage-card-map-img"
                  loading="lazy"
                />
                <div className="stage-card-map-fade" />
              </div>
            </ScrollStackItem>

            <ScrollStackItem itemClassName="stage-card-preview">
              <div className="stage-card-content">
                <span className="stage-card-step">Langkah berikutnya</span>
                <h2 className="stage-card-title">Stage 2 Build</h2>
                <p className="stage-card-desc">Bangun dan uji prototipe dari temuan lapangan.</p>
                <span className="stage-card-pill">Misi: Prototyping Solusi</span>
              </div>
              <div className="stage-card-map-wrap">
                <img
                  src="/assets/dungeon/map_stage2.png"
                  alt="Peta Stage 2 Build"
                  className="stage-card-map-img"
                  loading="lazy"
                />
                <div className="stage-card-map-fade" />
              </div>
            </ScrollStackItem>

            <ScrollStackItem itemClassName="stage-card-preview">
              <div className="stage-card-content">
                <span className="stage-card-step">Langkah berikutnya</span>
                <h2 className="stage-card-title">Stage 3 Pitch</h2>
                <p className="stage-card-desc">Uji, sempurnakan, dan siapkan presentasi final.</p>
                <span className="stage-card-pill">Misi: Validasi &amp; Pitching</span>
              </div>
              <div className="stage-card-map-wrap">
                <img
                  src="/assets/dungeon/map_stage3.png"
                  alt="Peta Stage 3 Pitch"
                  className="stage-card-map-img"
                  loading="lazy"
                />
                <div className="stage-card-map-fade" />
              </div>
            </ScrollStackItem>

            <ScrollStackItem itemClassName="stage-card-preview">
              <div className="stage-card-content">
                <span className="stage-card-step">Langkah berikutnya</span>
                <h2 className="stage-card-title">Stage 4 Impact</h2>
                <p className="stage-card-desc">Rayakan dampak dan kelulusan perjalananmu di kayangan.</p>
                <span className="stage-card-pill">Misi: Dampak Nyata</span>
              </div>
              <div className="stage-card-map-wrap">
                <img
                  src="/assets/dungeon/map_stage4.png"
                  alt="Peta Stage 4 Impact"
                  className="stage-card-map-img"
                  loading="lazy"
                />
                <div className="stage-card-map-fade" />
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </div>
      </section>

      {/* Screen 4: Invitation & Footer */}
      <section className="landing-screen landing-closing-screen" id="closing">
        <div className="landing-invitation">
          <div>
            <h2>Sudah menjadi peserta?</h2>
            <p>Gunakan undangan ECC untuk mengaktifkan akun, lalu lanjutkan ekspedisimu.</p>
          </div>
          <a className="entry-button entry-secondary" href={auth.session ? "/play" : "/login"}>{auth.session ? "Lanjutkan perjalanan" : "Login peserta"}</a>
        </div>
        <footer className="public-footer">
          <div className="footer-main">
            <div className="footer-about"><Brand linked={false} /><p>Future Quest adalah perjalanan belajar interaktif dalam program SIAP IMPACT 2026. Jelajahi stage, kerjakan tantangan, dan bangun dampakmu.</p></div>
            <nav aria-label="Navigasi Future Quest"><h2>Future Quest</h2><a href="#hero">Beranda</a><a href="#tracks">Tiga track</a><a href="#stages">Empat stage</a><a href="/demo">Coba demo</a></nav>
            <nav aria-label="Ekosistem ECC"><h2>Ekosistem ECC</h2><a href="https://ecc.co.id/">Situs ECC</a><a href="https://ecc.co.id/products/opa">Career Match Engine</a><a href="https://ecc.co.id/products/oas">Online Assessment &amp; Selection</a></nav>
            <div className="footer-contact"><h2>Kontak</h2><p><MapPin size={18} aria-hidden="true" /><span><strong>Gedung PDIN, Yogyakarta</strong><br /><span className="footer-address-detail">Lantai 2, Jl. C. Simanjuntak No. 19, Terban, Daerah Istimewa Yogyakarta 55223, Indonesia</span></span></p><a href="mailto:business@ecc.co.id"><EnvelopeSimple size={18} aria-hidden="true" />business@ecc.co.id</a></div>
          </div>
          <div className="footer-bottom"><span>© 2026 PT Engineering Career Center. Seluruh hak dilindungi.</span><div className="footer-social" aria-label="Media sosial ECC"><a href="https://www.instagram.com/ecc.co.id" aria-label="Instagram ECC"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8A4 4 0 0 1 16 11.37m1.5-4.87h.01" /></svg></a><a href="https://id.linkedin.com/company/ecccoid" aria-label="LinkedIn ECC"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6M2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg></a><a href="https://www.facebook.com/ecccoid" aria-label="Facebook ECC"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a><a href="https://www.youtube.com/channel/UCpZ8jpedlSssDIbT9344N6Q" aria-label="YouTube ECC"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 17a24.1 24.1 0 0 1 0-10a2 2 0 0 1 1.4-1.4a49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10a2 2 0 0 1-1.4 1.4a49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15l5-3l-5-3z" /></svg></a></div></div>
        </footer>
      </section>
    </main>
  </div>;
}
