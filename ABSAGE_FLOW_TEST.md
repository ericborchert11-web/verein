# Absage-Flow · Test-Anleitung

**Stand:** 21. April 2026 · Tag 2 · Prototyp v3

Dieses Dokument zeigt dir in 5 Minuten, wie du den neuen Absage-Flow live ausprobierst.

---

## Was ist neu im Prototyp?

### In `sitzwachen.html` (Sicht der Ehrenamtlichen)
- Gebuchte Dienste sind jetzt **klickbar** und **farbig nach Zeitzone**:
  - 🟢 Grün = mehr als 48 h bis Dienstbeginn
  - 🟠 Orange = 24–48 h bis Dienstbeginn
  - 🔴 Rot (pulsierend) = weniger als 24 h bis Dienstbeginn
- Klick auf einen gebuchten Chip öffnet einen **gestuften Absage-Dialog**:
  - **Grün:** ein Klick reicht, kein Grund erforderlich
  - **Orange:** Pflicht-Grund auswählen (Krankheit / Familie / Unfall / Beruf / Andere)
  - **Rot:** nur ernste Gründe auswählbar (Krankheit / Familie / Unfall) + Doppel-Check-Bestätigung + Notfall-Kasten mit Stations-Telefonnummer

### In `kliniken.html` (Sicht der Klinik)
- Wenn ein Ehrenamtlicher absagt, sieht die betroffene Klinik **sofort einen Banner** oben im Dashboard:
  - 🚨 Rot = Notfall-Absage unter 24 h
  - ⚠️ Orange = kurzfristige Absage
  - ℹ️ Grün = frühzeitige Absage
- Jeder Banner hat zwei Aktionen: „Zur Kenntnis genommen" oder „Neuen Ehrenamtlichen buchen"
- Darunter erscheint eine kompakte Historie der letzten 5 bereits bestätigten Absagen

### In `demo.html` (Test-Seite)
- Neuer Button: **„3 Test-Buchungen anlegen"** — legt automatisch drei Dienste in allen drei Zeitzonen an, damit du den Flow sofort durchspielen kannst

---

## 5-Minuten-Test: Alle drei Zonen durchklicken

**Schritt 1 · Demo aufsetzen (30 Sekunden)**

1. `start.html` oder `demo.html` öffnen
2. Falls noch nicht geschehen: „Demo-Daten jetzt laden" klicken
3. Dann: **„3 Test-Buchungen anlegen"** klicken → bestätigen

**Schritt 2 · Als Ehrenamtliche:r absagen (2 Minuten)**

1. Ausloggen (falls eingeloggt)
2. Einloggen als **`margarete@demo.de`** (Passwort: `demo1234`)
3. Im Mitgliederbereich auf **„Sitzwachen"** klicken
4. Du siehst im Kalender drei gebuchte Dienste in unterschiedlichen Farben:
   - grün = in 3 Tagen
   - orange = morgen
   - rot (pulsierend) = heute bzw. morgen früh
5. Klick auf den **grünen Chip** → Dialog „Dienst austragen?" → einfach bestätigen → Toast
6. Klick auf den **orangen Chip** → Dialog mit Grund-Auswahl → wähle „Krankheit" → Button wird aktiv → absagen
7. Klick auf den **roten Chip** → Notfall-Dialog mit Telefonnummer → wähle „Krankheit" → Doppel-Check ankreuzen → Button wird aktiv → absagen

**Schritt 3 · Als Klinik die Absagen sehen (1 Minute)**

1. Ausloggen
2. Einloggen als **`charite@demo.de`** (Passwort: `demo1234`)
3. Im Mitgliederbereich auf **„Sitzwachen-Buchungen"** klicken
4. Oben erscheinen drei Banner — sortiert nach Dringlichkeit (rot oben, grün unten)
5. Banner durchlesen, „Zur Kenntnis genommen" klicken → wandern in die Historie

**Schritt 4 · Zurücksetzen für nächste Demo (30 Sekunden)**

Zurück zu `demo.html` → „3 Test-Buchungen anlegen" räumt das alte Absage-Log auf und legt drei neue Buchungen an.

---

## Was passiert technisch dahinter

### Datenfluss

