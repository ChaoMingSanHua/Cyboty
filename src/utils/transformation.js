import * as math from 'mathjs'
import {Quaternion} from "@/utils/quaternion";

class AxisAngle {
  #axis = null
  #theta = null
  constructor(axis, theta) {
    this.#axis = axis
    this.#theta = theta
  }

  get getAxis() {
    return this.#axis
  }
  get getTheta() {
    return this.#theta
  }
}

class Transformation {
  static nearZero = (z) => {
    return math.abs(z) < 1e-6
  }

  static euclToHomPoint2D = (p) => {
    return math.matrix([
      [p[0]],
      [p[1]],
      [1]
    ])
  }

  static euclToHomPoint3D = (p) => {
    return math.matrix([
      [p[0]],
      [p[1]],
      [p[2]],
      [1]
    ])
  }

  static rotX = (theta) => {
    return math.matrix([
      [1, 0, 0],
      [0, math.cos(theta), -math.sin(theta)],
      [0, math.sin(theta), math.cos(theta)]
    ])
  }

  static rotY = (theta) => {
    return math.matrix([
      [math.cos(theta), 0, math.sin(theta)],
      [0, 1, 0],
      [-math.sin(theta), 0, math.cos(theta)]
    ])
  }

  static rotZ = (theta) => {
    return math.matrix([
      [math.cos(theta), -math.sin(theta), 0],
      [math.sin(theta), math.cos(theta), 0],
      [0, 0, 1]
    ])
  }

  static rpyToR = (phi, theta, psi) => {
    return math.multiply(math.multiply(this.rotZ(psi), this.rotY(theta)), this.rotX(phi))
  }

  static RTorpy = (R) => {
    let phi, theta, psi;
    if (this.nearZero(Math.abs(R.valueOf()[2][0]) - 1)) {
      if (R.valueOf()[2][0] <= 0) {
        theta = Math.PI / 2
        phi = Math.atan2(R.valueOf()[0][1], R.valueOf()[1][1])
        psi = 0.0
      } else {
        theta = -Math.PI / 2
        phi = Math.atan2(-R.valueOf()[0][1], R.valueOf()[1][1])
        psi = 0.0
      }
    } else {
      theta = Math.asin(-R.valueOf()[2][0])
      phi = Math.atan2(R.valueOf()[2][1], R.valueOf()[2][2])
      psi = Math.atan2(R.valueOf()[1][0], R.valueOf()[0][0])
    }
    return [phi, theta, psi]
  }

  static TransToX = (T) => {
    const R = T.subset(math.index([0, 1, 2], [0, 1, 2]))
    const px = T.get([0, 3])
    const py = T.get([1, 3])
    const pz = T.get([2, 3])
    const rpy = this.RTorpy(R)
    return [px, py, pz, ...rpy]
  }

  static pToTrans = (px, py, pz) => {
    const T = math.identity(4)
    T.subset(math.index([0, 1, 2], 3), [px, py, pz])
    return T
  }

  static RToTrans = (R) => {
    const T = math.identity(4)
    // math.subset(T, math.index([0, 1, 2], [0, 1, 2]), R)
    T.subset(math.index([0, 1, 2], [0, 1, 2]), R)
    return T
  }

  static XToTrans = (x) => {
    const R = this.rpyToR(x[3], x[4], x[5])
    const t = this.pToTrans(x[0], x[1], x[2])
    const TR = this.RToTrans(R)
    return math.multiply(t, TR)
  }

  static norm = (array) => {
    let sum = 0;
    array.forEach(value => {
      sum += Math.pow(value, 2)
    })
    return Math.sqrt(sum)
  }

  static normalize = (v) => {
    return math.divide(v, math.norm(math.squeeze(v)))
  }

  static rotInv = (R) => {
    return math.transpose(R)
  }

  static VecToso3 = (omega) => {
    return math.matrix([
      [0, -omega.get([2]), omega.get([1])],
      [omega.get([2]), 0, -omega.get([0])],
      [-omega.get([1]), omega.get([0]), 0]
    ])
  }

  static so3ToVec = (so3mat) => {
    return math.matrix([so3mat.get([2, 1]), so3mat.get([0, 2]), so3mat.get([1, 0])])
  }

  static AxisAng3 = (expc3) => {
    // return {
    //   axis: Transformation.normalize(expc3),
    //   theta: math.norm(math.squeeze(expc3))
    // }

    const theta = math.norm(expc3)
    let omgHat = math.matrix(math.zeros([3]))
    let maxIndex = 0
    expc3.valueOf().forEach((value, index, array) => {
      if (math.abs(value) > array[maxIndex]) {
        maxIndex = index
      }
    })
    if (this.nearZero(theta)) {
      omgHat.set([maxIndex], math.sign(expc3.get([maxIndex])))
      if (this.nearZero(math.norm(omgHat))) {
        omgHat.set([0], 1)
      }
    } else {
      omgHat = math.divide(expc3, theta)
    }
    return {omgHat, theta}
  }

