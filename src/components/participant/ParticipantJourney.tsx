import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpenText, Check, Compass, LockKey, MapTrifold, Medal, Sparkle, Trophy, UserCircle } from '@phosphor-icons/react';
import type { Dispatch, SetStateAction } from 'react';
import type { FutureBase, PathCode, Submission, UserRole } from '../../types';
import { OFFICIAL_PATHS, STAGE_BOSS_MISSIONS, STAGE_QUIZZES, TRACK_STAGE_FOCUS } from '../../data/mockQuests';
import { STAGE_MONSTERS } from '../../data/stageMonsters';
import { DEFAULT_DEMO_ACCESS, getStageAccess, PARTICIPANT_STAGES, trackLabel, type DemoAccessState, type ParticipantStage, type StageOrdinal, type StageGate } from '../../data/participantStages';
import { BossMissionModal } from '../modals/BossMissionModal';
import { InteractiveQuizModal } from '../modals/InteractiveQuizModal';
import { LeaderboardModal } from '../modals/LeaderboardModal';
import { JourneyDialog } from '../ui/JourneyDialog';
import { GameWorld } from '../../ui/game-world';
import { getHeroAvatar, getHeroSprite, getHeroConfig, getSavedHeroGender, saveHeroGender, type HeroGender } from '../../data/heroCharacters';

import type { ParticipantDemoState } from '../../lib/progress';

