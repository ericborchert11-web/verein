# WordPress-Migration auf Ionos — Leitfaden für LPR e.V.

**Ausgangslage:** Prototyp läuft als statische HTML-Seiten (GitHub Pages), funktional getestet. Alle Daten im localStorage. Ziel: Produktivumzug auf WordPress bei Ionos unter `lebenpflegenreisen.de`.

**Ansatz:** Nicht alles 1:1 übertragen — der Prototyp beweist, *dass* die Flows funktionieren. In WordPress nutzen wir lieber **bewährte Plugins** als eigenen Custom Code. Ausnahme: die Sitzwachen-Kopplung zwischen Ehrenamtlichen und Kliniken — dafür brauchen wir etwas Eigenes.

---

## 1. Reihenfolge der Migration

```
Woche 1 ──► Ionos Pro Hosting + WordPress-Installation + SSL
Woche 1 ──► Theme-Entscheidung (Astra oder GeneratePress), Brand anpassen
Woche 2 ──► Seiten aus Prototyp nach WordPress übertragen (Content only)
Woche 2 ──► Plugins installieren (DSGVO-Banner, SEO, Forms)
Woche 3 ──► Reise-Anmeldung (Plugin-basiert)
Woche 3 ──► Klinik-Buchungs-Kalender (Custom Plugin oder Amelia)
Woche 4 ──► Mitgliederbereich (passwortlos via Plugin)
Woche 4 ──► Abrechnung (separate Lösung, siehe §6)
Woche 5 ──► SEO-Feinschliff, Testing, Launch
```

**Realistischer Zeitbedarf:** 4–6 Wochen bei ca. 8–12 Std/Woche Eigenleistung oder einmalig 2.500–4.000 € extern.

---

## 2. Hosting-Setup bei Ionos

**Empfohlenes Paket:** Ionos WordPress Hosting **„WP Essential"** (ca. 4 €/Monat) oder **„WP Business"** (ca. 10 €/Monat) — letzteres wenn es mehr Traffic wird. Kein Managed WordPress nötig für den Anfang.

