import { useEffect, useRef, useState } from 'react'
import daten from './refigure-data.json'

function textOhneMarkierung(text) {
  return text ? text.replace(/<[^>]*>/g, ' ') : ''
}

function wirkungMitPunkten(effekt) {
  if (!effekt) {
    return ''
  }
  const trenner =
    '<span style="opacity:.45;padding:0 .4em;font-size:.85em;">•</span>'
  const ersetzt = effekt.replace(
    /(<span class="wirkung-inhalt">)([\s\S]*?)(<\/span>)/,
    (treffer, anfang, text, ende) => {
      const worte = text
        .split(',')
        .map((teil) => teil.trim())
        .filter((teil) => teil.length > 0)
      return anfang + worte.join(trenner) + ende
    },
  )
  if (ersetzt === effekt) {
    const worte = textOhneMarkierung(effekt)
      .replace(/\s+/g, ' ')
      .trim()
      .split(',')
      .map((teil) => teil.trim())
      .filter((teil) => teil.length > 0)
    return worte.join(trenner)
  }
  return ersetzt
}

function liesGespeichertenFarbmodus() {
  try {
    const wert = window.localStorage.getItem('sprachzwirbel-farbschema')
    if (wert === 'hell' || wert === 'system' || wert === 'dunkel') {
      return wert
    }
  } catch {
    // ohne Speicher weiter mit System
  }
  return 'system'
}

const farbmodusStufen = [
  { wert: 'hell', text: 'Hell' },
  { wert: 'system', text: 'System' },
  { wert: 'dunkel', text: 'Dunkel' },
]

