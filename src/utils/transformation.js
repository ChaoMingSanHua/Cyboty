import * as math from 'mathjs'

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

export {rotX, rotY, rotZ, rpy2R, R2rpy, Tr2xyzrpy, t2Tr, R2Tr, xyzrpy2Tr, nearZero, norm}
