// Optimized helper for clickable tooltips like "제5조", "전조제2항", "제5조제2항제3호", or "가목"
import { useState } from 'react'

export function useReferenceTooltip() {
  const [activeRef, setActiveRef] = useState(null)

  const toggleRef = (key) => {
    setActiveRef((prev) => (prev === key ? null : key))
  }

  return { activeRef, toggleRef }
}

export function renderWithReferences(text, sections = [], activeRef, toggleRef) {
  const refPattern = /(?:(전)(\d*)조)?(?:(제(\d+)조))?(?:(제(\d+)항))?(?:(제(\d+)호))?(?:([가-힣]목))?/g
  const parts = []
  let lastIndex = 0
  let match
  let lastFullRef = null
  const currentSecIndex = sections.findIndex(s => s.section_no?.startsWith('제'))
  const currentSecNum = parseInt(sections[currentSecIndex]?.section_no?.replace(/[^\d]/g, '')) || 0

  while ((match = refPattern.exec(text)) !== null) {
    if (match.index === refPattern.lastIndex) refPattern.lastIndex++ // prevent infinite loop
    const [fullMatch, prevToken, prevCount, secToken, secNum, subToken, subNum, paraToken, paraNum, mok] = match
    const matchStart = match.index

    if (!fullMatch.trim()) continue

    let key = fullMatch + '-' + matchStart
    let label = fullMatch
    let content = '내용을 찾을 수 없습니다'

    let section = null, subsection = null, paragraph = null, subparagraph = null

    if (secNum) {
      section = sections.find(s => s.section_no === `제${secNum}조`)
    } else if (prevToken === '전') {
      const count = prevCount ? parseInt(prevCount) : 1
      const targetSecNo = currentSecNum - count
      section = sections.find(s => s.section_no === `제${targetSecNo}조`)
    } else if (subNum || paraNum || mok) {
      if (lastFullRef?.section_no) {
        section = sections.find(s => s.section_no === lastFullRef.section_no)
      }
    }

    if (section) {
      lastFullRef = section
      const subs = section.subsections || []
      if (subNum) {
        subsection = subs.find(sub => sub.no === `제${subNum}항`)
        lastFullRef.subsection = subsection
      }
      if (subsection && paraNum) {
        paragraph = (subsection.paragraphs || []).find(p => p.no === `제${paraNum}호`)
        lastFullRef.paragraph = paragraph
      }
      if (paragraph && mok) {
        subparagraph = (paragraph.subparagraphs || []).find(sp => sp.no === mok)
      }

      const lines = []
      if (subparagraph) {
        lines.push(`${subparagraph.no} ${subparagraph.text}`)
      } else if (paragraph) {
        lines.push(`${paragraph.no} ${paragraph.text}`)
        lines.push(...(paragraph.subparagraphs || []).map(sp => `${sp.no} ${sp.text}`))
      } else if (subsection) {
        lines.push(subsection.text)
        lines.push(...(subsection.paragraphs || []).map(p => `${p.no} ${p.text}`))
        lines.push(...(subsection.paragraphs || []).flatMap(p => (p.subparagraphs || []).map(sp => `${sp.no} ${sp.text}`)))
      } else {
        lines.push(...subs.map(sub => sub.text || ''))
        lines.push(...subs.flatMap(sub => (sub.paragraphs || []).map(p => `${p.no} ${p.text}`)))
      }

      content = lines.filter(Boolean).join('\n')
    }

    parts.push(text.slice(lastIndex, matchStart))
    parts.push(
      <span
        key={key}
        onClick={() => toggleRef(key)}
        style={{
          textDecoration: 'underline dotted',
          cursor: 'pointer',
          background: activeRef === key ? '#eef' : 'none',
          position: 'relative',
        }}
      >
        {label}
        {activeRef === key && (
          <div
            style={{
              position: 'absolute',
              background: '#fff',
              border: '1px solid #ccc',
              padding: '1rem',
              marginTop: '0.2rem',
              zIndex: 200,
              whiteSpace: 'pre-line',
              boxShadow: '0px 2px 6px rgba(0,0,0,0.2)'
            }}
          >
            {content}
          </div>
        )}
      </span>
    )
    lastIndex = refPattern.lastIndex
  }

  parts.push(text.slice(lastIndex))
  return parts
}