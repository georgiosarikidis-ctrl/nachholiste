# nachholiste 📋

> Dein zentraler Ort für alles, was noch offen ist — Aufgaben, Nachholbedarf, Lernthemen, private und berufliche To-dos.

---

## Tech-Stack

| Schicht        | Technologie                |
| -------------- | -------------------------- |
| Frontend       | Next.js 14 (App Router)    |
| Styling        | Tailwind CSS               |
| Datenbank      | Supabase (PostgreSQL)      |
| Auth           | Supabase Auth              |
| Realtime-Sync  | Supabase Realtime          |
| Hosting        | Vercel (empfohlen)         |
| Typen          | TypeScript                 |

---

## Schritt-für-Schritt: Lokale Installation

### 1. Node.js installieren (falls noch nicht vorhanden)

```bash
# Empfohlen: Node.js 20+ via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
```

### 2. Projekt klonen / entpacken

```bash
# Falls du das Projekt als ZIP hast:
unzip nachholiste.zip
cd nachholiste

# Oder via Git (falls du ein Repo erstellt hast):
git clone https://github.com/DEIN-USERNAME/nachholiste.git
cd nachholiste
```

### 3. Dependencies installieren

```bash
npm install
```

### 4. Supabase-Projekt erstellen

1. Gehe zu [app.supabase.com](https://app.supabase.com) und erstelle einen kostenlosen Account
2. Klicke auf **"New Project"**
3. Gib einen Projektnamen ein (z.B. `nachholiste`) und wähle eine Region nahe Deutschland (z.B. Frankfurt)
4. Merke dir das Passwort

### 5. Datenbankschema einrichten

1. Im Supabase Dashboard: **SQL Editor** → **New Query**
2. Kopiere den gesamten Inhalt von `supabase/schema.sql`
3. Füge ihn in den Editor ein und klicke **Run**
4. Du siehst: `Success. No rows returned` → alles korrekt

### 6. Supabase Auth konfigurieren

Im Supabase Dashboard → **Authentication** → **URL Configuration**:

```
Site URL:          http://localhost:3000
Redirect URLs:     http://localhost:3000/auth/callback
                   https://DEINE-DOMAIN.vercel.app/auth/callback  (später hinzufügen)
```

### 7. Umgebungsvariablen einrichten

```bash
cp .env.local.example .env.local
```

Dann `.env.local` öffnen und die Werte aus Supabase eintragen:
- **NEXT_PUBLIC_SUPABASE_URL** → Supabase Dashboard → Settings → API → Project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** → Supabase Dashboard → Settings → API → `anon` `public`

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmno.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 8. Entwicklungsserver starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

Registriere dich mit deiner E-Mail-Adresse — fertig!

---

## Deployment auf Vercel (Production)

### 1. GitHub Repository erstellen

```bash
git init
git add .
git commit -m "Initial commit — nachholiste"
git remote add origin https://github.com/DEIN-USERNAME/nachholiste.git
git push -u origin main
```

### 2. Vercel verbinden

1. Gehe zu [vercel.com](https://vercel.com) → **New Project**
2. Wähle dein GitHub Repository aus
3. Framework: **Next.js** (wird automatisch erkannt)
4. **Environment Variables** hinzufügen:
   - `NEXT_PUBLIC_SUPABASE_URL` = dein Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = dein Anon Key
   - `NEXT_PUBLIC_APP_URL` = `https://DEIN-PROJEKTNAME.vercel.app`
5. **Deploy** klicken

### 3. Supabase Auth URLs aktualisieren

Im Supabase Dashboard → Authentication → URL Configuration:
```
Redirect URLs: https://DEIN-PROJEKTNAME.vercel.app/auth/callback
```

---

## Als PWA auf dem Handy installieren

### iPhone / iPad (Safari)
1. Öffne die App in Safari
2. Tippe auf das Teilen-Symbol (Quadrat mit Pfeil)
3. Wähle **"Zum Home-Bildschirm"**

### Android (Chrome)
1. Öffne die App in Chrome
2. Tippe auf das Dreipunkt-Menü
3. Wähle **"App installieren"** oder **"Zum Startbildschirm hinzufügen"**

---

## Erinnerungen / Push-Benachrichtigungen aktivieren

Die App speichert `reminder_date` für jede Aufgabe. Für echte Browser-Push-Benachrichtigungen:

### Option A: Browser Notification API (einfachste Lösung)

Füge in `src/app/dashboard/page.tsx` hinzu:

```typescript
// Nach dem Login: Benachrichtigungs-Erlaubnis anfragen
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}, [])

// Erinnerungen prüfen (alle 60 Sekunden)
useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date()
    tasks.forEach((task) => {
      if (!task.reminder_date || task.status === 'erledigt') return
      const reminderTime = new Date(task.reminder_date)
      const diff = Math.abs(reminderTime.getTime() - now.getTime())
      if (diff < 60000 && Notification.permission === 'granted') {
        new Notification('nachholiste', {
          body: `Erinnerung: ${task.title}`,
          icon: '/icon-192.png',
        })
      }
    })
  }, 60000)
  return () => clearInterval(interval)
}, [tasks])
```

### Option B: Supabase Edge Functions + Cron (robusteste Lösung)

Erstelle in `supabase/functions/send-reminders/index.ts`:

```typescript
// Supabase Edge Function — wird per Cron täglich ausgeführt
// Sendet E-Mails für fällige Erinnerungen
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, auth.users!user_id(email)')
    .lte('reminder_date', new Date().toISOString())
    .gt('reminder_date', new Date(Date.now() - 3600000).toISOString())
    .neq('status', 'erledigt')
  
  // Hier E-Mail-Versand über Resend, SendGrid oder Supabase Auth Emails
  
  return new Response(JSON.stringify({ reminders_sent: tasks?.length ?? 0 }))
})
```

Deploy: `supabase functions deploy send-reminders`
Cron einrichten: Supabase Dashboard → Edge Functions → Schedules

---

## Projektstruktur

```
nachholiste/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Login-Seite
│   │   ├── layout.tsx          # Root Layout
│   │   ├── globals.css         # Globales Styling + CSS Variables
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Haupt-App (nach Login)
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts    # Auth-Callback (Magic Link / OAuth)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx     # Navigation
│   │   │   └── Header.tsx      # Topbar mit Suche
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx    # Einzelne Aufgaben-Karte
│   │   │   ├── TaskForm.tsx    # Erstellen/Bearbeiten Modal
│   │   │   ├── TaskList.tsx    # Liste mit Filter-Toolbar
│   │   │   ├── Dashboard.tsx   # Dashboard-Ansicht
│   │   │   └── DeleteConfirm.tsx
│   │   └── ui/
│   │       ├── index.tsx       # Atomare UI-Komponenten
│   │       └── Toast.tsx       # Benachrichtigungen
│   ├── hooks/
│   │   ├── useTasks.ts         # Tasks laden, speichern, Realtime
│   │   ├── useFilters.ts       # Filter/Sort-State
│   │   └── useToast.ts         # Toast-System
│   ├── lib/
│   │   ├── constants.ts        # Kategorien, Prioritäten, Status
│   │   ├── utils.ts            # Hilfsfunktionen, Datums-Logik
│   │   ├── tasks.ts            # Supabase CRUD-Service
│   │   └── supabase/
│   │       ├── client.ts       # Browser-Client
│   │       └── server.ts       # Server-Client (RSC/API)
│   ├── types/
│   │   └── index.ts            # TypeScript-Typen
│   └── middleware.ts           # Auth-Schutz der Routen
├── supabase/
│   └── schema.sql              # Datenbankschema + RLS
├── public/
│   └── manifest.json           # PWA-Manifest
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Zukünftige Erweiterungen

| Feature | Aufwand | Beschreibung |
|---------|---------|--------------|
| Kanban-Ansicht | Mittel | Drag & Drop zwischen Status-Spalten |
| Kalender-Ansicht | Mittel | Aufgaben im Monatskalender |
| Wiederkehrende Aufgaben (Auto-Erstell) | Mittel | Cron-Job erstellt neue Instanz nach Erledigung |
| Tagesfokus | Klein | Modal: „Deine 3 wichtigsten Aufgaben heute" |
| Tags-Filterseite | Klein | Alle Aufgaben nach Tags gruppiert |
| Dateien/Anhänge | Groß | Supabase Storage für Dokumente |
| Geteilte Listen | Groß | Aufgaben mit anderen teilen / kollaborieren |
| KI-Priorisierung | Groß | Claude API schlägt Reihenfolge vor |
| Export (PDF/CSV) | Klein | Aufgaben als Datei exportieren |
| Dunkler Modus System-Sync | Klein | Automatisch nach OS-Einstellung |
| E-Mail-Erinnerungen | Mittel | Supabase Edge Function + Resend |

---

## Kosten

| Dienst | Free Tier | Reicht für |
|--------|-----------|-----------|
| Supabase | 500MB DB, 2 Projekte, 50K monatl. aktive User | Problemlos für persönliche Nutzung |
| Vercel | Unlimited Deployments, 100GB Bandwidth | Perfekt für Einzelperson |

**Fazit: Die App läuft komplett kostenlos für persönliche Nutzung.**

---

## Troubleshooting

**„Invalid Supabase URL"** → `.env.local` prüfen, kein Trailing-Slash am Ende der URL

**„Auth session missing"** → In Supabase Dashboard prüfen, ob die Redirect-URL korrekt gesetzt ist

**Aufgaben erscheinen nicht nach Neustart** → Stelle sicher, dass `.env.local` korrekt ausgefüllt ist (nicht `.env.local.example`)

**Build-Fehler** → `npm install` nochmal ausführen, dann `npm run build`
