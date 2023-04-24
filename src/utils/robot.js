import * as math from "mathjs"
import * as transformation from "./transformation"

const robotType = {
  INDUSTRY: 1,
  COOPERATION: 2
}

const getTransformationMatrixMDH = (alpha, a, d, theta, q) => {
  theta += q
  return math.matrix([
    [Math.cos(theta), -Math.sin(theta), 0, a],
    [Math.sin(theta) * Math.cos(alpha), Math.cos(theta) * Math.cos(alpha), -Math.sin(alpha), -d * Math.sin(alpha)],
    [Math.sin(theta) * Math.sin(alpha), Math.cos(theta) * Math.sin(alpha), Math.cos(alpha), d * Math.cos(alpha)],
    [0, 0, 0, 1]
  ])
}

const fKine = (dhPara, Q) => {
  let T = math.identity(4);
  for (let index = 0; index < Q.length; index++) {
    T = math.multiply(T, getTransformationMatrixMDH(dhPara.Alpha[index], dhPara.A[index], dhPara.D[index], dhPara.Theta[index], Q[index]))
  }
  return T
}

const iKine8 = (dhPara, T) => {
  const nx = T.get([0, 0])
  const ny = T.get([1, 0])
  const nz = T.get([2, 0])
  const ox = T.get([0, 1])
  const oy = T.get([1, 1])
  const oz = T.get([2, 1])
  const ax = T.get([0, 2])
  const ay = T.get([1, 2])
  const az = T.get([2, 2])
  const px = T.get([0, 3])
  const py = T.get([1, 3])
  const pz = T.get([2, 3])

  const Px = px - dhPara.D[5] * ax
  const Py = py - dhPara.D[5] * ay
  const Pz = pz - dhPara.D[5] * az - dhPara.D[0]

  let theta1_1, theta1_2
  if (transformation.nearZero(Math.pow(Px, 2) + Math.pow(Py, 2))) {
    theta1_1 = 0
    theta1_2 = 0
  } else {
    theta1_1 = Math.atan2(dhPara.D[2], Math.sqrt(Math.pow(Px, 2) +  Math.pow(Py, 2) - Math.pow(dhPara.D[2], 2))) + Math.atan2(Py, Px)
    theta1_2 = Math.atan2(dhPara.D[2], -Math.sqrt(Math.pow(Px, 2) +  Math.pow(Py, 2) - Math.pow(dhPara.D[2], 2))) + Math.atan2(Py, Px)
  }

  const Theta1 = []
  for (let i = 0; i < 4; i++) {
    Theta1.push(theta1_1)
  }
  for (let i = 0; i < 4; i++) {
    Theta1.push(theta1_2)
  }

  const Theta3 = []
  for (let i = 0; i < 2; i++) {
    let k3 = (Math.pow(dhPara.A[1] - Math.cos(Theta1[i*4]) * Px - Math.sin(Theta1[i*4]) * Py, 2) + Math.pow(Pz, 2) - (Math.pow(dhPara.A[3], 2) + Math.pow(dhPara.D[3], 2) + Math.pow(dhPara.A[2], 2))) / (2 * dhPara.A[2])
    const theta3_1 = Math.atan2(k3, Math.sqrt(Math.pow(dhPara.A[3], 2) + Math.pow(dhPara.D[3], 2) - Math.pow(k3, 2))) - Math.atan2(dhPara.A[3], dhPara.D[3]);
    for (let j = 0; j < 2; j++) {
      Theta3.push(theta3_1)
    }
    const theta3_2 = Math.atan2(k3, -Math.sqrt(Math.pow(dhPara.A[3], 2) + Math.pow(dhPara.D[3], 2) - Math.pow(k3, 2))) - Math.atan2(dhPara.A[3], dhPara.D[3]);
    for (let j = 0; j < 2; j++) {
      Theta3.push(theta3_2)
    }
  }

  const Theta2 = []
  for (let i = 0; i < 2; i++) {
    const g = Math.cos(Theta1[i*4]) * Px + Math.sin(Theta1[i*4]) * Py - dhPara.A[1]
    for (let j = 0; j < 2; j++) {
      const e = dhPara.A[3] * Math.cos(Theta3[i*4 + j*2]) + dhPara.D[3] * Math.sin(Theta3[i*4 + j*2]) + dhPara.A[2]
      const f = dhPara.A[3] * Math.sin(Theta3[i*4 + j*2]) - dhPara.D[3] * Math.cos(Theta3[i*4 + j*2])

      if (Math.pow(g, 2) + Math.pow(Pz, 2) > 0) {
        const theta2 = Math.atan2(Pz * e - g * f, g * e + Pz * f) - Math.PI / 2
        for (let k = 0; k < 2; k++) {
          Theta2.push(theta2)
        }
      } else {
        for (let k = 0; k < 2; k++) {
          Theta2.push(0)
        }
      }
    }
  }

  const Theta5 = []
  const Theta4 = []
  const Theta6 = []
  for (let i = 0; i < 4; i++) {
    const T01 = getTransformationMatrixMDH(dhPara.Alpha[0], dhPara.A[0], dhPara.D[0], 0, Theta1[i*2])
    const T12 = getTransformationMatrixMDH(dhPara.Alpha[1], dhPara.A[1], dhPara.D[1], dhPara.Theta[1], Theta2[i*2])
    const T23 = getTransformationMatrixMDH(dhPara.Alpha[2], dhPara.A[2], dhPara.D[2], 0, Theta3[i*2])

    const T03 = math.multiply(math.multiply(T01, T12), T23)
    const T36 = math.multiply(math.inv(T03), T)

    const theta5_1 = Math.acos(-T36.get([1, 2]))
    const theta5_2 = -theta5_1
    Theta5.push(theta5_1)
    Theta5.push(theta5_2)
    if (transformation.nearZero(theta5_1)) {
      for (let j = 0; j < 2; j++) {
        Theta4.push(0)
        Theta6.push(0)
      }
    } else {
      for (let j = 0; j < 2; j++) {
        const theta4 = Math.atan2(T36.get([2, 2]) / Math.sin(Theta5[i*2 + j]), T36.get([0, 2]) / Math.sin(Theta5[i*2 + j]))
        Theta4.push(theta4)
        const theta6 = Math.atan2(-T36.get([1, 1]) / Math.sin(Theta5[i*2 + j]), T36.get([1, 0]) / Math.sin(Theta5[i*2 + j]))
        Theta6.push(theta6)
      }
    }
  }

  return [Theta1, Theta2, Theta3, Theta4, Theta5, Theta6]
}

