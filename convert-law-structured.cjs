// convert-law-structured.cjs
// Converts raw legal text to structured JSON format with headings (편, 장, 절, 관)

const fs = require('fs')
const path = require('path')

const inputPath = path.join(__dirname, 'raw/japan-civil-procedure.txt')
const outputPath = path.join(__dirname, 'src/data/japan-civil-procedure.json')

const raw = fs.readFileSync(inputPath, 'utf-8')
const lines = raw.split(/\r?\n/)

const result = {
  id: 'jpn-civ-proc-001',
  country: 'Japan',
  language: 'ko',
  title_kr: '일본 민사소송법',
  title_original: '民事訴訟法',
  sections: []
}

const headingPatterns = {
  title: /^제(\d+)편\s+(.+)$/,      // 편 = Title
  chapter: /^제(\d+)장\s+(.+)$/,    // 장 = Chapter
  part: /^제(\d+)절\s+(.+)$/,       // 절 = Part
  subpart: /^제(\d+)관\s+(.+)$/     // 관 = Subpart
}

let currentSection = null

for (let line of lines) {
  line = line.trim()
  if (!line) continue

  // Check for high-level heading
  let matchedHeading = false
  for (const [level, pattern] of Object.entries(headingPatterns)) {
    const match = line.match(pattern)
    if (match) {
      result.sections.push({
        type: 'heading',
        level,
        number: match[1],
        title: match[2]
      })
      matchedHeading = true
      break
    }
  }
  if (matchedHeading) continue

  // Check for section (조) and extract trailing text
  const sectionMatch = line.match(/^제(\d+)조(?:\(([^\)]+)\))?\s*(.*)/) // e.g. 제1조(제목) 본문
  if (sectionMatch) {
    currentSection = {
      section_no: `제${sectionMatch[1]}조`,
      title: sectionMatch[2] || '',
      subsections: []
    }

    const remainingText = sectionMatch[3].trim()
    if (remainingText) {
      currentSection.subsections.push({
        no: '',
        text: remainingText,
        paragraphs: []
      })
    }

    result.sections.push(currentSection)
    continue
  }

  // Subsection (항), starts with circled digits or omitted if only one 항
  const subsectionMatch = line.match(/^([\u2460-\u2473])\s*(.+)$/)
  if (subsectionMatch) {
    currentSection.subsections.push({
      no: subsectionMatch[1],
      text: subsectionMatch[2],
      paragraphs: []
    })
    continue
  }

  // Paragraph (호): 1.
  const paraMatch = line.match(/^(\d+)\.\s+(.+)$/)
  if (paraMatch) {
    const subsection = currentSection?.subsections?.slice().reverse().find(sub => sub)
    if (subsection) {
      subsection.paragraphs.push({
        no: `${paraMatch[1]}.`,
        text: paraMatch[2],
        subparagraphs: []
      })
    } else {
      console.warn(`⚠️ Paragraph found without subsection at line: ${line}`)
    }
    continue
  }

  // Subparagraph (목): 가.
  const subpMatch = line.match(/^([가-힣])\.\s+(.+)$/)
  if (subpMatch) {
    const subsection = currentSection?.subsections?.slice().reverse().find(sub => sub)
    const paragraph = subsection?.paragraphs?.slice().reverse().find(p => p)
    if (paragraph) {
      paragraph.subparagraphs.push({
        no: `${subpMatch[1]}.`,
        text: subpMatch[2]
      })
    } else {
      console.warn(`⚠️ Subparagraph found without paragraph at line: ${line}`)
    }
    continue
  }

  // If nothing matches, treat as continuation of last subsection
  if (currentSection?.subsections?.length) {
    const lastSub = currentSection.subsections[currentSection.subsections.length - 1]
    lastSub.text += ' ' + line
  }
}

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8')
console.log(`✅ Generated ${outputPath}`)