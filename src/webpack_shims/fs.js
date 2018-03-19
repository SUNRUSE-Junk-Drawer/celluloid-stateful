export function readFile(path, options, callback) {
  const isText = options.encoding == "UTF8"

  callback = callback || options

  const request = new XMLHttpRequest()
  request.open("GET", path, true)
  request.responseType = isText ? "text" : "arraybuffer"
  request.onreadystatechange = function () {
    if (request.readyState == 4)
      if (request.status == 200)
        callback(null, isText ? request.response : { buffer: request.response })
      else
        callback(`Failed to read file "${path}"`, null)
    return
  }
  request.send(null)
}