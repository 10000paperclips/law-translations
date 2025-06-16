import { useEffect, useState } from 'react'

function App() {
  const [laws, setLaws] = useState([])
  const [selectedLaw, setSelectedLaw] = useState(null)
  const [lawContent, setLawContent] = useState(null)

  // Load the laws index (list of laws)
  useEffect(() => {
    fetch('/law-translations/src/data/laws-index.json')
      .then((res) => res.json())
      .then((data) => setLaws(data))
      .catch((err) => console.error('Failed to load law index:', err))
  }, [])

  // Load a specific law file
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

      {/* Law list */}
      <h2>법률 목록</h2>
      <ul>
        {laws.map((law) => (
          <li key={law.id} style={{ marginBottom: '0.5rem' }}>
            <button onClick={() => handleSelectLaw(law)}>{law.title_kr} ({law.title_original})</button>
          </li>
        ))}
      </ul>

      {/* Law content */}
      {lawContent && (
        <div style={{ marginTop: '2rem' }}>
          <h2>{lawContent.title_kr} ({lawContent.title_original})</h2>
          <p><strong>국가:</strong> {lawContent.country}</p>
          {lawContent.articles.map((article, index) => (
            <div key={index} style={{ marginTop: '1rem' }}>
              <h4>{article.article_no}</h4>
              <p><strong>번역:</strong> {article.text_kr}</p>
              <p><strong>원문:</strong> {article.text_original}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App