  static MatrixExp3 = (so3mat) => {
    const omegaTheta = Transformation.so3ToVec(so3mat)
    if (Transformation.nearZero(math.norm(omegaTheta))) {
      return math.identity(3)
    } else {
      const {theta} = Transformation.AxisAng3(omegaTheta)
      const omegaMat = math.divide(so3mat, theta)
      return math.add(math.add(math.identity(3), math.multiply(math.sin(theta), omegaMat)), math.multiply(math.subtract(1, math.cos(theta)), math.multiply(omegaMat, omegaMat)))
    }
  }

  static RpToTrans = (R, p) => {
    return math.concat(math.concat(R, math.reshape(p, [3, 1]), 1), math.matrix([[0, 0, 0, 1]]), 0)
  }

  static TransToRp = (T) => {
    const R = T.subset(math.index(math.range(0, 3), math.range(0, 3)))
    const p = math.squeeze(T.subset(math.index(math.range(0, 3), [3])))
    return {
      R,
      p
    }
  }

  static TransInv = (T) => {
    const {R, p} = this.TransToRp(T)
    const Rt = this.rotInv(R)
    return math.concat(math.concat(Rt, math.multiply(math.multiply(Rt, math.reshape(p, [3, 1])), -1), 1), math.matrix([[0, 0, 0, 1]]), 0)
  }

  static VecTose3 = (v) => {
    return math.concat(math.concat(this.VecToso3(math.subset(v, math.index([0, 1, 2]))), math.reshape(math.subset(v, math.index([3, 4, 5])), [3, 1]), 1), math.zeros([1, 4]), 0)
  }

  static se3ToVec = (se3mat) => {
    return math.matrix([se3mat.get([2, 1]), se3mat.get([0, 2]), se3mat.get([1, 0]),
      se3mat.get([0, 3]), se3mat.get([1, 3]), se3mat.get([2, 3])])
  }

  static Adjoint = (T) => {
    const {R, p} = this.TransToRp(T)
    return math.concat(math.concat(R, math.zeros(3, 3), 1), math.concat(math.multiply(this.VecToso3(p), R), R, 1), 0)
  }

  static ScrewToAxis = (q, s, h) => {
    return math.concat(s, math.add(math.cross(q, s), math.multiply(h, s)), 0)
  }

  static AxisAng6 = (expc6) => {
    let theta = math.norm(math.subset(expc6, math.index([0, 1, 2])))
    if (this.nearZero(theta)) {
      theta = math.norm(math.subset(expc6, math.index([3, 4, 5])))
    }
    const S = math.divide(expc6, theta)
    return {
      S,
      theta
    }
  }

  static MatrixExp6 = (se3mat) => {
    se3mat = math.matrix(se3mat)
    const omgTheta = this.so3ToVec(math.subset(se3mat, math.index([0, 1, 2], [0, 1, 2])))
    if (this.nearZero(math.norm(omgTheta))) {
      return math.concat(math.concat(math.identity(3), math.subset(se3mat, math.index([0, 1, 2], 3)), 1), math.matrix([[0, 0, 0, 1]]), 0)
    } else {
      const {theta} = this.AxisAng3(omgTheta)
      const omgmat = math.divide(math.subset(se3mat, math.index([0, 1, 2], [0, 1, 2])), theta)
      return math.concat(math.concat(this.MatrixExp3(math.subset(se3mat, math.index([0, 1, 2], [0, 1, 2]))),
          math.multiply(math.add(math.add(math.multiply(math.identity(3), theta), math.multiply(1 - math.cos(theta), omgmat)), math.multiply(theta - math.sin(theta), math.multiply(omgmat, omgmat))), math.divide(math.subset(se3mat, math.index([0, 1, 2], 3)), theta)), 1),
        math.matrix([[0, 0, 0, 1]]), 0)
    }
  }

  static MatrixLog6 = (T) => {
    const {R, p} = this.TransToRp(T)
    const omgmat = this.MatrixLog3(R)
    if (this.nearZero(math.norm(math.squeeze(omgmat)))) {
      return math.concat(math.concat(math.zeros([3, 3]), math.subset(T, math.index([0, 1, 2], 3)), 1), math.zeros([1, 4]), 0)
    } else {
      const theta = math.acos((math.trace(R) - 1) / 2.0)
      return math.concat(math.concat(omgmat, math.multiply(math.add(math.subtract(math.identity(3), math.divide(omgmat, 2.0)), math.multiply((1.0 / theta - 1.0 / math.tan(theta / 2.0) / 2) / theta, math.multiply(omgmat, omgmat))), math.subset(T, math.index([0, 1, 2], 3))), 1), math.matrix([[0, 0, 0, 0]]), 0)
    }
  }

