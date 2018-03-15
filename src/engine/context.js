import render from "./render"
import tick from "./tick"

const exported = {
  canvas: null,
  gl: null,
  glNonce: 0,
  tickProgress: 0
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

  animationFrame = requestAnimationFrame(onAnimationFrame)
  let lastTimestamp = null
  function onAnimationFrame(timestamp) {
    animationFrame = null

    if (lastTimestamp === null) {
      lastTimestamp = timestamp
    } else {
      exported.tickProgress += Math.min(5, (timestamp - lastTimestamp) * 60 / 1000)
      lastTimestamp = timestamp
      while (exported.tickProgress >= 1) {
        tick()
        exported.tickProgress -= 1
      }
    }

    render()

    animationFrame = requestAnimationFrame(onAnimationFrame)
  }

  canvas.style.visibility = "visible"
})