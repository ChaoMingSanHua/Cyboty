import * as math from "mathjs"
import {Transformation} from "./transformation";
import { BizException } from '@/exception/biz_exception';
import { StatusCodeEnum } from '@/enums/status_code_enum';

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
  #trajPara
  #interpolationPara
  #sFunction
  constructor(trajectoryPara) {
    this.#trajPara = JSON.parse(JSON.stringify(trajectoryPara))
    this.#interpolationPara = null
    const {x0, x1, xc} = this.#trajPara
    const p0 = x0.slice(0, 3)
    const a0 = x0.slice(3, 6)
    const pc = xc.slice(0, 3)
    const ac = xc.slice(3, 6)
    const p1 = x1.slice(0, 3)
    const a1 = x1.slice(3, 6)
    this.#trajPara.p0 = p0
    this.#trajPara.a0 = a0
    this.#trajPara.pc = pc
    this.#trajPara.ac = ac
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
        const sFunctionPath = this.#pathPlan()
        const sFunctionAttitude = this.#attitudePlan()
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
   * @returns {function(*, *, *): {ddq: *, q: *, dq: *}}
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
   * @returns {null}
   */
  #pathPlan = () => {
    const {pathState, p0, p1, pc} = this.#trajPara
    let sFunction = null
    switch (pathState) {
      case pathStateEnum.LINE:
        sFunction = this.#pathLine(p0, p1);
        break
      case pathStateEnum.ARC_CENTER:
        sFunction = this.#pathArcCenter(p0, pc, p1)
        break
      case pathStateEnum.ARC_POINT:
        sFunction = this.#pathArcPoint(p0, pc, p1)
        break
      case pathStateEnum.POINTS:
        const {points} = this.#trajPara
        sFunction = this.#pathPoints([p0, ...points])
        break
      default:
        break
    }

    return sFunction
  }

  /**
   * 姿态规划
   * @returns {null}
   */
  #attitudePlan = () => {
    const {attitudeState, a0, a1} = this.#trajPara
    let sFunction = null
    switch (attitudeState) {
      case attitudeStateEnum.EULER:
        sFunction = this.#attitudeEuler(a0, a1)
        break
      case attitudeStateEnum.QUATERNION:
        const q0 = Transformation.rpyToQuaternion(...a0)
        const q1 = Transformation.rpyToQuaternion(...a1)
        sFunction = this.#attitudeQuaternion(q0, q1)
        break
      case attitudeStateEnum.AXIS_ANGLE:
        const axisAngle1 = Transformation.rpyToAxisAngle(...a0)
        const axisAngle2 = Transformation.rpyToAxisAngle(...a1)
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
    if (Transformation.nearZero(normPcP0) || Transformation.nearZero(normPcP1)) {
      throw new BizException(StatusCodeEnum.ARC_CENTER_ERROR)
    }
    const theta = math.acos(math.dot(vecPcP0, vecPcP1) / (normPcP0 * normPcP1))
    let vecCx = math.divide(vecPcP0, normPcP0)
    let vecCz = math.cross(vecPcP0, vecPcP1)
    const normVecCz = math.norm(math.squeeze(vecCz))
    if (Transformation.nearZero(normVecCz)) {
      throw new BizException(StatusCodeEnum.ARC_CENTER_ERROR)
    }
    vecCz = math.divide(vecCz, normVecCz)
    let vecCy = math.cross(vecCz, vecCx)
    vecCx = math.reshape(vecCx, [3, 1])
    vecCy = math.reshape(vecCy, [3, 1])
    vecCz = math.reshape(vecCz, [3, 1])
    let T = math.identity(4)
    T.subset(math.index([0, 1, 2], 0), vecCx)
    T.subset(math.index([0, 1, 2], 1), vecCy)
    T.subset(math.index([0, 1, 2], 2), vecCz)
    T.subset(math.index([0, 1, 2], 3), velPc)

    const sFunction = (s, ds, dds) => {
      const thetaS = s * theta
      const x_ = radius * math.cos(thetaS)
      const y_ = radius * math.sin(thetaS)
      const dx_ = - radius * theta * math.sin(thetaS)
      const dy_ = radius * theta * math.cos(thetaS)
      const ddx_ = - radius * math.pow(theta, 2) * math.cos(thetaS)
      const ddy_ = - radius * math.pow(theta, 2) * math.sin(thetaS)
      const cP = Transformation.euclToHomPoint3D([x_, y_, 0])
      const p = math.multiply(T, cP)
      const dp = math.multiply(T.subset(math.index(math.range(0, 3), math.range(0, 3))),
        math.matrix([[dx_], [dy_], [0]]))
      const ddp = math.multiply(T.subset(math.index(math.range(0, 3), math.range(0, 3))),
        math.matrix([[ddx_], [ddy_], [0]]))
      return {
        p: [p.get([0, 0]), p.get([1, 0]), p.get([2, 0])],
        dp: [dp.get([0, 0]) * ds, dp.get([1, 0]) * ds, dp.get([2, 0]) * ds],
        ddp: [ddp.get([0, 0]) * ds + dp.get([0, 0]) * dds,
          ddp.get([1, 0]) * ds + dp.get([1, 0]) * dds,
          ddp.get([2, 0]) * ds + dp.get([2, 0]) * dds]
      }
    }

    return sFunction
  }

  #pathArcPoint = (p0, pc, p1) => {
    // 外接圆方程
    const A1 = (p0[1] - p1[1]) * (pc[2] - p1[2]) - (pc[1] - p1[1]) * (p0[2] - p1[2])
    const B1 = (pc[0] - p1[0]) * (p0[2] - p1[2]) - (p0[0] - p1[0]) * (pc[2] - p1[2])
    const C1 = (p0[0] - p1[0]) * (pc[1] - p1[1]) - (pc[0] - p1[0]) * (p0[1] - p1[1])
    const D1 = - (A1 * p1[0] + B1 * p1[1] + C1 * p1[2])

    // p0 pc 的垂直平分面M2的方程
    const A2 = pc[0] - p0[0]
    const B2 = pc[1] - p0[1]
    const C2 = pc[2] - p0[2]
    const D2 = - ((math.pow(pc[0], 2) - math.pow(p0[0], 2)) + (math.pow(pc[1], 2) - math.pow(p0[1], 2))
      + (math.pow(pc[2], 2) - math.pow(p0[2], 2))) / 2

    // pc p1 的垂直平分面M3的方程
    const A3 = p1[0] - pc[0]
    const B3 = p1[1] - pc[1]
    const C3 = p1[2] - pc[2]
    const D3 = - ((math.pow(p1[0], 2) - math.pow(pc[0], 2)) + (math.pow(p1[1], 2) - math.pow(pc[1], 2))
      + (math.pow(p1[2], 2) - math.pow(pc[2], 2))) / 2

    const M = math.matrix([
      [A1, B1, C1],
      [A2, B2, C2],
      [A3, B3, C3]
    ])
    const B = math.matrix([
      [-D1],
      [-D2],
      [-D3]
    ])

    if(Transformation.nearZero(math.det(M))) {
      throw new BizException(StatusCodeEnum.ARC_POINT_ERROR)
    }

    // 圆心和半径
    const c = math.multiply(math.pinv(M), B)
    const r = math.norm(math.squeeze(math.subtract(c, math.reshape(p0, [3, 1]))))

    // 新坐标系Z0的方向余弦
    const L = math.sqrt(math.pow(A1, 2) + math.pow(B1, 2) + math.pow(C1, 2))
    const ax = A1 / L, ay = B1 / L, az = C1 / L

    // 新坐标系X0的方向余弦
    const nx = (p0[0] - c.get([0, 0])) / r, ny = (p0[1] - c.get([1, 0])) / r, nz = (p0[2] - c.get([2, 0])) / r

    // 新坐标系Y0的方向余弦
    const o = math.cross([ax, ay, az], [nx, ny, nz])
    const ox = o[0], oy = o[1], oz = o[2]

    const T = math.matrix([
      [nx, ox, ax, c.get([0, 0])],
      [ny, oy, ay, c.get([1, 0])],
      [nz, oz, az, c.get([2, 0])],
      [0, 0, 0, 1]
    ])

    const invT = math.pinv(T)

    // 求解新坐标系下的坐标
    const S_ = math.multiply(invT, math.matrix([
      [p0[0]],
      [p0[1]],
      [p0[2]],
      [1]
    ]))
    const M_ = math.multiply(invT, math.matrix([
      [pc[0]],
      [pc[1]],
      [pc[2]],
      [1]
    ]))
    const D_ = math.multiply(invT, math.matrix([
      [p1[0]],
      [p1[1]],
      [p1[2]],
      [1]
    ]))

    const x1_ = S_.get([0, 0]), y1_ = S_.get([1, 0]), z1_ = S_.get([2, 0])
    const x2_ = M_.get([0, 0]), y2_ = M_.get([1, 0]), z2_ = M_.get([2, 0])
    const x3_ = D_.get([0, 0]), y3_ = D_.get([1, 0]), z3_ = D_.get([2, 0])

    // 判断圆弧是顺时针还是逆时针，并求解圆心角
    let angle_SOM = 0, angle_SOD = 0
    if (math.atan2(y2_, x2_) < 0) {
      angle_SOM = math.atan2(y2_, x2_) + 2 * math.pi
    } else {
      angle_SOM = math.atan2(y2_, x2_)
    }

    if (math.atan2(y3_, x3_) < 0) {
      angle_SOD = math.atan2(y3_, x3_) + 2 * math.pi
    } else {
      angle_SOD = math.atan2(y3_, x3_)
    }

    // 逆时针
    let flag = 1, theta = 0
    if (angle_SOM < angle_SOD) {
      flag = 1
      theta = angle_SOD
    } else {
      flag = -1
      theta = 2 * math.pi - angle_SOD
    }

    const sFunction = (s, ds, dds) => {
      const x_ = flag * r * math.cos(s * theta)
      const y_ = flag * r * math.sin(s * theta)
      const dx_ = - flag * r * theta * math.sin(s * theta)
      const dy_ = flag * r * theta * math.cos(s * theta)
      const ddx_ = - flag * r * math.pow(theta, 2) * math.cos(s * theta)
      const ddy_ = - flag * r * math.pow(theta, 2) * math.sin(s * theta)
      const P = math.multiply(T, math.matrix([
        [x_],
        [y_],
        [0],
        [1]
      ]))
      const dP = math.multiply(T, math.matrix([
        [dx_],
        [dy_],
        [0],
        [0]
      ]))
      const ddP = math.multiply(T, math.matrix([
        [ddx_],
        [ddy_],
        [0],
        [0]
      ]))
      return {
        p: [P.get([0, 0]), P.get([1, 0]), P.get([2, 0])],
        dp: [dP.get([0, 0]) * ds, dP.get([1, 0]) * ds, dP.get([2, 0]) * ds],
        ddp: [ddP.get([0, 0]) * ds + dP.get([0, 0]) * dds,
          ddP.get([1, 0]) * ds + dP.get([1, 0]) * dds,
          ddP.get([2, 0]) * ds + dP.get([2, 0]) * dds]
      }
    }
    return sFunction
  }

  #pathPoints = (ps) => {
    const pathPt0 = []
    const pathPt1 = []
    const pathC = []
    const pathThetaM = []
    const pathR = []
    const pathD1 = []
    const pathD2 = []
    for (let i = 1; i < ps.length - 1; i++) {
      const p0 = ps[i - 1]
      const pc = ps[i]
      const p1 = ps[i + 1]
      const r = 0.02
      const pathSegment = this.#pathSegmentTrans(p0, pc, p1, r)
      pathPt0.push(pathSegment.pt0)
      pathPt1.push(pathSegment.pt1)
      pathC.push(pathSegment.c)
      pathThetaM.push(pathSegment.thetaM)
      pathR.push(pathSegment.r)
      pathD1.push(pathSegment.d1)
      pathD2.push(pathSegment.d2)
    }

    const {pathLength, pathLengthI} = this.#pathSynthesis(ps, pathPt0, pathPt1, pathC, pathThetaM, pathR)
    const sFunction = (s, ds, dds) => {
      const sLength = s * pathLength
      const rowsPathLengthI = pathLengthI.length
      const PLine = [ps[0]]
      const rowsPathPt0 = pathPt0.length
      for (let i = 0; i < rowsPathPt0; i++) {
        PLine.push(pathPt0[i])
        PLine.push(pathPt1[i])
      }
      PLine.push(ps.at(-1))

      let sFunction, sI, dsI, ddsI
      for (let i = 0; i < rowsPathLengthI; i++) {
        if (sLength <= math.sum(pathLengthI.slice(0, i + 1))) {
          sI = (sLength - math.sum(pathLengthI.slice(0, i))) / pathLengthI[i]
          dsI = ds * pathLength / pathLengthI[i]
          ddsI = dds * pathLength / pathLengthI[i]
          if (math.mod(i, 2) === 0) {
            sFunction = this.#pathLine(PLine[i], PLine[i + 1])
            break
          } else {
            sFunction = this.#pathArcCenter(PLine[i], pathC[(i - 1) / 2], PLine[i + 1])
            break
          }
        } else {
          sFunction = this.#pathLine(PLine.at(-2), PLine.at(-1))
        }
      }
      const {p, dp, ddp} = sFunction(sI, dsI, ddsI)
      return {
        p,
        dp,
        ddp,
      }
    }
    return sFunction
  }

  /**
   * 圆弧过渡
   * @param p0
   * @param pc
   * @param p1
   * @param r
   * @returns {{r, c: math.MathArray, thetaM: number, pt1: math.MathArray, pt0: math.MathArray, d1: number | math.BigNumber, d2: number}|{r: number, c, thetaM: number, pt1, pt0, d1: number | math.BigNumber, d2: number}}
   */
  #pathSegmentTrans = (p0, pc, p1, r) => {
    const vecP0 = math.reshape(math.matrix(p0), [3, 1])
    const vecPc = math.reshape(math.matrix(pc), [3, 1])
    const vecP1 = math.reshape(math.matrix(p1), [3, 1])

    const vecPcP0 = math.subtract(vecP0, vecPc)
    const vecPcP1 = math.subtract(vecP1, vecPc)
    const normPcP0 = math.norm(math.squeeze(vecPcP0))
    const normPcP1 = math.norm(math.squeeze(vecPcP1))
    // TODO: 需要对acos进行判断
    const theta = math.acos(math.dot(vecPcP0, vecPcP1) / (normPcP0 * normPcP1))
    let pt0, pt1, d1, d2, thetaM, c
    if (Transformation.nearZero(math.abs(theta) - math.pi)) {
      pt0 = pc
      pt1 = pc
      d1 = math.norm(math.subtract(pt0, p0))
      d2 = 0
      thetaM = 0
      c = p1
      r = 0
      return {
        pt0,
        pt1,
        d1,
        d2,
        thetaM,
        c,
        r
      }
    }
    const rMax = math.multiply(math.min([normPcP0, normPcP1]), math.tan(theta / 2))
    if (r > rMax) {
      r = rMax
    }

    const vecPcPt0 = math.multiply(r / math.tan(theta / 2) / normPcP0, vecPcP0)
    const vecPcPt1 = math.multiply(r / math.tan(theta / 2) / normPcP1, vecPcP1)
    const vecPt0 = math.add(vecPc, vecPcPt0)
    const vecPt1 = math.add(vecPc, vecPcPt1)
    d1 = math.norm(math.squeeze(math.subtract(vecPt0, vecP0)))
    thetaM = math.pi - theta
    d2 = thetaM * r

    const vecPt0M = math.multiply(0.5, math.subtract(vecPt1, vecPt0))
    const vecM = math.add(vecPt0, vecPt0M)
    const vecPcM = math.subtract(vecM, vecPc)
    const normPcM = math.norm(math.squeeze(math.subtract(vecM, vecPc)))
    const normPcC = r / math.sin(theta / 2)
    const vecPcC = math.multiply(normPcC / normPcM, vecPcM)
    const vecC = math.add(vecPc, vecPcC)
    return {
      pt0: math.squeeze(vecPt0).toArray(),
      pt1: math.squeeze(vecPt1).toArray(),
      d1: d1,
      d2: d2,
      thetaM: thetaM,
      c: math.squeeze(vecC).toArray(),
      r: r
    }
  }

  /**
   * 路径合成
   * @param path
   * @param pathPt0
   * @param pathPt1
   * @param pathC
   * @param pathTheta
   * @param pathR
   * @returns {{pathLength: number, pathLengthI: *[]}}
   */
  #pathSynthesis = (path, pathPt0, pathPt1, pathC, pathTheta, pathR) => {
    let pathLength = 0
    const num = pathPt0.length
    const pathLengthI = []
    let l = math.norm(math.subtract(pathPt0[0], path[0]))
    pathLength += l
    pathLengthI.push(l)
    for (let i = 0; i < num - 1; i++) {
      l = pathTheta[i] * pathR[i]
      pathLength += l
      pathLengthI.push(l)
      l = math.norm(math.subtract(pathPt0[i + 1], pathPt1[i]))
      pathLength += l
      pathLengthI.push(l)
    }
    l = pathTheta.slice(-1) * pathR.slice(-1)
    pathLength += l
    pathLengthI.push(l)
    l = math.norm(math.subtract(path.at(-1), pathPt1.at(-1)))
    pathLength += l
    pathLengthI.push(l)
    return {
      pathLength,
      pathLengthI
    }
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
    const theta = math.atan2(math.sqrt(1 - math.pow(deltaQ, 2)), deltaQ)

    const sFunction = (s, ds, dds) => {
      let k0 = 0
      let k1 = 0
      if (deltaQ > 0.9995) {
        k0 = 1 - s
        k1 = s
      } else {
        k0 = math.sin((1 - s) * theta) / math.sin(theta)
        k1 = math.sin(s * theta) / math.sin(theta)
      }
      const a = Transformation.QuaternionTorpy(math.add(math.multiply(k0, q0), math.multiply(k1, q1)).valueOf())
      return {
        a,
        da: [0, 0, 0],
        dda: [0, 0, 0]
      }
    }

    return sFunction
  }

  /**
   * 姿态规划： 轴角
   * @param axisAngle0
   * @param axisAngle1
   */
  #attitudeAxisAngle = (axisAngle0, axisAngle1) => {
    const R0 = Transformation.AxisAngleToR(axisAngle0.axis, axisAngle0.theta)
    const R1 = Transformation.AxisAngleToR(axisAngle1.axis, axisAngle1.theta)
    const deltaR = math.multiply(Transformation.rotInv(R0), R1)
    const log3 = Transformation.MatrixLog3(deltaR)


    const sFunction = (s, ds, dds) => {
      const R = math.multiply(R0, Transformation.MatrixExp3(math.multiply(log3, s)))
      const a = Transformation.RTorpy(R)
      return {
        a,
        da: [0, 0, 0],
        dda: [0, 0, 0]
      }
    }

    return sFunction
  }
}

export {spaceStateEnum, velStateEnum, jointStateEnum, pathStateEnum, attitudeStateEnum, Plan}