  static MatrixLog3 = (R) => {
    const acosInput = (math.trace(R) - 1) / 2.0
    let omg = 0.0
    if (acosInput >= 1) {
      return math.matrix(math.zeros([3, 3]))
    } else if (acosInput <= -1) {
      if (!this.nearZero(1 + R.get([2, 2]))) {
        omg = math.multiply(1.0 / math.sqrt(2 * (1 + R.get([2, 2]))), math.matrix([R.get([0, 2]), R.get([1, 2]), 1 + R.get([2, 2])]))
      } else if (!this.nearZero(1 + R.get([1, 1]))) {
        omg = math.multiply(1.0 / math.sqrt(2 * (1 + R.get([1, 1]))), math.matrix([R.get([0, 1], 1 + R.get([1, 1]), R.get([2, 1]))]))
      } else {
        omg = math.multiply(1.0 / math.sqrt(2 * (1 + R.get([0, 0]))), math.matrix([1 + R.get([0, 0]), R.get([1, 0]), R.get([2, 0])]))
      }
      return this.VecToso3(math.multiply(math.pi, omg))
    } else {
      const theta = math.acos(acosInput)
      return math.multiply(theta / 2.0 / math.sin(theta), math.subtract(R, math.transpose(R)))
    }
  }

  static QuaternionToR = (q) => {
    const x2 = math.pow(q[1], 2)
    const y2 = math.pow(q[2], 2)
    const z2 = math.pow(q[3], 2)

    const wx = q[0] * q[1]
    const wy = q[0] * q[2]
    const wz = q[0] * q[3]
    const xy = q[1] * q[2]
    const xz = q[1] * q[3]
    const yz = q[2] * q[3]

    return math.matrix([
      [1 - 2 * (y2 + z2), 2 * (xy - wz), 2 * (xz + wy)],
      [2 * (xy + wz), 1 - 2 * (x2 + z2), 2 * (yz - wx)],
      [2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (x2 + y2)]
    ])
  }

  static RToQuaternion = (R) => {
    const tr = math.trace(R)
    let w, x, y, z
    if (tr > 0) {
      const sqtrp1 = math.sqrt(tr + 1.0)
      w = 0.5 * sqtrp1
      x = (R.get([2, 1]) - R.get([1, 2])) / (2.0 * sqtrp1)
      y = (R.get([0, 2]) - R.get([2, 0])) / (2.0 * sqtrp1)
      z = (R.get([1, 0]) - R.get([0, 1])) / (2.0 * sqtrp1)
    } else {
      const d = math.diag(R)
      if ((d.get([1]) > d.get([0])) && (d.get([1]) > d.get([2]))) {
        let sqdip1 = math.sqrt(d.get([1]) - d.get([0]) - d.get([2]) + 1.0)
        y = 0.5 * sqdip1

        if (sqdip1 !== 0) {
          sqdip1 = 0.5 / sqdip1
        }

        w = (R.get([0, 2]) - R.get([2, 0])) * sqdip1
        x = (R.get([1, 0]) + R.get([0, 1])) * sqdip1
        z = (R.get([2, 1]) + R.get([1, 2])) * sqdip1
      } else if (d.get([2]) > d.get([0])) {
        let sqdip1 = math.sqrt(d.get([2]) - d.get([0]) - d.get([1]) + 1.0)
        z = 0.5 * sqdip1

        if (sqdip1 !== 0) {
          sqdip1 = 0.5 / sqdip1
        }

        w = (R.get([1, 0]) - R.get([0, 1])) * sqdip1
        x = (R.get([0, 2]) + R.get([2, 0])) * sqdip1
        y = (R.get([2, 1]) + R.get([1, 2])) * sqdip1
      } else {
        let sqdip1 = math.sqrt(d.get([0]) - d.get([1]) - d.get([2]) + 1.0)
        x = 0.5 * sqdip1

        if (sqdip1 !== 0) {
          sqdip1 = 0.5 / sqdip1
        }

        w = (R.get([2, 1]) - R.get([1, 2])) * sqdip1
        y = (R.get([1, 0]) + R.get([0, 1])) * sqdip1
        z = (R.get([0, 2]) + R.get([2, 0])) * sqdip1
      }
    }
    if (w < 0) {
      w = -w
      x = -x
      y = -y
      z = -z
    }
    return [w, x, y, z]
  }

  static QuaternionTorpy = (q) => {
    return this.RTorpy(this.QuaternionToR(q))
  }

  static rpyToQuaternion = (phi, theta, psi) => {
    return this.RToQuaternion(this.rpyToR(phi, theta, psi))
  }

  static RToAxisAngle = (R) => {
    const {omgHat, theta} = this.AxisAng3(this.so3ToVec(math.matrix(this.MatrixLog3(R))))
    return {
      axis: omgHat.valueOf(),
      theta
    }
  }

  static AxisAngleToR = (axis, theta) => {
    return this.MatrixExp3(this.VecToso3(math.multiply(theta, math.matrix(axis))))
  }

  static rpyToAxisAngle = (phi, theta, psi) => {
    return this.RToAxisAngle(this.rpyToR(phi  , theta, psi))
  }
}

export {Transformation}
