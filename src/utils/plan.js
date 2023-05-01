import * as math from "mathjs"
import * as transformation from "./transformation"
import {AxisAngle} from "./transformation";

const spaceStateEnum = {
  JOINT: 0,
  DESCARTES: 1,
}
const velStateEnum = {
  CUBIC: 0,
  TCURVE: 1,
  QUINTIC: 2,
  SEVENTH: 3
}

const jointStateEnum = {
  LINE: 0,
  MOTION: 1
}

const pathStateEnum = {
  LINE: 0,
  ARC_CENTER: 1,
  ARC_POINT: 2,
  POINTS: 3
}

const attitudeStateEnum = {
  EULER: 0,
  QUATERNION: 1,
  AXIS_ANGLE: 2
}

class Plan {
  /**
   * {x0, x1, tf, vMax, aMax}
   */
  #trajPara
  #interpolationPara
  #sFunction
  constructor(trajectoryPara) {
    this.#trajPara = trajectoryPara
    this.#interpolationPara = null
    const {x0, x1} = this.#trajPara
    const p0 = x0.slice(0, 3)
    const a0 = x0.slice(3, 6)
    const p1 = x1.slice(0, 3)
    const a1 = x1.slice(3, 6)
    this.#trajPara.p0 = p0
    this.#trajPara.a0 = a0
    this.#trajPara.p1 = p1
    this.#trajPara.a1 = a1

    // 路径规划
    this.#sFunction = this.#spacePlan()
    // 速度规划
    this.#velPlan()
  }

  /**
   * 获取轨迹
   * @param t
   * @returns {*}
   */
  getTrajectory = (t) => {
    const {s, ds, dds} = this.#interpolation(t)
    return this.#sFunction(s, ds, dds)
  }

  get getTf() {
    return this.#interpolationPara.tf
  }

