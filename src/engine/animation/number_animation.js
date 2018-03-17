export class NumberAnimation {
  constructor(keyframes) {
    this.keyframes = keyframes
  }

  sample(frame) {
    const firstKeyframe = this.keyframes[0]
    if (firstKeyframe.startsOnFrame > frame) return firstKeyframe.withValue
    const lastKeyframe = this.keyframes[this.keyframes.length - 1]
    if (lastKeyframe.startsOnFrame <= frame) return lastKeyframe.withValue
    for (let i = 0; i < this.keyframes.length; i++) {
      const keyframe = this.keyframes[i]
      if (keyframe.startsOnFrame <= frame) return keyframe.sample(frame, this.keyframes[i + 1])
    }
  }
}

export class NumberConstantKeyframe {
  constructor(startsOnFrame, withValue) {
    this.startsOnFrame = startsOnFrame
    this.withValue = withValue
  }

  sample(frame, next) {
    return this.withValue
  }
}

export class NumberLinearKeyframe {
  constructor(startsOnFrame, withValue) {
    this.startsOnFrame = startsOnFrame
    this.withValue = withValue
  }

  sample(frame, next) {
    return this.withValue + (next.withValue - this.withValue) * (frame - this.startsOnFrame) / (next.startsOnFrame - this.startsOnFrame)
  }
}

export class ConstantNumberAnimation {
  constructor(withValue) {
    this.withValue = withValue
  }

  sample(frame) {
    return this.withValue
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