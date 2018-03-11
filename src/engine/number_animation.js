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

export function parseNumberAnimation(fileParser) {
  const numberOfKeyframes = fileParser.uint16()
  if (!numberOfKeyframes) {
    const value = fileParser.float32()
    return new ConstantNumberAnimation(value)
  } else {
    const keyframes = []
    while (keyframes.length < numberOfKeyframes) {
      const startsOnFrame = fileParser.float32()

      switch (fileParser.uint8()) {
        case 0: {
          keyframes.push(new NumberConstantKeyframe(startsOnFrame, fileParser.float32()))
        } break

        case 1: {
          keyframes.push(new NumberLinearKeyframe(startsOnFrame, fileParser.float32()))
        } break
      }
    }
    return new NumberAnimation(keyframes)
  }
}