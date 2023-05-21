import {robot} from "@/utils/robot";
import {Plan} from "@/utils/plan";
import {StatusCodeEnum} from "@/enums/status_code_enum";
import {Result} from "@/vo/result";

class RobotService {

  #plan

  // TODO: Cybaster / 20230521 / 增加规划失败的判断 (圆弧、多点)
  constructor(trajectoryPara) {
    this.#plan = new Plan(trajectoryPara)
  }

  getStateViaJoint = (t) => {
    const {q, dq, ddq} = this.#plan.getTrajectory(t)
    const {dxs, ddxs} = robot.getDescartesViaJoint(q, dq, ddq)
    const result = {q, dq, ddq, dxs, ddxs}
    return Result.okData(result)
  }

  getStateViaDescartes = (t, q0) => {
    const {x, dx, ddx} = this.#plan.getTrajectory(t)
    const {qs, dqs, ddqs, JDet} = robot.getJointViaDescartes(x, dx, ddx, q0)
    if (!qs.length) {
      return Result.fail(StatusCodeEnum.OUT_OF_WORKSPACE)
    }
    if (JDet < 1e-6) {
      return Result.fail(StatusCodeEnum.SINGULARITY)
    }
    const result = {qs, dqs, ddqs, x, dx, ddx}
    return Result.okData(result)
  }

  getTf = () => {
    return this.#plan.getTf
  }
}

export {RobotService}
