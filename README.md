# LPR Vereinswebsite — Prototyp v2

**Leben Pflegen Reisen e.V. · Berlin · Stand: April 2026**

Kompletter klickbarer Prototyp der Vereinswebsite mit Mitgliederbereich, Klinik-Buchungssystem und allen Rechts-Seiten.

---

## 🚀 Schnellstart

1. Entpacke das Archiv.
2. Öffne **`index.html`** in einem aktuellen Browser (Chrome, Firefox, Safari, Edge).
3. Fertig — alles läuft clientseitig, keine Installation nötig.

Für die **Online-Demo**: Lade den Ordner als-ist zu GitHub Pages, Netlify oder in einen WordPress-Unterordner.

---

## 👥 Demo-Zugänge

Nach dem ersten Öffnen: Klick auf **„⚙ Test-Konten"** oben rechts → **„Demo-Daten laden"**.
Danach stehen diese Konten zur Verfügung (Passwort jeweils **`demo1234`**):

| E-Mail | Rolle | Zweck |
|---|---|---|
| `margarete@demo.de` | Ehrenamt | Reisen eintragen, Sitzwachen anbieten, Abrechnung |
| `hans@demo.de` | Ehrenamt | Zweiter Ehrenamt-Account |
| `fatma@demo.de` | Ehrenamt | Türkisch-sprachig, Demo für Vielfalt |
| `charite@demo.de` | Klinik | Charité-Perspektive, Sitzwache buchen |
| `hedwig@demo.de` | Klinik | St. Hedwig-Perspektive |
| `vorstand@demo.de` | Admin | Vorstands-Zugriff |

---

## 🗺 Seitenübersicht

### Öffentliche Seiten (Marketing)
- `index.html` — Startseite mit 3 Einstiegspfaden (Familien / Ehrenamt / Klinik)
- `reisen.html` — Reise-Übersicht für Familien mit Anfrage-Formular
- `sitzwache-buchen.html` — Landingpage für Kliniken
- `ehrenamt.html` — Onboarding-Seite für neue Helfer:innen
- `spenden.html` — Spenden-Info mit Bankverbindung

### Mitgliederbereich (login-geschützt)
- `login.html` — Zentrale Anmeldung + Registrierung
- `mein-bereich.html` — Hub für Ehrenamtliche (Kacheln zu allen Tools)
- `profil.html` — Profildaten bearbeiten, Passwort ändern
- `schichtplaner.html` — Reise-Eintragung
- `sitzwachen.html` — Verfügbarkeits-Kalender für Sitzwachen
- `abrechnung.html` — Aufwandsentschädigung beantragen
- `kliniken.html` — Buchungs-Dashboard für Kliniken

### Rechtliches & Service
- `impressum.html`
- `datenschutz.html`
- `barrierefreiheit.html`
- `demo.html` — Test-Konten-Übersicht, Demo-Daten laden/zurücksetzen

### Zentrale Libraries
- `app.js` — Auth (E-Mail + Passwort, SHA-256), Session, A11y, Helper
- `layout.js` — Header/Footer/A11y-Bar als wiederverwendbare Komponente
- `shared.css` — Alle Brand-Styles, Formulare, Buttons

---

## 🔐 Authentifizierung

Passwörter werden mit **SHA-256 + Salt** gehasht (browser-nativ via Web Crypto API).
Session liegt in `localStorage` unter `lpr-session-v2`.

**Rollen:**
- `ehrenamt` → Landet im Mitgliederbereich-Hub
- `klinik` → Landet im Klinik-Dashboard
- `admin` → Hat Zugriff auf alles

Die Struktur ist **WordPress-kompatibel** — siehe `WORDPRESS_MIGRATION.md` für den Umzugsplan.

---

## ♿ Barrierefreiheit

Jede Seite bietet oben rechts:
- **Text A / A+ / A++** — drei Schriftgrößen
- **◐ Kontrast** — Schwarz-Weiß-Modus mit dicken Rändern
- **✎ Leichte Sprache** — Simpler Text via `data-ls`-Attribute

Einstellungen bleiben über alle Seiten erhalten (`lpr-text-size`, `lpr-contrast`, `lpr-ls`).

---

## 🎨 Brand

- **Dunkelgrün** `#2D4A3A` (primär)
- **Electric Lime** `#C8F135` (Akzent)
- **Sand** `#E8E4DC` (Hintergrund)
- **Schriften:** Bricolage Grotesque 800 (Headlines), Instrument Sans (Body)

---

## 📦 Datenmodell (localStorage)

| Key | Inhalt |
|---|---|
| `lpr-users-v2` | Alle User (Hash, Salt, Rolle, Profil-Extras) |
| `lpr-session-v2` | Aktive Session |
| `lpr-sitzwachen-avail-v1` | Ehrenamtlichen-Verfügbarkeiten nach Datum |
| `lpr-sitzwachen-book-v1` | Klinik-Buchungen nach Datum + Schicht |
| `lpr-sitzwachen-clinics-v1` | Klinik-Stammdaten |
| `lpr-schichtplan-v1` | Reise-Eintragungen je Reise-ID |
| `lpr-claims-v1` | Abrechnungen/Belege |
| `lpr-family-requests-v1` | Anfragen von Familien über reisen.html |
| `lpr-text-size`, `lpr-contrast`, `lpr-ls` | A11y-Prefs |

Daten leben nur im Browser — **kein Server, kein Backend**. Beim WordPress-Umzug werden alle Keys in Custom Post Types / Usermeta überführt.

---

## 📋 Was noch zu tun ist (vor Livegang)

**Content:**
- [ ] Impressum um reale Vereinsdaten ergänzen (Sobald im Vereinsregister eingetragen)
- [ ] Telefonnummer im Footer und auf Kontakt-Seiten überall ersetzen (`030/000 000 00`)
- [ ] Bankverbindung in `spenden.html` prüfen/ergänzen
- [ ] Steuerbescheid vom Finanzamt → Gemeinnützigkeits-Nachweis für `spenden.html`

**Rechtliches:**
- [ ] Datenschutzerklärung von Juristen prüfen lassen (v.a. Art. 9 DSGVO bei Klinikbuchungen)
- [ ] Impressumspflicht laut § 5 DDG und § 18 MStV abgleichen

**Technik (beim WordPress-Umzug):**
- [ ] Siehe `WORDPRESS_MIGRATION.md`

---

## 🛠 Support

Fragen: Eric Borchert · info@lebenpflegenreisen.de

---

_Erstellt mit Claude (Anthropic) — April 2026_
