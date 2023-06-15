import {robot} from "@/utils/robot";
import {Plan} from "@/utils/plan";
import {StatusCodeEnum, getStatusFromCode} from "@/enums/status_code_enum";
import {Result} from "@/vo/result";

class RobotService {

  #plan

  // TODO: Cybaster / 20230521 / 增加规划失败的判断 (圆弧、多点)
  constructor() {
    // try {
    //   this.#plan = new Plan(trajectoryPara)
    //   return Result.ok()
    // } catch (error) {
    //   return Result.fail(error)
    // }
    // return Result.ok()
    this.#plan = null
  }

  planTrajectory = (trajectoryPara) => {
    try {
      this.#plan = new Plan(trajectoryPara)
      return Result.ok()
    } catch (error) {
      return Result.fail(error.statusCode)
    }
  }

  getStateViaJoint = (t) => {
    const {q, dq, ddq} = this.#plan.getTrajectory(t)
    const {dxs, ddxs} = robot.getDescartesViaJoint(q, dq, ddq)
    const result = {q, dq, ddq, dxs, ddxs}
    return Result.okData(result)
  }

  getStateViaDescartes = (t, q0) => {
    const {x, dx, ddx} = this.#plan.getTrajectory(t)
    try {
      const {qs, dqs, ddqs, JDet} = robot.getJointViaDescartes(x, dx, ddx, q0)
      // if (!qs.length) {
      //   console.log(getStatusFromCode(StatusCodeEnum.OUT_OF_WORKSPACE.code));
      //   return Result.fail(StatusCodeEnum.OUT_OF_WORKSPACE)
      // }
      if (JDet < 1e-6) {
        return Result.fail(StatusCodeEnum.SINGULARITY)
      }
      const result = {qs, dqs, ddqs, x, dx, ddx}
      return Result.okData(result)
    } catch (error) {
      console.log("进入错误");
      console.log(error);
      return Result.fail(error.statusCode)
    }
  }

  getTf = () => {
    return this.#plan.getTf
  }

  getRobotType = () => {
    return Result.okData(robot.getRobotType)
  }

  setJConfig = (q) => {
    robot.setJConfig(q)
    return Result.ok()
  }
}

export {RobotService}