**Muss:**
- PHP 8.2+
- SSL-Zertifikat (Let's Encrypt, bei Ionos kostenfrei)
- Tägliche Backups aktivieren
- Ionos-Mail für `@lebenpflegenreisen.de` separat (5 Postfächer reichen: `hallo@`, `familien@`, `sitzwachen@`, `kliniken@`, `datenschutz@`)

**DNS-Migration:** Die Domain liegt bereits bei Ionos, daher nur A-Record auf die WP-Installation umstellen.

---

## 3. Theme-Empfehlung

**Option A: Astra (kostenlos / Pro 49 €/Jahr)** — meine Empfehlung.
- Extrem performant, GDPR-ready
- Riesige Demo-Bibliothek
- Full-Site-Editing kompatibel
- Lässt sich mit dem LPR-Branding (dunkelgrün/lime) über Theme-Optionen konfigurieren

**Option B: GeneratePress (kostenlos / Premium 59 €/Jahr)** — Alternative falls Astra nicht passt.

**Schriften:** Nicht über Google Fonts laden (DSGVO-Problem), sondern selbst hosten:
- Bricolage Grotesque — npm-Paket `@fontsource/bricolage-grotesque` → nach `/wp-content/fonts/` kopieren
- Instrument Sans — `@fontsource/instrument-sans` → gleiches Vorgehen
- Einbindung über Theme-Custom-CSS oder „Custom Fonts"-Plugin

**Farben ins Theme (Astra → Customize):**
```
Primary:        #2D4A3A
Secondary:      #1E3127
Accent (Lime):  #C8F135
Background:     #E8E4DC
Text:           #1A241E
```

---

## 4. Unverzichtbare Plugins

| Zweck | Plugin | Lizenz | Bemerkung |
|------|--------|--------|-----------|
| **SEO** | Rank Math Free | kostenlos | besser als Yoast Free; Schema.org integriert |
| **DSGVO-Banner** | Complianz | 79 €/Jahr | scannt Cookies, erzeugt Consent-Banner |
| **Formulare** | WPForms Pro | 50 €/Jahr | oder Gravity Forms (höherpreisig, mächtiger) |
| **Cache** | WP Rocket | 59 €/Jahr | optional — bei Ionos oft eigener Cache |
| **Backup** | UpdraftPlus | kostenlos | Backup auf Ionos-FTP oder Ionos HiDrive |
| **Security** | Wordfence Free | kostenlos | Login-Schutz, Malware-Scan |
| **Image-Opt.** | Imagify | kostenlos | WebP-Konversion automatisch |
| **A11y-Widget** | One Click Accessibility | kostenlos | ersetzt die A11y-Bar aus dem Prototyp |

**Geschätzte Plugin-Lizenzkosten:** 130–200 €/Jahr.

---

## 5. Seiten-Mapping Prototyp → WordPress

| Prototyp-Datei | WordPress-Seite | Seitenvorlage | Besonderheit |
|----|----|----|----|
| `index.html` | `/` (Startseite) | Full-Width Landing | 4-Stakeholder-Hub als Block-Gruppe |
| `fuer-familien.html` | `/familien/` | Full-Width | Reise-Cards als Custom-Post-Type „Reise" |
| `kliniken.html` | `/kliniken/` | Full-Width | Buchung via Amelia oder Custom |
| `mein-bereich.html` | `/mein-bereich/` | Members-only | siehe §7 |
| `sitzwachen.html` | Teil von `/mein-bereich/` | Tab im Mitgliederbereich | |
| `schichtplaner.html` | Teil von `/mein-bereich/` | Tab im Mitgliederbereich | |
| `abrechnung.html` | Teil von `/mein-bereich/` | Tab im Mitgliederbereich | |
| `impressum.html` | `/impressum/` | Default | |
| `datenschutz.html` | `/datenschutz/` | Default | |
| `barrierefreiheit.html` | `/barrierefreiheit/` | Default | |

**Praktischer Tipp:** Die Startseite ist das einzige Design-Schwergewicht. Hier lohnt sich entweder der WP-Block-Editor mit Astra Blocks oder der Kauf von Elementor Pro (59 €/Jahr), um die Hero-Sektion + 4-Stakeholder-Grid sauber nachzubauen.

---

## 6. Die funktionalen Module — Plugin- vs. Eigenlösung

### 6.1 Reise-Anmeldung (ehemals `schichtplaner.html`)

**Lösung: WPForms + Custom Post Type „Reise"**

- Custom Post Type `reise` mit Feldern: Titel, Datum-Start, Datum-Ende, Ort, Partner, Max. Plätze, Beschreibung
- Unter jeder Reise ein WPForms-Formular mit Feldern: Name, E-Mail, Tel., Anmerkung
- Formular-Einträge werden per Mail an `familien@lebenpflegenreisen.de` gesendet UND in WP-Tabelle gespeichert
- Warteliste = einfache Reihung nach Eintragungszeit; bei Platz 5+ Banner „Warteliste" anzeigen

**Alternative (mächtiger):** Modern Events Calendar + Event-Anmeldung (ca. 89 €/Jahr).

### 6.2 Sitzwachen-Kalender (Ehrenamtliche + Kliniken)

**Das ist der komplexeste Teil.** Er braucht:
- Ehrenamtliche tragen Verfügbarkeiten ein
- Kliniken sehen freie Slots, buchen
- Beide Seiten bekommen Mails

**Option A — Amelia Booking Plugin (89 €/Jahr, 1-Seiten-Lizenz)**
- Ehrenamtliche = „Employees" (Anbieter:innen)
- Kliniken = Kunden
- Sitzwache = „Service" mit 8h-Dauer
- Shift-Zeiten (Früh/Spät/Nacht) = verschiedene Zeitfenster
- **Grenze:** Amelia ist für 1:n Termine optimiert (ein Friseur, viele Kunden), nicht für n:n. Kompromisse nötig bei mehrfacher Zuordnung.

**Option B — Eigenes Plugin (empfohlen, wenn ein Entwickler:in Zeit hat)**
- WP-Custom-Post-Type `sitzwache_slot` (Datum, Schicht, Ehrenamt-User-ID, Status)
- WP-Custom-Post-Type `klinik` (Nutzerrolle „clinic")
- Shortcode `[lpr_availability]` für Ehrenamtliche → Kalender-UI
- Shortcode `[lpr_booking]` für Kliniken → gleicher Kalender aus anderer Perspektive
- Mailversand bei Buchung via WP Mail + Template
- **Entwicklungsaufwand:** ca. 3–5 Tage extern (1.500–2.500 €)

**Meine Empfehlung:** Für den Anfang **Option A (Amelia)**, parallel eigene Lösung entwickeln lassen wenn das Buchungsvolumen wächst.

### 6.3 Abrechnung

**Wichtiger Hinweis:** Abrechnungen enthalten steuerrelevante Daten mit 10-Jahres-Aufbewahrungspflicht (§ 147 AO). Kein Prototyp-Ansatz, hier muss es wirklich sitzen.

**Option A — WPForms + Spreadsheet**
- WPForms-Formular für Abrechnungs-Einreichung
- Automatische E-Mail mit PDF-Beleg an Ehrenamtliche und Schatzmeister
- Hintergrund-Buchung manuell in Excel/GnuCash

**Option B — WISO MeinVerein (ab 12 €/Monat)**
- Komplette Vereinsverwaltung: Mitglieder, Beiträge, Buchhaltung, Spendenbescheinigungen, Abrechnungen
- Läuft separat vom WordPress, aber über Single Sign-on einbindbar
- **Stark empfohlen**, weil Vorstand dann keine Excel-Basteleien mehr hat
- Alternative: SPG-Verein (ab 10 €/Monat), Easyverein.com (ab 15 €/Monat)

**Empfehlung:** WordPress macht den **Einreichungs**-Teil (Formular), **WISO MeinVerein** macht die eigentliche Buchhaltung. Daten werden monatlich übertragen.

### 6.4 Mitgliederbereich / Login

**Magic-Link passwortlos:**
- Plugin **„Passwordless Login by Cozmoslabs"** (kostenlos) oder **„WP Passwordless Login"**
- Nutzer gibt E-Mail ein → erhält Link → klickt → eingeloggt
- Kein Passwort-Management, kein Risiko schwacher Passwörter

**Zugriffskontrolle:**
- Plugin **„Members" von MemberPress** (kostenlos) für Rollen & Capabilities
- Rollen: `ehrenamt`, `klinik`, `vorstand`, `administrator`
- Seiten per Shortcode oder Einstellung nur für eingeloggte Nutzer:innen sichtbar

---

## 7. SEO-Setup in WordPress

**Nach Installation Rank Math:**

1. **Setup Wizard durchklicken:**
   - Seitentyp: „Non-Profit"
   - Land: Deutschland
   - Schema: Organization → NGO
   - Adresse eintragen

2. **Sitemap einrichten** (wird automatisch unter `/sitemap_index.xml` generiert)

3. **Google Search Console verbinden** (kostenlos, Ionos-Verifizierung per DNS-TXT)

4. **Für jede Seite Focus-Keyword setzen:**
   - Startseite: `Sitzwache Berlin`
   - Familien-Seite: `Reisebegleitung Senioren Berlin`
   - Kliniken-Seite: `ehrenamtliche Sitzwache buchen Berlin`
   - Ehrenamt-Seite: `bezahltes Ehrenamt Berlin Pflege`

5. **Interne Verlinkung** überall wo passend — Google liebt das.

6. **Optional: Content-Aufbau** über 6–12 Monate mit Themen-Clustern:
   - „Sitzwache für Demenz-Patient:innen"
   - „Aktivrente 2026 für Pflegekräfte"
   - „Verhinderungspflege § 39 SGB XI beantragen"
   - „Barrierefrei reisen mit Pflegegrad"
   - Jeder Artikel verlinkt auf relevante Angebots-Seiten → SEO-Juice für die Geldseiten

---

## 8. Daten-Migration aus dem Prototyp

**Kurze Antwort:** Keine Migration nötig. Prototyp-Daten waren Demo-Daten. Echte Nutzer:innen registrieren sich neu in WordPress.

**Einzige Ausnahme:** Falls vor Migration schon echte Anmeldungen/Buchungen im Prototyp stehen: localStorage-Exportfunktion im Prototyp einbauen (JSON-Download), dann in WP manuell importieren. Bei &lt; 50 Einträgen reicht Hand-Import.

---

## 9. Rechtliche Fallstricke beim Umzug

- **Datenschutzerklärung aktualisieren:** sobald Daten serverseitig liegen, verändert sich die Rechtslage. Neuer Abschnitt zu WP-Plugins nötig (welches Plugin speichert was wo).
- **Auftragsverarbeitungsvertrag (AVV) mit Ionos abschließen** — Muster ist im Ionos-Kundenbereich verlinkt, einmalig unterzeichnen.
- **Cookie-Banner:** Complianz-Plugin scannt automatisch und schlägt Kategorien vor. Nicht weglassen — DSGVO-Pflicht bei nicht-essenziellen Cookies.
- **Impressum:** sobald die Anschrift feststeht, Platzhalter ersetzen.
- **Barrierefreiheitserklärung:** nach einer Ende-zu-Ende-Prüfung mit Screenreader aktualisieren.

---

## 10. Go-Live-Checkliste

Vor dem Umschalten auf die Live-URL nochmal alles durchgehen:

**Technik**
- [ ] SSL aktiv, alle URLs auf https umgeleitet
- [ ] `www` auf `non-www` (oder umgekehrt) weiterleiten, konsistent
- [ ] 301-Redirects für alle alten URLs gesetzt
- [ ] XML-Sitemap in Search Console eingereicht
- [ ] Robots.txt erlaubt Indexierung (kein `Disallow: /`)
- [ ] Tägliches Backup aktiv
- [ ] Mobile-Test auf echten Geräten (nicht nur DevTools)

**Rechtlich**
- [ ] Impressum vollständig, keine Platzhalter mehr
- [ ] Datenschutzerklärung aktualisiert für Live-Betrieb
- [ ] Cookie-Banner funktioniert, Kategorien korrekt
- [ ] AVV mit Ionos unterzeichnet
- [ ] Barrierefreiheitserklärung aktualisiert

**Inhaltlich**
- [ ] Alle Seiten haben `title` und `meta description`
- [ ] Focus-Keywords gesetzt
- [ ] Interne Verlinkung zwischen Angebots-Seiten
- [ ] Footer-Links funktionieren alle
- [ ] Kontaktformulare getestet, Mails kommen an
- [ ] Mitgliederbereich-Login funktioniert
- [ ] Buchungs-Flow für Kliniken einmal komplett durchgespielt
- [ ] Abrechnungs-Flow einmal komplett durchgespielt

**SEO**
- [ ] Google Search Console eingerichtet
- [ ] Google Business Profil (vormals „My Business") angelegt für lokale Suche
- [ ] Bing Webmaster Tools (optional, aber kostet nichts)

---

## 11. Was ich NICHT empfehle

- **Elementor Free** — zwar beliebt, aber bläht den Code auf, schlechte Performance. Wenn Page Builder, dann Elementor Pro oder den Gutenberg-Block-Editor mit Astra.
- **Riesiges Theme mit 100+ Demo-Seiten** (Divi, Avada) — führt zu Feature-Bloat. Astra oder GeneratePress sind leichter und schneller.
- **Eigene User-Registrierung erfinden** — Passwordless-Plugin nutzen, das ist bereits DSGVO-durchdacht.
- **Google Analytics** — lieber Matomo (selbst gehostet, DSGVO-konform) oder ganz ohne Tracking. Bei einem gemeinnützigen Verein reicht die Search-Console-Auswertung meist.

---

## 12. Kostenabschätzung Erstjahr

| Posten | Kosten |
|---|---|
| Ionos WP Hosting Essential (12 Monate) | ca. 50 € |
| Domain lebenpflegenreisen.de (12 Monate) | 12 € |
| Astra Pro (optional) | 49 € |
| WPForms Pro | 50 € |
| Complianz (DSGVO) | 79 € |
| Amelia Booking (oder eigenes Plugin) | 89 € |
| WISO MeinVerein (Buchhaltung) | 144 € |
| Externer Entwickler für Custom-Teile | 1.500–3.000 € |
| **Gesamt Erstjahr** | **ca. 2.000–3.500 €** |

Ab Jahr 2: ca. 500–700 €/Jahr laufende Kosten.

---

## 13. Kontakt für Rückfragen

Dieser Guide basiert auf dem Prototyp-Stand vom April 2026. Bei offenen Fragen zur Migration gerne zurück an Eric.

---

*Dokument-Version 1.0 · erstellt für Leben Pflegen Reisen e.V. · April 2026*
