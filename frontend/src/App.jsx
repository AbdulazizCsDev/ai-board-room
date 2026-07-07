import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ADVISORS } from "./data/boardData.js";
import { UI, EXAMPLES } from "./i18n.js";
import { AdvisorIcon } from "./components/Icons.jsx";
import {
  runIntake,
  streamRound,
  runVerdict,
  buildLiveSession,
  deriveTensions,
  loadSaved,
  saveSession,
  deleteSaved,
  downloadSession,
  readSessionFile,
  fetchProfile,
  saveProfile,
} from "./lib/session.js";
import {
  IconGavel,
  IconPencil,
  IconUsers,
  IconMessages,
  IconCrown,
  IconAffiliate,
  IconArrowRight,
  IconQuote,
  IconCornerDownRight,
  IconDeviceFloppy,
  IconDownload,
  IconUpload,
  IconTrash,
  IconBolt,
  IconLoader2,
  IconScale,
  IconCheck,
  IconBulb,
  IconSend,
  IconBuilding,
  IconX,
  IconAlertTriangle,
} from "@tabler/icons-react";

const TABS = [
  { id: "convene", label: UI.tabConvene, Icon: IconPencil },
  { id: "advisors", label: UI.tabAdvisors, Icon: IconUsers },
  { id: "debate", label: UI.tabDebate, Icon: IconMessages },
  { id: "verdict", label: UI.tabVerdict, Icon: IconCrown },
  { id: "tension", label: UI.tabTension, Icon: IconAffiliate },
];

const ADV_LIST = Object.values(ADVISORS);

export default function App() {
  const [lang, setLang] = useState(
    () => localStorage.getItem("boardroom.lang") || "en"
  );
  const t = useCallback(
    (v) => {
      if (v == null) return "";
      if (typeof v === "string") return v;
      return v[lang] ?? v.en ?? "";
    },
    [lang]
  );

  const [tab, setTab] = useState("convene");
  const [session, setSession] = useState(null); // last finished / loaded session
  const [saved, setSaved] = useState(loadSaved);
  // live: { decision, context } while a live run is in progress; null for replay.
  const [live, setLive] = useState(null);

  // Company profile the board is briefed with (null until added).
  const [profile, setProfile] = useState(null);
  const [profileKnown, setProfileKnown] = useState(false); // GET /profile answered
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        setProfile(p);
        setProfileKnown(true);
      })
      .catch(() => {}); // API down — keep the button in its neutral state
  }, []);

  const handleProfileSave = async (payload) => {
    const saved = await saveProfile(payload);
    setProfile(saved);
    setProfileKnown(true);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("boardroom.lang", lang);
  }, [lang]);

  // Replay an existing session (demo / saved / imported).
  const startReplay = (s) => {
    setLive(null);
    setSession(s);
    setTab("debate");
  };

  // Begin a live, round-by-round run.
  const startLive = (decision, context) => {
    setLive({ decision, context: context || "" });
    setTab("debate");
  };

  return (
    <div className="app">
      <Topbar
        t={t}
        tab={tab}
        setTab={setTab}
        lang={lang}
        setLang={setLang}
        hasProfile={!!profile}
        profileKnown={profileKnown}
        onProfile={() => setProfileOpen(true)}
      />

      {profileOpen && (
        <ProfileModal
          t={t}
          profile={profile}
          onSave={handleProfileSave}
          onClose={() => setProfileOpen(false)}
        />
      )}

      <main className="panel">
        {tab === "convene" && (
          <Convene
            t={t}
            lang={lang}
            saved={saved}
            setSaved={setSaved}
            onReplay={startReplay}
            onLive={startLive}
          />
        )}
        {tab === "advisors" && <Advisors t={t} />}
        {tab === "debate" &&
          (live ? (
            <LiveDebate
              key={live.decision + "|" + live.context}
              t={t}
              lang={lang}
              decision={live.decision}
              baseContext={live.context}
              onSessionReady={(s) => {
                // Hand off to review so revisiting the tab never re-runs the board.
                setSession(s);
                setLive(null);
              }}
            />
          ) : session ? (
            <ReplayDebate
              t={t}
              session={session}
              setSaved={setSaved}
              onVerdict={() => setTab("verdict")}
            />
          ) : (
            <EmptyState t={t} onGo={() => setTab("convene")} />
          ))}
        {tab === "verdict" &&
          (session ? (
            <Verdict t={t} session={session} />
          ) : (
            <EmptyState t={t} onGo={() => setTab("convene")} />
          ))}
        {tab === "tension" &&
          (session ? (
            <Tension t={t} session={session} />
          ) : (
            <EmptyState t={t} onGo={() => setTab("convene")} />
          ))}
      </main>

      <footer className="foot">
        <span className="foot-mono">{t(UI.footer)}</span>
      </footer>
    </div>
  );
}

