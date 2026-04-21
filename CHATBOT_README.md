# LPR Chatbot · Setup & Anleitung

**Stand:** 21. April 2026 · Prototyp v1

Ein Chat-Widget unten rechts auf jeder Seite. Antwortet auf Fragen zu Verein, Sitzwachen, Reisen, Aufwandsentschädigung, Rechtlichem. Powered by Claude (Anthropic).

---

## Schnellstart

1. Prototyp öffnen (`start.html` oder `index.html`)
2. Unten rechts auf den grünen Chat-Button klicken
3. Beim ersten Öffnen erscheint ein Setup-Dialog:
   - **Anthropic API-Key** eintragen (Format: `sk-ant-api03-...`)
   - Hinweis zur USA-Datenverarbeitung bestätigen
4. Loslegen. Claude begrüßt dich und fragt nach der Zielgruppe (Ehrenamtlich oder Klinik).

### Wo bekomme ich einen API-Key?

- Gehe auf [console.anthropic.com](https://console.anthropic.com)
- Account erstellen (kostenlos, gibt ein paar Euro Startguthaben)
- Im Menü auf "API Keys" → "Create Key"
- Kopieren und im Chat-Setup einfügen

### Was kostet das?

Bei Claude Sonnet 4.5: ca. **0,2 – 1 Cent pro Nutzer-Frage**, abhängig von Antwortlänge. Eine ausgiebige Demo-Session liegt bei wenigen Cent.

---

## Was kann der Chatbot?

**Inhaltlich:**
- Erklärt den Verein, Angebote, Gründung, Vorstand
- Auskunft zu Pauschalen (Übungsleiter 3.300 €, Ehrenamt 960 €)
- Preise für Kliniken (240 € pro 8-Stunden-Sitzwache)
- Absage-Flow-Erklärung mit den drei Zonen
- Versicherung, Haftung, Rechtsrahmen (Überblick, keine Rechtsberatung!)
- Werden-bei-uns-Prozess (Schulung → Führungszeugnis → Vereinbarung)
- Unterscheidet Ehrenamtliche (duzt) und Kliniken (siezt)

**Aktionen (Tool-Calls):**
- `navigate_to` — schlägt passende Seite vor und zeigt Button ("→ Zum Ehrenamt-Bereich")
- `contact_form` — generiert `mailto:`-Link mit vorausgefülltem Betreff und Text
- `show_pricing` — zeigt eine strukturierte Preistabelle im Chat

**Absichtlich NICHT:**
- Keine direkten Buchungen ausführen
- Keine Absagen für User durchführen
- Keine Änderung an Benutzerdaten
- Keine Rechts- oder Medizinberatung
- Keine Aussagen über andere Personen

---

## Technische Architektur

```
┌─────────────────────┐
│  Browser (User)     │
│  ┌───────────────┐  │
│  │ chatbot.js    │  │   ← System-Prompt + Tools
│  │  ↓            │  │
│  │ fetch(...)    │──┼──→  api.anthropic.com/v1/messages
│  │               │  │       mit API-Key aus localStorage
│  │ renderMsg()   │  │
│  └───────────────┘  │
│                     │
│  localStorage:      │
│   • apikey (Demo!)  │
│   • consent         │
│   • history (max 20)│
└─────────────────────┘
```

### Dateien
- **`chatbot.js`** — das gesamte Widget in einer Datei (ca. 600 Zeilen)
- **`layout.js`** — lädt Chatbot auf allen Seiten automatisch

### Einbindung auf einzelnen Seiten
Auf Seiten, die `LPR_Layout.init(...)` benutzen, ist der Chatbot automatisch dabei. Zum Ausschalten (z. B. für spezielle Seiten):
```js
LPR_Layout.init({ page: 'start', chatbot: false });
```

---

## ⚠ WICHTIG: Dieser Prototyp ist NICHT produktiv-sicher

### Das Problem
Der API-Key liegt im Browser. **Jeder Besucher der Seite kann ihn in den DevTools auslesen** und auf deine Kosten anfragen. Deshalb ist das aktuelle Setup ausschließlich:

- Für lokale Demo auf deinem Rechner
- Für Vorstandspräsentationen (Montag)
- Zum Entwickeln und Ausprobieren des Flows

**Bevor der Chatbot ans echte Internet geht, MUSS folgendes erfüllt sein:**

### 1. Server-Proxy
Ein kleines PHP-Script auf deinem Ionos-Hosting. Der Browser schickt Anfragen an den Proxy, der Proxy fügt den API-Key hinzu und leitet an Anthropic weiter. Der Key liegt dann serverseitig in einer `.env`-Datei außerhalb des Web-Roots.

**Phase 2 (WordPress):** Wird als eigenes WordPress-Plugin oder als kleines PHP-Endpoint unter `wp-content/mu-plugins/` gebaut. Dann aus der Browser-Anfrage einfach `api.anthropic.com` durch `https://lebenpflegenreisen.de/api/chat` ersetzen.

### 2. DSGVO-Ergänzungen
- Auftragsverarbeitungsvertrag (AVV) mit Anthropic — Standard-Template gibt's auf ihrer Website
- Datenschutzerklärung ergänzen:
  - "Wir nutzen den Dienst Claude von Anthropic PBC (USA) zur Beantwortung von Chat-Anfragen."
  - "Übermittelte Inhalte: Ihre Chat-Nachrichten während der Session."
  - "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse, effiziente Auskunft)."
  - "Keine Speicherung beim Verein — nur temporärer lokaler Verlauf im Browser."
- Einwilligungshinweis im Chat-Widget **vor dem ersten Absenden** (ist aktuell als Setup-Check drin)

### 3. Rate Limiting
Damit niemand den Chat missbraucht, um Kosten zu verursachen:
- Max. 20 Anfragen pro IP / Stunde
- Max. 500 Zeichen pro Nachricht
- Missbrauchs-Erkennung (gleiche Frage 10x → sperren)

### 4. Monitoring
- Dashboard: wie oft wird der Chat genutzt, welche Themen kommen häufig
- Logging (anonymisiert!) für 30 Tage zur Qualitätssicherung
- Tägliches Cost-Limit in der Anthropic-Console einrichten

---

## Wie verbessere ich die Antworten?

Der **System-Prompt** steckt in `chatbot.js` ganz oben (ca. Zeile 25–120). Da kannst du:

- Neue Fakten ergänzen (z.B. neue Preise, weitere Angebote)
- Den Tonfall anpassen
- Weitere Tool-Aktionen ergänzen (siehe Array `TOOLS` darunter)
- Beispiele hinzufügen, wenn der Bot Dinge oft falsch macht ("few-shot learning")

Nach Änderung: einfach Browser neu laden (keine Build-Schritte).

---

## Typische Test-Fragen

Für eine gute Demo am Montag:

**Als Ehrenamtliche/r:**
- "Wie werde ich bei euch Mitwirkende/r?"
- "Was verdiene ich eigentlich?"
- "Was passiert, wenn ich kurzfristig nicht kann?"
- "Bin ich versichert?"

**Als Klinik:**
- "Was kostet eine Nachtschicht?"
- "Was dürfen die Sitzwachen eigentlich?"
- "Was passiert, wenn die Sitzwache ausfällt?"
- "Wie läuft die Abrechnung?"

**Allgemein:**
- "Wer ist der Vorstand?"
- "Habt ihr eine Satzung?"
- "Ich möchte spenden."
- "Wohin geht die nächste Reise?"

---

## Bekannte Grenzen

- **Browser-only API-Call** — funktioniert wegen `anthropic-dangerous-direct-browser-access` Header, aber genau deswegen nur für Demo geeignet
- **Mobile:** Chat-Panel ist 400px breit, wird auf schmalen Displays auf die Fensterbreite zurechtgezogen — sollte funktionieren, aber Feinschliff für Mobile steht aus
- **Keine Streaming-Antworten** — Claude antwortet erst komplett, dann erscheint die Nachricht (kein tippender Effekt). Streaming können wir später nachrüsten.
- **Verlauf nur lokal** — wenn User Browser wechselt oder Cache löscht, ist die Konversation weg

---

## Nächste Ausbaustufen (nach WordPress-Migration)

1. **PHP-Proxy statt Direct-Browser-Call** (Pflicht vor Live-Gang)
2. **Streaming** für natürlichere Antworten
3. **Kontextbewusstsein**: wenn User eingeloggt ist, kennt Claude Name und Rolle
4. **Echte Aktionen**: z.B. Claude schlägt "Soll ich dir einen Dienst-Slot für morgen markieren?" → User bestätigt → API ruft eine WordPress-REST-Route auf, die den Eintrag macht (mit doppelter Bestätigung im UI)
5. **Vector-Store für die Satzung/AGB**: ganze Dokumente als Wissens-Basis, nicht nur System-Prompt
6. **Feedback-Button** pro Antwort (👍 / 👎) für Qualitätsverbesserung

---

*Fragen zum Chatbot? info@lebenpflegenreisen.de*
