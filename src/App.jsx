/*
Secret Mission — single-file React app
====================================

This file contains a complete React single-file app (App.jsx) designed to be
mobile-first and GitHub Pages friendly. It uses Tailwind utility classes for
styling (no imports needed in this editor preview). It follows the "Secret
Mission" theme (spy / mission-controller tone), password-protected pages,
progress tracking via localStorage, and an example logic puzzle walkthrough
with gradual hints.

How to use
----------
1. Create a new GitHub repo (public or private). Add this file as src/App.jsx.
2. Add a standard React app (create-react-app or Vite). Example layout:
   - src/App.jsx        <- replace with this file
   - src/main.jsx/index.js
   - public/index.html
3. Make sure Tailwind is set up for your repo (recommended) OR keep the
   minimal CSS included below in index.html to get working styles quickly.
4. Commit and push. Enable GitHub Pages in repo settings (branch: gh-pages)
   or use GitHub Actions to deploy (if using Vite/CRA). This app uses client-side
   routing (no backend) so GitHub Pages works fine.

Notes & Features
----------------
- Mobile-first layout for phones
- Theme: Secret Mission (copywriting and UI tone)
- Per-page password protection (simple client-side): each page expects a
  password to unlock. Passwords are stored in `PAGE_PASSWORDS` in the code;
  you can edit them or wire to envelope codes you hand out physically.
- Example logic puzzle walkthrough with step-by-step hints and solution check.
- Generic "Confirm Location" flow: after solving, user can press a button to
  verify (site confirms if answer matches expected) — useful if they solved
  on paper and want the website to confirm.
- Extensible: each puzzle page is a JS object in `PAGES`. Add new pages or new
  behaviors per puzzle.

Security
--------
This client-side password approach is simple and intentionally lightweight for a
party game. Do NOT use client-side passwords for anything sensitive.

Customization
-------------
- Edit PAGE_PASSWORDS to set your physical envelope codes.
- Replace the EXAMPLE_PUZZLE with your real logic puzzle structure (see
  comments in the code for shape).

*/

import React, { useState, useEffect } from "react";

// ------------------------
// Configuration
// ------------------------

// Set page passwords. Change to match codes you hand out in envelopes.
const PAGE_PASSWORDS = {
  "landing": "ENVELOPE-1",
  "crawl-space": "CRAWL-SPACE",
  "logic-puzzle": "PUZZLE-1",
  "confirm": "CONFIRM-1",
};

// Pages config. Add more pages to expand the hunt. Each page has an id,
// title, description, and a `type` which determines behavior.
const PAGES = [
  { id: "landing", title: "Mission Briefing", type: "info" },
  { id: "crawl-space", title: "In the Crawl Space", type: "info" },
  { id: "logic-puzzle", title: "Logic Puzzle — Operation: Carol", type: "puzzle" },
  { id: "confirm", title: "Confirm Location", type: "confirm" },
];

// ------------------------
// Example logic puzzle (replace with your puzzle when ready)
// Structure used here: items: arrays of categories. We'll present a 3x3 grid
// like classic puzzles. solution is an object mapping person->(gift,color).
// For a more complex puzzle system you can expand the shape.
// ------------------------

const EXAMPLE_PUZZLE = {
  slug: "example-1",
  title: "Operation: Carol — Deliver the Carol Booklets",
  intro: `Agents: three volunteers are to deliver small carol booklets. Each has a unique
vehicle and a unique color of satchel. Use the clues to assign each person the correct satchel and vehicle.
(Practice puzzle to learn the site.)`,
  people: ["Ava", "Ben", "Cole"],
  gifts: ["Booklet", "Ornament", "Candy"],
  colors: ["Red", "Green", "Blue"],
  // Clues (these are human-readable; hints will reveal them one by one).
  clues: [
    "The person with the Red satchel is not Cole.",
    "Ava rides a bicycle, and the person with the Candy is not Ben.",
    "The Green satchel goes with the Ornament.",
  ],
  // canonical solution for verification (person -> {gift,color,vehicle})
  solution: {
    Ava: { gift: "Booklet", color: "Blue", vehicle: "Bicycle" },
    Ben: { gift: "Candy", color: "Red", vehicle: "Car" },
    Cole: { gift: "Ornament", color: "Green", vehicle: "Sled" },
  },
};

