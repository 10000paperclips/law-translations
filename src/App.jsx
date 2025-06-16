import { useEffect, useState } from 'react'

function App() {
  const [laws, setLaws] = useState([])
  const [selectedLaw, setSelectedLaw] = useState(null)
  const [lawContent, setLawContent] = useState(null)

  useEffect(() => {
    fetch('/law-translations/src/data/laws-index.json')
      .then((res) => res.json())
      .then((data) => setLaws(data))
      .catch((err) => console.error('Failed to load law index:', err))
  }, [])

  const loadLaw = async (filename) => {
    try {
      const res = await fetch(`/law-translations/src/data/${filename}`)
      const data = await res.json()
      setLawContent(data)
    } catch (err) {
      console.error('Failed to load law file:', err)
    }
  }

  const handleSelectLaw = (law) => {
    setSelectedLaw(law)
    loadLaw(law.file)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>국가별 번역 법률</h1>

      <h2>법률 목록</h2>
      <ul>
        {laws.map((law) => (
          <li key={law.id} style={{ marginBottom: '0.5rem' }}>
            <button onClick={() => handleSelectLaw(law)}>{law.title_kr} ({law.title_original})</button>
          </li>
        ))}
      </ul>

      {lawContent && (
        <div style={{ marginTop: '2rem' }}>
          <h2>{lawContent.title_kr} ({lawContent.title_original})</h2>
          <p><strong>국가:</strong> {lawContent.country}</p>

          {lawContent.sections.map((section, idx) => (
            <div key={idx} style={{ marginTop: '1.5rem' }}>
              <h3>{section.section_no} {section.title && `(${section.title})`}</h3>

              {section.subsections.map((sub, subIdx) => (
                <div key={subIdx} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <p><strong>{sub.no}</strong> {sub.text}</p>

                  {sub.paragraphs && sub.paragraphs.map((para, paraIdx) => (
                    <div key={paraIdx} style={{ marginLeft: '1rem', marginTop: '0.3rem' }}>
                      <p><strong>{para.no}</strong> {para.text}</p>

                      {para.subparagraphs && para.subparagraphs.map((subp, subpIdx) => (
                        <p key={subpIdx} style={{ marginLeft: '1.5rem' }}>
                          <strong>{subp.no}</strong> {subp.text}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App