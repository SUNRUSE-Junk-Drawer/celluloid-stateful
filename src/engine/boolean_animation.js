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

export function parseBooleanAnimation(fileParser) {
  const numberOfKeyframes = fileParser.uint16()
  if (!numberOfKeyframes) {
    const value = !!fileParser.uint8()
    return new ConstantBooleanAnimation(value)
  } else {
    const keyframes = []
    while (keyframes.length < numberOfKeyframes) {
      keyframes.push(new BooleanKeyframe(fileParser.float32(), !!fileParser.uint8()))
    }
    return new BooleanAnimation(keyframes)
  }
}