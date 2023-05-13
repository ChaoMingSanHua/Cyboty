import * as math from "mathjs"

class Quaternion {
  #w
  #v
  constructor(q) {
    if (q.length === 3) {
      this.#w = 0
      this.#v = q
    } else if (q.length === 4) {
      this.#w = q[0]
      this.#v = q.slice(1, 4)
    }
  }

  get getW() {
    return this.#w
  }

  get getV() {
    return this.#v
  }

  static #inv = (q) => {
    const w = q.getW
    const v = math.multiply(-1, q.getV)
    return new Quaternion([w, ...v])
  }

  static #multiply = (q1, q2) => {
    const w = q1.getW * q2.getW - math.dot(q1.getV, q2.getV)
    const v = math.add(math.add(math.multiply(q1.getW, q2.getV), math.multiply(q2.getW, q1.getV)), math.cross(q1.getV, q2.getV))
    return new Quaternion([w, ...v])
  }

  static multiRot = (q1, q2) => {
    const q1Quaternion = new Quaternion(q1)
    const q2Quaternion = new Quaternion(q2)
    const result = this.#multiply(q2Quaternion, q1Quaternion)
    return [result.getW, ...result.getV]
  }

  static rot = (p, q) => {
    const pQuaternion = new Quaternion(p)
    const qQuaternion = new Quaternion(q)
    if (p.length === 3) {
      const qResult = this.#multiply(this.#multiply(qQuaternion, pQuaternion), this.#inv(qQuaternion))
      return [qResult.getW, ...qResult.getV]
    } else if (p.length === 4) {
      const q2result = this.#multiply(qQuaternion, pQuaternion)
      return [q2result.getW, ...q2result.getV]
    }
    return [q2result.getW, ...q2result.getV]
  }
}

export {Quaternion}