// ── Top bar ──────────────────────────────────────────────────────────────────
function Topbar({ t, tab, setTab, lang, setLang, hasProfile, profileKnown, onProfile }) {
  const missing = profileKnown && !hasProfile;
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <IconGavel size={20} />
        </div>
        <div className="brand-name">{t(UI.brand)}</div>
      </div>
      <div className="tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={"tab" + (tab === id ? " active" : "")}
            onClick={() => setTab(id)}
          >
            <Icon size={16} />
            <span>{t(label)}</span>
          </button>
        ))}
      </div>
      <div className="topbar-side">
        <button
          className={"profile-btn" + (missing ? " missing" : "")}
          onClick={onProfile}
          title={t(missing ? UI.profileBtnAdd : UI.profileBtnEdit)}
        >
          <IconBuilding size={15} />
          <span>{t(missing ? UI.profileBtnAdd : UI.profileBtnEdit)}</span>
          {missing && <span className="profile-dot" />}
        </button>
        <button
          className="lang-toggle"
          onClick={() => setLang((l) => (l === "en" ? "ar" : "en"))}
        >
          {UI.langToggle[lang]}
        </button>
      </div>
    </div>
  );
}

// ── Company profile add / edit modal ─────────────────────────────────────────
const TEAM_SIZES = ["1–10 employees", "11–50 employees", "51–200 employees", "200+ employees"];

function ProfileModal({ t, profile, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    business_name: profile?.business_name || "",
    city: profile?.city || "",
    industry: profile?.industry || "",
    description: profile?.description || "",
    team_size: profile?.team_size || "",
    revenue: profile?.revenue || "",
    risk_tolerance: profile?.risk_tolerance || "",
  }));
  const [challenges, setChallenges] = useState((profile?.challenges || []).join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await onSave({
        ...(profile || {}),
        ...form,
        challenges: challenges.split(/[,،]/).map((s) => s.trim()).filter(Boolean),
      });
      onClose();
    } catch {
      setError(t(UI.profileError));
      setBusy(false);
    }
  };

  const risks = [
    ["conservative", UI.riskConservative],
    ["moderate", UI.riskModerate],
    ["aggressive", UI.riskAggressive],
  ];

  return (
    <div className="pmodal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pmodal">
        <div className="pmodal-head">
          <div className="pmodal-titles">
            <h3 className="pmodal-title display">{t(UI.profileTitle)}</h3>
            <p className="pmodal-lede">{t(UI.profileLede)}</p>
          </div>
          <button className="pmodal-close" onClick={onClose} title={t(UI.profileCancel)}>
            <IconX size={18} />
          </button>
        </div>

        {!profile && (
          <div className="pmodal-warning">
            <IconAlertTriangle size={17} />
            <span>{t(UI.profileMissing)}</span>
          </div>
        )}

        <div className="pform-grid">
          <label className="pfield">
            <span className="pfield-label">{t(UI.profileName)}</span>
            <input className="pfield-input" value={form.business_name} onChange={set("business_name")} />
          </label>
          <label className="pfield">
            <span className="pfield-label">{t(UI.profileCity)}</span>
            <input className="pfield-input" value={form.city} onChange={set("city")} />
          </label>
          <label className="pfield wide">
            <span className="pfield-label">{t(UI.profileIndustry)}</span>
            <input className="pfield-input" value={form.industry} onChange={set("industry")} />
          </label>
          <label className="pfield wide">
            <span className="pfield-label">{t(UI.profileDescription)}</span>
            <textarea className="pfield-input" rows={2} value={form.description} onChange={set("description")} />
          </label>
          <label className="pfield">
            <span className="pfield-label">{t(UI.profileTeam)}</span>
            <select className="pfield-input" value={form.team_size} onChange={set("team_size")}>
              <option value="">{t(UI.profileSelect)}</option>
              {TEAM_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="pfield">
            <span className="pfield-label">{t(UI.profileRevenue)}</span>
            <input className="pfield-input" placeholder="300,000 SAR" value={form.revenue} onChange={set("revenue")} />
          </label>
          <label className="pfield">
            <span className="pfield-label">{t(UI.profileRisk)}</span>
            <select className="pfield-input" value={form.risk_tolerance} onChange={set("risk_tolerance")}>
              <option value="">{t(UI.profileSelect)}</option>
              {risks.map(([v, label]) => (
                <option key={v} value={v}>{t(label)}</option>
              ))}
            </select>
          </label>
          <label className="pfield wide">
            <span className="pfield-label">{t(UI.profileChallenges)}</span>
            <input
              className="pfield-input"
              placeholder="Cash flow, Competition, Hiring…"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
            />
          </label>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="pmodal-actions">
          <button className="convene-btn pmodal-save" onClick={submit} disabled={busy}>
            {busy ? <IconLoader2 size={17} className="spin" /> : <IconDeviceFloppy size={17} />}
            {t(busy ? UI.profileSaving : UI.profileSave)}
          </button>
          <button className="ghost-btn" onClick={onClose}>{t(UI.profileCancel)}</button>
          <a className="pmodal-fullsetup" href="/onboarding">{t(UI.profileFullSetup)} →</a>
        </div>
      </div>
    </div>
  );
}

