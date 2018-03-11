export default class Listenable {
  constructor() {
    this.raising = false
    this.eventsWhileRaising = []
    this.callbacks = []
  }

  raise() {
    if (this.raising) throw new Error("Listeners cannot be recursively raised")
    this.raising = true
    for (const callback of this.callbacks) callback.apply(this, arguments)
    this.raising = false
    while (true) {
      const event = this.eventsWhileRaising.shift()
      if (!event) break
      if (event.listen) {
        this.listen(event.listen)
      } else {
        this.unlisten(event.unlisten)
      }
    }
  }

  listen(callback) {
    if (this.raising) {
      this.eventsWhileRaising.push({ listen: callback })
    } else {
      if (this.callbacks.indexOf(callback) != -1) throw new Error("Cannot add the same callback to a Listener twice")
      this.callbacks.push(callback)
    }
  }

  unlisten(callback) {
    if (this.raising) {
      this.eventsWhileRaising.push({ unlisten: callback })
    } else {
      const index = this.callbacks.indexOf(callback)
      if (index == -1) throw new Error("Cannot remove a callback from a Listener which was never added")
      this.callbacks.splice(index, 1)
    }
  }
}