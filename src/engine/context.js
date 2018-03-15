const exported = {
  canvas: null
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

  canvas.style.visibility = "visible"
})