export class BooleanAnimation {
  constructor(keyframes) {
    this.keyframes = keyframes
  }

  sample(frame) {
    const firstKeyframe = this.keyframes[0]
    if (firstKeyframe.startsOnFrame > frame) return firstKeyframe.withValue
    for (let i = 0; i < this.keyframes.length; i++) {
      const keyframe = this.keyframes[i]
      if (keyframe.startsOnFrame <= frame) return keyframe.withValue
    }
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

  sample(frame) {
    return this.withValue
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