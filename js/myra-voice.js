(() => {
  "use strict";

  function hasSpeechRecognition() {
    return (
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }

  function createRecognition() {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    return rec;
  }

  function safeText(s) {
    return String(s || "").trim();
  }

  function normalize(s) {
    return safeText(s).toLowerCase();
  }

  function stripWakeWord(text, wakeWord) {
    const t = safeText(text);
    if (!wakeWord) return t;
    const w = normalize(wakeWord);
    const n = normalize(t);
    if (!n.startsWith(w)) return t;
    return safeText(t.slice(t.toLowerCase().indexOf(w) + wakeWord.length));
  }

  function chooseVoice(preferLangPrefix) {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const pref = (preferLangPrefix || "en").toLowerCase();
    const byLang = voices.filter(v => (v.lang || "").toLowerCase().startsWith(pref));
    return (
      byLang.find(v => /female|woman|zira|susan|samantha/i.test(v.name || "")) ||
      byLang[0] ||
      voices[0] ||
      null
    );
  }

  function buildUtterance(msg, opts) {
    const u = new SpeechSynthesisUtterance(msg);

    // Defaults tuned for "more human" (slightly slower, slightly lower pitch, not max volume).
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const rate = opts.rate ?? 0.95; // 0.1..10 (browser dependent); ~1 is default
    const pitch = opts.pitch ?? 0.98; // 0..2; 1 is default
    const volume = opts.volume ?? 0.92; // 0..1; 1 is default

    u.rate = clamp(rate, 0.6, 1.15);
    u.pitch = clamp(pitch, 0.75, 1.2);
    u.volume = clamp(volume, 0.4, 1);

    const v = chooseVoice(opts.langPrefix || "en");
    if (v) u.voice = v;
    return u;
  }

  function speak(text, opts = {}) {
    const msg = safeText(text);
    if (!msg) return;
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;

    // Avoid stacking speech for rapid re-runs.
    if (opts.cancel !== false) window.speechSynthesis.cancel();

    const u = buildUtterance(msg, opts);
    window.speechSynthesis.speak(u);
  }

  function speakAsync(text, opts = {}) {
    const msg = safeText(text);
    if (!msg) return Promise.resolve();
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return Promise.resolve();

    if (opts.cancel !== false) window.speechSynthesis.cancel();

    return new Promise(resolve => {
      const u = buildUtterance(msg, opts);
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  }

  function listenOnce({ lang = "en-US", timeoutMs = 9000, startDelayMs = 250 } = {}) {
    return new Promise((resolve, reject) => {
      if (!hasSpeechRecognition()) {
        reject(new Error("speech_recognition_unavailable"));
        return;
      }

      const rec = createRecognition();
      if (!rec) {
        reject(new Error("speech_recognition_unavailable"));
        return;
      }

      rec.lang = lang;

      let done = false;
      let timeoutId = null;

      function finish(err, transcript) {
        if (done) return;
        done = true;
        if (timeoutId) clearTimeout(timeoutId);
        try {
          rec.onstart = null;
          rec.onend = null;
          rec.onerror = null;
          rec.onresult = null;
          rec.stop();
        } catch {
          // Ignore.
        }
        if (err) reject(err);
        else resolve(transcript);
      }

      rec.onerror = e => {
        finish(new Error(safeText(e?.error) || "speech_error"), null);
      };

      rec.onresult = e => {
        const result = e?.results?.[0]?.[0];
        const transcript = safeText(result?.transcript);
        if (!transcript) {
          finish(new Error("no_transcript"), null);
          return;
        }
        finish(null, transcript);
      };

      rec.onend = () => {
        // If it ends without a result, surface that clearly.
        if (!done) finish(new Error("recognition_ended"), null);
      };

      timeoutId = setTimeout(() => {
        finish(new Error("listen_timeout"), null);
      }, timeoutMs);

      setTimeout(() => {
        try {
          rec.start();
        } catch (err) {
          finish(err instanceof Error ? err : new Error("rec_start_failed"), null);
        }
      }, startDelayMs);
    });
  }

  /**
   * Bind a single-button "push to talk" control.
   *
   * Options:
   * - button: HTMLElement (required)
   * - statusEl: HTMLElement (optional)
   * - wakeWord: string (optional) e.g. "hey myra"
   * - onTranscript: async (text, strippedText) => void (required)
   */
  function bindVoiceControl({ button, statusEl, wakeWord, onTranscript }) {
    if (!button) throw new Error("MyraVoice.bindVoiceControl: missing button");
    if (typeof onTranscript !== "function") {
      throw new Error("MyraVoice.bindVoiceControl: missing onTranscript");
    }

    if (!hasSpeechRecognition()) {
      button.disabled = true;
      if (statusEl) {
        statusEl.textContent =
          "Voice not available in this browser. Try Chrome (desktop/mobile).";
      }
      return { stop: () => {} };
    }

    const rec = createRecognition();
    if (!rec) {
      button.disabled = true;
      if (statusEl) statusEl.textContent = "Voice recognition unavailable.";
      return { stop: () => {} };
    }

    let listening = false;

    function setStatus(msg) {
      if (!statusEl) return;
      statusEl.textContent = msg;
    }

    function setButtonLabel() {
      button.textContent = listening ? "Stop Listening" : "Talk to Myra";
    }

    rec.onstart = () => {
      listening = true;
      setButtonLabel();
      setStatus("Listening…");
    };

    rec.onend = () => {
      listening = false;
      setButtonLabel();
      setStatus(" ");
    };

    rec.onerror = e => {
      // Most common: "not-allowed" (no mic perms), "no-speech".
      setStatus(`Voice error: ${safeText(e?.error) || "unknown"}`);
    };

    rec.onresult = async e => {
      const result = e?.results?.[0]?.[0];
      const transcript = safeText(result?.transcript);
      if (!transcript) return;

      const stripped = stripWakeWord(transcript, wakeWord);
      setStatus(`Heard: "${transcript}"`);

      try {
        await onTranscript(transcript, stripped);
      } catch (err) {
        console.error(err);
        setStatus("Sorry, I couldn't process that voice request.");
      }
    };

    button.addEventListener("click", () => {
      if (listening) {
        try {
          rec.stop();
        } catch {
          // Ignore.
        }
        return;
      }
      try {
        rec.start();
      } catch {
        // Some browsers throw if called twice quickly.
      }
    });

    setButtonLabel();
    setStatus(" ");

    return {
      stop: () => {
        try {
          rec.stop();
        } catch {
          // Ignore.
        }
      },
    };
  }

  window.MyraVoice = {
    bindVoiceControl,
    listenOnce,
    normalize,
    speak,
    speakAsync,
  };
})();
