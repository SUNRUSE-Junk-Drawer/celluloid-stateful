export class BooleanAnimation {
  constructor(keyframes) {
    this.keyframes = keyframes
  }
}

export class BooleanKeyframe {
  constructor(startsOnFrame, withValue) {
    this.startsOnFrame = startsOnFrame
    this.withValue = withValue
  }
}

export class ConstantBooleanAnimation {
  constructor(withValue) {
    this.withValue = withValue
  }
}