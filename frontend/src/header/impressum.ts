const ADDRESS = 'Lukas Bossert<br>Marienstraße 10<br>89231 Neu-Ulm'
const EMAIL = 'bossert.dev@gmail.com'

const SECTIONS = [
  {
    h: 'Haftung für Inhalte',
    p: 'Als Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG bin ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werde ich diese Inhalte umgehend entfernen.',
  },
  {
    h: 'Haftung für Links',
    p: 'Diese Seite enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Links umgehend entfernen.',
  },
  {
    h: 'Urheberrecht',
    p: 'Die durch mich erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen meiner schriftlichen Zustimmung. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht von mir erstellt wurden, werden die Urheberrechte Dritter beachtet und solche Inhalte als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitte ich um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Inhalte umgehend entfernen.',
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
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>${ADDRESS}</p>
      ${SECTIONS.map(s => `<h2>${s.h}</h2><p>${s.p}</p>`).join('')}
    `
    dialog.querySelector('.impressum-close')!.addEventListener('click', () => dialog!.close())
    // A click on the backdrop targets the dialog element itself
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog!.close() })
    document.body.appendChild(dialog)
  }
  dialog.showModal()
}
