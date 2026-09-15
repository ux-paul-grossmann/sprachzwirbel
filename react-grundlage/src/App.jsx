import { useState } from 'react'
import daten from './refigure-data.json'
import './App.css'

function textOhneMarkierung(text) {
  return text ? text.replace(/<[^>]*>/g, ' ') : ''
}

function App() {
  const [suchbegriff, setSuchbegriff] = useState('')
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
    <main className="zwirbel">
      <h1>Sprachzwirbel</h1>
      <p>Grundlage mit React ohne Gestaltungsbibliothek</p>
      <label className="suchfeld">
        Suche
        <input
          type="search"
          value={suchbegriff}
          onChange={(ereignis) => setSuchbegriff(ereignis.target.value)}
          placeholder="zum Beispiel Vergleich"
        />
      </label>
      <p>
        {gefiltert.length} von {daten.length} Treffern
      </p>
      {gefiltert.length === 0 ? (
        <p>Keine Treffer für diese Suche.</p>
      ) : (
        <section className="kartenraster">
          {gefiltert.map((eintrag) => (
            <article className="karte" key={eintrag.stilmittel}>
              <h2>{eintrag.stilmittel}</h2>
              <p>{eintrag.beschreibung}</p>
              <div dangerouslySetInnerHTML={{ __html: eintrag.beispiel }} />
              <div dangerouslySetInnerHTML={{ __html: eintrag.effekt }} />
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default App
