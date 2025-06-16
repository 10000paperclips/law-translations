const fs = require('fs')
const path = require('path')

const dataFolder = path.join(__dirname, 'src', 'data')
const outputFile = path.join(dataFolder, 'laws-index.json')

// Read all .json files except the index itself
const files = fs.readdirSync(dataFolder).filter(f => f.endsWith('.json') && f !== 'laws-index.json')

const index = []

files.forEach((filename) => {
  const filePath = path.join(dataFolder, filename)
  const content = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(content)

  index.push({
    id: data.id,
    title_kr: data.title_kr,
    title_original: data.title_original,
    country: data.country,
    file: filename
  })
})

fs.writeFileSync(outputFile, JSON.stringify(index, null, 2), 'utf-8')
console.log(`✅ Generated laws-index.json with ${index.length} entries`)