const iKine6s = (dhPara, T, q) => {
  const nx = T.get([0, 0])
  const ny = T.get([1, 0])
  const nz = T.get([2, 0])
  const ox = T.get([0, 1])
  const oy = T.get([1, 1])
  const oz = T.get([2, 1])
  const ax = T.get([0, 2])
  const ay = T.get([1, 2])
  const az = T.get([2, 2])
  const px = T.get([0, 3])
  const py = T.get([1, 3])
  const pz = T.get([2, 3])

  const Px = px - dhPara.D[5] * ax
  const Py = py - dhPara.D[5] * ay
  const Pz = pz - dhPara.D[5] * az - dhPara.D[0]

  let theta1_1, theta1_2, theta1, theta2, theta3, theta4, theta5, theta6
  if (transformation.nearZero(transformation.norm([Px, Py]))) {
    theta1_1 = q[0]
    theta1_2 = q[0]
  } else {
    theta1_1 = Math.atan2(dhPara.D[2], Math.sqrt(Math.pow(Px, 2) +  Math.pow(Py, 2) - Math.pow(dhPara.D[2], 2))) + Math.atan2(Py, Px)
    theta1_2 = Math.atan2(dhPara.D[2], -Math.sqrt(Math.pow(Px, 2) +  Math.pow(Py, 2) - Math.pow(dhPara.D[2], 2))) + Math.atan2(Py, Px)
  }

  if (math.abs(theta1_1 - q[0]) <= math.abs(theta1_2 - q[0])) {
    theta1 = theta1_1
  } else {
    theta1 = theta1_2
  }

  let k3 = (Math.pow(dhPara.A[1] - Math.cos(theta1) * Px - Math.sin(theta1) * Py, 2) + Math.pow(Pz, 2) - (Math.pow(dhPara.A[3], 2) + Math.pow(dhPara.D[3], 2) + Math.pow(dhPara.A[2], 2))) / (2 * dhPara.A[2])
  const theta3_1 = Math.atan2(k3, Math.sqrt(Math.pow(dhPara.A[3], 2) + Math.pow(dhPara.D[3], 2) - Math.pow(k3, 2))) - Math.atan2(dhPara.A[3], dhPara.D[3]);
  const theta3_2 = Math.atan2(k3, -Math.sqrt(Math.pow(dhPara.A[3], 2) + Math.pow(dhPara.D[3], 2) - Math.pow(k3, 2))) - Math.atan2(dhPara.A[3], dhPara.D[3]);
  if (math.abs(theta3_1 - q[2]) <= math.abs(theta3_2 - q[2])) {
    theta3 = theta3_1
  } else {
    theta3 = theta3_2
  }

  const g = Math.cos(theta1) * Px + Math.sin(theta1) * Py - dhPara.A[1]
  const e = dhPara.A[3] * Math.cos(theta3) + dhPara.D[3] * Math.sin(theta3) + dhPara.A[2]
  const f = dhPara.A[3] * Math.sin(theta3) - dhPara.D[3] * Math.cos(theta3)

  if (math.pow(g, 2) + math.pow(pz, 2) > 0) {
    theta2 = Math.atan2(Pz * e - g * f, g * e + Pz * f) - Math.PI / 2
  } else {
    theta2 = 0
  }

  const T01 = getTransformationMatrixMDH(dhPara.Alpha[0], dhPara.A[0], dhPara.D[0], 0, theta1)
  const T12 = getTransformationMatrixMDH(dhPara.Alpha[1], dhPara.A[1], dhPara.D[1], dhPara.Theta[1], theta2)
  const T23 = getTransformationMatrixMDH(dhPara.Alpha[2], dhPara.A[2], dhPara.D[2], 0, theta3)

  const T03 = math.multiply(math.multiply(T01, T12), T23)
  const T36 = math.multiply(math.inv(T03), T)

  const theta5_1 = Math.acos(-T36.get([1, 2]))
  const theta5_2 = - theta5_1

  if (transformation.nearZero(theta5_1)) {
    theta4 = q[3]
    theta6 = q[5]
  } else {
    if (math.abs(theta5_1 - q[4]) <= math.abs(theta5_2 - q[4])) {
      theta5 = theta5_1
    } else {
      theta5 = theta5_2
    }
    theta4 = Math.atan2(T36.get([2, 2]) / Math.sin(theta5), T36.get([0, 2]) / Math.sin(theta5))
    theta6 = Math.atan2(-T36.get([1, 1]) / Math.sin(theta5), T36.get([1, 0]) / Math.sin(theta5))
  }

  return [theta1, theta2, theta3, theta4, theta5, theta6]
}

const getJacobian = (dHPara, q) => {
  const dof = q.length
  const TArray = []
  for (let i = 0; i < dof; i++) {
    TArray.push(getTransformationMatrixMDH(dHPara.Alpha[i], dHPara.A[i], dHPara.D[i], dHPara.Theta[i], q[i]))
  }

  const wArray = []
  const RArray = []
  let T;
  T = math.identity(4)
  for (let i = 0; i < dof; i++) {
    T = math.multiply(T, TArray[i])
    wArray.push(T.subset(math.index([0, 1, 2], 2)))
    RArray.push(T.subset(math.index([0, 1, 2], [0, 1, 2])))
  }

  T = math.identity(4)
  const vArray = []
  for (let i = dof - 1; i > -1; i--) {
    vArray.push(math.transpose(math.cross(wArray[i], math.multiply(RArray[i], T.subset(math.index([0, 1, 2], 3))))))
    T = math.multiply(TArray[i], T)
  }

  vArray.reverse()

  return math.concat(math.concat(...vArray), math.concat(...wArray), 0)
}

export {robotType, getTransformationMatrixMDH, fKine, iKine8, iKine6s, getJacobian}
