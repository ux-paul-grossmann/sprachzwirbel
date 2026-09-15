import { useEffect, useState } from 'react'
import daten from './refigure-data.json'

function textOhneMarkierung(text) {
  return text ? text.replace(/<[^>]*>/g, ' ') : ''
}

function liesGespeichertesThema() {
  try {
    const wert = window.localStorage.getItem('sprachzwirbel-thema')
    if (wert === 'hell' || wert === 'dunkel' || wert === 'system') {
      return wert
    }
  } catch {
    // ohne Speicher weiter mit System
  }
  return 'system'
}

function liesGespeicherteDarstellung() {
  try {
    const wert = window.localStorage.getItem('sprachzwirbel-karten')
    if (wert === 'kompakt' || wert === 'voll') {
      return wert
    }
  } catch {
    // ohne Speicher weiter mit voller Darstellung
  }
  return 'voll'
}

function App() {
  const [thema, setThema] = useState(liesGespeichertesThema)
  const [darstellung, setDarstellung] = useState(liesGespeicherteDarstellung)
  const [suchbegriff, setSuchbegriff] = useState('')

  useEffect(() => {
    const wendetThemaAn = () => {
      const systemWillDunkel = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches
      const sollDunkel =
        thema === 'dunkel' || (thema === 'system' && systemWillDunkel)
      document.documentElement.classList.toggle('dark', sollDunkel)
      document.documentElement.style.colorScheme = sollDunkel
        ? 'dark'
        : 'light'
    }
    wendetThemaAn()
    try {
      window.localStorage.setItem('sprachzwirbel-thema', thema)
    } catch {
      // ohne Speicher weiter
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const beiSystemwechsel = () => {
      if (thema === 'system') {
        wendetThemaAn()
      }
    }
    media.addEventListener('change', beiSystemwechsel)
    return () => media.removeEventListener('change', beiSystemwechsel)
  }, [thema])

  useEffect(() => {
    try {
      window.localStorage.setItem('sprachzwirbel-karten', darstellung)
    } catch {
      // ohne Speicher weiter
    }
  }, [darstellung])
  const normiert = suchbegriff.trim().toLowerCase()
  const woerter = normiert === '' ? [] : normiert.split(/\s+/)
  const gefiltert =
    normiert === ''
      ? daten
      : daten
          .filter((eintrag) => {
            const heu = [
              eintrag.stilmittel,
              eintrag.beschreibung,
              textOhneMarkierung(eintrag.beispiel),
              textOhneMarkierung(eintrag.effekt),
            ]
              .join(' ')
              .toLowerCase()
            return woerter.every((wort) => heu.includes(wort))
          })
          .map((eintrag, index) => {
            const titel = eintrag.stilmittel.toLowerCase()
            let titelPunkte = 0
            if (titel.includes(normiert)) {
              titelPunkte = 10
            } else {
              const trefferImTitel = woerter.filter((wort) =>
                titel.includes(wort),
              ).length
              if (trefferImTitel === woerter.length) {
                titelPunkte = 5
              } else if (trefferImTitel > 0) {
                titelPunkte = 2
              }
            }
            return { eintrag, index, titelPunkte }
          })
          .sort((a, b) => {
            if (b.titelPunkte !== a.titelPunkte) {
              return b.titelPunkte - a.titelPunkte
            }
            return a.index - b.index
          })
          .map((bewertet) => bewertet.eintrag)

  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-white p-6 text-left text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Sprachzwirbel</h1>
          <p className="mt-1">Darstellung mit Tailwind bei gleicher Funktion</p>
        </div>
        <div className="flex flex-wrap gap-2">
        <div role="group" aria-label="Farbschema" className="flex gap-1 rounded border p-1">
          {[
            { wert: 'hell', text: 'Hell' },
            { wert: 'system', text: 'System' },
            { wert: 'dunkel', text: 'Dunkel' },
          ].map((option) => (
            <button
              key={option.wert}
              type="button"
              aria-pressed={thema === option.wert}
              onClick={() => setThema(option.wert)}
              className={
                thema === option.wert
                  ? 'rounded bg-neutral-900 px-3 py-1 text-white dark:bg-white dark:text-neutral-900'
                  : 'rounded px-3 py-1'
              }
            >
              {option.text}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Kartendarstellung" className="flex gap-1 rounded border p-1">
          {[
            { wert: 'kompakt', text: 'Kompakt' },
            { wert: 'voll', text: 'Voll' },
          ].map((option) => (
            <button
              key={option.wert}
              type="button"
              aria-pressed={darstellung === option.wert}
              onClick={() => setDarstellung(option.wert)}
              className={
                darstellung === option.wert
                  ? 'rounded bg-neutral-900 px-3 py-1 text-white dark:bg-white dark:text-neutral-900'
                  : 'rounded px-3 py-1'
              }
            >
              {option.text}
            </button>
          ))}
        </div>
        </div>
      </div>
      <label className="mb-4 mt-6 flex items-center gap-3">
        Suche
        <input
          type="search"
          value={suchbegriff}
          onChange={(ereignis) => setSuchbegriff(ereignis.target.value)}
          placeholder="zum Beispiel Vergleich"
          className="w-full max-w-md rounded border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>
      <p className="mb-6 mt-2">
        {gefiltert.length} von {daten.length} Treffern
      </p>
      {gefiltert.length === 0 ? (
        <p>Keine Treffer für diese Suche.</p>
      ) : (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gefiltert.map((eintrag) => (
            <article
              className={
                darstellung === 'voll'
                  ? 'flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900'
                  : 'flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900'
              }
              key={eintrag.stilmittel}
            >
              <h2 className="text-xl font-semibold tracking-tight">
                {eintrag.stilmittel}
              </h2>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Beschreibung
                </h3>
                <p className="mt-1 text-sm leading-relaxed">
                  {eintrag.beschreibung}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Beispiel
                </h3>
                <div
                  className={
                    darstellung === 'voll'
                      ? 'mt-1 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm leading-relaxed dark:border-neutral-800 dark:bg-neutral-950 [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5'
                      : 'mt-1 border-t border-neutral-200 pt-2 text-sm leading-relaxed dark:border-neutral-800 [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5'
                  }
                  dangerouslySetInnerHTML={{ __html: eintrag.beispiel }}
                />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Wirkung
                </h3>
                <div
                  className={
                    darstellung === 'voll'
                      ? 'mt-1 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm leading-relaxed dark:border-neutral-800 dark:bg-neutral-950'
                      : 'mt-1 border-t border-neutral-200 pt-2 text-sm leading-relaxed dark:border-neutral-800'
                  }
                  dangerouslySetInnerHTML={{ __html: eintrag.effekt }}
                />
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default App