// ------------------------
// Utilities
// ------------------------

function saveProgress(state) {
  localStorage.setItem("secret-mission-state", JSON.stringify(state));
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem("secret-mission-state")) || {};
  } catch (e) {
    return {};
  }
}

// Simple password check (client-side). We do exact match.
function checkPassword(pageId, attempt) {
  const pw = PAGE_PASSWORDS[pageId];
  if (!pw) return false;
  return attempt.trim() === pw;
}

// ------------------------
// Components
// ------------------------

function Header({ title }) {
  return (
    <div className="w-full p-4 bg-gradient-to-r from-slate-800 to-slate-600 text-white rounded-b-2xl shadow-md">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="text-xs opacity-80">Top secret — mission controller</p>
    </div>
  );
}

function PageCard({ page, unlocked, onOpen }) {
  return (
    <div className={`p-4 rounded-2xl shadow-sm bg-white/90 ${unlocked ? "border-2 border-green-400" : "border border-slate-200"}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold">{page.title}</div>
          <div className="text-xs text-slate-600">{page.id}</div>
        </div>
        <div>
          <button onClick={() => onOpen(page.id)} className="px-3 py-2 rounded-lg bg-slate-800 text-white text-sm">
            {unlocked ? "Open" : "Unlock"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordModal({ pageId, onClose, onSuccess }) {
  const [attempt, setAttempt] = useState("");
  const [error, setError] = useState(null);

  function tryUnlock() {
    if (checkPassword(pageId, attempt)) {
      onSuccess(pageId);
      onClose();
    } else {
      setError("Invalid code. Check your envelope and try again.");
    }
  }

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md bg-white rounded-2xl p-6">
        <h3 className="font-semibold mb-2">Unlock: {pageId}</h3>
        <p className="text-sm text-slate-600 mb-4">Enter the code from your envelope.</p>
        <input value={attempt} onChange={(e) => setAttempt(e.target.value)} className="w-full p-3 rounded-lg border" placeholder="Enter code" />
        {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
        <div className="mt-4 flex gap-2">
          <button onClick={tryUnlock} className="flex-1 bg-green-600 text-white p-3 rounded-lg">Unlock</button>
          <button onClick={onClose} className="flex-1 border p-3 rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Landing({ onOpenPage, unlockedPages }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700">Welcome, Agent. Your mission: find the Christmas gift by following secret clues and helping the party along the way. Unlock the next stages using codes you receive physically.</p>
      <div className="grid gap-3">
        {PAGES.map((p) => (
          <PageCard key={p.id} page={p} unlocked={!!unlockedPages[p.id]} onOpen={onOpenPage} />
        ))}
      </div>
    </div>
  );
}

function InfoPage({ page, onBack }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">{page.title}</h2>
      <div className="bg-white/90 p-4 rounded-xl shadow-sm text-sm">
        <p>This is an info page. Place the mission text, audio embed, or a short video here to deliver flavor and instructions in the crawl space or envelope.</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onBack} className="flex-1 p-3 rounded-lg border">Back</button>
      </div>
    </div>
  );
}

function LogicPuzzlePage({ puzzle, onBack, onSolvedExternal }) {
  // Local candidate answers: mapping person -> {gift,color,vehicle}
  const [answers, setAnswers] = useState(() => {
    const base = {};
    puzzle.people.forEach((p) => (base[p] = { gift: "", color: "", vehicle: "" }));
    return base;
  });

  const [hintIndex, setHintIndex] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage("");
  }, [answers]);

  function setAnswer(person, key, value) {
    setAnswers((s) => ({ ...s, [person]: { ...s[person], [key]: value } }));
  }

  function checkSolution() {
    // compare to canonical solution
    const expected = puzzle.solution;
    let ok = true;
    for (const person of puzzle.people) {
      const a = answers[person];
      const e = expected[person];
      if (!a || !e) { ok = false; break; }
      if (a.gift !== e.gift || a.color !== e.color || a.vehicle !== e.vehicle) { ok = false; break; }
    }
    if (ok) {
      setMessage("Mission success! Puzzle solved.");
      onSolvedExternal && onSolvedExternal(puzzle.slug);
    } else {
      setMessage("Not quite — check the clues and try again. Use hints if needed.");
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">{puzzle.title}</h2>
      <p className="text-sm text-slate-700">{puzzle.intro}</p>

      <div className="bg-white p-3 rounded-xl shadow-sm text-sm">
        <div className="mb-2 font-medium">Clues</div>
        <div className="text-xs text-slate-600">Reveal clues gradually. Use hints if you're new to logic puzzles.</div>
        <div className="mt-3 grid gap-2">
          <div className="flex gap-2">
            <button className="p-2 rounded-lg border flex-1" onClick={() => setHintIndex(Math.max(0, hintIndex - 1))} disabled={hintIndex === 0}>Prev</button>
            <button className="p-2 rounded-lg border flex-1" onClick={() => setHintIndex(Math.min(puzzle.clues.length, hintIndex + 1))} disabled={hintIndex === puzzle.clues.length}>Reveal Next</button>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg min-h-[3rem]">
            {hintIndex === 0 ? (
              <div className="text-slate-500 text-sm">No clues revealed yet. Use the buttons to reveal them one at a time.</div>
            ) : (
              <ol className="list-decimal ml-4 text-sm">
                {puzzle.clues.slice(0, hintIndex).map((c, i) => (
                  <li key={i} className="mb-1">{c}</li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm text-sm">
        <div className="font-medium">Your deductions</div>
        <div className="text-xs text-slate-600 mb-2">Choose assignments for each person.</div>
        <div className="space-y-3">
          {puzzle.people.map((person) => (
            <div key={person} className="p-3 border rounded-lg">
              <div className="font-semibold">{person}</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <select value={answers[person].gift} onChange={(e) => setAnswer(person, "gift", e.target.value)} className="p-2 rounded border">
                  <option value="">Gift</option>
                  {puzzle.gifts.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={answers[person].color} onChange={(e) => setAnswer(person, "color", e.target.value)} className="p-2 rounded border">
                  <option value="">Color</option>
                  {puzzle.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={answers[person].vehicle} onChange={(e) => setAnswer(person, "vehicle", e.target.value)} placeholder="Vehicle" className="p-2 rounded border" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={checkSolution} className="flex-1 p-3 rounded-lg bg-slate-800 text-white">Check Solution</button>
          <button onClick={() => { setAnswers(() => { const base = {}; puzzle.people.forEach(p => base[p] = { gift: "", color: "", vehicle: "" }); return base; }); setMessage(''); }} className="flex-1 p-3 rounded-lg border">Reset</button>
        </div>

        {message && <div className="mt-3 p-3 rounded-lg bg-green-50 text-sm text-slate-800">{message}</div>}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="flex-1 p-3 rounded-lg border">Back</button>
        <button onClick={() => { navigator.vibrate && navigator.vibrate(50); alert('If you solved the puzzle on paper, use Confirm Location to check you\'re headed to the right area.'); }} className="flex-1 p-3 rounded-lg">I solved this — confirm</button>
      </div>
    </div>
  );
}

function ConfirmPage({ onBack, expectedLocation = "Under the Christmas tree" }) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);

  function verify() {
    // Simple confirm: if they enter the expected phrase, success. Customize.
    if (code.trim().toLowerCase() === expectedLocation.toLowerCase()) {
      setMsg({ ok: true, text: "Confirmed — you are heading to the correct area." });
    } else {
      setMsg({ ok: false, text: "That doesn't match our expected location. Double-check your deduction." });
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Confirm Location</h2>
      <p className="text-sm text-slate-700">If you solved the puzzle on paper, type the location or the secret phrase you deduced to the field below for a quick confirmation.</p>
      <div className="bg-white p-3 rounded-xl shadow-sm">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Type location or secret phrase" className="w-full p-3 border rounded-lg" />
        <div className="mt-3 flex gap-2">
          <button onClick={verify} className="flex-1 p-3 rounded-lg bg-slate-800 text-white">Verify</button>
          <button onClick={onBack} className="flex-1 p-3 rounded-lg border">Back</button>
        </div>
        {msg && <div className={`mt-3 p-3 rounded-lg ${msg.ok ? 'bg-green-50' : 'bg-red-50'}`}>{msg.text}</div>}
      </div>
    </div>
  );
}

// ------------------------
// Main App
// ------------------------

export default function App() {
  const [state, setState] = useState(() => loadProgress());
  const [view, setView] = useState("home");
  const [currentPageId, setCurrentPageId] = useState(null);
  const [showPasswordFor, setShowPasswordFor] = useState(null);

  useEffect(() => { saveProgress(state); }, [state]);

  function openPage(id) {
    // If already unlocked, open directly
    if (state.unlocked && state.unlocked[id]) {
      setCurrentPageId(id);
      setView("page");
      return;
    }
    setShowPasswordFor(id);
  }

  function onUnlock(id) {
    setState((s) => ({ ...s, unlocked: { ...(s.unlocked || {}), [id]: true } }));
  }

  function closePassword() {
    setShowPasswordFor(null);
  }

  function onOpenPageDirect(id) {
    setCurrentPageId(id);
    setView("page");
  }

  function backToHome() {
    setView("home");
    setCurrentPageId(null);
  }

  // find page
  const currentPage = PAGES.find((p) => p.id === currentPageId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white p-4 sm:p-6">
      <div className="max-w-md mx-auto">
        <Header title="Secret Mission: Operation Christmas" />

        <div className="mt-4 space-y-4">
          {view === "home" && (
            <Landing onOpenPage={openPage} unlockedPages={state.unlocked || {}} />
          )}

          {view === "page" && currentPage && (
            <div className="bg-transparent">
              {currentPage.type === "info" && <InfoPage page={currentPage} onBack={backToHome} />}
              {currentPage.type === "puzzle" && <LogicPuzzlePage puzzle={EXAMPLE_PUZZLE} onBack={backToHome} onSolvedExternal={(slug) => { setState(s => ({ ...s, solved: { ...(s.solved||{}), [slug]: true } })); }} />}
              {currentPage.type === "confirm" && <ConfirmPage onBack={backToHome} expectedLocation={"Under the Christmas tree"} />}
            </div>
          )}

          <div className="text-xs text-slate-500">Progress is saved on your device.</div>

          <div className="mt-6">
            <div className="flex gap-2 text-sm">
              <button className="flex-1 p-3 rounded-lg bg-slate-800 text-white" onClick={() => { setView('home'); }}>Home</button>
              <button className="flex-1 p-3 rounded-lg border" onClick={() => { localStorage.clear(); setState({}); alert('Progress cleared'); }}>Reset Progress</button>
            </div>
          </div>
        </div>
      </div>

      {showPasswordFor && (
        <PasswordModal pageId={showPasswordFor} onClose={closePassword} onSuccess={(id) => { onUnlock(id); onOpenPageDirect(id); }} />
      )}

      <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/90 px-3 py-2 rounded-2xl shadow-md text-xs">Mission status: {Object.keys(state.unlocked || {}).filter(k => state.unlocked[k]).length} / {PAGES.length} pages unlocked</div>
      </div>
    </div>
  );
}
