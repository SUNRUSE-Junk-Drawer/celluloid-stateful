import Cache from "./cache"
import { readFile } from "fs"
import { join } from "path"
import onFileChange from "./on_file_change"

const readFileOptions = { encoding: "UTF8" }

class CsvCache extends Cache {
  transform(key, then) {
    readFile(join("data", key), readFileOptions, (err, data) => {
      if (err) {
        console.error(`Failed to read "${key}" as text for CSV`, err)
        then(null)
      } else {
        let text = ""
        const lines = []

        function writeText() {
          lines[lines.length - 1].push(text.trim())
          text = ""
        }

        const startOfLine = {
          character(character) {
            if (character == "\"") {
              lines.push([])
              return quotedText
            } else if (character == ",") {
              lines.push([])
              writeText()
              return afterComma
            } else if (/^\s$/.test(character)) {
              return startOfLine
            } else {
              lines.push([])
              text = character
              return unquotedText
            }
          },
          endOfFile() {
            then(lines)
          }
        }

        const quotedText = {
          character(character) {
            if (character == "\"") {
              return afterQuote
            } else {
              text += character
              return quotedText
            }
          },
          endOfFile() {
            console.error(`Unexpected end-of-file during quoted text in CSV "${key}"`)
            then(null)
          }
        }

        const afterQuote = {
          character(character) {
            if (character == "\"") {
              text += "\""
              return quotedText
            } else if (character == ",") {
              writeText()
              return afterComma
            } else if (character == "\n") {
              writeText()
              return startOfLine
            } else if (/^\s$/.test(character)) {
              writeText()
              return afterQuotedText
            } else {
              console.error(`Unexpected character "${character}" following quoted text in CSV "${key}"`)
              then(null)
            }
          },
          endOfFile() {
            writeText()
            then(lines)
          }
        }

        const afterQuotedText = {
          character(character) {
            if (character == ",") {
              return afterComma
            } else if (character == "\n") {
              return startOfLine
            } else if (/^\s$/.test(character)) {
              return afterQuotedText
            } else {
              console.error(`Unexpected character "${character}" following quoted text in CSV "${key}"`)
              then(null)
            }
          },
          endOfFile() {
            then(lines)
          }
        }

        const unquotedText = {
          character(character) {
            if (character == "\n") {
              writeText()
              return startOfLine
            } else if (character == ",") {
              writeText()
              return afterComma
            } else {
              text += character
              return unquotedText
            }
          },
          endOfFile() {
            writeText()
            then(lines)
          }
        }

        const afterComma = {
          character(character) {
            if (character == "\"") {
              return quotedText
            } else if (character == "\n") {
              writeText()
              return startOfLine
            } else if (/^\s$/.test(character)) {
              return afterComma
            } else if (character == ",") {
              writeText()
              return afterComma
            } else {
              text = character
              return unquotedText
            }
          },
          endOfFile() {
            writeText()
            then(lines)
          }
        }

        let currentHandler = startOfLine
        for (let i = 0; i < data.length; i++) {
          currentHandler = currentHandler.character(data.charAt(i))
          if (!currentHandler) return
        }
        currentHandler.endOfFile()
      }
    })
  }
}

const cache = new CsvCache()
onFileChange.listen(key => cache.changed(key))

export default cache