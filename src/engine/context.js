import mainLoop from "./main_loop"

const exported = {
  canvas: null,
  gl: null,
  glNonce: 0,
  width: 0,
  height: 0
}
export default exported

addEventListener("load", () => {
  const canvas = document.createElement("CANVAS")
  canvas.style.position = "fixed"
  canvas.style.left = "0"
  canvas.style.top = "0"
  canvas.style.width = "100%"
  canvas.style.height = "100%"
  canvas.style.visibility = "hidden"
  document.body.appendChild(canvas)
  exported.canvas = canvas

  let animationFrame = null

  canvas.addEventListener("webglcontextlost", event => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
    event.preventDefault()
  }, true)

  canvas.addEventListener("webglcontextrestored", () => {
    exported.glNonce++
    initializeGl()
    animationFrame = requestAnimationFrame(onAnimationFrame)
  })

  const attributes = {
    alpha: false,
    depth: true,
    stencil: false,
    antialias: false, /* TODO: This should be configurable. */
    powerPreference: "high-performance"
  }

  const gl = canvas.getContext("webgl", attributes) || canvas.getContext("experimental-webgl", attributes)
  if (!gl) throw new Error("Failed to open a WebGL context")
  exported.gl = gl

  initializeGl()

  animationFrame = requestAnimationFrame(onAnimationFrame)
  let lastTimestamp = null
  function onAnimationFrame(timestamp) {
    animationFrame = null

    let deltaSeconds = 0
    if (lastTimestamp === null) {
      lastTimestamp = timestamp
    } else {
      deltaSeconds = Math.min(0.25, (timestamp - lastTimestamp) / 1000)
      lastTimestamp = timestamp
    }

    canvas.width = exported.width = Math.floor(canvas.clientWidth * (window.devicePixelRatio || 1))
    canvas.height = exported.height = Math.floor(canvas.clientHeight * (window.devicePixelRatio || 1))

    mainLoop(deltaSeconds)

    animationFrame = requestAnimationFrame(onAnimationFrame)
  }

  function initializeGl() {
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)
  }

  canvas.style.visibility = "visible"
})