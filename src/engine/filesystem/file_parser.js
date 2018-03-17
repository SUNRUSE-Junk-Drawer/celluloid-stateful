export default class FileParser {
  constructor(arrayBuffer) {
    this.dataView = new DataView(arrayBuffer)
    this.position = 0
  }

  skip(bytes) {
    this.position += bytes
  }

  uint8() {
    const output = this.dataView.getUint8(this.position)
    this.position++
    return output
  }

  uint8Array(count) {
    const output = []
    while (count) {
      output.push(this.uint8())
      count--
    }
    return new Uint8Array(output)
  }

  uint16() {
    const output = this.dataView.getUint16(this.position, true)
    this.position += 2
    return output
  }

  uint16Array(count) {
    const output = []
    while (count) {
      output.push(this.uint16())
      count--
    }
    return new Uint16Array(output)
  }

  float32() {
    const output = this.dataView.getFloat32(this.position, true)
    this.position += 4
    return output
  }

  float32Array(count) {
    const output = []
    while (count) {
      output.push(this.float32())
      count--
    }
    return new Float32Array(output)
  }

  utf8() {
    // TODO: this is not a correct UTF-8 decode; awaiting licence declaration for https://gist.github.com/pascaldekloe/62546103a1576803dade9269ccf76330#file-utf8-js
    let output = ""
    while (true) {
      const nextByte = this.uint8()
      if (!nextByte) return output
      output += String.fromCharCode(nextByte)
    }
  }
}