  /**
   * 空间规划
   * @param spacePara
   * @returns {null}
   */
  #spacePlan = () => {
    const {spaceState} = this.#trajPara
    let errors = null
    let sFunction = null
    switch (spaceState) {
      case spaceStateEnum.JOINT:
        sFunction = this.#jointPlan()
        const {q0, q1} = this.#trajPara
        errors = q0.map((value, index) => {
          return q1[index] - value
        })
        this.#trajPara.errors = errors
        break
      case spaceStateEnum.DESCARTES:
        const {pathPara, attitudePara} = this.#trajPara
        const sFunctionPath = this.#pathPlan(pathPara)
        const sFunctionAttitude = this.#attitudePlan(attitudePara)
        sFunction = (s, ds, dds) => {
          const {p, dp, ddp} = sFunctionPath(s, ds, dds)
          const {a, da, dda} = sFunctionAttitude(s,ds, dds)
          return {
            x: [...p, ...a],
            dx: [...dp, ...da],
            ddx: [...ddp, ...dda]
          }
        }
        const {x0, x1} = this.#trajPara
        errors = x0.map((value, index) => {
          return x1[index] - value
        })
        this.#trajPara.errors = errors
        break
      default:
        break
    }
    return sFunction
  }

  /**
   * 关节规划
   * @param jointPara
   */
  #jointPlan = () => {
    const {q0, q1} = this.#trajPara
    const sFunction = (s, ds, dds) => {
      const q = q0.map((value, index) => {
        return (q1[index] - value) * s + value
      })
      const dq = q0.map((value, index) => {
        return (q1[index] - value) * ds
      })
      const ddq = q0.map((value, index) => {
        return (q1[index] - value) * dds
      })
      return {q, dq, ddq}
    }
    return sFunction
  }

  /**
   * 路径规划
   * @param pathPara
   * @returns {null}
   */
  #pathPlan = (pathPara) => {
    const {pathState, p0, p1} = this.#trajPara
    let sFunction = null
    switch (pathState) {
      case pathStateEnum.LINE:
        sFunction = this.#pathLine(p0, p1);
        break
      case pathStateEnum.ARC_CENTER:
        const {xc} = pathPara
        const pc = xc.slice(0, 3)
        sFunction = this.#pathArcCenter(p0, pc, p1)
        break
      case pathStateEnum.ARC_POINT:
        const {xp} = pathPara
        const pp = xp.slice(0, 3)
        sFunction = this.#pathArcPoint(p0, pp, p1)
        break
      case pathStateEnum.POINTS:
        const {ps} = pathPara
        sFunction = this.#pathPoints(ps)
        break
      default:
        break
    }

    return sFunction
  }

  /**
   * 姿态规划
   * @param attitudePara
   * @returns {null}
   */
  #attitudePlan = (attitudePara) => {
    const {attitudeState, a0, a1} = this.#trajPara
    let sFunction = null
    switch (attitudeState) {
      case attitudeStateEnum.EULER:
        sFunction = this.#attitudeEuler(a0, a1)
        break
      case attitudeStateEnum.QUATERNION:
        // TODO: euler to quaternion
        const q0 = null
        const q1 = null
        sFunction = this.#attitudeQuaternion(q0, q1)
        break
      case attitudeStateEnum.AXIS_ANGLE:
        // TODO:
        let axisAngle1 = null
        let axisAngle2 = null
        sFunction = this.#attitudeAxisAngle(axisAngle1, axisAngle2)
        break
      default:
        break
    }
    return sFunction
  }

  /**
   * 速度规划
   * @param velPara
   */
  #velPlan = () => {
    const {velState, tf, vMax, aMax, errors} = this.#trajPara
    this.#trajPara.velState = velState
    switch (velState) {
      case velStateEnum.CUBIC:
        this.#velCubic(tf)
        break
      case velStateEnum.TCURVE:
        const vHat = errors.map((value, index) => {
          return math.abs(value / vMax[index])
        })
        const aHat = errors.map((value, index) => {
          return math.abs(value / aMax[index])
        })
        const vHatMax = 1.0 / Math.max(...vHat)
        const aHatMax = 1.0 / Math.max(...aHat)
        this.#velTCurve(vHatMax, aHatMax)
        break
      case velStateEnum.QUINTIC:
        this.#velQuintic(tf)
        break
      default:
        break
    }
  }

  /**
   * 插补
   * @param t
   * @returns {null|{dds: *, s: number, ds: *}|{dds, s: number, ds: number}|{dds: *, s: *, ds: *}}
   */
  #interpolation = (t) => {
    switch (this.#trajPara.velState) {
      case velStateEnum.CUBIC:
        return this.#interpolationCubic(t)
      case velStateEnum.TCURVE:
        return this.#interpolationTCurve(t)
      case velStateEnum.QUINTIC:
        return this.#interpolationQuintic(t)
      default:
        break
      return null
    }
  }

  #velCubic = (tf) => {
    const Y = math.matrix([
      [1, 0, 0, 0],
      [1, tf, Math.pow(tf, 2), Math.pow(tf, 3)],
      [0, 1, 0, 0],
      [0, 1, 2 * tf, 3 * Math.pow(tf, 2)]
    ])
    const P = math.matrix([
      [0],
      [1],
      [0],
      [0]
    ])
    const A = math.multiply(math.inv(Y), P)
    this.#interpolationPara = {
      para: A,
      tf
    }
  }

  #velQuintic = (tf) => {
    const A = math.matrix([
      [0],
      [0],
      [0],
      [1 / (2 * Math.pow(tf, 3)) * 20],
      [1 / (2 * Math.pow(tf, 4)) * (-30)],
      [1 / (2 * Math.pow(tf, 5)) * 12]
    ])
    this.#interpolationPara = {
      para: A,
      tf
    }
  }

  #velTCurve = (vMax, aMax) => {
    let ta = vMax / aMax
    const pa = 0.5 * aMax * math.pow(ta, 2)
    const tm = (1 - 2 * pa) / vMax
    let tf = tm + 2 * ta;
    if (tf - 2 * ta < 0) {
      ta = math.sqrt(1 / aMax)
      tf = 2 * ta
    }

    this.#interpolationPara = {
      ta,
      tf,
      vMax,
      aMax
    }
  }

  #interpolationCubic = (t) => {
    let s, ds, dds
    if (t <= 0) {
      s = 0
      ds = 0
      dds = math.multiply(math.matrix([
        [0, 0, 2, 0]
      ]), this.#interpolationPara.para).get([0, 0])
    } else if (t >= this.#interpolationPara.tf) {
      s = 1
      ds = 0
      dds = math.multiply(math.matrix([
        [0, 0, 2, 6 * this.#interpolationPara.tf]
      ]), this.#interpolationPara.para).get([0, 0])
    } else {
      s = math.multiply(math.matrix([
        [1, t, math.pow(t, 2), math.pow(t, 3)]
      ]), this.#interpolationPara.para).get([0, 0])
      ds = math.multiply(math.matrix([
        [0, 1, 2 * t, 3 * math.pow(t, 2)]
      ]), this.#interpolationPara.para).get([0, 0])
      dds = math.multiply(math.matrix([
        [0, 0, 2, 6 * t]
      ]), this.#interpolationPara.para).get([0, 0])
    }
    return {s, ds, dds}
  }

  #interpolationTCurve = (t) => {
    let s = 0, ds = 0, dds = 0
    if (t <= 0) {
      s = 0
      ds = 0
      dds = 0
    } else if (t <= this.#interpolationPara.ta) {
      s = 0.5 * this.#interpolationPara.aMax * math.pow(t, 2)
      ds = this.#interpolationPara.aMax * t
      dds = this.#interpolationPara.aMax
    } else if (t <= this.#interpolationPara.tf - this.#interpolationPara.ta) {
      s = 0.5 * this.#interpolationPara.aMax * math.pow(this.#interpolationPara.ta, 2) + this.#interpolationPara.aMax * this.#interpolationPara.ta * (t - this.#interpolationPara.ta)
      ds = this.#interpolationPara.vMax
      dds = 0
    } else if (t <= this.#interpolationPara.tf) {
      s = 1 - 0.5 * this.#interpolationPara.aMax * math.pow(this.#interpolationPara.tf - t, 2)
      ds = this.#interpolationPara.aMax * (this.#interpolationPara.tf - t)
      dds = -this.#interpolationPara.aMax
    } else {
      s = 1
      ds = 0
      dds = 0
    }
    return {s, ds, dds}
  }

  #interpolationQuintic = (t) => {
    let s = 0, ds = 0, dds = 0
    if (t <= 0) {
      s = 0
      ds = 0
      dds = 0
    } else if (t >= this.#interpolationPara.tf) {
      s = 1
      ds = 0
      dds = 0
    } else {
      s = math.multiply(math.matrix([
        [0, t, math.pow(t, 2), math.pow(t, 3), math.pow(t, 4), math.pow(t, 5)]
      ]), this.#interpolationPara.para).get([0, 0])
      ds = math.multiply(math.matrix([
        [0, 1, 2 * t, 3 * math.pow(t, 2), 4 * math.pow(t, 3), 5 * math.pow(t, 4)]
      ]), this.#interpolationPara.para).get([0, 0])
      dds = math.multiply(math.matrix([
        [0, 0, 2, 6 * t, 12 * math.pow(t, 2), 20 * math.pow(t, 3)]
      ]), this.#interpolationPara.para).get([0, 0])
    }
    return {s, ds, dds}
  }

  /**
   * 路径规划：直线
   * @param p0
   * @param p1
   * @returns {function(*, *, *): {p: *, ddp: *, dp: *}}
   */
  #pathLine = (p0, p1) => {
    const sFunction = (s, ds, dds) => {
      const p = p0.map((value, index) => {
        return (p1[index] - value) * s + value
      })
      const dp = p0.map((value, index) => {
        return (p1[index] - value) * ds
      })
      const ddp = p0.map((value, index) => {
        return (p1[index] - value) * dds
      })
      return {p, dp, ddp}
    }
    return sFunction
  }

  /**
   * 圆弧路径规划
   * @param p0
   * @param pc
   * @param p1
   * @returns {function(*): math.Matrix}
   */
  #pathArcCenter = (p0, pc, p1) => {
    const velP0 = math.reshape(math.matrix(p0), [3, 1])
    const velPc = math.reshape(math.matrix(pc), [3, 1])
    const velP1 = math.reshape(math.matrix(p1), [3, 1])
    const vecPcP0 = math.subtract(velP0, velPc)
    const vecPcP1 = math.subtract(velP1, velPc)
    const normPcP0 = math.norm(math.squeeze(vecPcP0))
    const normPcP1 = math.norm(math.squeeze(vecPcP1))
    const radius = math.norm(math.squeeze(vecPcP0))
    const theta = math.acos(math.dot(vecPcP0, vecPcP1) / (normPcP0 * normPcP1))
    let vecCx = math.divide(vecPcP0, normPcP0)
    let vecCz = math.cross(vecPcP0, vecPcP1)
    vecCz = math.divide(vecCz, math.norm(math.squeeze(vecCz)))
    let vecCy = math.cross(vecCz, vecCx)
    vecCx = math.reshape(vecCx, [3, 1])
    vecCy = math.reshape(vecCy, [3, 1])
    vecCz = math.reshape(vecCz, [3, 1])

    const sFunction = (s) => {
      const thetaS = s * theta
      const cPx = radius * math.cos(thetaS)
      const cPy = radius * math.sin(thetaS)
      const cPz = 0
      const cP = transformation.euclToHomPoint3D([cPx, cPy, cPz])
      let T = math.identity(4)
      T.subset(math.index([0, 1, 2], 0), vecCx)
      T.subset(math.index([0, 1, 2], 1), vecCy)
      T.subset(math.index([0, 1, 2], 2), vecCz)
      T.subset(math.index([0, 1, 2], 2), pc)
      const p = math.multiply(T, cP)
      return [p.get([0, 0]), p.get([1, 0]), p.get([2, 0])]
    }

    return sFunction
  }

  // TODO: 三点圆弧路径规划
  #pathArcPoint = (p0, pp, p1) => {
    const sFunction = (s) => {

    }
    return sFunction
  }

  #pathPoints = (ps) => {
    const sFunction = (s) => {

    }
    return sFunction
  }

  /**
   * 姿态规划： 欧拉角
   * @param a0
   * @param a1
   */
  #attitudeEuler = (a0, a1) => {
    const sFunction = (s, ds, dds) => {
      const a = a0.map((value, index) => {
        return (a1[index] - value) * s + value
      })
      const da = a0.map((value, index) => {
        return (a1[index] - value) * ds
      })
      const dda = a0.map((value, index) => {
        return (a1[index] - value) * dds
      })
      return {a, da, dda}
    }
    return sFunction
  }

  /**
   * 姿态规划： 四元数
   * @param q0
   * @param q1
   * @returns {function(*): math.Matrix}
   */
  #attitudeQuaternion = (q0, q1) => {
    let deltaQ = math.dot(q0, q1)
    if (deltaQ < 0) {
      deltaQ = -deltaQ
    }

    const sFunction = (s) => {
      let k0 = 0
      let k1 = 0
      if (deltaQ > 0.9995) {
        k0 = 1 - s
        k1 = s
      } else {
        const theta = math.atan2(math.sqrt(1 - math.pow(deltaQ, 2)), deltaQ)
        k0 = math.sin((1 - s) * theta) / math.sin(theta)
        k1 = math.sin(s * theta) / math.sin(theta)
      }
      return math.add(math.multiply(k0, q0), math.multiply(k1, q1))
    }

    return sFunction
  }

  // TODO: 姿态规划： 轴角
  /**
   * 姿态规划： 轴角
   * @param axisAngle0
   * @param axisAngle1
   */
  #attitudeAxisAngle = (axisAngle0, axisAngle1) => {

  }
}

export {spaceStateEnum, velStateEnum, jointStateEnum, pathStateEnum, attitudeStateEnum, Plan}
