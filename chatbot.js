/**
 * LPR Chatbot — Schwebendes Chat-Widget mit Claude-API
 * ==================================================
 *
 * Architektur:
 *   1. Schwebender Button unten rechts, klappt Panel auf
 *   2. Claude API (claude-sonnet-4-5-20250929) mit System-Prompt
 *   3. Tool-Calls für sichere Aktionen (Navigation, Vorbefüllung)
 *   4. Setup-Dialog beim ersten Öffnen für Demo-API-Key
 *
 * WICHTIG:
 *   - API-Key liegt nur im localStorage dieses Browsers
 *   - KEIN Produktionseinsatz! Für Live: PHP-Proxy auf Server
 *   - DSGVO: In der Datenschutzerklärung ergänzen, bevor online
 */
(function() {
  'use strict';

  const KEY_APIKEY = 'lpr-chatbot-apikey';
  const KEY_CONSENT = 'lpr-chatbot-consent';
  const KEY_HISTORY = 'lpr-chatbot-history';
  const MAX_HISTORY = 20; // Maximale Anzahl Nachrichten im Kontext

  const API_URL = 'https://api.anthropic.com/v1/messages';
  const MODEL = 'claude-sonnet-4-5-20250929';

  // ═══════════════════════════════════════════════════════════════════
  // SYSTEM-PROMPT — das komplette Vereinswissen
  // ═══════════════════════════════════════════════════════════════════
  const SYSTEM_PROMPT = `Du bist der digitale Assistent von **Leben Pflegen Reisen e.V.** (LPR) — einem gemeinnützigen Berliner Verein, der sich 2026 gegründet hat.

## Deine Persönlichkeit
- Warm, zugewandt, pragmatisch — nicht steif, nicht werblich.
- Antworte auf Deutsch, außer jemand schreibt in einer anderen Sprache.
- Kurze Antworten sind besser als lange. 2–5 Sätze im Regelfall, ausführlicher nur wenn gefragt.
- Bei Unsicherheit ehrlich sagen: "Das weiß ich nicht genau, ich leite dich am besten an info@lebenpflegenreisen.de weiter."
- Nutze keine Emojis im Übermaß — einzelne gezielte sind okay.
- Du duzt Ehrenamtliche, siezt Klinik-Ansprechpartner:innen.

## Zielgruppen-Erkennung
Am Anfang einer Unterhaltung oder wenn unklar, frage höflich:
"Bist du ehrenamtlich aktiv bei uns oder interessiert daran? Oder rufst du aus einer Klinik/Pflegeeinrichtung an?"

Danach passe die Ansprache an:
- **Ehrenamtliche:** Du-Form, Fokus auf persönliches Engagement, Aufwandsentschädigung, eigene Schichten
- **Kliniken:** Sie-Form, Fokus auf Buchung, Abrechnung, rechtliche Rahmenbedingungen
- **Allgemein:** Freundlich-neutral, dann zur Zielgruppen-Klärung hinlenken

## Das weißt du über den Verein

**Angebote:**
- **Reisebegleitung:** Gruppenreisen innerhalb Deutschlands für Menschen mit Pflege- oder Mobilitätsbedarf. Erste Reise Ende Mai 2026.
- **Sitzwachen:** In Berliner Krankenhäusern und Pflegeeinrichtungen. Schichten: Früh (06–14 Uhr), Spät (14–22 Uhr), Nacht (22–06 Uhr).
- **Soziale Teilhabe:** Begleitangebote, Veranstaltungen.
- **Pfade in Pflegeberufe:** Qualifizierungs- und Heranführungsangebote für Menschen, die einen Pflegeberuf erwägen.

**Guiding Framework:** PPP-Modell — Purpose, Pulse, People.

**Gründung:** Anfang 2026, Sitz Berlin, gemeinnützig nach § 52 AO.

**Vorstand:** Eric Borchert. Kontakt: info@lebenpflegenreisen.de.

## Aufwandsentschädigung / Pauschalen 2026
- **Übungsleiterpauschale** (§ 3 Nr. 26 EStG): 3.300 €/Jahr steuer- und sozialversicherungsfrei — für direkte Begleitung/Betreuung.
- **Ehrenamtspauschale** (§ 3 Nr. 26a EStG): 960 €/Jahr steuer- und sozialversicherungsfrei — für organisatorische Tätigkeiten.
- Kombinierbar für getrennte Tätigkeiten: maximal 4.260 €/Jahr steuerfrei.
- Konkrete Sätze:
  - **Reisebegleitung:** 150 €/Reisetag, An-/Abreise je 75 €
  - **Sitzwache:** 200 €/8-Stunden-Schicht
- Erhöhte Werte seit 01.01.2026 durch Steueränderungsgesetz 2025 (vorher: 3.000 € / 840 €).

## Kliniken: Preise für Sitzwachen
- 8-Stunden-Schicht: **240 €** (inkl. Vereinsverwaltungspauschale)
- 4-Stunden-Halbschicht: 130 €
- Späte Absage der Klinik (<12h): 50 € Bearbeitungspauschale
- Keine Umsatzsteuer (gemeinnütziger Verein, § 4 Nr. 18 UStG)

## Buchungsmodell für Kliniken
- Registrierung im Portal, dann Online-Buchung offener Schichten
- **Wichtig:** Der Verein vermittelt Sitzwachen, garantiert aber keine Anwesenheit. Fällt eine Sitzwache aus, bleibt die Aufsichtspflicht bei der Klinik (§ 4 der AGB). Ehrenamtliche sind nicht weisungsgebunden.
- Sitzwachen übernehmen NICHT: Medikamente, Körperpflege, Fixierung, medizinische Geräte, Eins-zu-Eins-Betreuung bei akuter Suizidalität.

## Absage-Flow (3 Stufen)
- **> 48 h (grün):** Ehrenamtliche/r klickt einfach "Austragen", kein Grund nötig.
- **24–48 h (orange):** Absage mit Grund-Auswahl (Krankheit/Familie/Unfall/Arbeit/Andere). Verein sucht Ersatz.
- **< 24 h (rot):** Notfall-Absage, zusätzlicher Doppel-Check, Ehrenamtliche/r wird aufgefordert, die Klinik DIREKT telefonisch zu informieren.
- Kliniken bekommen je nach Stufe unterschiedlich dringende Benachrichtigungen (E-Mail / + SMS / + Telefonanruf).

## Versicherungen (für Ehrenamtliche)
- Vereinshaftpflicht des Vereins
- Gruppenunfallversicherung
- Gesetzlich unfallversichert über Berufsgenossenschaft für Gesundheitsdienst und Wohlfahrtspflege (BGW)
- Persönliche Haftung nur bei Vorsatz oder grober Fahrlässigkeit (§§ 31a, 31b BGB analog)

## Werden bei uns — wie geht das?
1. Registrieren auf der Ehrenamt-Seite
2. Kurzschulung (3–4 Stunden) — Online oder in Präsenz
3. Erweitertes Führungszeugnis nach § 30a BZRG einreichen
4. Mitwirkungsvereinbarung unterschreiben
5. Los geht's — erste Schicht selbst im Kalender eintragen

## Was du TUN kannst (Tools)
Du hast Zugriff auf folgende Aktionen. Nutze sie sparsam und nur wenn eindeutig hilfreich:
- **navigate_to**: Schlägt dem User vor, zu einer bestimmten Seite zu gehen (login.html, ehrenamt.html, sitzwache-buchen.html, reisen.html, spenden.html, etc.)
- **contact_form**: Füllt die Kontakt-E-Mail mit einem vorbereiteten Text vor
- **show_pricing**: Zeigt eine strukturierte Preistabelle

## Was du NICHT tust
- Nicht direkt Dienste buchen, absagen oder Daten ändern — immer Hinweise geben, der User soll selbst klicken.
- Keine Rechtsberatung im engeren Sinn (sag: "Für eine verbindliche Rechtsauskunft wende dich an eine:n Anwält:in.")
- Keine medizinischen Ratschläge.
- Keine Aussagen über andere Mitglieder oder Kliniken.
- Keine Zusagen über Versicherungsleistungen im Einzelfall.

## Wenn du nicht weiterweißt
"Da bin ich ehrlich gesagt unsicher. Am besten wendest du dich an info@lebenpflegenreisen.de — der Vorstand hilft dir persönlich weiter."
`;

  // ═══════════════════════════════════════════════════════════════════
  // TOOLS — das was Claude tun darf
  // ═══════════════════════════════════════════════════════════════════
  const TOOLS = [
    {
      name: 'navigate_to',
      description: 'Schlägt dem User vor, zu einer bestimmten Seite zu navigieren. Zeigt einen Button im Chat, den der User klicken kann.',
      input_schema: {
        type: 'object',
        properties: {
          page: {
            type: 'string',
            description: 'Die Ziel-Seite, z.B. "ehrenamt.html", "login.html", "sitzwache-buchen.html", "reisen.html", "spenden.html", "abrechnung.html"'
          },
          reason: {
            type: 'string',
            description: 'Kurze Begründung, warum diese Seite sinnvoll ist. Erscheint als Button-Beschriftung.'
          }
        },
        required: ['page', 'reason']
      }
    },
    {
      name: 'contact_form',
      description: 'Bietet einen vorausgefüllten E-Mail-Link an info@lebenpflegenreisen.de an.',
      input_schema: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Betreff der E-Mail' },
          body: { type: 'string', description: 'Vorgeschlagener Text der E-Mail' }
        },
        required: ['subject', 'body']
      }
    },
    {
      name: 'show_pricing',
      description: 'Zeigt eine strukturierte Preistabelle für Kliniken oder Aufwandsentschädigungen für Ehrenamtliche.',
      input_schema: {
        type: 'object',
        properties: {
          audience: { type: 'string', enum: ['klinik', 'ehrenamt'], description: 'Für welche Zielgruppe' }
        },
        required: ['audience']
      }
    }
  ];

  // ═══════════════════════════════════════════════════════════════════
  // STORAGE
  // ═══════════════════════════════════════════════════════════════════
  function getApiKey() { try { return localStorage.getItem(KEY_APIKEY) || ''; } catch (e) { return ''; } }
  function setApiKey(k) { try { localStorage.setItem(KEY_APIKEY, k); } catch (e) {} }
  function getConsent() { try { return localStorage.getItem(KEY_CONSENT) === '1'; } catch (e) { return false; } }
  function setConsent(v) { try { localStorage.setItem(KEY_CONSENT, v ? '1' : '0'); } catch (e) {} }
  function getHistory() {
    try { return JSON.parse(localStorage.getItem(KEY_HISTORY) || '[]'); } catch (e) { return []; }
  }
  function saveHistory(msgs) {
    try { localStorage.setItem(KEY_HISTORY, JSON.stringify(msgs.slice(-MAX_HISTORY))); } catch (e) {}
  }
  function clearHistory() { try { localStorage.removeItem(KEY_HISTORY); } catch (e) {} }

  function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; }

  // ═══════════════════════════════════════════════════════════════════
  // UI — CSS + HTML
  // ═══════════════════════════════════════════════════════════════════
  const STYLE = `
    #lpr-chat-fab {
      position: fixed; bottom: 24px; right: 24px;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #2D4A3A, #1E3127);
      border: 3px solid #C8F135;
      cursor: pointer; z-index: 9998;
      box-shadow: 0 8px 24px rgba(0,0,0,.2);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
    }
    #lpr-chat-fab:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(0,0,0,.28); }
    #lpr-chat-fab svg { width: 28px; height: 28px; }
    #lpr-chat-fab .notif {
      position: absolute; top: -4px; right: -4px;
      background: #C8F135; color: #1E3127;
      font-size: 10px; font-weight: 800;
      padding: 3px 7px; border-radius: 10px;
      font-family: 'Bricolage Grotesque', sans-serif;
      letter-spacing: .05em;
    }

    #lpr-chat-panel {
      position: fixed; bottom: 100px; right: 24px;
      width: 400px; max-width: calc(100vw - 32px);
      height: 600px; max-height: calc(100vh - 160px);
      background: #fff; border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
      border: 1px solid #D8D4CC;
      z-index: 9999;
      display: none; flex-direction: column;
      overflow: hidden;
      font-family: 'Instrument Sans', sans-serif;
    }
    #lpr-chat-panel.open { display: flex; animation: chat-in .25s ease-out; }
    @keyframes chat-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

    .lpr-chat-header {
      background: #1E3127; color: #fff;
      padding: 16px 20px;
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 3px solid #C8F135;
    }
    .lpr-chat-head-title {
      font-family: 'Bricolage Grotesque', sans-serif;
      font-weight: 800; font-size: 17px;
    }
    .lpr-chat-head-sub {
      font-size: 11px; opacity: .7; margin-top: 2px;
      letter-spacing: .05em;
    }
    .lpr-chat-close {
      background: transparent; border: none;
      color: #fff; font-size: 22px; cursor: pointer;
      padding: 4px 10px; border-radius: 6px;
      transition: background .15s;
    }
    .lpr-chat-close:hover { background: rgba(255,255,255,.1); }

    .lpr-chat-messages {
      flex: 1; overflow-y: auto;
      padding: 18px 16px;
      background: #F5F5F0;
      display: flex; flex-direction: column; gap: 12px;
    }
    .lpr-msg { max-width: 86%; }
    .lpr-msg.user { align-self: flex-end; }
    .lpr-msg.assistant { align-self: flex-start; }
    .lpr-msg .bubble {
      padding: 10px 14px; border-radius: 14px;
      font-size: 14.5px; line-height: 1.55;
      word-wrap: break-word;
    }
    .lpr-msg.user .bubble {
      background: #2D4A3A; color: #fff;
      border-bottom-right-radius: 4px;
    }
    .lpr-msg.assistant .bubble {
      background: #fff; color: #1A241E;
      border: 1px solid #E5E1D8;
      border-bottom-left-radius: 4px;
    }
    .lpr-msg.system .bubble {
      background: #FFF4EE; color: #8B4518;
      border: 1px solid #F5C4B0;
      font-size: 13px;
      text-align: center; font-style: italic;
    }
    .lpr-msg .bubble a { color: inherit; text-decoration: underline; }
    .lpr-msg.user .bubble a { color: #C8F135; }

    .lpr-tool-action {
      margin-top: 8px;
      display: inline-flex; align-items: center; gap: 6px;
      background: #C8F135; color: #1E3127;
      border: none; border-radius: 10px;
      padding: 8px 14px;
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 700; font-size: 13px;
      cursor: pointer; text-decoration: none !important;
      transition: filter .15s;
    }
    .lpr-tool-action:hover { filter: brightness(.94); }
    .lpr-tool-action.secondary {
      background: #fff; color: #2D4A3A;
      border: 1.5px solid #2D4A3A;
    }

    .lpr-pricing-table {
      margin-top: 8px;
      background: #F8F5EE; border-radius: 10px;
      padding: 10px 12px; font-size: 13px;
    }
    .lpr-pricing-table .row {
      display: flex; justify-content: space-between;
      padding: 5px 0; border-top: 1px solid #E5E1D8;
    }
    .lpr-pricing-table .row:first-child { border-top: none; font-weight: 700; color: #1E3127; }
    .lpr-pricing-table .row strong { color: #2D4A3A; }

    .lpr-typing {
      align-self: flex-start;
      display: flex; gap: 4px; align-items: center;
      padding: 12px 16px; background: #fff;
      border-radius: 14px; border-bottom-left-radius: 4px;
      border: 1px solid #E5E1D8;
    }
    .lpr-typing span {
      width: 7px; height: 7px; border-radius: 50%; background: #999;
      animation: lpr-bounce 1.3s infinite ease-in-out;
    }
    .lpr-typing span:nth-child(2) { animation-delay: .15s; }
    .lpr-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes lpr-bounce {
      0%, 60%, 100% { opacity: .3; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-4px); }
    }

    .lpr-chat-input-bar {
      display: flex; gap: 8px;
      padding: 12px 14px;
      background: #fff;
      border-top: 1px solid #E5E1D8;
    }
    .lpr-chat-input-bar textarea {
      flex: 1; border: 1.5px solid #D8D4CC;
      border-radius: 10px; padding: 9px 12px;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 14px; resize: none; min-height: 40px; max-height: 100px;
      outline: none; transition: border-color .15s;
    }
    .lpr-chat-input-bar textarea:focus { border-color: #2D4A3A; }
    .lpr-chat-send {
      background: #2D4A3A; color: #fff; border: none;
      padding: 0 16px; border-radius: 10px;
      font-size: 20px; cursor: pointer;
      transition: background .15s;
    }
    .lpr-chat-send:hover:not(:disabled) { background: #1E3127; }
    .lpr-chat-send:disabled { opacity: .4; cursor: not-allowed; }

    .lpr-chat-footer {
      font-size: 11px; text-align: center;
      padding: 6px 14px 8px;
      color: #6B7771;
      background: #fff;
      border-top: 1px solid #F0ECE4;
    }
    .lpr-chat-footer a { color: #2D4A3A; }
    .lpr-chat-footer button {
      background: none; border: none;
      color: #6B7771; cursor: pointer;
      text-decoration: underline;
      font-size: 11px;
    }

    /* Setup-Dialog */
    .lpr-setup {
      position: absolute; inset: 0;
      background: #fff; z-index: 2;
      padding: 24px 22px;
      overflow-y: auto;
    }
    .lpr-setup h3 {
      font-family: 'Bricolage Grotesque', sans-serif;
      font-size: 18px; color: #1E3127; margin-bottom: 8px;
    }
    .lpr-setup p { font-size: 13.5px; line-height: 1.55; color: #3E4A43; margin-bottom: 12px; }
    .lpr-setup .warn {
      background: #FFF4EE; border: 1.5px solid #F5C4B0;
      padding: 10px 12px; border-radius: 8px;
      font-size: 12.5px; color: #8B4518; margin-bottom: 14px;
    }
    .lpr-setup input, .lpr-setup label {
      display: block; width: 100%;
      font-size: 13.5px;
    }
    .lpr-setup label { font-weight: 600; margin: 14px 0 6px; color: #1E3127; }
    .lpr-setup input[type="password"], .lpr-setup input[type="text"] {
      border: 1.5px solid #D8D4CC; border-radius: 8px;
      padding: 10px 12px;
      font-family: monospace; font-size: 13px;
    }
    .lpr-setup .check-row {
      margin: 16px 0; font-size: 12.5px;
      display: flex; align-items: flex-start; gap: 8px;
      color: #3E4A43;
    }
    .lpr-setup .check-row input { width: auto; margin-top: 2px; }
    .lpr-setup .btn-row {
      display: flex; gap: 10px; margin-top: 18px;
    }
    .lpr-setup button {
      flex: 1; padding: 10px 16px;
      border-radius: 8px; border: none;
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 700; font-size: 14px; cursor: pointer;
    }
    .lpr-setup .btn-primary { background: #2D4A3A; color: #fff; }
    .lpr-setup .btn-primary:disabled { background: #B5B5B0; cursor: not-allowed; }
    .lpr-setup .btn-primary:not(:disabled):hover { background: #1E3127; }
    .lpr-setup .btn-ghost {
      background: transparent; border: 1.5px solid #D8D4CC;
      color: #3E4A43;
    }
  `;

  const HTML = `
    <button id="lpr-chat-fab" aria-label="Chat mit dem LPR-Assistenten öffnen" title="Frag mich etwas!">
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M6 10c0-2 1.5-3.5 3.5-3.5h13c2 0 3.5 1.5 3.5 3.5v8c0 2-1.5 3.5-3.5 3.5h-9L9 25v-3.5H9.5C7.5 21.5 6 20 6 18v-8z" stroke="#C8F135" stroke-width="2.2" stroke-linejoin="round"/>
        <circle cx="12" cy="14" r="1.5" fill="#C8F135"/>
        <circle cx="16" cy="14" r="1.5" fill="#C8F135"/>
        <circle cx="20" cy="14" r="1.5" fill="#C8F135"/>
      </svg>
      <span class="notif">KI</span>
    </button>

    <div id="lpr-chat-panel" role="dialog" aria-label="LPR Chat-Assistent" aria-modal="false">
      <div class="lpr-chat-header">
        <div>
          <div class="lpr-chat-head-title">LPR-Assistent</div>
          <div class="lpr-chat-head-sub">Fragen rund um den Verein</div>
        </div>
        <button class="lpr-chat-close" aria-label="Chat schließen" onclick="LPR_Chatbot.close()">✕</button>
      </div>

      <div id="lpr-chat-messages" class="lpr-chat-messages" role="log" aria-live="polite"></div>

      <div class="lpr-chat-input-bar">
        <textarea id="lpr-chat-input" placeholder="Schreib mir eine Frage …" rows="1" aria-label="Deine Nachricht"></textarea>
        <button id="lpr-chat-send" class="lpr-chat-send" onclick="LPR_Chatbot.send()" aria-label="Senden" title="Senden">➤</button>
      </div>

      <div class="lpr-chat-footer">
        KI-Prototyp · antworten können Fehler enthalten ·
        <button onclick="LPR_Chatbot.openSetup()">Einstellungen</button> ·
        <button onclick="LPR_Chatbot.resetChat()">Chat löschen</button>
      </div>

      <div id="lpr-chat-setup" class="lpr-setup" style="display:none;">
        <h3>Chatbot einrichten</h3>
        <p>Dieser Chatbot nutzt die <strong>Claude API von Anthropic</strong>. Du brauchst einen persönlichen API-Key, den du in deinem Anthropic-Konto erstellen kannst.</p>

        <div class="warn">
          ⚠ <strong>Nur für Demo-Zwecke:</strong> Der API-Key wird lokal in deinem Browser (localStorage) gespeichert und mit jedem Seitenbesucher mitgegeben, der diese Seite öffnet. Für den echten Online-Betrieb brauchst du einen Server-Proxy (kommt in der WordPress-Phase).
        </div>

        <label for="lpr-apikey">Anthropic API-Key</label>
        <input type="password" id="lpr-apikey" placeholder="sk-ant-api03-..." autocomplete="off">

        <div class="check-row">
          <input type="checkbox" id="lpr-consent">
          <label for="lpr-consent" style="margin:0; font-weight:500;">
            Ich weiß, dass Chat-Inhalte an Anthropic (USA) gesendet werden. Für den Live-Betrieb ergänze ich die Datenschutzerklärung.
          </label>
        </div>

        <div class="btn-row">
          <button class="btn-ghost" onclick="LPR_Chatbot.closeSetup()">Abbrechen</button>
          <button id="lpr-save-setup" class="btn-primary" onclick="LPR_Chatbot.saveSetup()">Speichern</button>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #6B7771;">
          API-Key bekommst du auf <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a> unter "API Keys".
          Kosten liegen bei wenigen Cent pro Unterhaltung.
        </p>
      </div>
    </div>
  `;

  // ═══════════════════════════════════════════════════════════════════
  // UI-Rendering
  // ═══════════════════════════════════════════════════════════════════
  function mount() {
    const style = document.createElement('style');
    style.id = 'lpr-chatbot-style';
    style.textContent = STYLE;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.id = 'lpr-chatbot-root';
    root.innerHTML = HTML;
    document.body.appendChild(root);

    document.getElementById('lpr-chat-fab').addEventListener('click', open);
    const input = document.getElementById('lpr-chat-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(100, input.scrollHeight) + 'px';
    });

    document.getElementById('lpr-apikey').addEventListener('input', updateSetupBtn);
    document.getElementById('lpr-consent').addEventListener('change', updateSetupBtn);

    // Gespeicherte History wieder anzeigen
    renderHistory();
  }

  function updateSetupBtn() {
    const key = document.getElementById('lpr-apikey').value.trim();
    const consent = document.getElementById('lpr-consent').checked;
    document.getElementById('lpr-save-setup').disabled = !(key.startsWith('sk-ant-') && consent);
  }

  function open() {
    const panel = document.getElementById('lpr-chat-panel');
    panel.classList.add('open');

    if (!getApiKey() || !getConsent()) {
      openSetup();
    } else if (getHistory().length === 0) {
      // Begrüßung einfügen
      addMessage('assistant',
        'Hi! Ich bin der digitale Assistent von Leben Pflegen Reisen. ' +
        'Ich kann dir bei Fragen zum Verein, zu Sitzwachen, Reisen, Aufwandsentschädigung oder Abläufen helfen. ' +
        'Bist du ehrenamtlich aktiv oder interessiert daran? Oder schreibst du aus einer Klinik?'
      );
    }

    setTimeout(() => document.getElementById('lpr-chat-input').focus(), 300);
  }

  function close() {
    document.getElementById('lpr-chat-panel').classList.remove('open');
  }

  function openSetup() {
    document.getElementById('lpr-chat-setup').style.display = 'block';
    document.getElementById('lpr-apikey').value = getApiKey();
    document.getElementById('lpr-consent').checked = getConsent();
    updateSetupBtn();
  }

  function closeSetup() {
    document.getElementById('lpr-chat-setup').style.display = 'none';
  }

  function saveSetup() {
    const key = document.getElementById('lpr-apikey').value.trim();
    const consent = document.getElementById('lpr-consent').checked;
    if (!key.startsWith('sk-ant-') || !consent) return;
    setApiKey(key);
    setConsent(consent);
    closeSetup();
    if (getHistory().length === 0) {
      addMessage('assistant',
        'Alles bereit! Frag mich jetzt etwas — z.B. "Was kostet eine Sitzwache?" oder "Wie werde ich Ehrenamtlicher?".'
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // Nachrichten rendern
  // ═══════════════════════════════════════════════════════════════════
  function renderHistory() {
    const msgs = getHistory();
    const box = document.getElementById('lpr-chat-messages');
    if (!box) return;
    box.innerHTML = '';
    msgs.forEach(m => renderMessage(m));
  }

  function addMessage(role, content, toolUse) {
    const msg = { role, content, toolUse, time: Date.now() };
    const msgs = getHistory();
    msgs.push(msg);
    saveHistory(msgs);
    renderMessage(msg);
  }

  function renderMessage(msg) {
    const box = document.getElementById('lpr-chat-messages');
    if (!box) return;

    const div = document.createElement('div');
    div.className = 'lpr-msg ' + msg.role;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    // Simple Markdown-Support: **bold**, [link](url), Zeilenumbrüche
    bubble.innerHTML = mdToHtml(msg.content || '');
    div.appendChild(bubble);

    // Tool-spezifische UI
    if (msg.toolUse) {
      const toolBox = document.createElement('div');
      if (msg.toolUse.name === 'navigate_to') {
        const btn = document.createElement('a');
        btn.className = 'lpr-tool-action';
        btn.href = msg.toolUse.input.page;
        btn.textContent = '→ ' + msg.toolUse.input.reason;
        toolBox.appendChild(btn);
      } else if (msg.toolUse.name === 'contact_form') {
        const btn = document.createElement('a');
        btn.className = 'lpr-tool-action';
        const href = 'mailto:info@lebenpflegenreisen.de'
          + '?subject=' + encodeURIComponent(msg.toolUse.input.subject)
          + '&body=' + encodeURIComponent(msg.toolUse.input.body);
        btn.href = href;
        btn.textContent = '✉ E-Mail vorbereiten';
        toolBox.appendChild(btn);
      } else if (msg.toolUse.name === 'show_pricing') {
        toolBox.appendChild(renderPricingTable(msg.toolUse.input.audience));
      }
      div.appendChild(toolBox);
    }

    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function renderPricingTable(audience) {
    const div = document.createElement('div');
    div.className = 'lpr-pricing-table';
    if (audience === 'klinik') {
      div.innerHTML = `
        <div class="row"><span>Leistung</span><span>Preis</span></div>
        <div class="row"><span>Sitzwache 8 Std.</span><strong>240 €</strong></div>
        <div class="row"><span>Sitzwache 4 Std. (halbe Schicht)</span><strong>130 €</strong></div>
        <div class="row"><span>Absage <12 h vor Dienst</span><strong>50 €</strong></div>
        <div class="row" style="font-size:11px; color:#6B7771;"><span>Keine Umsatzsteuer (§ 4 Nr. 18 UStG)</span><span></span></div>
      `;
    } else {
      div.innerHTML = `
        <div class="row"><span>Tätigkeit</span><span>Aufwand</span></div>
        <div class="row"><span>Sitzwache (8-Std-Schicht)</span><strong>200 €</strong></div>
        <div class="row"><span>Reisebegleitung (voller Tag)</span><strong>150 €</strong></div>
        <div class="row"><span>An-/Abreisetag</span><strong>75 €</strong></div>
        <div class="row" style="font-size:11px; color:#6B7771;"><span>Bis 3.300 € p.a. steuerfrei (§ 3 Nr. 26 EStG)</span><span></span></div>
      `;
    }
    return div;
  }

  function showTyping(show) {
    const box = document.getElementById('lpr-chat-messages');
    const existing = document.getElementById('lpr-typing-indicator');
    if (show) {
      if (existing) return;
      const div = document.createElement('div');
      div.id = 'lpr-typing-indicator';
      div.className = 'lpr-typing';
      div.innerHTML = '<span></span><span></span><span></span>';
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    } else if (existing) existing.remove();
  }

  function mdToHtml(t) {
    return escapeHtml(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
  }

  // ═══════════════════════════════════════════════════════════════════
  // SEND — der eigentliche API-Call
  // ═══════════════════════════════════════════════════════════════════
  async function send() {
    const input = document.getElementById('lpr-chat-input');
    const text = input.value.trim();
    if (!text) return;

    const apiKey = getApiKey();
    if (!apiKey) { openSetup(); return; }

    addMessage('user', text);
    input.value = '';
    input.style.height = 'auto';
    document.getElementById('lpr-chat-send').disabled = true;
    showTyping(true);

    try {
      await callClaude();
    } catch (err) {
      showTyping(false);
      addMessage('assistant',
        '⚠ Entschuldige, da ist gerade etwas schiefgelaufen.\n\n' +
        'Fehler: ' + (err.message || err) + '\n\n' +
        'Falls das wiederholt passiert: API-Key prüfen (Einstellungen unten) oder später nochmal versuchen.'
      );
    } finally {
      document.getElementById('lpr-chat-send').disabled = false;
    }
  }

  async function callClaude() {
    const apiKey = getApiKey();
    const history = getHistory();

    // Nachrichten in das API-Format umwandeln
    const messages = history
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => {
        // Bei Tool-Nachrichten: Content-Block-Format
        if (m.role === 'assistant' && m.toolUse) {
          return {
            role: 'assistant',
            content: [
              { type: 'text', text: m.content },
              {
                type: 'tool_use',
                id: m.toolUse.id,
                name: m.toolUse.name,
                input: m.toolUse.input
              }
            ]
          };
        }
        return { role: m.role, content: m.content };
      });

    const body = {
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages
    };

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      let errMsg = `HTTP ${resp.status}`;
      try {
        const errObj = JSON.parse(errText);
        if (errObj.error?.message) errMsg = errObj.error.message;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const data = await resp.json();
    showTyping(false);

    // Antwort-Blöcke verarbeiten
    const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text);
    const toolBlocks = (data.content || []).filter(b => b.type === 'tool_use');

    const text = textBlocks.join('\n\n').trim();
    if (toolBlocks.length > 0) {
      // Nur ersten Tool-Call darstellen (reicht für unsere Cases)
      const t = toolBlocks[0];
      addMessage('assistant', text || '—', { id: t.id, name: t.name, input: t.input });
    } else if (text) {
      addMessage('assistant', text);
    } else {
      addMessage('assistant', 'Ich habe keine Antwort bekommen — probier es bitte nochmal.');
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════════════════════════════════
  function resetChat() {
    if (!confirm('Chat-Verlauf wirklich löschen?')) return;
    clearHistory();
    document.getElementById('lpr-chat-messages').innerHTML = '';
    addMessage('assistant',
      'Chat zurückgesetzt. Frag mich gerne nochmal was!'
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════
  window.LPR_Chatbot = {
    mount, open, close, send,
    openSetup, closeSetup, saveSetup,
    resetChat
  };

  // Auto-mount wenn DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
