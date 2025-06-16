const fs = require('fs')
const path = require('path')

// === CONFIGURATION ===
const INPUT_FILE = path.join(__dirname, 'raw', 'japan-civil-procedure.txt')
const OUTPUT_FILE = path.join(__dirname, 'src', 'data', 'japan-civil-procedure.json')

const metadata = {
  id: 'jpn-civ-proc-001',
  country: 'Japan',
  language: 'ko',
  title_kr: '일본 민사소송법',
  title_original: '民事訴訟法',
  sections: []
}

// === PATTERNS ===
const sectionRegex = /^제\d+조(?:\(([^)]+)\))?\s+(.+)$/
const subsectionRegex = /^[①②③④⑤⑥⑦⑧⑨⑩]/     // 항
const paragraphRegex = /^\d+\./                   // 호
const subparagraphRegex = /^[가-힣]\./             // 목

const lines = fs.readFileSync(INPUT_FILE, 'utf-8').split('\n')

let currentSection = null
let currentSubsection = null
let currentParagraph = null

for (let rawLine of lines) {
  const line = rawLine.trim()
  if (!line) continue

  const sectionMatch = line.match(sectionRegex)
  const isSubsection = subsectionRegex.test(line)
  const isParagraph = paragraphRegex.test(line)
  const isSubparagraph = subparagraphRegex.test(line)

  if (sectionMatch) {
    const section_no = line.match(/^제\d+조/)[0]
    const title = sectionMatch[1] || ''
    const text = sectionMatch[2]

    currentSection = {
      section_no,
      title,
      subsections: []
    }

    // If the text is not part of a numbered subsection, treat it as 1 implicit one
    if (!subsectionRegex.test(text)) {
      currentSection.subsections.push({
        no: '',
        text,
        paragraphs: []
      })
    }

    metadata.sections.push(currentSection)
    currentSubsection = null
    currentParagraph = null
  }

  else if (isSubsection) {
    const no = line[0]
    const text = line.slice(1).trim()

    currentSubsection = {
      no,
      text,
      paragraphs: []
    }

    currentSection?.subsections.push(currentSubsection)
    currentParagraph = null
  }

  else if (isParagraph) {
    const match = line.match(/^(\d+\.)\s*(.+)/)
    if (!match) continue

    const [ , no, text ] = match
    currentParagraph = {
      no,
      text,
      subparagraphs: []
    }

    currentSubsection?.paragraphs.push(currentParagraph)
  }

  else if (isSubparagraph) {
    const match = line.match(/^([가-힣]\.)\s*(.+)/)
    if (!match) continue

    const [ , no, text ] = match
    currentParagraph?.subparagraphs.push({ no, text })
  }

  else {
    // fallback: plain paragraph if no structure matched
    currentSubsection?.paragraphs?.push?.({
      no: '',
      text: line
    })
  }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2), 'utf-8')
console.log(`✅ Structured law file created: ${OUTPUT_FILE}`)