// ── Convene (with discovery chat) ─────────────────────────────────────────────
// phase: "input" → "discovering" → "chat" | "answered"
function Convene({ t, lang, saved, setSaved, onReplay, onLive }) {
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState("input");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]); // {q, a}
  const [qIdx, setQIdx] = useState(0);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");          // chairman's direct answer
  const [suggested, setSuggested] = useState("");    // suggested decision
  const fileRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [qIdx, phase]);

  const buildContext = (pairs) =>
    pairs
      .filter((p) => p.a.trim())
      .map((p) => `Q: ${p.q}\nA: ${p.a.trim()}`)
      .join("\n\n");

  const askBoard = async () => {
    const q = draft.trim();
    if (!q || phase !== "input") return;
    setError("");
    setPhase("discovering");
    try {
      const r = await runIntake(q, lang);
      if (r.kind === "question") {
        // Chairman answers directly + proposes a decision.
        setAnswer(r.answer);
        setSuggested(r.suggestedDecision);
        setPhase("answered");
      } else if (r.questions.length) {
        // A vague decision → discovery chat.
        setQuestions(r.questions);
        setAnswers([]);
        setQIdx(0);
        setPhase("chat");
      } else {
        // A clear decision → straight to the board.
        onLive(q, "");
        setPhase("input");
      }
    } catch {
      // Intake unavailable — go straight to the live board.
      onLive(q, "");
      setPhase("input");
    }
  };

  const resetIntake = () => {
    setPhase("input");
    setAnswer("");
    setSuggested("");
    setQuestions([]);
    setAnswers([]);
  };

  const sendReply = () => {
    const a = reply.trim();
    const pairs = [...answers, { q: questions[qIdx], a }];
    setAnswers(pairs);
    setReply("");
    if (qIdx + 1 < questions.length) {
      setQIdx(qIdx + 1);
    } else {
      onLive(draft.trim(), buildContext(pairs));
    }
  };

  const skipRest = () => onLive(draft.trim(), buildContext(answers));

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      onReplay(await readSessionFile(file));
    } catch {
      setError("Invalid session file.");
    }
    e.target.value = "";
  };

  return (
    <div className="panel-pad">
      <div className="hero">
        <div className="eyebrow accent-market">{t(UI.heroEyebrow)}</div>
        <h1 className="display hero-h1">
          {t(UI.heroTitle1)}
          <br />
          <em>{t(UI.heroTitleEm)}</em>
        </h1>
        <p className="lede">{t(UI.heroLede)}</p>

        <div className="compose">
          {phase === "answered" ? (
            <AnswerView
              t={t}
              question={draft}
              answer={answer}
              suggested={suggested}
              onConvene={() => onLive(suggested || draft.trim(), "")}
              onReset={resetIntake}
            />
          ) : phase === "chat" ? (
            <DiscoveryChat
              t={t}
              decision={draft}
              questions={questions}
              answers={answers}
              qIdx={qIdx}
              reply={reply}
              setReply={setReply}
              onSend={sendReply}
              onSkip={skipRest}
              chatEndRef={chatEndRef}
            />
          ) : (
            <>
              <div className="qbox">
                <div className="qbox-label">{t(UI.decisionLabel)}</div>
                <textarea
                  className="qbox-input"
                  rows={2}
                  value={draft}
                  placeholder={t(UI.questionPlaceholder)}
                  disabled={phase === "discovering"}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) askBoard();
                  }}
                />
              </div>

              {phase === "discovering" ? (
                <div className="discover-loading">
                  <IconLoader2 size={18} className="spin" />
                  <span>{t(UI.discoverLoading)}</span>
                </div>
              ) : (
                <>
                  <div className="examples">
                    {EXAMPLES.map((ex, i) => (
                      <button
                        key={i}
                        className="ex-chip"
                        onClick={() => setDraft(t(ex.full))}
                      >
                        {t(ex.chip)}
                      </button>
                    ))}
                  </div>
                  <div className="convene-actions">
                    <button
                      className="convene-btn"
                      onClick={askBoard}
                      disabled={!draft.trim()}
                    >
                      <IconBolt size={18} /> {t(UI.runLive)}
                    </button>
                  </div>
                  <p className="live-hint">{t(UI.liveHint)}</p>
                </>
              )}
            </>
          )}
          {error && <p className="error-msg">{error}</p>}
        </div>

        <div className="seats">
          {ADV_LIST.map((a) => (
            <div key={a.id} className="seat">
              <div
                className="seat-av"
                style={{ background: a.accentSoft, borderColor: a.accent }}
              >
                <AdvisorIcon name={a.icon} color={a.accent} size={30} />
              </div>
              <span className="seat-name">{t(a.name)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="saved-section">
        <div className="saved-head">
          <h3 className="saved-title">{t(UI.savedTitle)}</h3>
          <button className="ghost-btn" onClick={() => fileRef.current?.click()}>
            <IconUpload size={15} /> {t(UI.importFile)}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={onImport}
          />
        </div>
        {saved.length === 0 ? (
          <p className="muted">{t(UI.noSaved)}</p>
        ) : (
          <div className="saved-list">
            {saved.map((s) => (
              <div key={s.id} className="saved-item">
                <span className={"src-badge " + s.source}>
                  {t(s.source === "live" ? UI.liveBadge : UI.demoBadge)}
                </span>
                <span className="saved-q">{t(s.decision)}</span>
                <div className="saved-acts">
                  <button className="mini-btn" onClick={() => onReplay(s)}>
                    {t(UI.load)}
                  </button>
                  <button
                    className="mini-btn"
                    onClick={() => downloadSession(s, t(s.decision).slice(0, 24))}
                    title={t(UI.download)}
                  >
                    <IconDownload size={15} />
                  </button>
                  <button
                    className="mini-btn danger"
                    onClick={() => setSaved(deleteSaved(s.id))}
                    title={t(UI.deleteWord)}
                  >
                    <IconTrash size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DiscoveryChat({ t, decision, questions, answers, qIdx, reply, setReply, onSend, onSkip, chatEndRef }) {
  return (
    <div className="chat">
      <div className="chat-thread">
        <div className="chat-row user">
          <div className="bubble user">{decision}</div>
        </div>
        <div className="chat-row chair">
          <div className="chair-av"><IconCrown size={15} /></div>
          <div className="bubble chair">{t(UI.discoverIntro)}</div>
        </div>
        {questions.slice(0, qIdx + 1).map((q, i) => (
          <div key={i}>
            <div className="chat-row chair">
              <div className="chair-av"><IconCrown size={15} /></div>
              <div className="bubble chair">{q}</div>
            </div>
            {answers[i] && answers[i].a.trim() && (
              <div className="chat-row user">
                <div className="bubble user">{answers[i].a}</div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-input">
        <textarea
          className="chat-textarea"
          rows={1}
          value={reply}
          placeholder={t(UI.answerPlaceholder)}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button className="send-btn" onClick={onSend}>
          {qIdx + 1 < questions.length ? (
            <><IconSend size={16} /> {t(UI.send)}</>
          ) : (
            <><IconBolt size={16} /> {t(UI.discoverStart)}</>
          )}
        </button>
      </div>
      <button className="chat-skip" onClick={onSkip}>
        {t(UI.discoverSkip)} →
      </button>
    </div>
  );
}

// The chairman's direct answer to a question + a suggested decision to convene on.
function AnswerView({ t, question, answer, suggested, onConvene, onReset }) {
  return (
    <div className="chat">
      <div className="chat-thread">
        <div className="chat-row user">
          <div className="bubble user">{question}</div>
        </div>
        <div className="chat-row chair">
          <div className="chair-av"><IconCrown size={15} /></div>
          <div className="bubble chair">{answer}</div>
        </div>
      </div>

      {suggested && (
        <div className="suggested-card">
          <div className="suggested-label">
            <IconBolt size={14} /> {t(UI.suggestedDecision)}
          </div>
          <div className="suggested-text">{suggested}</div>
          <div className="suggested-actions">
            <button className="convene-btn" onClick={onConvene}>
              <IconUsers size={17} /> {t(UI.convOnSuggested)}
            </button>
            <button className="ghost-btn" onClick={onReset}>
              {t(UI.askAnother)}
            </button>
          </div>
        </div>
      )}
      {!suggested && (
        <div className="convene-actions">
          <button className="ghost-btn" onClick={onReset}>{t(UI.askAnother)}</button>
        </div>
      )}
    </div>
  );
}

// ── Advisors intro ────────────────────────────────────────────────────────────
function Advisors({ t }) {
  return (
    <div className="panel-pad">
      <div className="section-intro">
        <div className="eyebrow accent-market">{t(UI.advEyebrow)}</div>
        <h2 className="display">{t(UI.advTitle)}</h2>
        <p className="lede">{t(UI.advLede)}</p>
      </div>
      <div className="advisor-grid">
        {ADV_LIST.map((a) => (
          <div key={a.id} className="advisor-card" style={advVars(a)}>
            <div className="ac-banner">
              <div className="ac-avatar">
                <AdvisorIcon name={a.icon} color={a.accent} size={34} />
              </div>
              <span className="ac-tag">{t(a.tag)}</span>
            </div>
            <div className="ac-body">
              <div className="ac-name">{t(a.name)}</div>
              <div className="ac-role">{t(a.role)}</div>
              <div className="ac-quote">“{t(a.quote)}”</div>
              <div className="ac-traits">
                {t(a.traits).map((tr, i) => (
                  <span key={i} className="trait">{tr}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Debate feed (shared by live + review) ─────────────────────────────────────
function ContributionCard({ t, beat, n }) {
  const a = ADVISORS[beat.data.advisor];
  const resp = beat.data;
  const target = resp.respondsTo ? ADVISORS[resp.respondsTo] : null;
  const outOfScope = resp.relevant === false;
  return (
    <div className="feed-card" style={advVars(a)}>
      <div className="ac-head">
        <span className="ac-number">{n}</span>
        <div className="ac-av">
          <AdvisorIcon name={a.icon} color={a.accent} size={24} />
        </div>
        <div className="ac-meta">
          <span className="ac-name">{t(a.name)}</span>
          <span className="ac-role">{t(a.role)}</span>
        </div>
        {target && (
          <span className="replying-chip">
            <IconCornerDownRight size={14} className="reply-arrow" />
            <span className="replying-label">{t(UI.respondingTo)}</span>
            <span
              className="target-pill"
              style={{ background: target.accentSoft, color: target.accentDeep }}
            >
              <AdvisorIcon name={target.icon} color={target.accent} size={14} />
              {t(target.name)}
            </span>
          </span>
        )}
      </div>

      {outOfScope ? (
        <p className="ac-perspective out">
          <span className="oos-tag">{t(UI.outOfScope)}</span> {t(resp.perspective)}
        </p>
      ) : (
        <>
          <p className="ac-perspective display">{t(resp.perspective)}</p>
          {resp.conditions?.length > 0 && (
            <div className="stage-tags">
              <span className="tags-label"><IconCheck size={13} /> {t(UI.conditionsLabel)}</span>
              {resp.conditions.map((c, i) => (
                <span key={i} className="tag cond">{t(c)}</span>
              ))}
            </div>
          )}
          {resp.recommendations?.length > 0 && (
            <div className="stage-tags">
              <span className="tags-label"><IconBulb size={13} /> {t(UI.recommendsLabel)}</span>
              {resp.recommendations.map((r, i) => (
                <span key={i} className="tag rec">{t(r)}</span>
              ))}
            </div>
          )}
          {resp.reasoning && <p className="ac-reasoning">{t(resp.reasoning)}</p>}
        </>
      )}
    </div>
  );
}

// All contributions in arrival order, with round dividers.
function DebateFeed({ t, beats, thinking }) {
  const firstR2 = beats.findIndex((b) => b.round === 2);
  return (
    <div className="feed">
      {beats.length > 0 && (
        <div className="round-divider">
          <span className="round-label">{t(UI.round1)}</span>
        </div>
      )}
      {beats.map((b, i) => (
        <div key={i} className="feed-item">
          {i === firstR2 && (
            <div className="round-divider">
              <span className="round-label">{t(UI.round2)}</span>
            </div>
          )}
          <ContributionCard t={t} beat={b} n={i + 1} />
        </div>
      ))}
      {thinking && (
        <div className="feed-card waiting">
          <div className="typing-dots"><span /><span /><span /></div>
          <span className="ac-waiting-text">{thinking}</span>
        </div>
      )}
    </div>
  );
}

// Shown when a tab needs a session that doesn't exist yet.
function EmptyState({ t, onGo }) {
  return (
    <div className="panel-pad">
      <div className="empty-state">
        <div className="empty-icon">
          <IconMessages size={26} />
        </div>
        <h3 className="display empty-title">{t(UI.emptyTitle)}</h3>
        <p className="lede">{t(UI.emptyLede)}</p>
        <button className="convene-btn" onClick={onGo}>
          <IconPencil size={17} /> {t(UI.emptyCta)}
        </button>
      </div>
    </div>
  );
}

// ── Live debate: contributions stream into the feed; interject anytime ────────
function LiveDebate({ t, lang, decision, baseContext, onSessionReady }) {
  // phase: r1 | r2 | verdict | error — completion hands the session to review.
  const [phase, setPhase] = useState("r1");
  const [beats, setBeats] = useState([]); // {round, data} in arrival order
  const [interject, setInterject] = useState("");
  const [flash, setFlash] = useState(false);

  const contextRef = useRef(baseContext || "");
  const interjectRef = useRef("");
  const round1Ref = useRef([]);
  const round2Ref = useRef([]);
  const cancelRef = useRef(null);
  const endRef = useRef(null);

  // keep the newest contribution in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [beats.length, phase]);

  // ── orchestration: round1 → round2 → verdict, back-to-back ──────────────────
  useEffect(() => {
    cancelRef.current = streamRound(decision, lang, contextRef.current, 1, [], {
      onAdvisor: (a) => {
        round1Ref.current.push(a);
        setBeats((b) => [...b, { round: 1, data: a }]);
      },
      onDone: startRound2,
      onError: () => setPhase("error"),
    });
    return () => cancelRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyInterjection() {
    if (interjectRef.current.trim()) {
      contextRef.current += `\n\n[Board chair adds]: ${interjectRef.current.trim()}`;
      interjectRef.current = "";
      setInterject("");
    }
  }

  function startRound2() {
    applyInterjection();
    setPhase("r2");
    cancelRef.current = streamRound(decision, lang, contextRef.current, 2, round1Ref.current, {
      onAdvisor: (a) => {
        round2Ref.current.push(a);
        setBeats((b) => [...b, { round: 2, data: a }]);
      },
      onDone: goVerdict,
      onError: () => setPhase("error"),
    });
  }

  async function goVerdict() {
    applyInterjection();
    setPhase("verdict");
    try {
      const v = await runVerdict(
        decision, lang, contextRef.current, round1Ref.current, round2Ref.current
      );
      onSessionReady(buildLiveSession(decision, round1Ref.current, round2Ref.current, v));
    } catch {
      setPhase("error");
    }
  }

  const total = 2 * ADV_LIST.length; // expected contributions
  const status =
    phase === "verdict"
      ? t(UI.synthesizing)
      : phase === "r2"
      ? t(UI.round2)
      : t(UI.round1);

  const sendInterject = () => {
    if (!interject.trim()) return;
    interjectRef.current = interject;
    setFlash(true);
    setTimeout(() => setFlash(false), 1600);
    setInterject("");
  };

  return (
    <div className="panel-pad">
      <div className="debate-top">
        <h2 className="display debate-h2">{t(UI.debateTitle)}</h2>
      </div>

      <div className="decision-recap">
        <IconQuote size={17} className="recap-icon" />
        <span>{t(decision)}</span>
        <span className="src-badge live">{t(UI.liveBadge)}</span>
      </div>

      {phase !== "error" && (
        <div className="round-banner">
          <span className="round-label">{status}</span>
          <IconLoader2 size={14} className="spin" />
          <span className="round-count">{beats.length} / {total}</span>
        </div>
      )}

      <DebateFeed
        t={t}
        beats={beats}
        thinking={
          phase === "error"
            ? null
            : phase === "verdict"
            ? t(UI.synthesizing)
            : t(UI.deliberating)
        }
      />
      <div ref={endRef} />

      {phase === "error" ? (
        <p className="error-msg">{t(UI.apiError)}</p>
      ) : (
        <div className={"live-interject" + (flash ? " flash" : "")}>
          <input
            className="interject-input"
            value={interject}
            placeholder={flash ? t(UI.interjected) + " ✓" : t(UI.interjectPlaceholder)}
            onChange={(e) => setInterject(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendInterject(); }}
          />
          <button className="ctrl" onClick={sendInterject} disabled={!interject.trim()}>
            <IconSend size={15} /> {t(UI.send)}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Session review (finished / saved / imported sessions) ─────────────────────
function ReplayDebate({ t, session, setSaved, onVerdict }) {
  const beats = useMemo(() => {
    const b = [];
    session.round1.forEach((d) => b.push({ round: 1, data: d }));
    session.round2.forEach((d) => b.push({ round: 2, data: d }));
    return b;
  }, [session]);

  const [savedTick, setSavedTick] = useState(false);
  const onSave = () => {
    setSaved(saveSession(session));
    setSavedTick(true);
    setTimeout(() => setSavedTick(false), 1800);
  };

  return (
    <div className="panel-pad">
      <div className="debate-top">
        <h2 className="display debate-h2">{t(UI.debateTitle)}</h2>
        <div className="debate-tools">
          <button className="ghost-btn" onClick={onSave}>
            <IconDeviceFloppy size={15} /> {savedTick ? t(UI.saved) : t(UI.save)}
          </button>
          <button
            className="ghost-btn"
            onClick={() => downloadSession(session, t(session.decision).slice(0, 24))}
          >
            <IconDownload size={15} /> {t(UI.download)}
          </button>
        </div>
      </div>

      <div className="decision-recap">
        <IconQuote size={17} className="recap-icon" />
        <span>{t(session.decision)}</span>
        <span className={"src-badge " + session.source}>
          {t(session.source === "live" ? UI.liveBadge : UI.demoBadge)}
        </span>
      </div>

      <DebateFeed t={t} beats={beats} />

      <div className="controls">
        <button className="ctrl accent" onClick={onVerdict}>
          {t(UI.toVerdict)} <IconArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Verdict ───────────────────────────────────────────────────────────────────
function Verdict({ t, session }) {
  const v = session.verdict;
  const pct = Math.round((v.confidence || 0) * 100);
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setFill(pct), 200);
    return () => clearTimeout(id);
  }, [pct]);

  // each advisor's final perspective + conditions (what each lens requires)
  const finals = useMemo(() => {
    const m = {};
    session.round1.forEach((r) => (m[r.advisor] = r));
    session.round2.forEach((r) => (m[r.advisor] = r));
    return ADV_LIST.map((a) => ({ a, r: m[a.id] })).filter((x) => x.r);
  }, [session]);

  return (
    <div className="panel-pad">
      <div className="section-intro">
        <div className="eyebrow accent-legal">{t(UI.verdictEyebrow)}</div>
        <h2 className="display">{t(UI.verdictTitle)}</h2>
      </div>

      <div className="requires-title">{t(UI.whatEachRequires)}</div>
      <div className="requires-grid">
        {finals.map(({ a, r }) => (
          <div key={a.id} className="requires-cell" style={advVars(a)}>
            <div className="rc-head">
              <div className="rc-av">
                <AdvisorIcon name={a.icon} color={a.accent} size={22} />
              </div>
              <span className="rc-name">{t(a.name)}</span>
            </div>
            <p className="rc-perspective">{t(r.perspective)}</p>
            {r.conditions?.length > 0 && (
              <ul className="rc-conditions">
                {r.conditions.map((c, i) => (
                  <li key={i}><IconCheck size={12} /> {t(c)}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="gavel">
        <div className="gavel-top">
          <div className="gavel-label">
            <IconCrown size={14} /> {t(UI.chairmanRec)}
          </div>
          {v.stance && UI.stance[v.stance] && (
            <span className={"stance-badge " + v.stance}>
              {t(UI.stance[v.stance])}
            </span>
          )}
        </div>
        <div className="gavel-rec display">{t(v.recommendation)}</div>
        {v.boardNote && (
          <div className="board-note">
            <IconScale size={15} /> {t(v.boardNote)}
          </div>
        )}
        <div className="gavel-foot">
          <span className="conf-label">{t(UI.confidence)}</span>
          <div className="conf-track">
            <div className="conf-fill" style={{ width: fill + "%" }} />
          </div>
          <span className="conf-num">{pct}%</span>
        </div>
      </div>

      {v.nextSteps?.length > 0 && (
        <div className="steps-box">
          <div className="steps-title">{t(UI.nextSteps)}</div>
          {v.nextSteps.map((s, i) => (
            <div key={i} className="step-item">
              <span className="step-num">{i + 1}</span>
              <span className="step-text">{t(s)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tension map ───────────────────────────────────────────────────────────────
const TENSION_POS = {
  CFO: { x: 26, y: 28 },
  Market: { x: 74, y: 28 },
  Legal: { x: 50, y: 80 },
};
const TENSION_COLOR = { clash: "#a82e2e", tension: "#c98a2a", align: "#3d7012" };

function Tension({ t, session }) {
  const edges = useMemo(() => deriveTensions(session), [session]);
  return (
    <div className="panel-pad">
      <div className="section-intro">
        <div className="eyebrow accent-market">{t(UI.tensionEyebrow)}</div>
        <h2 className="display">{t(UI.tensionTitle)}</h2>
        <p className="lede">{t(UI.tensionLede)}</p>
      </div>

      <div className="tmap-wrap">
        <div className="tmap">
          <svg className="tlines" viewBox="0 0 100 100" preserveAspectRatio="none">
            {edges.map((e, i) => {
              const p1 = TENSION_POS[e.a];
              const p2 = TENSION_POS[e.b];
              if (!p1 || !p2) return null;
              return (
                <line
                  key={i}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={TENSION_COLOR[e.kind]}
                  strokeWidth={e.kind === "clash" ? 1.1 : e.kind === "tension" ? 0.7 : 0.8}
                  strokeLinecap="round"
                  opacity="0.9"
                />
              );
            })}
          </svg>
          {ADV_LIST.map((a) => {
            const pos = TENSION_POS[a.id];
            if (!pos) return null;
            return (
              <div
                key={a.id}
                className="tnode"
                style={{ left: pos.x + "%", top: pos.y + "%", ...advVars(a) }}
              >
                <div className="tnode-av">
                  <AdvisorIcon name={a.icon} color={a.accent} size={28} />
                </div>
                <span className="tnode-name">{t(a.name)}</span>
              </div>
            );
          })}
        </div>

        {/* the tensions, labelled */}
        <div className="tlist">
          {edges.filter((e) => e.kind !== "align" && e.over).map((e, i) => (
            <div key={i} className="tlist-item">
              <span
                className="tlist-dot"
                style={{ background: TENSION_COLOR[e.kind] }}
              />
              <b>{t(ADVISORS[e.a].name)} ↔ {t(ADVISORS[e.b].name)}</b>
              <span className="tlist-over">{t(e.over)}</span>
            </div>
          ))}
        </div>

        <div className="tlegend">
          <div className="tleg">
            <span className="tleg-line" style={{ background: TENSION_COLOR.clash }} />
            {t(UI.legClash)}
          </div>
          <div className="tleg">
            <span className="tleg-line" style={{ background: TENSION_COLOR.tension }} />
            {t(UI.legTension)}
          </div>
          <div className="tleg">
            <span className="tleg-line" style={{ background: TENSION_COLOR.align }} />
            {t(UI.legAlign)}
          </div>
        </div>
      </div>
    </div>
  );
}

function advVars(a) {
  return {
    "--accent": a.accent,
    "--accent-soft": a.accentSoft,
    "--accent-deep": a.accentDeep,
  };
}
