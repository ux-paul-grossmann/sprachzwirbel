import { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  SegmentedControl,
  Separator,
  Text,
  TextField,
  Theme,
} from '@radix-ui/themes'
import daten from './refigure-data.json'

function textOhneMarkierung(text) {
  return text ? text.replace(/<[^>]*>/g, ' ') : ''
}

function bereinigtesBeispiel(text) {
  if (!text) {
    return ''
  }
  return text
    .replace(/<span class="title-beispiel">Beispiel<\/span>/g, '')
    .trim()
}

function wirkungAlsListe(effekt) {
  const rein = textOhneMarkierung(effekt)
    .replace(/\s+/g, ' ')
    .trim()
  if (!rein) {
    return []
  }
  return rein
    .split(',')
    .map((teil) => teil.trim())
    .filter((teil) => teil.length > 0)
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
  const [systemWillDunkel, setSystemWillDunkel] = useState(false)
  const [suchbegriff, setSuchbegriff] = useState('')

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const aktualisiere = () => setSystemWillDunkel(media.matches)
    aktualisiere()
    media.addEventListener('change', aktualisiere)
    return () => media.removeEventListener('change', aktualisiere)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('sprachzwirbel-thema', thema)
    } catch {
      // ohne Speicher weiter
    }
  }, [thema])

  useEffect(() => {
    try {
      window.localStorage.setItem('sprachzwirbel-karten', darstellung)
    } catch {
      // ohne Speicher weiter
    }
  }, [darstellung])

  const sollDunkel =
    thema === 'dunkel' || (thema === 'system' && systemWillDunkel)
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
    <Theme appearance={sollDunkel ? 'dark' : 'light'}>
      <Container size="4" px="4" py="3" style={{ textAlign: 'left' }}>
        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <Box>
            <Heading size="7">Sprachzwirbel</Heading>
            <Text as="p" color="gray">
              Darstellung mit Radix bei gleicher Funktion
            </Text>
          </Box>
          <Flex gap="2" wrap="wrap">
            <SegmentedControl.Root
              value={thema}
              onValueChange={setThema}
              aria-label="Farbschema"
            >
              <SegmentedControl.Item value="hell">
                Hell
              </SegmentedControl.Item>
              <SegmentedControl.Item value="system">
                System
              </SegmentedControl.Item>
              <SegmentedControl.Item value="dunkel">
                Dunkel
              </SegmentedControl.Item>
            </SegmentedControl.Root>
            <SegmentedControl.Root
              value={darstellung}
              onValueChange={setDarstellung}
              aria-label="Kartendarstellung"
            >
              <SegmentedControl.Item value="kompakt">
                Kompakt
              </SegmentedControl.Item>
              <SegmentedControl.Item value="voll">Voll</SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>
        </Flex>

        <Box mt="6" mb="4">
          <Flex align="center" gap="3">
            <Text as="label" htmlFor="suche">
              Suche
            </Text>
            <TextField.Root
              id="suche"
              type="search"
              style={{ flex: 1, maxWidth: 420 }}
              value={suchbegriff}
              onChange={(ereignis) => setSuchbegriff(ereignis.target.value)}
              placeholder="zum Beispiel Vergleich"
            />
          </Flex>
        </Box>
        <Box mb="6" style={{ textAlign: 'left' }}>
          <Text as="p" color="gray" align="left">
            {gefiltert.length} von {daten.length} Treffern
          </Text>
        </Box>
        {gefiltert.length === 0 ? (
          <Text as="p">Keine Treffer für diese Suche.</Text>
        ) : (
          <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
            {gefiltert.map((eintrag) => (
              <Card key={eintrag.stilmittel}>
                <Flex
                  direction="column"
                  gap={darstellung === 'voll' ? '4' : '2'}
                >
                  <Heading size="4">{eintrag.stilmittel}</Heading>
                  <Box>
                    <Text as="p" size="1" weight="bold" color="gray">
                      Beschreibung
                    </Text>
                    <Text as="p" size="2" mt="1">
                      {eintrag.beschreibung}
                    </Text>
                  </Box>
                  <Separator size="4" />
                  <Box>
                    <Text as="p" size="1" weight="bold" color="gray">
                      Beispiel
                    </Text>
                    <Box
                      mt="1"
                      p={darstellung === 'voll' ? '3' : '2'}
                      style={
                        darstellung === 'voll'
                          ? { borderRadius: 8 }
                          : undefined
                      }
                    >
                      <div
                        className="karten-beispiel"
                        dangerouslySetInnerHTML={{
                          __html: bereinigtesBeispiel(eintrag.beispiel),
                        }}
                      />
                    </Box>
                  </Box>
                  <Separator size="4" />
                  <Box>
                    <Text as="p" size="1" weight="bold" color="gray">
                      Wirkung
                    </Text>
                    <Flex mt="2" gap="2" wrap="wrap">
                      {wirkungAlsListe(eintrag.effekt).map((wort) => (
                        <Badge key={wort} size="2" variant="soft">
                          {wort}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                </Flex>
              </Card>
            ))}
          </Grid>
        )}
      </Container>
    </Theme>
  )
}

export default App