function App() {
  const [farbmodus, setFarbmodus] = useState(liesGespeichertenFarbmodus)
  const [suchbegriff, setSuchbegriff] = useState('')
  const [menueOffen, setMenueOffen] = useState(false)
  const [systemWillDunkel, setSystemWillDunkel] = useState(false)
  const [zeigeHoch, setZeigeHoch] = useState(false)
  const leisteRef = useRef(null)
  const behalterRef = useRef(null)

  useEffect(() => {
    document.body.classList.add('thetop')
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const aktualisiere = () => setSystemWillDunkel(media.matches)
    aktualisiere()
    media.addEventListener('change', aktualisiere)
    return () => media.removeEventListener('change', aktualisiere)
  }, [])

  useEffect(() => {
    const klasse =
      farbmodus === 'hell'
        ? 'tau'
        : farbmodus === 'dunkel'
          ? 'starfall'
          : systemWillDunkel
            ? 'starfall'
            : 'tau'
    document.body.classList.remove('dark', 'starfall', 'tau')
    document.body.classList.add(klasse)
    try {
      window.localStorage.setItem('sprachzwirbel-farbschema', farbmodus)
      window.localStorage.removeItem('theme')
    } catch {
      // ohne Speicher weiter
    }
  }, [farbmodus, systemWillDunkel])

  useEffect(() => {
    const beiBildlauf = () => {
      const position =
        window.scrollY || document.documentElement.scrollTop || 0
      const element = document.documentElement
      const anteil =
        (element.scrollTop / (element.scrollHeight - element.clientHeight)) *
        100
      document
        .querySelector('.progress')
        ?.style.setProperty('--scroll', anteil + '%')
      setZeigeHoch(position > 50)
    }
    document.addEventListener('scroll', beiBildlauf, { passive: true })
    beiBildlauf()
    return () => document.removeEventListener('scroll', beiBildlauf)
  }, [])

  useEffect(() => {
    const angleichen = () => {
      const leiste = leisteRef.current
      const behalter = behalterRef.current
      if (!leiste || !behalter) {
        return
      }
      const karten = [...behalter.querySelectorAll('.row > div .card')]
      let luecke = 30
      for (let i = 0; i + 1 < karten.length; i++) {
        const erste = karten[i]
        const zweite =
          erste.parentElement?.nextElementSibling?.querySelector('.card')
        if (!zweite) {
          continue
        }
        if (
          getComputedStyle(erste).transform !== 'none' ||
          getComputedStyle(zweite).transform !== 'none'
        ) {
          continue
        }
        const ra = erste.getBoundingClientRect()
        const rb = zweite.getBoundingClientRect()
        if (Math.abs(ra.top - rb.top) < 2 && rb.left > ra.right) {
          luecke = Math.round(rb.left - ra.right)
          break
        }
      }
      behalter.style.setProperty(
        'margin-top',
        `${leiste.offsetHeight + 12 + luecke - 24}px`,
        'important',
      )
    }
    angleichen()
    window.addEventListener('resize', angleichen)
    return () => window.removeEventListener('resize', angleichen)
  })

  useEffect(() => {
    if (window.ScrollOut) {
      window.ScrollOut()
    }
  })

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

  const reihen = []
  for (let i = 0; i < gefiltert.length; i += 3) {
    reihen.push(gefiltert.slice(i, i + 3))
  }

  const hochrollen = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <nav
        ref={leisteRef}
        className="navbar fixed-top navbar-expand-md navbar-light shadow"
        style={{ paddingLeft: 0, paddingRight: 0 }}
      >
       <div className="container nav-behaelter">
        <a
          className="navbar-brand d-none d-md-block"
          href="./index.html"
          style={{ marginLeft: 0 }}
        >
          Sprachzwirbel
        </a>
        <a
          className="navbar-brand d-sm-none d-md-none d-lg-none d-xl-none"
          href="./index.html"
          style={{ marginLeft: 0 }}
        >
          S
        </a>
        <form
          className="form-inline input-group"
          id="nav-form-inline-id-searchfield"
          onSubmit={(ereignis) => ereignis.preventDefault()}
        >
          <input
            className="form-control"
            id="nav-form-control-id-searchfield"
            type="search"
            placeholder="z.B. Aliteration"
            aria-label="Search"
            value={suchbegriff}
            onChange={(ereignis) => setSuchbegriff(ereignis.target.value)}
          />
          <div className="input-group-append">
            <button
              className=" btn btn-outline-dark my-sm-0"
              id="searchBtn"
              type="submit"
            >
              Suche
            </button>
          </div>
        </form>

        <button
          className="navbar-toggler ml-auto"
          type="button"
          aria-controls="navbarToggler"
          aria-expanded={menueOffen}
          aria-label="Toggle navigation"
          onClick={() => setMenueOffen((offen) => !offen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className={`collapse navbar-collapse py-3 pt-sm-0 py-md-0${menueOffen ? ' show' : ''}`}
          id="navbarToggler"
        >
          <div
            className="farbschema-schalter ml-auto"
            role="group"
            aria-label="Farbschema"
          >
            <div className="btn-group" role="group">
              {farbmodusStufen.map((stufe) => (
                <button
                  key={stufe.wert}
                  type="button"
                  aria-pressed={farbmodus === stufe.wert}
                  onClick={() => setFarbmodus(stufe.wert)}
                  className={`btn btn-sm farbmodus-knopf${farbmodus === stufe.wert ? ' aktiv' : ''}`}
                >
                  {stufe.text}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          className="progress"
          style={{ position: 'absolute', top: 'auto', bottom: 0, left: 0 }}
        ></div>
       </div>
      </nav>

      <div ref={behalterRef} className="container">
        {normiert !== '' && (
          <p>
            {gefiltert.length} von {daten.length} Treffern
          </p>
        )}
        {gefiltert.length === 0 ? (
          <p>Keine Treffer für diese Suche.</p>
        ) : (
          reihen.map((reihe, nummer) => (
            <div className="row" key={nummer}>
              {reihe.map((eintrag) => (
                <div
                  className="col-sm-12 col-lg-4 mb-3"
                  key={eintrag.stilmittel}
                >
                  <div className="card mt-4" data-scroll="">
                    <h4 className="card-header">{eintrag.stilmittel}</h4>
                    <div className="card-block">
                      <h6 className="card-title">Beschreibung</h6>
                      <p className="card-text">{eintrag.beschreibung}</p>
                    </div>
                    <div className="card-block card-block-beispiel">
                      <p
                        className="card-text"
                        dangerouslySetInnerHTML={{ __html: eintrag.beispiel }}
                      />
                    </div>
                    <div
                      className="card-footer"
                      dangerouslySetInnerHTML={{
                        __html: wirkungMitPunkten(eintrag.effekt),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {zeigeHoch && (
        <button
          type="button"
          aria-label="Nach oben rollen"
          onClick={hochrollen}
          className="animated slideInUp"
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: 'none',
            background: 'black',
            color: 'white',
            cursor: 'pointer',
            zIndex: 1000,
            animationDelay: '0ms',
            animationDuration: '500ms',
          }}
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </>
  )
}

export default App