export function ParticipantJourney({
  currentPath,
  currentRole,
  demo,
  setDemo,
  onCompleteOnboarding,
  onSelectStage,
  onRoleChange,
  allowStaffDemo = true,
  onNavigate,
  storageScope,
  storageError,
}: {
  currentPath: PathCode;
  currentRole: UserRole;
  demo: ParticipantDemoState;
  setDemo: Dispatch<SetStateAction<ParticipantDemoState>>;
  onCompleteOnboarding: (path: PathCode, futureBase: FutureBase) => void;
  onSelectStage: (stage: StageOrdinal) => void;
  onRoleChange: (role: UserRole) => void;
  allowStaffDemo?: boolean;
  onNavigate: (screen: ParticipantDemoState['screen']) => void;
  storageScope: string;
  storageError: string | null;
}) {
  const [selectedPreview, setSelectedPreview] = useState<StageOrdinal>(1);
  const [heroGender, setHeroGender] = useState<HeroGender>(() => getSavedHeroGender());
  const heroConfig = getHeroConfig(currentPath, heroGender);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [pausePassportOpen, setPausePassportOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const openPause = useCallback(() => setPauseOpen(true), []);
  const closePause = () => { setPauseOpen(false); setPausePassportOpen(false); };
  const [activeQuiz, setActiveQuiz] = useState<(typeof STAGE_QUIZZES)[number] | null>(null);
  const [victoryEvent, setVictoryEvent] = useState<{ quizId: string; serial: number } | null>(null);
  const [activeMission, setActiveMission] = useState<(typeof STAGE_BOSS_MISSIONS)[number] | null>(null);
  const totalXp = useMemo(() => Object.values(demo.xpAwards).reduce((sum, amount) => sum + amount, 0), [demo.xpAwards]);
  const activeStage = PARTICIPANT_STAGES.find(stage => stage.ordinal === demo.currentStage) || PARTICIPANT_STAGES[0];
  const activeGate = getStageAccess(activeStage.ordinal, demo.access);
  const introOpen = demo.screen === 'stage' && !demo.introducedStages.includes(activeStage.ordinal);
  const beginStage = () => setDemo(current => ({ ...current, introducedStages: current.introducedStages.includes(activeStage.ordinal) ? current.introducedStages : [...current.introducedStages, activeStage.ordinal] }));
  const nextQuiz = STAGE_QUIZZES.find(quiz => quiz.stageOrdinal === activeStage.ordinal && !demo.quizDefeats.includes(quiz.id));
  const bossDefeated = demo.quizDefeats.includes(STAGE_MONSTERS[activeStage.ordinal][2].quizId);
  const submission = demo.submissions[activeStage.ordinal];
  const objective = nextQuiz ? `Kerjakan kuis: ${nextQuiz.title}`
    : (submission?.status === 'changes_requested' || (submission?.status === 'draft' && submission.review?.decision === 'changes_requested')) ? 'Revisi misi mengikuti masukan mentor.'
    : ['submitted', 'in_review'].includes(submission?.status || '') ? 'Kiriman tersimpan. Tunggu hasil review mentor.'
    : submission?.status === 'reviewed' ? 'Stage selesai. Pilih stage berikutnya di peta ekspedisi.'
    : `Selesaikan misi: ${STAGE_BOSS_MISSIONS[activeStage.ordinal].title}`;
  const openQuiz = useCallback((quizId: string) => setActiveQuiz(STAGE_QUIZZES.find(quiz => quiz.id === quizId) || null), []);
  const openMission = useCallback(() => setActiveMission(STAGE_BOSS_MISSIONS[activeStage.ordinal]), [activeStage.ordinal]);


  const enterStage = (stage: ParticipantStage) => {
    const access = getStageAccess(stage.ordinal, demo.access);
    setSelectedPreview(stage.ordinal);
    if (!access.unlocked) return;
    onSelectStage(stage.ordinal);
    setDemo(current => ({ ...current, currentStage: stage.ordinal, screen: 'stage' }));
  };

  const markQuizAttempt = (quizId: string) => setDemo(current => {
    if (current.quizAttempts.includes(quizId)) return current;
    return {
      ...current,
      quizAttempts: [...current.quizAttempts, quizId],
      xpAwards: { ...current.xpAwards, [`quiz:${quizId}`]: 10 },
    };
  });
  const markQuizDefeat = (quizId: string) => setDemo(current => current.quizDefeats.includes(quizId) ? current : {
    ...current, quizDefeats: [...current.quizDefeats, quizId],
  });

  const saveMission = useCallback((submission: Submission) => setDemo(current => ({
    ...current,
    submissions: { ...current.submissions, [submission.stageOrdinal]: submission },
  })), [setDemo]);

  const updateGate = (ordinal: 2 | 3, patch: Partial<StageGate>) => setDemo(current => ({
    ...current,
    access: {
      ...current.access,
      [ordinal === 2 ? 'stage2' : 'stage3']: { ...current.access[ordinal === 2 ? 'stage2' : 'stage3'], ...patch },
    },
  }));

  const toggleView = (screen: ParticipantDemoState['screen']) => onNavigate(screen);

  return (
    <div className={`participant-shell ${demo.screen === "stage" ? "is-playing" : ""}`}>
      <header className="participant-topbar">
        <img className="brand-mark" src="/assets/ecc-logo.png" alt="" />
        <div className="brand-copy"><span>ECC · SIAP IMPACT 2026</span><strong>FUTURE QUEST</strong></div>
        <div className="topbar-spacer" />
        {demo.onboarded && (
          <button
            type="button"
            onClick={() => setIsLeaderboardOpen(true)}
            className="topbar-leaderboard-btn"
            title="Papan Peringkat Global (Leaderboard)"
          >
            <Trophy size={16} weight="fill" className="text-amber-500" />
            <span className="font-rpg text-xs">Peringkat</span>
          </button>
        )}
        {demo.onboarded && (
          <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/40 rounded-full px-2.5 py-1 shadow-sm">
            <img 
              src={getHeroAvatar(currentPath, heroGender)} 
              alt={heroConfig.characterName} 
              className="w-7 h-7 rounded-full border border-amber-400 object-cover shadow-sm"
              title={`${heroConfig.characterName} (${heroConfig.title})`}
            />
            <div className="flex flex-col text-left leading-tight hidden sm:flex">
              <span className="text-[11px] font-bold text-amber-300 font-rpg">{heroConfig.characterName}</span>
              <span className="text-[9px] text-slate-400 font-mono">{heroConfig.title}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = heroGender === 'male' ? 'female' : 'male';
                setHeroGender(next);
                saveHeroGender(next);
              }}
              className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 cursor-pointer transition-all active:scale-95 ml-1"
              title="Ganti Gender Karakter (Laki-laki / Perempuan)"
            >
              {heroGender === 'male' ? '♂ L' : '♀ P'}
            </button>
          </div>
        )}
        {demo.onboarded && <span className="track-chip"><span />{trackLabel(currentPath)}</span>}
        {allowStaffDemo && <label className="workspace-picker"><UserCircle size={17} /><span>Demo peran</span>
          <select aria-label="Pilih workspace" value={currentRole} onChange={event => onRoleChange(event.target.value as UserRole)}>
            <option value="participant">Peserta</option><option value="mentor">Mentor</option><option value="admin">Admin</option>
          </select>
        </label>}
      </header>

      <main className={`participant-main ${demo.screen === 'stage' ? 'has-game' : ''}`}>
        {!demo.onboarded ? (
          <Onboarding currentPath={currentPath} onContinue={onCompleteOnboarding} />
        ) : demo.screen === 'stage' ? (
          <section className="stage-screen">
            <GameWorld 
              key={`${activeStage.ordinal}-${currentPath}-${heroGender}`} 
              stage={activeStage} 
              paused={introOpen || pauseOpen || Boolean(activeQuiz) || Boolean(activeMission) || isLeaderboardOpen}
              quizDefeats={demo.quizDefeats}
              victoryEvent={victoryEvent}
              onOpenQuiz={openQuiz}
              onPause={openPause} 
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              heroSpritesheetUrl={getHeroSprite(currentPath, heroGender)}
            />
            {introOpen && <JourneyDialog titleId="stage-intro-title" className="stage-intro-dialog" onClose={beginStage}>
              <p className="dialog-stage-label">{activeStage.phase} {activeStage.name}</p><h2 id="stage-intro-title">{activeStage.description}</h2><p>{TRACK_STAGE_FOCUS[currentPath][activeStage.ordinal]}</p>
              <div className="stage-first-step"><Compass size={24} /><div><strong>Temukan tiga monster kuis</strong><p>Jawab dua kuis untuk membuka boss. Setelah boss kalah, buka Misi dari menu Jeda.</p></div></div>
              <ControlsGuide />
              <footer className="dialog-actions"><span className="demo-note">Progres belajar disimpan sebagai simulasi di browser ini.</span><button className="button button-gold" onClick={beginStage}>Mulai menjelajah</button></footer>
            </JourneyDialog>}
            {pauseOpen && <JourneyDialog titleId="pause-title" className="pause-dialog" onClose={closePause}>
              <p className="dialog-stage-label">{activeStage.phase} {activeStage.name}</p><h2 id="pause-title">{pausePassportOpen ? 'Future Passport' : 'Permainan dijeda'}</h2>
              {pausePassportOpen ? <><p>{trackLabel(currentPath)} · {totalXp.toLocaleString('id-ID')} XP</p><BaseMilestones milestones={PARTICIPANT_STAGES.map(stage => isStageComplete(stage, demo))} /></> : <><div className="pause-brief"><strong>Brief stage</strong><p>{activeStage.description}</p><p>{TRACK_STAGE_FOCUS[currentPath][activeStage.ordinal]}</p></div><p><strong>Langkah berikutnya:</strong> {objective}</p><p className="pause-instruction"><strong>Misi: {STAGE_BOSS_MISSIONS[activeStage.ordinal].title}</strong><br />{bossDefeated ? 'Terbuka. Pilih Buka misi di bawah.' : `Terkunci. Kalahkan ${3 - STAGE_QUIZZES.filter(quiz => quiz.stageOrdinal === activeStage.ordinal && demo.quizDefeats.includes(quiz.id)).length} monster kuis untuk membukanya.`}</p><ControlsGuide /></>}
              <footer className="pause-actions">
                <button className="button button-gold" onClick={closePause}>Lanjutkan permainan</button>
                {!pausePassportOpen && <button className="button button-outline" disabled={!bossDefeated} onClick={() => { closePause(); openMission(); }}>Buka misi</button>}
                <button className="button button-quiet" onClick={() => { closePause(); setIsLeaderboardOpen(true); }}><Trophy size={18} className="text-amber-500" weight="fill" />Papan Peringkat</button>
                <button className="button button-quiet" onClick={() => setPausePassportOpen(value => !value)}><BookOpenText size={18} />{pausePassportOpen ? 'Kembali ke menu jeda' : 'Future Passport'}</button>
                <button className="button button-quiet" onClick={() => { closePause(); toggleView('expedition'); }}>Kembali ke peta ekspedisi</button>
              </footer>
            </JourneyDialog>}
            <InteractiveQuizModal
              key={activeQuiz?.id || 'no-quiz'}
              quiz={activeQuiz}
              currentPath={currentPath}
              gender={heroGender}
              trackFocus={TRACK_STAGE_FOCUS[currentPath][activeStage.ordinal]}
              alreadyAttempted={Boolean(activeQuiz && demo.quizAttempts.includes(activeQuiz.id))}
              readOnly={activeGate.readOnly}
              onClose={() => setActiveQuiz(null)}
              onSubmit={markQuizAttempt}
              onCorrect={markQuizDefeat}
              onVictoryClose={quizId => setVictoryEvent(current => ({ quizId, serial: (current?.serial || 0) + 1 }))}
            />
            <BossMissionModal
              key={activeMission?.id || 'no-mission'}
              mission={activeMission}
              storageScope={storageScope}
              saveError={storageError}
              currentSubmission={demo.submissions[activeStage.ordinal]}
              currentPath={currentPath}
              trackFocus={TRACK_STAGE_FOCUS[currentPath][activeStage.ordinal]}
              readOnly={activeGate.readOnly}
              onClose={() => setActiveMission(null)}
              onSubmitMission={saveMission}
            />
          </section>
        ) : demo.screen === 'passport' ? (
          <PassportPage
            currentPath={currentPath}
            demo={demo}
            totalXp={totalXp}
            onBack={() => toggleView('expedition')}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onUpdateGate={updateGate}
          />
        ) : (
          <ExpeditionMap
            currentPath={currentPath}
            demo={demo}
            totalXp={totalXp}
            selectedPreview={selectedPreview}
            onPreview={setSelectedPreview}
            onEnter={enterStage}
            onPassport={() => toggleView('passport')}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onUpdateGate={updateGate}
          />
        )}
      </main>
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUserPath={currentPath}
        currentUserTotalXp={totalXp}
        currentUserName={heroConfig.characterName}
        currentUserCity="Yogyakarta"
        currentUserStageReached={demo.currentStage}
      />
    </div>
  );
}

