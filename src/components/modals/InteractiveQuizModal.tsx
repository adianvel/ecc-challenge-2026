import { useEffect, useState } from 'react';
import { CheckCircle, Circle, XCircle } from '@phosphor-icons/react';
import type { PathCode, QuizQuestion, HeroGender } from '../../types';
import { JourneyDialog } from '../ui/JourneyDialog';
import { PARTICIPANT_STAGES, trackLabel } from '../../data/participantStages';
import { HeroBattleSprite } from '../game/BattleSprites';
import { STAGE_MONSTERS, monsterArtPath } from '../../data/stageMonsters';
import type { StageOrdinal } from '../../data/participantStages';
import { getHeroConfig, getSavedHeroGender } from '../../data/heroCharacters';

export function InteractiveQuizModal({
  quiz,
  currentPath = 'professional',
  gender,
  trackFocus,
  alreadyAttempted,
  readOnly = false,
  onClose,
  onSubmit,
  onCorrect,
  onVictoryClose,
}: {
  quiz: QuizQuestion | null;
  currentPath?: PathCode;
  gender?: HeroGender;
  trackFocus: string;
  alreadyAttempted: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onSubmit: (quizId: string) => void;
  onCorrect: (quizId: string) => void;
  onVictoryClose: (quizId: string) => void;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [earnedXp, setEarnedXp] = useState(false);
  const [battlePhase, setBattlePhase] = useState<'idle' | 'attack' | 'result'>('idle');
  const [playerHp, setPlayerHp] = useState(100);
  const heroCfg = getHeroConfig(currentPath, gender || getSavedHeroGender());

  useEffect(() => {
    if (battlePhase !== 'attack') return;
    const timer = window.setTimeout(() => {
      const correct = quiz?.options.find(option => option.id === selectedOptionId)?.isCorrect;
      if (!correct) {
        setPlayerHp(hp => Math.max(15, hp - 25));
      }
      setBattlePhase('result');
      setSubmitted(true);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [battlePhase, quiz, selectedOptionId]);

  if (!quiz) return null;
  const stage = PARTICIPANT_STAGES.find(item => item.ordinal === quiz.stageOrdinal);
  const monster = STAGE_MONSTERS[quiz.stageOrdinal as StageOrdinal].find(item => item.quizId === quiz.id);
  const selected = quiz.options.find(option => option.id === selectedOptionId);
  const closeQuiz = () => {
    if (battlePhase === 'result' && selected?.isCorrect) onVictoryClose(quiz.id);
    onClose();
  };
  const submitAnswer = () => {
    if (!selected || readOnly) return;
    if (battlePhase === 'attack') return;
    setBattlePhase('attack');
    setEarnedXp(current => current || !alreadyAttempted);
    onSubmit(quiz.id);
    if (selected.isCorrect) onCorrect(quiz.id);
  };

  return (
    <JourneyDialog titleId="quiz-title" className="quiz-dialog" onClose={closeQuiz}>
        <header className="dialog-heading">
          <div><span className="eyebrow">L{quiz.stageOrdinal} · QUIZ <i>DEMO</i></span><h2 id="quiz-title">{quiz.title}</h2></div>
          <button className="icon-button" onClick={closeQuiz} aria-label="Tutup kuis"><XCircle size={22} /></button>
        </header>
        <p className="dialog-context"><strong>{trackLabel(currentPath)}:</strong> {trackFocus}</p>
        {!readOnly && <div className={`quiz-battle ${battlePhase === 'attack' ? selected?.isCorrect ? 'is-victory' : 'is-counterattack' : ''} ${battlePhase === 'result' && selected?.isCorrect ? 'is-defeated' : ''} ${monster?.boss ? 'is-boss' : ''}`} style={{ backgroundImage: stage ? `linear-gradient(180deg,rgba(8,31,61,.24),rgba(8,31,61,.62)),url('${stage.mapPath}')` : undefined, borderColor: stage?.accent }} aria-label={`Adegan kuis: karakter melawan ${quiz.enemyName}`}>
          <div className="quiz-combatant quiz-enemy"><span>{quiz.enemyName}</span><div className="quiz-health"><i style={{ width: battlePhase === 'result' && selected?.isCorrect ? '0%' : '100%' }} /></div>{monster && <img className={`quiz-monster-art${monster.boss ? ' is-boss' : ''}`} src={monsterArtPath(monster.art)} alt="" />}</div>
          <strong className="quiz-battle-result" aria-hidden="true">{selected?.isCorrect ? 'Tepat!' : 'Coba lagi!'}</strong>
          {battlePhase === 'attack' && selected?.isCorrect && <span className="quiz-battle-slash" aria-hidden="true" />}
          {battlePhase === 'result' && selected?.isCorrect && <div className="quiz-victory-burst" aria-hidden="true"><strong>{monster?.boss ? 'BOSS DIKALAHKAN!' : 'MONSTER DIKALAHKAN!'}</strong></div>}
          <div className="quiz-combatant quiz-hero"><span>{heroCfg.characterName}</span><div className="quiz-health"><i style={{ width: `${playerHp}%` }} /></div><HeroBattleSprite pathCode={currentPath} gender={gender} actionState={battlePhase === 'attack' && selected?.isCorrect ? 'attack' : battlePhase === 'attack' ? 'hit' : battlePhase === 'result' && selected?.isCorrect ? 'victory' : 'idle'} size={110} /></div>
          <div className="quiz-battle-caption" role="status">{battlePhase === 'idle' ? 'Pilih jawaban untuk memulai' : battlePhase === 'attack' ? selected?.isCorrect ? 'Serangan tepat!' : 'Musuh menyerang balik!' : selected?.isCorrect ? 'Musuh berhasil dikalahkan' : 'Pilih jawaban lain untuk mencoba lagi'}</div>
        </div>}
        <div className="quiz-scenario"><span className="eyebrow">STUDI KASUS</span><p>{quiz.scenario}</p></div>
        <h3 className="quiz-question">{quiz.question}</h3>
        <div className="quiz-options" role="radiogroup" aria-label="Pilih satu jawaban">
          {quiz.options.map(option => {
            const chosen = selectedOptionId === option.id;
            const correctResult = submitted && option.isCorrect;
            const wrongResult = submitted && chosen && !option.isCorrect;
            return (
              <button
                type="button"
                key={option.id}
                className={`quiz-option ${chosen ? 'is-selected' : ''} ${correctResult ? 'is-correct' : ''} ${wrongResult ? 'is-wrong' : ''}`}
                onClick={() => !readOnly && setSelectedOptionId(option.id)}
                role="radio"
                aria-checked={chosen}
                disabled={readOnly || submitted || battlePhase === 'attack'}
              >
                {correctResult ? <CheckCircle size={20} weight="fill" /> : wrongResult ? <XCircle size={20} weight="fill" /> : chosen ? <CheckCircle size={20} /> : <Circle size={20} />}
                <span>{option.text}</span>
              </button>
            );
          })}
        </div>
        {submitted && selected && (
          <div className={`quiz-feedback ${selected.isCorrect ? 'feedback-good' : 'feedback-retry'}`} role="status">
            <strong>{selected.isCorrect ? 'Jawaban tepat' : 'Belum tepat'}</strong>
            <p>{selected.isCorrect ? selected.explanation : `Jawaban terbaik: ${quiz.options.find(option => option.isCorrect)?.text}`}</p>
            {earnedXp && <span>+10 XP · tercatat pada pengiriman pertama</span>}
            {!earnedXp && alreadyAttempted && <span>Pengiriman valid sudah pernah dicatat · tidak ada XP ulang</span>}
          </div>
        )}
        {readOnly && <p className="read-only-note">Hasil seleksi demo sudah dipublikasikan. Kuis ini hanya bisa dilihat.</p>}
        <footer className="dialog-actions">
          <span className="demo-note">{readOnly ? 'Mode lihat · tidak ada XP baru · DEMO' : 'XP hanya untuk percobaan pertama · DEMO'}</span>
          <div>
            <button className="button button-quiet" onClick={closeQuiz}>{submitted ? 'Selesai' : 'Kembali'}</button>
            {readOnly ? <button className="button button-gold" onClick={closeQuiz}>Tutup tampilan</button> : !submitted ? (
              <button className="button button-gold" onClick={submitAnswer} disabled={!selected || battlePhase === 'attack'}>{battlePhase === 'attack' ? 'Menilai jawaban…' : 'Jawab / serang'} {!alreadyAttempted && !earnedXp && <span>+10 XP</span>}</button>
            ) : selected?.isCorrect ? (
              <button className="button button-gold" onClick={closeQuiz}>Lanjutkan</button>
            ) : (
              <button className="button button-gold" onClick={() => { setSubmitted(false); setSelectedOptionId(null); setBattlePhase('idle'); }}>Coba jawaban lain <span>tanpa XP ulang</span></button>
            )}
          </div>
        </footer>
    </JourneyDialog>
  );
}
