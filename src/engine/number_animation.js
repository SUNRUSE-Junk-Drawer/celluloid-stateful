export class NumberAnimation {
  constructor(keyframes) {
    this.keyframes = keyframes
  }
}

export class NumberConstantKeyframe {
  constructor(startsOnFrame, withValue) {
    this.startsOnFrame = startsOnFrame
    this.withValue = withValue
  }
}

export class NumberLinearKeyframe {
  constructor(startsOnFrame, withValue) {
    this.startsOnFrame = startsOnFrame
    this.withValue = withValue
  }
}

export class ConstantNumberAnimation {
  constructor(withValue) {
    this.withValue = withValue
  }
}