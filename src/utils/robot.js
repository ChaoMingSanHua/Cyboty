import * as math from "mathjs"
import {Transformation} from "./transformation"

const RobotTypeEnum = {
  INDUSTRY: 0,
  COOPERATION: 1
}

const OverheadEnum = {
  FRONT: 0,
  BACK: 1
}

const InlineEnum = {
  UP: 0,
  DOWN: 1
}

const WristEnum = {
  FLIP: 0,
  NO_FLIP: 1
}

const JointTypeEnum = {
  PRISMATIC: 0,
  REVOLUTE: 1
}

class Robot {
  #dof
  #Alphas
  #As
  #Ds
  #Thetas
  #Sigmas
  #jConfig
  constructor() {
    this.#jConfig = {
      overhead: OverheadEnum.FRONT,
      inline: InlineEnum.UP,
      wrist: WristEnum.FLIP
    }
  }

  get getDof() {
    return this.#dof
  }

  get getMDHParameter() {
    return {
      Alphas: this.#Alphas,
      As: this.#As,
      Ds: this.#Ds,
      Thetas: this.#Thetas,
      Sigmas: this.#Sigmas
    }
  }

  get getSDHParameter() {
    const Alphas = []
    const As = []

    for (let i = 0; i < this.#dof; i++) {
      if (i > 0) {
        Alphas.push(this.#Alphas[i])
        As.push(this.#As[i])
      }
    }
    Alphas.push(0)
    As.push(0)

    return {
      Thetas: this.#Thetas,
      Ds: this.#Ds,
      As,
      Alphas,
      Sigmas: this.#Sigmas
    }
  }

  configRobot = (robotPara) => {
    this.robotType = robotPara.robotType
    const {linkLengths} = robotPara
    switch (this.robotType) {
      case RobotTypeEnum.INDUSTRY:
        this.#dof = 6
        this.#Alphas = [0, Math.PI / 2, 0, Math.PI / 2, -Math.PI / 2, Math.PI / 2]
        this.#As = [0, linkLengths[1], linkLengths[2], linkLengths[4], 0, 0]
        this.#Ds = [linkLengths[0], 0, linkLengths[3], linkLengths[5], 0, linkLengths[6]]
        this.#Thetas = [0, Math.PI / 2, 0, 0, 0, 0]
        this.#Sigmas = [JointTypeEnum.REVOLUTE, JointTypeEnum.REVOLUTE, JointTypeEnum.REVOLUTE,
          JointTypeEnum.REVOLUTE, JointTypeEnum.REVOLUTE, JointTypeEnum.REVOLUTE]
        break
      case RobotTypeEnum.COOPERATION:
        this.#dof = 6
        this.#Alphas = [0,  -Math.PI / 2, 0.0, 0.0, Math.PI / 2, -Math.PI / 2]
        this.#As = [0, 0, linkLengths[1], linkLengths[2], 0, 0]
        this.#Ds = [linkLengths[0], 0, 0, linkLengths[3], linkLengths[4], linkLengths[5]]
        this.#Thetas = [0, -Math.PI / 2, 0, Math.PI / 2, 0, 0]
        this.#Sigmas = [JointTypeEnum.REVOLUTE, JointTypeEnum.REVOLUTE, JointTypeEnum.REVOLUTE,
          JointTypeEnum.REVOLUTE, JointTypeEnum.REVOLUTE, JointTypeEnum.REVOLUTE]
        break
      default:
        this.#dof = 0
        this.#Alphas = null
        this.#As = null
        this.#Ds = null
        this.#Thetas = null
        this.#Sigmas = null
        break
    }
    this.#jConfig = {
      overhead: OverheadEnum.FRONT,
      inline: InlineEnum.UP,
      wrist: WristEnum.FLIP
    }
  }

  fKine = (Qs) => {
    let T = math.identity(4)
    for (let i = 0; i < this.#dof; i++) {
      T = math.multiply(T, getTransformationMatrixMDH(this.#Alphas[i], this.#As[i], this.#Ds[i], this.#Thetas[i], this.#Sigmas[i], Qs[i]))
    }
    return T
  }

  iKineAll = (T) => {
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

    const Px = px - this.#Ds[5] * ax
    const Py = py - this.#Ds[5] * ay
    const Pz = pz - this.#Ds[5] * az - this.#Ds[0]

    let theta1_1, theta1_2
    if (Transformation.nearZero(Math.pow(Px, 2) + Math.pow(Py, 2))) {
      theta1_1 = 0
      theta1_2 = 0
    } else {
      theta1_1 = Math.atan2(this.#Ds[2], Math.sqrt(Math.pow(Px, 2) +  Math.pow(Py, 2) - Math.pow(this.#Ds[2], 2))) + Math.atan2(Py, Px)
      theta1_2 = Math.atan2(this.#Ds[2], -Math.sqrt(Math.pow(Px, 2) +  Math.pow(Py, 2) - Math.pow(this.#Ds[2], 2))) + Math.atan2(Py, Px)
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
      let k3 = (Math.pow(this.#As[1] - Math.cos(Theta1[i*4]) * Px - Math.sin(Theta1[i*4]) * Py, 2) + Math.pow(Pz, 2) - (Math.pow(this.#As[3], 2) + Math.pow(this.#Ds[3], 2) + Math.pow(this.#As[2], 2))) / (2 * this.#As[2])
      const theta3_1 = Math.atan2(k3, Math.sqrt(Math.pow(this.#As[3], 2) + Math.pow(this.#Ds[3], 2) - Math.pow(k3, 2))) - Math.atan2(this.#As[3], this.#Ds[3]);
      for (let j = 0; j < 2; j++) {
        Theta3.push(theta3_1)
      }
      const theta3_2 = Math.atan2(k3, -Math.sqrt(Math.pow(this.#As[3], 2) + Math.pow(this.#Ds[3], 2) - Math.pow(k3, 2))) - Math.atan2(this.#As[3], this.#Ds[3]);
      for (let j = 0; j < 2; j++) {
        Theta3.push(theta3_2)
      }
    }

    const Theta2 = []
    for (let i = 0; i < 2; i++) {
      const g = Math.cos(Theta1[i*4]) * Px + Math.sin(Theta1[i*4]) * Py - this.#As[1]
      for (let j = 0; j < 2; j++) {
        const e = this.#As[3] * Math.cos(Theta3[i*4 + j*2]) + this.#Ds[3] * Math.sin(Theta3[i*4 + j*2]) + this.#As[2]
        const f = this.#As[3] * Math.sin(Theta3[i*4 + j*2]) - this.#Ds[3] * Math.cos(Theta3[i*4 + j*2])

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
      const T01 = getTransformationMatrixMDH(this.#Alphas[0], this.#As[0], this.#Ds[0], 0, this.#Sigmas[0], Theta1[i*2])
      const T12 = getTransformationMatrixMDH(this.#Alphas[1], this.#As[1], this.#Ds[1], this.#Thetas[1], this.#Sigmas[1], Theta2[i*2])
      const T23 = getTransformationMatrixMDH(this.#Alphas[2], this.#As[2], this.#Ds[2], 0, this.#Sigmas[2], Theta3[i*2])

      const T03 = math.multiply(math.multiply(T01, T12), T23)
      const T36 = math.multiply(math.inv(T03), T)

      const theta5_1 = Math.acos(-T36.get([1, 2]))
      const theta5_2 = -theta5_1
      Theta5.push(theta5_1)
      Theta5.push(theta5_2)
      if (Transformation.nearZero(theta5_1)) {
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

  iKine6s = (T, q) => {
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


    let theta1_1, theta1_2, theta1, theta2, theta3, theta3_1, theta3_2, theta4, theta5, theta5_1, theta5_2, theta6
    let T01
    switch (this.robotType) {
      case RobotTypeEnum.INDUSTRY:
        const Px = px - this.#Ds[5] * ax
        const Py = py - this.#Ds[5] * ay
        const Pz = pz - this.#Ds[5] * az - this.#Ds[0]

        // let theta1_1, theta1_2, theta1, theta2, theta3, theta4, theta5, theta6
        if (Transformation.nearZero(Transformation.norm([Px, Py]))) {
          theta1_1 = q[0]
          theta1_2 = q[0]
        } else {
          theta1_1 = Math.atan2(this.#Ds[2], Math.sqrt(Math.pow(Px, 2) +  Math.pow(Py, 2) - Math.pow(this.#Ds[2], 2))) + Math.atan2(Py, Px)
          theta1_2 = Math.atan2(this.#Ds[2], -Math.sqrt(Math.pow(Px, 2) +  Math.pow(Py, 2) - Math.pow(this.#Ds[2], 2))) + Math.atan2(Py, Px)
        }

        if (math.abs(theta1_1 - q[0]) <= math.abs(theta1_2 - q[0])) {
          theta1 = theta1_1
        } else {
          theta1 = theta1_2
        }

        let k3 = (Math.pow(this.#As[1] - Math.cos(theta1) * Px - Math.sin(theta1) * Py, 2) + Math.pow(Pz, 2) - (Math.pow(this.#As[3], 2) + Math.pow(this.#Ds[3], 2) + Math.pow(this.#As[2], 2))) / (2 * this.#As[2])
        theta3_1 = Math.atan2(k3, Math.sqrt(Math.pow(this.#As[3], 2) + Math.pow(this.#Ds[3], 2) - Math.pow(k3, 2))) - Math.atan2(this.#As[3], this.#Ds[3]);
        theta3_2 = Math.atan2(k3, -Math.sqrt(Math.pow(this.#As[3], 2) + Math.pow(this.#Ds[3], 2) - Math.pow(k3, 2))) - Math.atan2(this.#As[3], this.#Ds[3]);
        if (math.abs(theta3_1 - q[2]) <= math.abs(theta3_2 - q[2])) {
          theta3 = theta3_1
        } else {
          theta3 = theta3_2
        }

        const g = Math.cos(theta1) * Px + Math.sin(theta1) * Py - this.#As[1]
        const e = this.#As[3] * Math.cos(theta3) + this.#Ds[3] * Math.sin(theta3) + this.#As[2]
        const f = this.#As[3] * Math.sin(theta3) - this.#Ds[3] * Math.cos(theta3)

        if (math.pow(g, 2) + math.pow(pz, 2) > 0) {
          // theta2 = Math.atan2(Pz * e - g * f, g * e + Pz * f) - Math.PI / 2
          theta2 = Math.atan2(Pz * e - g * f, g * e + Pz * f)
        } else {
          // theta2 = 0
          theta2 = this.#Thetas[1]
        }

        T01 = getTransformationMatrixMDH(this.#Alphas[0], this.#As[0], this.#Ds[0], 0, this.#Sigmas[0], theta1)
        const T12 = getTransformationMatrixMDH(this.#Alphas[1], this.#As[1], this.#Ds[1], 0, this.#Sigmas[1], theta2)
        const T23 = getTransformationMatrixMDH(this.#Alphas[2], this.#As[2], this.#Ds[2], 0, this.#Sigmas[2], theta3)

        const T03 = math.multiply(math.multiply(T01, T12), T23)
        const T36 = math.multiply(math.inv(T03), T)

        theta5_1 = Math.acos(-T36.get([1, 2]))
        theta5_2 = - theta5_1

        if (Transformation.nearZero(theta5_1)) {
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

        break;
      case RobotTypeEnum.COOPERATION:
        const a3 = this.#As[2]
        const a4 = this.#As[3]

        const d1 = this.#Ds[0]
        const d3 = this.#Ds[2]
        const d4 = this.#Ds[3]
        const d6 = this.#Ds[5]

        const m = ay * d6 - py
        const n = ax * d6 - px


        // solve theta1
        // let theta1 = 0.0
        theta1_1 = Math.atan2(m, n) - Math.atan2(-d4, -Math.sqrt(Math.pow(m, 2) + Math.pow(n, 2) - Math.pow(d4, 2)))
        theta1_2 = Math.atan2(m, n) - Math.atan2(-d4, Math.sqrt(Math.pow(m, 2) + Math.pow(n, 2) - Math.pow(d4, 2)))
        if (Math.abs(theta1_1 - q[0]) <= Math.abs(theta1_2 - q[0])) {
          theta1 = theta1_1
        } else {
          theta1 = theta1_2
        }

        // solve theta5
        // let theta5 = 0.0
        theta5_1 = Math.acos(-ax * Math.sin(theta1) + ay * Math.cos(theta1))
        theta5_2 = -theta5_1
        if (Math.abs(theta5_1 - q[4]) <= Math.abs(theta5_2 - q[4])) {
          theta5 = theta5_1
        } else {
          theta5 = theta5_2
        }

        // solve theta6
        const m1 = - nx * Math.sin(theta1) + ny * Math.cos(theta1)
        const n1 = - ox * Math.sin(theta1) + oy * Math.cos(theta1)
        theta6 = Math.atan2(-n1 / Math.sin(theta5), m1 / Math.sin(theta5))

        // solve theta3
        T01 = getTransformationMatrixMDH(this.#Alphas[0], this.#As[0], this.#Ds[0], 0, this.#Sigmas[0], theta1)
        const T45 = getTransformationMatrixMDH(this.#Alphas[4], this.#As[4], this.#Ds[4], 0, this.#Sigmas[4], theta5)
        const T56 = getTransformationMatrixMDH(this.#Alphas[5], this.#As[5], this.#Ds[5], 0, this.#Sigmas[5], theta6)

        const T46 = math.multiply(T45, T56)
        const T14 = math.multiply(math.multiply(math.inv(T01), T), math.inv(T46))
        const x = T14.get([0, 3])
        const y = T14.get([2, 3])

        theta3_1 = Math.acos((Math.pow(x, 2) + Math.pow(y, 2) - Math.pow(this.#As[2], 2) - Math.pow(this.#As[3], 2)) / (2 * this.#As[2] * this.#As[3]))
        theta3_2 = -theta3_1

        if (Math.abs(theta3_1 - q[2]) <= Math.abs(theta3_1 - q[2])) {
          theta3 = theta3_1
        } else {
          theta3 = theta3_2
        }

        // solve theta2
        const M = math.matrix([
          [this.#As[3] * Math.cos(theta3) + this.#As[2], -this.#As[3] * Math.sin(theta3)],
          [this.#As[3] * Math.sin(theta3), this.#As[3] * Math.cos(theta3) + this.#As[2]]
        ])
        const XY = math.matrix([
          [x],
          [-y]
        ])
        const CS = math.multiply(math.inv(M), XY)
        theta2 = Math.atan2(CS.get([1, 0]), CS.get([0, 0]))

        // solve theta4
        theta4 = Math.atan2(-T14.get([0, 1]), T14.get([0, 0])) - theta2 - theta3;
        break
      default:
        break
    }

    const q1 = theta1 - this.#Thetas[0]
    const q2 = theta2 - this.#Thetas[1]
    const q3 = theta3 - this.#Thetas[2]
    const q4 = theta4 - this.#Thetas[3]
    const q5 = theta5 - this.#Thetas[4]
    const q6 = theta6 - this.#Thetas[5]
    return [q1, q2, q3, q4, q5, q6]
  }

  iKineJConfig = (T, q0) => {
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

    let theta1_1, theta1_2, theta1, theta2, theta3, theta3_1, theta3_2, theta4, theta5, theta5_1, theta5_2, theta6
    let T01
    const theta0 = this.#Thetas.map((value, index) => {
      return value + q0[index]
    })

    let theta1Condition = 0
    let theta3Condition = 0
    let theta5Condition = 0
    switch (this.robotType) {
      case RobotTypeEnum.INDUSTRY:
        const Px = px - this.#Ds[5] * ax
        const Py = py - this.#Ds[5] * ay
        const Pz = pz - this.#Ds[5] * az - this.#Ds[0]

        // solve theta1
        theta1Condition = Math.pow(Px, 2) +  Math.pow(Py, 2) - Math.pow(this.#Ds[2], 2)
        if (theta1Condition < 0) {
          return []
        }

        if (Transformation.nearZero(Transformation.norm([Px, Py]))) {   // overhead singularity
          theta1 = theta0[0]
        } else {
          switch (this.#jConfig.overhead) {
            case OverheadEnum.FRONT:
              theta1 = Math.atan2(this.#Ds[2], Math.sqrt(theta1Condition)) + Math.atan2(Py, Px)
              break
            case OverheadEnum.BACK:
              theta1 = Math.atan2(this.#Ds[2], -Math.sqrt(theta1Condition)) + Math.atan2(Py, Px)
              break
            default:
              return []
          }
        }
        // solve theta3
        let k3 = (Math.pow(this.#As[1] - Math.cos(theta1) * Px - Math.sin(theta1) * Py, 2) + Math.pow(Pz, 2) - (Math.pow(this.#As[3], 2) + Math.pow(this.#Ds[3], 2) + Math.pow(this.#As[2], 2))) / (2 * this.#As[2])
        theta3Condition = Math.pow(this.#As[3], 2) + Math.pow(this.#Ds[3], 2) - Math.pow(k3, 2)
        if (theta3Condition < 0) {
          return []   // inline singularity
        }
        switch (this.#jConfig.inline) {
          case InlineEnum.UP:
            theta3 = Math.atan2(k3, Math.sqrt(theta3Condition)) - Math.atan2(this.#As[3], this.#Ds[3])
            break
          case InlineEnum.DOWN:
            theta3 = Math.atan2(k3, -Math.sqrt(theta3Condition)) - Math.atan2(this.#As[3], this.#Ds[3])
            break
          default:
            return []
        }

        const g = Math.cos(theta1) * Px + Math.sin(theta1) * Py - this.#As[1]
        const e = this.#As[3] * Math.cos(theta3) + this.#Ds[3] * Math.sin(theta3) + this.#As[2]
        const f = this.#As[3] * Math.sin(theta3) - this.#Ds[3] * Math.cos(theta3)

        theta2 = Math.atan2(Pz * e - g * f, g * e + Pz * f)

        T01 = getTransformationMatrixMDH(this.#Alphas[0], this.#As[0], this.#Ds[0], theta1, this.#Sigmas[0], 0)
        const T12 = getTransformationMatrixMDH(this.#Alphas[1], this.#As[1], this.#Ds[1], theta2, this.#Sigmas[1], 0)
        const T23 = getTransformationMatrixMDH(this.#Alphas[2], this.#As[2], this.#Ds[2], theta3, this.#Sigmas[2], 0)

        const T03 = math.multiply(math.multiply(T01, T12), T23)
        const T36 = math.multiply(math.inv(T03), T)
        theta5Condition = -T36.get([1, 2])
        if (Math.abs(theta5Condition) > 1) {
          return []
        }
        switch (this.#jConfig.wrist) {
          case WristEnum.FLIP:
            theta5 = Math.acos(theta5Condition)
            break
          case WristEnum.NO_FLIP:
            theta5 = -Math.acos(theta5Condition)
            break
          default:
            return []
        }

        if (Transformation.nearZero(Math.sin(theta5))) {
          // wrist singularity
          theta4 = theta0[3]
          theta6 = theta0[5]
        } else {
          theta4 = Math.atan2(T36.get([2, 2]) / Math.sin(theta5), T36.get([0, 2]) / Math.sin(theta5))
          theta6 = Math.atan2(-T36.get([1, 1]) / Math.sin(theta5), T36.get([1, 0]) / Math.sin(theta5))
        }

        break;
      case RobotTypeEnum.COOPERATION:
        const a3 = this.#As[2]
        const a4 = this.#As[3]

        const d1 = this.#Ds[0]
        const d3 = this.#Ds[2]
        const d4 = this.#Ds[3]
        const d6 = this.#Ds[5]

        const m = ay * d6 - py
        const n = ax * d6 - px

        // solve theta1
        // let theta1 = 0.0
        theta1Condition = Math.pow(m, 2) + Math.pow(n, 2) - Math.pow(d4, 2)
        if (theta1Condition < 0) {
          return []
        }
        if (Transformation.nearZero(Transformation.norm([m, n]))) {
          theta1 = theta0[0] // overhead singularity
        } else {
          switch (this.#jConfig.overhead) {
            case OverheadEnum.FRONT:
              theta1 = Math.atan2(m, n) - Math.atan2(-d4, Math.sqrt(theta1Condition))
              break
            case OverheadEnum.BACK:
              theta1 = Math.atan2(m, n) - Math.atan2(-d4, -Math.sqrt(theta1Condition))
              break
            default:
              return []
          }
        }

        theta5Condition = -ax * Math.sin(theta1) + ay * Math.cos(theta1)
        if (Math.abs(theta5Condition) > 1) {
          return []
        }
        switch (this.#jConfig.wrist) {
          case WristEnum.FLIP:
            theta5 = Math.acos(theta5Condition)
            break
          case WristEnum.NO_FLIP:
            theta5 = -Math.acos(theta5Condition)
            break
          default:
            return []
        }

        // solve theta6
        const m1 = - nx * Math.sin(theta1) + ny * Math.cos(theta1)
        const n1 = - ox * Math.sin(theta1) + oy * Math.cos(theta1)
        if (Transformation.nearZero(Math.sin(theta5))) {
          // return []   // wrist singularity
          theta6 = theta0[5]
        } else {
          theta6 = Math.atan2(-n1 / Math.sin(theta5), m1 / Math.sin(theta5))
        }


        // solve theta3
        T01 = getTransformationMatrixMDH(this.#Alphas[0], this.#As[0], this.#Ds[0], theta1, this.#Sigmas[0], 0)
        const T45 = getTransformationMatrixMDH(this.#Alphas[4], this.#As[4], this.#Ds[4], theta5, this.#Sigmas[4], 0)
        const T56 = getTransformationMatrixMDH(this.#Alphas[5], this.#As[5], this.#Ds[5], theta6, this.#Sigmas[5], 0)

        const T46 = math.multiply(T45, T56)
        const T14 = math.multiply(math.multiply(math.inv(T01), T), math.inv(T46))
        const x = T14.get([0, 3])
        const y = T14.get([2, 3])
        theta3Condition = (Math.pow(x, 2) + Math.pow(y, 2) - Math.pow(this.#As[2], 2) - Math.pow(this.#As[3], 2)) / (2 * this.#As[2] * this.#As[3])
        if (Math.abs(theta3Condition) > 1) {
          return []
        }
        switch (this.#jConfig.inline) {
          case InlineEnum.UP:
            theta3 = -Math.acos(theta3Condition)
            break
          case InlineEnum.DOWN:
            theta3 = Math.acos(theta3Condition)
            break
          default:
            return []
        }

        // solve theta2
        const M = math.matrix([
          [this.#As[3] * Math.cos(theta3) + this.#As[2], -this.#As[3] * Math.sin(theta3)],
          [this.#As[3] * Math.sin(theta3), this.#As[3] * Math.cos(theta3) + this.#As[2]]
        ])
        const XY = math.matrix([
          [x],
          [-y]
        ])
        const CS = math.multiply(math.inv(M), XY)
        theta2 = Math.atan2(CS.get([1, 0]), CS.get([0, 0]))

        // solve theta4
        theta4 = Math.atan2(-T14.get([0, 1]), T14.get([0, 0])) - theta2 - theta3;
        break
      default:
        break
    }

    const q1 = theta1 - this.#Thetas[0]
    const q2 = theta2 - this.#Thetas[1]
    const q3 = theta3 - this.#Thetas[2]
    const q4 = theta4 - this.#Thetas[3]
    const q5 = theta5 - this.#Thetas[4]
    const q6 = theta6 - this.#Thetas[5]

    const q = [q1, q2, q3, q4, q5, q6]
    q.forEach((value, index, array) => {
      [array[index]] = Robot.wrap(value)
    })

    const multiTurn = true

    if (!multiTurn) {
      return q
    }

    const q0_0 = [0, 0, 0, 0, 0, 0]
    const count = [0, 0, 0, 0, 0, 0]
    q0.forEach((value, index) => {
      [q0_0[index], count[index]] = Robot.wrap(value)
    })

    q.forEach((value, index, array) => {
      if (value - q0_0[index] > Math.PI) {
        array[index] += (count[index] - 1) * 2 * Math.PI
      } else if (value - q0_0[index] < -Math.PI) {
        array[index] += (count[index] + 1) * 2 * Math.PI
      } else {
        array[index] += count[index] * 2 * Math.PI
      }
    })

    return q
  }

  getJacobian = (q) => {
    const dof = q.length
    const TArray = []
    for (let i = 0; i < dof; i++) {
      TArray.push(getTransformationMatrixMDH(this.#Alphas[i], this.#As[i], this.#Ds[i], this.#Thetas[i],  this.#Sigmas[i], q[i]))
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

  getDJacobian = (q, dq) => {
    const TArray = []
    for (let i = 0; i < this.#dof; i++) {
      TArray.push(getTransformationMatrixMDH(this.#Alphas[i], this.#As[i], this.#Ds[i], this.#Thetas[i], this.#Sigmas[i], q[i]))
    }

    let T = math.identity(4)
    const eArray = []
    const wArray = []
    let wi = math.zeros([3, 1])
    const deArray = []
    const RArray = []
    const PArray = []
    for (let i = 0; i < this.#dof; i++) {
      T = math.multiply(T, TArray[i])
      const ei = T.subset(math.index([0, 1, 2], 2))
      eArray.push(ei)
      // wi += ei * dq[i]
      wi = math.add(wi, math.multiply(ei, dq[i]))
      wArray.push(wi)
      deArray.push(math.transpose(math.cross(wi, ei)))
      RArray.push(T.subset(math.index([0, 1, 2], [0, 1, 2])))
      PArray.push(TArray[i].subset(math.index([0, 1, 2], 3)))
    }

    const dPArray = [math.zeros([3, 1])]
    let dPi = math.zeros([3, 1])
    for (let i = this.#dof - 1; i > 0; i--) {
      dPi = math.add(dPi, math.transpose(math.cross(wArray[i-1], math.multiply(RArray[i-1], PArray[i]))))
      dPArray.push(dPi)
    }
    dPArray.reverse()

    const PeArray = [math.zeros([3, 1])]
    let Ti = math.identity(4)
    for (let i = this.#dof - 1; i > 0; i--) {
      // Ti = TArray[i] * Ti
      Ti = math.multiply(TArray[i], Ti)
      PeArray.push(math.multiply(RArray[i-1], Ti.subset(math.index([0, 1, 2], 3))))
    }
    PeArray.reverse()


    const dvArray = []
    for (let i = 0; i < this.#dof; i++) {
      dvArray.push(math.transpose(math.add(math.cross(deArray[i], PeArray[i]), math.cross(eArray[i], dPArray[i]))))
    }

    return math.concat(math.concat(...dvArray), math.concat(...deArray), 0)
  }

  /**
   * 获取笛卡尔信息
   * @param qs
   * @param dqs
   * @param ddqs
   * @returns {{ddxs: math.MathArray, xs: *, dxs: math.MathArray}}
   */
  getDescartesViaJoint = (qs, dqs, ddqs) => {
    const J = this.getJacobian(qs)
    const dJ = this.getDJacobian(qs, dqs)

    const T = this.fKine(qs)
    const xs = Transformation.TransToX(T)
    const dxs = math.multiply(J, dqs).valueOf()
    const ddxs = math.add(math.multiply(J, ddqs), math.multiply(dJ, dqs)).valueOf()
    return {
      xs,
      dxs,
      ddxs
    }
  }

  getJointViaDescartes = (xs, dxs, ddxs, q0) => {
    const T = Transformation.XToTrans(xs)
    // const qs = this.iKine6s(T, q0)
    let J = null, dqs = null, ddqs = null, JDet = 0
    const qs = this.iKineJConfig(T, q0)
    if (qs.length) {
      J = this.getJacobian(qs)
      JDet = math.sqrt(math.abs(math.det(math.multiply(J, math.transpose(J)))))
      if (!Transformation.nearZero(JDet)) {
        dqs = math.multiply(math.inv(J), dxs).valueOf()
        ddqs = math.multiply(math.inv(J), math.subtract(ddxs, math.multiply(J, dqs))).valueOf()
      }
    }
    return {
      qs,
      dqs,
      ddqs,
      JDet
    }
  }

  getWorkspace = (qLimit) => {
    const count = 10000
    const q = []
    const pxArray = []
    const pyArray = []
    const pzArray = []
    for (let i = 0; i < count; i++) {
      q.length = 0
      for (let j = 0; j < robot.#dof; j++) {
        q.push(math.random() * (qLimit.upper[j] - qLimit.lower[j]) + qLimit.lower[j])
      }
      const T = this.fKine(q)
      pxArray.push(T.get([0, 3]))
      pyArray.push(T.get([1, 3]))
      pzArray.push(T.get([2, 3]))
    }
    return {pxArray, pyArray, pzArray}
  }

  // TODO: will delete
  calWPC = (T) => {
    const Px = T.get([0, 3]) - this.#Ds[5] * T.get([0, 2])
    const Py = T.get([1, 3]) - this.#Ds[5] * T.get([1, 2])
    const Pz = T.get([2, 3]) - this.#Ds[5] * T.get([2, 2]) - this.#Ds[0]
    return [Px, Py, Pz]
  }

  setJConfig = (q) => {
    const T = robot.fKine(q)
    const wpc = this.calWPC(T)
    const theta = q.map((value, index) => {
      return value + this.#Thetas[index]
    })

    // overhead
    if (theta[0] - Math.atan2(wpc[1], wpc[0]) <= Math.PI / 2) {
      this.#jConfig.overhead = 0
    } else {
      this.#jConfig.overhead = 1
    }

    // inline
    if (theta[2] + Math.atan2(this.#As[3], this.#Ds[3]) <= Math.PI / 2) {
      this.#jConfig.inline = 0
    } else {
      this.#jConfig.inline = 1
    }

    // wrist
    if (theta[4] >= 0) {
      this.#jConfig.wrist = 0
    } else {
      this.#jConfig.wrist = 1
    }
  }

  static wrap = (theta) => {
    let number = Math.trunc(theta / (2 * Math.PI))
    theta -= number * 2 * Math.PI
    if (theta > Math.PI) {
      theta -= 2 * Math.PI
      number++
    } else if (theta < -Math.PI) {
      theta += 2 * Math.PI
      number--
    }
    return [theta, number]
  }
}

const getTransformationMatrixMDH = (alpha, a, d, theta, sigma, q) => {
  switch (sigma) {
    case JointTypeEnum.PRISMATIC:
      d += q
      break
    case JointTypeEnum.REVOLUTE:
      theta += q
      break
    default:
      break
  }
  return math.matrix([
    [Math.cos(theta), -Math.sin(theta), 0, a],
    [Math.sin(theta) * Math.cos(alpha), Math.cos(theta) * Math.cos(alpha), -Math.sin(alpha), -d * Math.sin(alpha)],
    [Math.sin(theta) * Math.sin(alpha), Math.cos(theta) * Math.sin(alpha), Math.cos(alpha), d * Math.cos(alpha)],
    [0, 0, 0, 1]
  ])
}

const robot = new Robot()
export {RobotTypeEnum, JointTypeEnum, robot}
