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
    <div
      style={{
        padding: '2rem',
        fontFamily: 'Noto Sans KR, sans-serif',
        fontSize: '1rem',
        lineHeight: 1.6,
        textAlign: 'justify',
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>
        국가별 번역 법률
      </h1>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '600' }}>
        법률 목록
      </h2>

      <ul>
        {laws.map((law) => (
          <li key={law.id} style={{ marginBottom: '0.5rem' }}>
            <button
              onClick={() => handleSelectLaw(law)}
              style={{
                cursor: 'pointer',
                color: '#1a4bb4',
                background: 'none',
                border: 'none',
                fontSize: '1rem',
              }}
            >
              {law.title_kr} ({law.title_original})
            </button>
          </li>
        ))}
      </ul>

      {lawContent && (
        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {lawContent.title_kr} ({lawContent.title_original})
          </h2>

          {lawContent.sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '0.5rem' }}>
              {section.type === 'heading' && (
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: '#003366',
                    marginTop: '1rem',
                    paddingLeft:
                      section.level === 'title' ? '0rem' :
                      section.level === 'chapter' ? '1rem' :
                      section.level === 'part' ? '2rem' : '0rem',
                  }}
                >
                  {section.level === 'title' && `제${section.number}편 ${section.title}`}
                  {section.level === 'chapter' && `제${section.number}장 ${section.title}`}
                  {section.level === 'part' && `제${section.number}절 ${section.title}`}
                </h3>
              )}

              {section.section_no && (
                <>
                  <p
                    style={{
                      fontSize: '1rem',
                      margin: 0,
                      paddingLeft: '1rem',
                      textIndent: '-1rem',
                    }}
                  >
                    <span style={{ color: '#003366', fontWeight: 'bold' }}>
                      {section.section_no}
                      {section.title ? `(${section.title})` : ''}
                    </span>{' '}
                    {section.subsections?.[0] && (
                      <>
                        {section.subsections[0].no ? `${section.subsections[0].no} ` : ''}
                        {section.subsections[0].text}
                      </>
                    )}
                  </p>

                  {section.subsections?.[0]?.paragraphs?.map((para, paraIdx) => (
                    <div key={paraIdx}>
                      <p style={{ paddingLeft: '1.5rem', textIndent: '-0.5rem', margin: 0 }}>
                        <span style={{ fontWeight: 'normal' }}>{para.no}</span>{' '}
                        {para.text}
                      </p>
                      {para.subparagraphs?.map((subp, subpIdx) => (
                        <p key={subpIdx} style={{ paddingLeft: '3rem', textIndent: '-1rem', margin: 0 }}>
                          <span>{subp.no}</span> {subp.text}
                        </p>
                      ))}
                    </div>
                  ))}

                  {section.subsections.slice(1).map((sub, subIdx) => (
                    <div key={subIdx}>
                      <p style={{ paddingLeft: '1rem', margin: 0 }}>
                        <span style={{ fontWeight: 'normal' }}>{sub.no}</span>{' '}
                        {sub.text}
                      </p>

                      {sub.paragraphs?.map((para, paraIdx) => (
                        <div key={paraIdx}>
                          <p style={{ paddingLeft: '1rem', margin: 0 }}>
                            <span style={{ fontWeight: 'normal' }}>{para.no}</span>{' '}
                            {para.text}
                          </p>
                          {para.subparagraphs?.map((subp, subpIdx) => (
                            <p
                              key={subpIdx}
                              style={{
                                paddingLeft: '2rem',
                                color: '#444',
                                fontWeight: 'normal',
                                margin: 0,
                              }}
                            >
                              <span>{subp.no}</span> {subp.text}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App