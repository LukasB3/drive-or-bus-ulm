const ADDRESS = 'Lukas Bossert<br>Marienstraße 10<br>89231 Neu-Ulm'
const EMAIL = 'bossert.dev@gmail.com'

const SECTIONS = [
  {
    h: 'Über dieses Projekt',
    p: 'Diese Seite ist ein privates, nicht kommerzielles Projekt. Sie ist kein offizielles Angebot der Stadt Ulm, der SWU Stadtwerke Ulm/Neu-Ulm oder der Betreiber der Parkhäuser.',
  },
  {
    h: 'Datenquellen',
    p: 'Fahrzeugpositionen und Linienverläufe: offene Daten der SWU Stadtwerke Ulm/Neu-Ulm (api.swu.de, gtfs.swu.de). Parkhausbelegung: parken-in-ulm.de. Karte: © Stadia Maps, © OpenMapTiles, © OpenStreetMap-Mitwirkende.',
  },
  {
    h: 'Keine Gewähr',
    p: 'Alle angezeigten Daten stammen von den genannten Quellen und werden automatisiert übernommen. Für ihre Richtigkeit, Vollständigkeit und Aktualität übernehme ich keine Gewähr. Verbindlich sind allein die Auskünfte der jeweiligen Betreiber.',
  },
]

const PRIVACY_SECTIONS = [
  {
    h: 'Hosting',
    p: 'Die Seite wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA gehostet. Beim Aufruf verarbeitet Vercel die von Ihrem Browser übermittelten Daten (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser und Betriebssystem, verweisende Seite) in Server-Logs, um die Seite auszuliefern und abzusichern. Rechtsgrundlage ist mein berechtigtes Interesse am sicheren Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO).',
  },
  {
    h: 'Live-Daten',
    p: 'Die Parkhausdaten und Linienverläufe lädt Ihr Browser direkt aus einer Datenbank bei Supabase (Supabase, Inc.; Serverstandort Frankfurt am Main). Die Fahrzeugpositionen kommen über eine WebSocket-Verbindung von meinem Server bei der Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen. Dabei wird technisch bedingt Ihre IP-Adresse an diese Anbieter übermittelt. Ich selbst werte keine Zugriffe aus und führe keine Nutzerprofile. Rechtsgrundlage ist mein berechtigtes Interesse an der Bereitstellung der Live-Karte (Art. 6 Abs. 1 lit. f DSGVO).',
  },
  {
    h: 'Karte',
    p: 'Die Kartenkacheln werden von Stadia Maps, Inc. (USA) geladen. Dazu überträgt Ihr Browser Ihre IP-Adresse, den angezeigten Kartenausschnitt und die Adresse dieser Seite an Stadia Maps. Ohne diese Übertragung kann die Karte nicht dargestellt werden. Rechtsgrundlage ist mein berechtigtes Interesse an einer Kartendarstellung (Art. 6 Abs. 1 lit. f DSGVO). Näheres steht in der Datenschutzerklärung von Stadia Maps unter stadiamaps.com/privacy-policy.',
  },
  {
    h: 'Cookies und Tracking',
    p: 'Diese Seite setzt keine Cookies, nutzt keine Analysewerkzeuge und erstellt keine Nutzerprofile. Es gibt keine Anmeldung und keine Formulare.',
  },
  {
    h: 'E-Mail',
    p: 'Wenn Sie mir eine E-Mail schreiben, verarbeite ich Ihre Adresse und Ihre Nachricht, um zu antworten (Art. 6 Abs. 1 lit. b und f DSGVO), und lösche sie, sobald sie nicht mehr benötigt werden.',
  },
  {
    h: 'Ihre Rechte',
    p: 'Sie haben nach Art. 15 bis 21 DSGVO das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht auf Beschwerde bei einer Aufsichtsbehörde, zum Beispiel dem Bayerischen Landesamt für Datenschutzaufsicht. Zur Ausübung Ihrer Rechte schreiben Sie mir an die oben genannte Adresse.',
  },
]

let dialog: HTMLDialogElement | undefined

export function openImpressum() {
  if (!dialog) {
    dialog = document.createElement('dialog')
    dialog.className = 'impressum'
    dialog.innerHTML = `
      <button class="impressum-close" aria-label="Schließen">✕</button>
      <h1>Impressum</h1>
      <p>Angaben gemäß § 5 DDG.</p>
      <p>${ADDRESS}</p>
      <h2>Kontakt</h2>
      <p><a href="mailto:${EMAIL}">${EMAIL}</a></p>
      ${SECTIONS.map(s => `<h2>${s.h}</h2><p>${s.p}</p>`).join('')}
      <h1 class="impressum-privacy">Datenschutzerklärung</h1>
      <p>Diese Seite erhebt so wenige Daten wie möglich. Was verarbeitet wird und warum, steht hier. Verantwortlich ist die im Impressum oben genannte Person.</p>
      ${PRIVACY_SECTIONS.map(s => `<h2>${s.h}</h2><p>${s.p}</p>`).join('')}
    `
    dialog.querySelector('.impressum-close')!.addEventListener('click', () => dialog!.close())
    // A click on the backdrop targets the dialog element itself
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog!.close() })
    document.body.appendChild(dialog)
  }
  dialog.showModal()
}