function Onboarding({ currentPath, onContinue }: { currentPath: PathCode; onContinue: (path: PathCode, futureBase: FutureBase) => void }) {
  const [path, setPath] = useState<PathCode>(currentPath);
  const [gender, setGender] = useState<HeroGender>(() => getSavedHeroGender());
  const [direction, setDirection] = useState('');
  const [target90d, setTarget90d] = useState('');
  const selected = OFFICIAL_PATHS[path];
  const activeHero = getHeroConfig(path, gender);

  const handleGenderSelect = (newGender: HeroGender) => {
    setGender(newGender);
    saveHeroGender(newGender);
  };

  return (
    <section className="onboarding-layout">
      <div className="onboarding-art">
        <div className="onboarding-art-shade" />
        <div className="onboarding-copy"><span className="eyebrow">Future Base · sebelum bootcamp</span>
          <h1>Siapkan perjalananmu.</h1>
          <p>Pilih fokus belajar dan tuliskan tujuanmu. Setelah ini, kamu bisa menjelajahi empat stage.</p>
          <div className="onboarding-sequence"><span className="sequence-active">01 Future Base</span><i /><span>02 L1 Discover</span><i /><span>03 L2 Build</span><i /><span>04 L3 Pitch</span></div>
        </div>
        
      </div>
      <form className="onboarding-form" onSubmit={event => { event.preventDefault(); if (!direction.trim() || !target90d.trim()) return; onContinue(path, { direction: direction.trim(), target90d: target90d.trim(), skills: [], support: '' }); }}>
        
        <h2>Pilih jalur & karakter hero</h2>
        <p className="muted-copy">Tentukan fokus track dan persona karakter petualangmu.</p>

        {/* Gender Selector with FF Avatar Preview */}
        <div className="p-3 bg-slate-900/90 border border-slate-700 rounded-xl mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img 
              src={activeHero.avatarUrl} 
              alt={activeHero.characterName} 
              className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-md"
            />
            <div>
              <div className="font-bold text-amber-300 text-sm font-rpg">{activeHero.characterName}</div>
              <div className="text-xs text-slate-300 font-mono">{activeHero.title}</div>
            </div>
          </div>

          <div className="flex gap-1.5" role="radiogroup" aria-label="Pilih Gender Hero">
            <button
              type="button"
              onClick={() => handleGenderSelect('male')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                gender === 'male' 
                  ? 'bg-sky-600 border-sky-400 text-white shadow-sm' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              ♂ Laki-laki
            </button>
            <button
              type="button"
              onClick={() => handleGenderSelect('female')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                gender === 'female' 
                  ? 'bg-rose-600 border-rose-400 text-white shadow-sm' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              ♀ Perempuan
            </button>
          </div>
        </div>

        <div className="track-options" role="radiogroup" aria-label="Pilih track program">
          {Object.values(OFFICIAL_PATHS).map(option => <button type="button" key={option.code} className={`track-option ${path === option.code ? 'selected' : ''}`} onClick={() => setPath(option.code)} role="radio" aria-checked={path === option.code}>
            <span className="track-option-icon" style={{ color: option.themeColor }}>{path === option.code ? <Check size={18} /> : <Compass size={18} />}</span>
            <span><strong>{option.title}</strong><small>{option.subtitle}</small></span>
          </button>)}
        </div>
        <label className="form-field">Arah yang ingin kamu bangun<textarea rows={2} required value={direction} onChange={event => setDirection(event.target.value)} placeholder={`Fokus ${selected.title.toLowerCase()} yang ingin kamu kembangkan`} /></label>
        <label className="form-field">Target 90 hari<textarea rows={2} required value={target90d} onChange={event => setTarget90d(event.target.value)} placeholder="Tuliskan hasil nyata yang ingin kamu capai" /></label>
        <div className="onboarding-note"><Sparkle size={16} /><span>Future Base adalah milestone onboarding, bukan bootcamp stage dan tidak membuka akses seleksi.</span></div>
        <button className="button button-gold onboarding-submit" type="submit" disabled={!direction.trim() || !target90d.trim()}>Simpan & buka peta <ArrowRight size={17} /></button>
      </form>
    </section>
  );
}

function ExpeditionMap({ currentPath, demo, totalXp, selectedPreview, onPreview, onEnter, onPassport, onOpenLeaderboard, onUpdateGate }: {
  currentPath: PathCode;
  demo: ParticipantDemoState;
  totalXp: number;
  selectedPreview: StageOrdinal;
  onPreview: (stage: StageOrdinal) => void;
  onEnter: (stage: ParticipantStage) => void;
  onPassport: () => void;
  onOpenLeaderboard: () => void;
  onUpdateGate: (ordinal: 2 | 3, patch: Partial<StageGate>) => void;
}) {
  const stage = PARTICIPANT_STAGES.find(item => item.ordinal === selectedPreview) || PARTICIPANT_STAGES[0];
  const access = getStageAccess(stage.ordinal, demo.access);
  const next = PARTICIPANT_STAGES.find(item => getStageAccess(item.ordinal, demo.access).unlocked && !isStageComplete(item, demo)) || PARTICIPANT_STAGES[0];
  return (
    <div className="expedition-layout">
      <nav className="expedition-nav" aria-label="Navigasi dashboard">
        <span className="expedition-nav-title">Perjalananmu</span>
        <a className="expedition-nav-link is-current" href="#stage-list"><MapTrifold size={19} /> Peta ekspedisi</a>
        <button className="expedition-nav-link" onClick={onPassport}><BookOpenText size={19} /> Future Passport</button>
        <button className="expedition-nav-link" onClick={onOpenLeaderboard}><Trophy size={19} /> Papan peringkat</button>
        <div className="expedition-nav-progress"><span>Stage selesai</span><strong>{PARTICIPANT_STAGES.filter(item => isStageComplete(item, demo)).length} / {PARTICIPANT_STAGES.length}</strong><small>Lanjutkan dari stage yang tersedia.</small></div>
      </nav>
      <section className="expedition-content">
        <div className="expedition-heading"><div><h1>Peta Ekspedisi</h1><p>Pilih stage, jelajahi peta, dan selesaikan tiga tantangan monster.</p></div></div>
        <div className="next-step" style={{ '--next-map': `url('${next.mapPath}')` } as React.CSSProperties}><div><span className="next-step-label">Langkah berikutnya</span><strong>{next.phase} {next.name}</strong><p>{next.description}</p><button className="button button-gold" onClick={() => onEnter(next)}>{demo.quizAttempts.length || Object.keys(demo.submissions).length ? 'Lanjutkan stage' : 'Mulai bermain'} <ArrowRight size={17} /></button></div></div>
        <div className="route-panel" id="stage-list">
          <div className="route-panel-top"><strong>Pilih stage</strong><span>{PARTICIPANT_STAGES.length} stage bootcamp</span></div>
          <div className="stage-route" aria-label="Empat stage bootcamp">
            {PARTICIPANT_STAGES.map((item, index) => {
              const itemAccess = getStageAccess(item.ordinal, demo.access);
              const complete = isStageComplete(item, demo);
              const active = selectedPreview === item.ordinal;
              const status = itemAccess.readOnly ? 'Hanya lihat' : complete ? 'Selesai' : itemAccess.unlocked ? 'Tersedia' : 'Terkunci';
              return <div className="route-stop" key={item.ordinal}>
                {index > 0 && <span className={`route-connector ${itemAccess.unlocked ? 'connector-open' : ''}`} aria-hidden="true" />}
                <button className={`stage-card ${active ? 'stage-card-selected' : ''} ${itemAccess.unlocked ? '' : 'stage-card-locked'}`} style={{ '--stage-accent': item.accent } as React.CSSProperties} onClick={() => { onPreview(item.ordinal); onEnter(item); }} aria-label={`${item.phase} ${item.name}, ${status}`}>
                  <span className="stage-card-image" style={{ backgroundImage: `linear-gradient(180deg,rgba(3,10,18,.02),rgba(3,10,18,.92)),url('${item.mapPath}')` }} />
                  <span className="stage-card-top"><span>{item.phase}</span>{itemAccess.unlocked ? <span className="stage-lock-open">OPEN</span> : <LockKey size={16} />}</span>
                  <span className="stage-card-body"><strong>{item.name}</strong><small>{item.description}</small><span className={`stage-status ${itemAccess.unlocked ? 'status-open' : ''}`}>{complete ? <Check size={13} /> : itemAccess.unlocked ? <Compass size={13} /> : <LockKey size={13} />}{status}</span></span>
                  <span className="stage-card-action">{itemAccess.unlocked ? 'Jelajahi stage' : 'Lihat status'} <ArrowRight size={14} /></span>
                </button>
              </div>;
            })}
          </div>
          <div className="route-summary"><span className="route-summary-dot" />{stage.phase} · {stage.name}<span>{access.unlocked ? (access.readOnly ? 'Akses hanya baca' : 'Siap dijelajahi') : lockMessage(access.reason)}</span></div>
        </div>

        <AccessControls access={demo.access} onUpdateGate={onUpdateGate} />
      </section>
      <aside className="passport-rail">
        <PassportSummary currentPath={currentPath} demo={demo} totalXp={totalXp} onOpen={onPassport} onOpenLeaderboard={onOpenLeaderboard} />
        <div className="rail-note"><strong>Progres simulasi</strong><p>Hasil, jadwal, status review, dan XP tersimpan di browser ini sebagai data demo.</p></div>
      </aside>
    </div>
  );
}

function PassportSummary({ currentPath, demo, totalXp, onOpen, onOpenLeaderboard }: { currentPath: PathCode; demo: ParticipantDemoState; totalXp: number; onOpen: () => void; onOpenLeaderboard: () => void }) {
  const milestones = PARTICIPANT_STAGES.map(stage => isStageComplete(stage, demo));
  return <section className="passport-card">
    <div className="passport-title"><span>FUTURE PASSPORT</span><span className="demo-pill">DEMO</span></div>
    <div className="passport-track"><span>PROGRAM TRACK</span><strong>{trackLabel(currentPath)}</strong></div>
    <div className="passport-xp">
      <span>XP TOTAL <small>NONSPENDABLE</small></span>
      <strong>{totalXp.toLocaleString('id-ID')} <i>XP</i></strong>
      <div className="xp-track"><span style={{ width: `${Math.min(totalXp, 100)}%` }} /></div>
      <button type="button" onClick={onOpenLeaderboard} className="passport-leaderboard-btn">
        <Trophy size={15} weight="fill" className="text-amber-500" />
        <span>Peringkat Global</span>
      </button>
      <small>Progres ilustrasi saja · tidak memengaruhi akses</small>
    </div>
    <BaseMilestones milestones={milestones} />
    <button className="passport-open" onClick={onOpen}>Buka passport lengkap <ArrowRight size={15} /></button>
  </section>;
}

function PassportPage({ currentPath, demo, totalXp, onBack, onOpenLeaderboard, onUpdateGate }: {
  currentPath: PathCode;
  demo: ParticipantDemoState;
  totalXp: number;
  onBack: () => void;
  onOpenLeaderboard: () => void;
  onUpdateGate: (ordinal: 2 | 3, patch: Partial<StageGate>) => void;
}) {
  const milestones = PARTICIPANT_STAGES.map(stage => isStageComplete(stage, demo));
  return <div className="passport-page">
    <div className="passport-page-heading">
      <div>
        <span className="page-kicker"><BookOpenText size={16} /> INDIVIDUAL PROGRESS · DEMO</span>
        <h1>Future Passport</h1>
        <p>Track, XP nonspendable, dan milestone stage milikmu.</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="button button-quiet" onClick={onOpenLeaderboard}>
          <Trophy size={17} weight="fill" className="text-amber-500" /> Peringkat Global
        </button>
        <button className="button button-quiet" onClick={onBack}>
          <ArrowLeft size={17} /> Kembali ke Peta
        </button>
      </div>
    </div>
    {demo.futureBase && <section className="future-base-summary"><h2>Tujuan perjalananmu</h2><p>{demo.futureBase.direction}</p><strong>Target 90 hari</strong><p>{demo.futureBase.target90d}</p></section>}
    <div className="passport-page-grid">
      <section className="passport-large-card">
        <span className="eyebrow">PROGRAM TRACK</span>
        <strong className="passport-track-name">{trackLabel(currentPath)}</strong>
        <span className="passport-track-description">{OFFICIAL_PATHS[currentPath].subtitle}</span>
        <div className="passport-total">
          <span>XP DEMO · NONSPENDABLE</span>
          <strong>{totalXp.toLocaleString('id-ID')} <i>XP</i></strong>
          <div className="xp-track"><span style={{ width: `${Math.min(totalXp, 100)}%` }} /></div>
          <button type="button" onClick={onOpenLeaderboard} className="passport-leaderboard-btn">
            <Trophy size={16} weight="fill" className="text-amber-500" />
            <span>Lihat Posisi di Peringkat Global</span>
          </button>
          <small>Bar ilustrasi dari 0–100 XP. XP tidak mengubah hasil seleksi atau akses stage.</small>
        </div>
      </section>
      <section className="passport-large-card base-card"><span className="eyebrow">PERSONAL BASE · MILESTONE</span><h2>Bangun dari hasil kerjamu</h2><p>Satu milestone tampil untuk setiap stage yang selesai.</p><BaseMilestones milestones={milestones} large /></section>
    </div>
    <div className="passport-stage-list">{PARTICIPANT_STAGES.map(stage => {
      const done = isStageComplete(stage, demo);
      const status = getStageAccess(stage.ordinal, demo.access);
      return <div className="passport-stage-row" key={stage.ordinal}><span className={`milestone-icon ${done ? 'milestone-done' : ''}`}>{done ? <Check size={17} /> : <Medal size={17} />}</span><div><strong>{stage.phase} · {stage.name}</strong><small>{done ? 'Stage selesai' : status.readOnly ? 'Akses sebelumnya · hanya baca' : status.unlocked ? 'Tersedia pada simulasi ini' : lockMessage(status.reason)}</small></div><span className="demo-pill">DEMO</span></div>;
    })}</div>
    <AccessControls access={demo.access} onUpdateGate={onUpdateGate} />
  </div>;
}

function BaseMilestones({ milestones, large = false }: { milestones: boolean[]; large?: boolean }) {
  return <div className={`base-milestones ${large ? 'base-milestones-large' : ''}`} aria-label={`${milestones.filter(Boolean).length} dari 3 milestone selesai`}>
    {PARTICIPANT_STAGES.map((stage, index) => <div className={`base-milestone ${milestones[index] ? 'milestone-complete' : ''}`} key={stage.ordinal}>
      <div className={`base-layer layer-${index + 1}`}>{milestones[index] ? <Check size={15} weight="bold" /> : <span>{String(index + 1).padStart(2, '0')}</span>}</div><strong>{stage.phase}</strong><small>{stage.name}</small>
    </div>)}
  </div>;
}

function AccessControls({ access, onUpdateGate }: { access: DemoAccessState; onUpdateGate: (ordinal: 2 | 3, patch: Partial<StageGate>) => void }) {
  return <details className="access-controls">
    <summary><span><LockKey size={16} /> Simulasi akses stage</span><span className="demo-pill">DEMO DATA</span></summary>
    <p>Ubah nilai simulasi untuk melihat gate hasil dan jadwal. Ini tidak terhubung ke keputusan ECC.</p>
    {([2, 3] as const).map(ordinal => {
      const gate = access[ordinal === 2 ? 'stage2' : 'stage3'];
      return <fieldset className="gate-row" key={ordinal}><legend>L{ordinal} · {ordinal === 2 ? 'Hasil L1' : 'Hasil L2'}</legend>
        <label className="gate-check"><input type="checkbox" checked={gate.resultPublished} onChange={event => onUpdateGate(ordinal, { resultPublished: event.target.checked })} /><span>Hasil dipublikasikan</span></label>
        <label className="gate-select"><span>Keputusan</span><select aria-label={`Keputusan akses L${ordinal}`} value={gate.decision} onChange={event => onUpdateGate(ordinal, { decision: event.target.value as StageGate['decision'] })}><option value="advance">Maju</option><option value="not-advanced">Tidak maju</option></select></label>
        <label className="gate-check"><input type="checkbox" checked={gate.scheduledOpen} onChange={event => onUpdateGate(ordinal, { scheduledOpen: event.target.checked })} /><span>Jadwal pembukaan tiba</span></label>
      </fieldset>;
    })}
  </details>;
}

function isStageComplete(stage: ParticipantStage, demo: ParticipantDemoState) {
  const quizzesDone = STAGE_QUIZZES.filter(quiz => quiz.stageOrdinal === stage.ordinal).every(quiz => demo.quizDefeats.includes(quiz.id));
  return quizzesDone && demo.submissions[stage.ordinal]?.status === 'reviewed';
}

function lockMessage(reason: ReturnType<typeof getStageAccess>['reason']) {
  if (reason === 'not-advanced') return 'Hasil demo: tidak maju · sebelumnya hanya baca';
  if (reason === 'schedule-pending') return 'Menunggu jadwal pembukaan demo';
  if (reason === 'previous-stage-locked') return 'Hasil stage sebelumnya belum memenuhi gate demo';
  return 'Menunggu hasil seleksi demo dipublikasikan';
}

function ControlsGuide() {
  return <div className="controls-guide"><div><kbd>W A S D</kbd><span>atau tombol panah untuk bergerak</span></div><div><kbd>E</kbd><span>interaksi di dekat monster atau penanda misi</span></div><div><kbd>Esc</kbd><span>jeda dan lanjutkan permainan</span></div><p>Di ponsel: gunakan joystick di tengah bawah dan tombol interaksi di kanan. Mainkan dalam posisi lanskap.</p></div>;
}
