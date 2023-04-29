import * as math from 'mathjs'

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

  static normalize = (v) => {
    return math.divide(v, math.norm(math.squeeze(v)))
  }

  static rotInv = (R) => {
    return math.transpose(R)
  }

  static vecToso3 = (omega) => {
    return math.matrix([
      [0, -omega.get([2]), omega.get([1])],
      [omega.get([2]), 0, -omega.get([0])],
      [-omega.get([1]), omega.get([0]), 0]
    ])
  }

  static so3Tovec = (so3mat) => {
    return math.matrix([so3mat.get([2, 1]), so3mat.get([0, 2]), so3mat.get([1, 0])])
  }

  static axisAng3 = (expc3) => {
    return {
      axis: Transformation.normalize(expc3),
      theta: math.norm(math.squeeze(expc3))
    }
  }

  static matrixExp3 = (so3mat) => {
    const omegaTheta = Transformation.so3Tovec(so3mat)
    if (nearZero(math.norm(omegaTheta))) {
      return math.identity(3)
    } else {
      const {theta} = Transformation.axisAng3(omegaTheta)
      const omegaMat = math.divide(so3mat, theta)
      return math.add(math.add(math.identity(3), math.multiply(math.sin(theta), omegaMat)), math.multiply(math.subtract(1, math.cos(theta)), math.multiply(omegaMat, omegaMat)))
    }
  }
}

const axisAng3 = (expc3) => {
  const theta = math.norm(expc3)
  let omgHat = math.zeros(3, 1)
  let maxIndex = 0
  expc3.forEach((value, index, array) => {
    if (math.abs(value) > array[maxIndex]) {
      maxIndex = index
    }
  })
  if (nearZero(theta)) {
    omgHat.set([maxIndex, 0], math.sign(expc3[maxIndex]))
  } else {
    omgHat = math.divide(expc3, theta)
  }
  return {omgHat, theta}
}

const euclToHomPoint2D = (p) => {
  return math.matrix([
    [p[0]],
    [p[1]],
    [1]
  ])
}

const euclToHomPoint3D = (p) => {
  return math.matrix([
    [p[0]],
    [p[1]],
    [p[2]],
    [1]
  ])
}

const rotX = (theta) => {
  return math.matrix([
    [1, 0, 0],
    [0, math.cos(theta), -math.sin(theta)],
    [0, math.sin(theta), math.cos(theta)]
  ])
}

const rotY = (theta) => {
    return math.matrix([
    [math.cos(theta), 0, math.sin(theta)],
    [0, 1, 0],
    [-math.sin(theta), 0, math.cos(theta)]
  ])
}

const rotZ = (theta) => {
    return math.matrix([
    [math.cos(theta), -math.sin(theta), 0],
    [math.sin(theta), math.cos(theta), 0],
    [0, 0, 1]
  ])
}

const rpy2R = (phi, theta, psi) => {
    return math.multiply(math.multiply(rotZ(psi), rotY(theta)), rotX(phi))
}

const R2rpy = (R) => {
  let phi, theta, psi;
  if (nearZero(Math.abs(R.valueOf()[2][0]) - 1)) {
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

const Tr2xyzrpy = (T) => {
  const R = T.subset(math.index([0, 1, 2], [0, 1, 2]))
  const px = T.get([0, 3])
  const py = T.get([1, 3])
  const pz = T.get([2, 3])
  const rpy = R2rpy(R)
  return [px, py, pz, ...rpy]
}

const t2Tr = (px, py, pz) => {
  const T = math.identity(4)
  T.subset(math.index([0, 1, 2], 3), [px, py, pz])
  return T
}

const R2Tr = (R) => {
  const T = math.identity(4)
  // math.subset(T, math.index([0, 1, 2], [0, 1, 2]), R)
  T.subset(math.index([0, 1, 2], [0, 1, 2]), R)
  return T
}

const xyzrpy2Tr = (x) => {
  const R = rpy2R(x[3], x[4], x[5])
  const t = t2Tr(x[0], x[1], x[2])
  const TR = R2Tr(R)
  return math.multiply(t, TR)
}

const nearZero = (number) => {
  return Math.abs(number) < 1e-6
}

const norm = (array) => {
  let sum = 0;
  array.forEach(value => {
    sum += Math.pow(value, 2)
  })
  return Math.sqrt(sum)
}

// Quaternion
const Quaternion2R = (q) => {
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

const R2Quaternion = (R) => {
  const r11 = R.get([0, 0])
  const r22 = R.get([1, 1])
  const r33 = R.get([2, 2])
  const w = math.sqrt(math.trace(R) + 1) / 2
  const x = math.sign(R.get([2, 1]) - R.get([1, 2])) * math.sqrt(r11 - r22 - r33 + 1) / 2
  const y = math.sign(R.get([0, 2]) - R.get([2, 0])) * math.sqrt(-r11 + r22 - r33 + 1) / 2
  const z = math.sign(R.get([1, 0]) - R.get([0, 1])) * math.sqrt(-r11 - r22 + r33 + 1) / 2
  return [w, x, y, z]
}

// Axis-Angle
const AxisAngle2R = (axis, theta) => {
  const kx = axis[0]
  const ky = axis[1]
  const kz = axis[2]

  const kx2 = math.pow(kx, 2)
  const kxy = kx * ky
  const kxz = kx * kz
  const ky2 = math.pow(ky, 2)
  const kyz = ky * kz
  const kz2 = math.pow(kz, 2)

  const st = math.sin(theta)
  const ct = math.cos(theta)
  const vt = 1 - ct
  const R = math.matrix([
    [kx2 * vt + ct, kxy * vt - kz * st, kxz * vt + ky * st],
    [kxy * vt + kz * st, ky2 * vt + ct, kyz * vt - kx * st],
    [kxz * vt - ky * st, kyz * vt + kx * st, kz2 * vt + ct]
  ])
  return R
}

const R2AxisAngle = (R) => {
  let theta = math.acos((math.trace(R) - 1) / 2)
  let axis = [0, 0, 0]
  let st = sin(theta)
  if (nearZero(st)) {

  } else {
    axis[0] = (R.get(2, 1) - R.get(1, 2)) / (2 * st)
    axis[1] = (R.get(0, 2) - R.get(2, 0)) / (2 * st)
    axis[2] = (R.get(1, 0) - R.get(0, 1)) / (2 * st)
  }
}

export {euclToHomPoint2D, euclToHomPoint3D, rotX, rotY, rotZ, rpy2R, R2rpy, Tr2xyzrpy, t2Tr, R2Tr, xyzrpy2Tr, nearZero, norm}
export {Quaternion2R, R2Quaternion}
export {axisAng3}
export {AxisAngle, Transformation}