```
┌──────────────────┐         ┌──────────────────┐
│  Ehrenamtliche   │         │     Klinik       │
│  sitzwachen.html │         │  kliniken.html   │
└────────┬─────────┘         └────────▲─────────┘
         │                            │
         │ 1. Klick auf gebuchten     │ 4. Banner lädt
         │    Chip → calcZone()       │    renderCancelBanners()
         │                            │    aus CANCEL_KEY
         │ 2. Absage-Dialog je nach   │
         │    Zone                    │
         │                            │
         │ 3. confirmCancel():        │
         │    • BOOK_KEY: Buchung löschen
         │    • CANCEL_KEY: Log-Eintrag anhängen
         │    • Toast
         │
         ▼
  ┌─────────────────┐
  │  localStorage   │
  │  BOOK_KEY       │  ◄─── beide Seiten lesen
  │  CANCEL_KEY     │       und schreiben hier
  └─────────────────┘
```

### Der CANCEL_KEY-Log-Eintrag

Jede Absage hinterlässt einen strukturierten Eintrag:

```json
{
  "id": 1713692400000,
  "timestamp": "2026-04-21T08:00:00.000Z",
  "date_key": "2026-04-22",
  "shift": "frueh",
  "zone": "orange",
  "reason": "krankheit",
  "ehrenamt_email": "margarete@demo.de",
  "ehrenamt_name": "Margarete Schmidt",
  "clinic_email": "charite@demo.de",
  "clinic_name": "Charité Berlin",
  "clinic_ward": "Station 3B · Neurologie",
  "patient_ref": "Patient H.M. (3B-07)",
  "seen_by_clinic": false
}
```

Das macht später in WordPress einfache Queries möglich: „Alle Absagen der letzten 30 Tage für Klinik X" oder „Absage-Verteilung über alle drei Zonen zur Qualitätssicherung".

---

## Was rechtlich zusammenpasst

Der Flow hält genau das ein, was in den drei Rechts-Dokumenten von gestern steht:

- **Mitwirkungsvereinbarung § 3** („Bindungswirkung nach Buchung") → drei Absage-Fristen sind im UI abgebildet
- **Mitwirkungsvereinbarung § 3 Abs. 5** („Verein verzichtet auf Schadensersatzansprüche") → es gibt keine Bestrafung im Code, keinen Punkteabzug, keine Sperre
- **AGB Kliniken § 4** („Keine Anwesenheitsgarantie") → der Banner bei der Klinik sagt explizit „Der Verein sucht Ersatz, kann diesen aber nicht garantieren"
- **AGB Kliniken § 5** („Eskalationsmatrix") → bei Zone Rot wird der Klinik ein Notfall-Banner mit Telefonaufforderung gezeigt
- **Absage-Flow-Konzept § 5** („Guardrails") → keine öffentliche Absage-Quote, kein Ranking, kein Attest-Zwang, keine automatische Sperre

---

## Was in dieser Demo noch simuliert ist

Diese Dinge passieren im lokalen Prototyp noch **nicht wirklich**, sind aber im Datenmodell vorbereitet und werden in der WordPress-Umsetzung live:

- Automatische E-Mail an die Klinik bei Absage (hier: nur Banner beim nächsten Login)
- SMS-Versand bei Zone Orange und Rot (hier: nur im Dialog-Text erwähnt)
- Voice-Anruf bei Zone Rot (hier: Telefonnummer wird nur angezeigt zum Selbst-Anrufen)
- Automatische Ersatz-Suche unter anderen Ehrenamtlichen (hier: der Slot wird still wieder freigegeben)
- Push-Benachrichtigungen an freie Ehrenamtliche

Wenn du die drei Zeilen-Kommentare im Code nach `// Simuliert:` suchst, findest du die Andock-Punkte für die spätere WordPress-Integration.

---

## Nächste Schritte

1. Du spielst den Flow für dich durch und sagst Bescheid, was du am Wording ändern willst (die Dialog-Texte sind leicht anpassbar)
2. WordPress-Migrationsplan als nächstes Dokument — das ist der nächste Arbeitsblock
3. Montag zeigst du beim Vorstand: Sitzwachen-Kalender mit den drei farbcodierten Chips, Absage-Dialog in Zone Rot mit Telefonnummer, Banner in der Klinik-Sicht

Gute Demo. 🎯
