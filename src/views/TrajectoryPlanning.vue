<template>
  <back-configuration/>
  <v-card class="model-container">
    <div class="my-4 text-center text-h4 font-weight-bold">轨迹规划</div>
    <v-divider/>
    <!-- 空间规划 -->
    <v-row class="my-4 text-center">
      <v-col cols="12">
        <div class="text-h5">规划空间</div>
      </v-col>
      <v-col class="v-col-12 v-col-md-6">
        <input type="radio" name="spaceState" :value="spaceStateEnum.JOINT" v-model="trajectoryPara.spaceState"/> 关节空间
      </v-col>
      <v-col class="v-col-12 v-col-md-6">
        <input type="radio" name="spaceState" :value="spaceStateEnum.DESCARTES" v-model="trajectoryPara.spaceState"/>
        笛卡尔空间
      </v-col>
    </v-row>
    <v-divider/>
    <!-- 速度规划 -->
    <v-row class="my-4 text-center">
      <v-col cols="12">
        <div class="text-h5">速度规划</div>
      </v-col>
      <v-col class="v-col-12 v-col-md-4">
        <input type="radio" name="velState" :value="velStateEnum.CUBIC" v-model="trajectoryPara.velState"/> 三次多项式
      </v-col>
      <v-col class="v-col-12 v-col-md-4">
        <input type="radio" name="velState" :value="velStateEnum.QUINTIC" v-model="trajectoryPara.velState"/> 五次多项式
      </v-col>
      <v-col class="v-col-12 v-col-md-4">
        <input type="radio" name="velState" :value="velStateEnum.TCURVE" v-model="trajectoryPara.velState"/> 梯型速度
      </v-col>
      <template class="mx-auto"
                v-if="[velStateEnum.CUBIC, velStateEnum.QUINTIC].indexOf(trajectoryPara.velState) !== -1">
        <v-col class="v-col-4 mx-auto">
          tf: <input class="ml-4 input-number" type="number" v-fixed="{obj:trajectoryPara, key: 'tf'}"/> (s)
        </v-col>
      </template>
      <template class="mx-auto" v-else-if="[velStateEnum.TCURVE].indexOf(trajectoryPara.velState) !== -1">
        <v-col class="v-col-12">
          <div class="text-h6">最大速度</div>
        </v-col>
        <v-col class="v-col-12 v-col-md-4" v-for="index in 6">
          <template v-if="spaceStateEnum.JOINT === trajectoryPara.spaceState">{{ jointName[index - 1] }}:</template>
          <template v-else-if="spaceStateEnum.DESCARTES === trajectoryPara.spaceState">{{ descartesName[index - 1] }}:
          </template>
          <input class="ml-4 input-number" type="number" v-fixed="{obj: trajectoryPara, key: 'vMax', index: index-1}"/>
          <template v-if="spaceStateEnum.JOINT === trajectoryPara.spaceState">(rad/s)</template>
          <template v-else-if="spaceStateEnum.DESCARTES === trajectoryPara.spaceState">
            <template v-if="index-1 < 3">(m/s)</template>
            <template v-else>(rad/s)</template>
          </template>
        </v-col>
        <v-col class="v-col-12">
          <div class="text-h6">最大加速度</div>
        </v-col>
        <v-col class="v-col-12 v-col-md-4" v-for="index in 6">
          <template v-if="spaceStateEnum.JOINT === trajectoryPara.spaceState">{{ jointName[index - 1] }}:</template>
          <template v-else-if="spaceStateEnum.DESCARTES === trajectoryPara.spaceState">{{ descartesName[index - 1] }}:
          </template>
          <input class="ml-4 input-number" type="number" v-fixed="{obj: trajectoryPara, key: 'aMax', index: index-1}"/>
          <template v-if="spaceStateEnum.JOINT === trajectoryPara.spaceState">(rad/s<sup>2</sup>)</template>
          <template v-else-if="spaceStateEnum.DESCARTES === trajectoryPara.spaceState">
            <template v-if="index-1 < 3">(m/s<sup>2</sup>)</template>
            <template v-else>(rad/s<sup>2</sup>)</template>
          </template>
        </v-col>
      </template>
    </v-row>
    <v-divider/>
    <!-- 路径规划 -->
    <v-row class="my-4 text-center">
      <v-col class="v-col-12">
        <div class="text-h5">路径规划</div>
      </v-col>
      <template v-if="spaceStateEnum.JOINT === trajectoryPara.spaceState">
        <v-col class="v-cols-6">
          <input type="radio" name="jointState" :value="jointStateEnum.LINE" v-model="trajectoryPara.jointState"/> 直线
        </v-col>
        <v-col class="v-cols-6">
          <input type="radio" name="jointState" :value="jointStateEnum.MOTION" v-model="trajectoryPara.jointState"/>
          motion
        </v-col>
        <template v-if="jointStateEnum.LINE === trajectoryPara.jointState">
          <v-col class="v-col-12">
            <div class="text-h6">目标点</div>
          </v-col>
          <v-col class="v-col-4" v-for="(value, index) in trajectoryPara.q1">
            {{ jointName[index] }}: <input class="ml-4 input-number" type="number"
                                           v-fixed="{obj: trajectoryPara, key: 'q1', index: index}"/> (rad)
          </v-col>
        </template>
        <template v-else-if="jointStateEnum.MOTION === trajectoryPara.jointState">
          <v-col class="v-col-12">
            <a href="./trajectory.csv" download="trajectory.csv">样本</a>
          </v-col>
          <v-col class="v-col-12">
            <v-file-input label="File input" actions="" ref="fileInput" accept=".csv"></v-file-input>
          </v-col>
        </template>
      </template>
      <template v-else-if="spaceStateEnum.DESCARTES === trajectoryPara.spaceState">
        <v-col class="v-col-3">
          <input type="radio" name="pathState" :value="pathStateEnum.LINE" v-model="trajectoryPara.pathState"/> 直线
        </v-col>
        <v-col class="v-col-3">
          <input type="radio" name="pathState" :value="pathStateEnum.ARC_CENTER" v-model="trajectoryPara.pathState"/>
          圆弧(中心)
        </v-col>
        <v-col class="v-col-3">
          <input type="radio" name="pathState" :value="pathStateEnum.ARC_POINT" v-model="trajectoryPara.pathState"/>
          圆弧(途径点)
        </v-col>
        <v-col class="v-col-3">
          <input type="radio" name="pathState" :value="pathStateEnum.POINTS" v-model="trajectoryPara.pathState"/> 多点
        </v-col>

        <!-- 中间点 -->
        <template v-if="[pathStateEnum.ARC_CENTER, pathStateEnum.ARC_POINT].indexOf(trajectoryPara.pathState) !== -1">
          <v-col class="v-col-12">
            <div class="text-h6">中间点</div>
          </v-col>
          <v-col class="v-col-4" v-for="(value, index) of trajectoryPara.x1.slice(0, 3)">
            {{ descartesName[index] }}: <input class="ml-4 input-number" type="number"
                                               v-fixed="{obj: trajectoryPara, key: 'xc', index: index}"/> (m)
          </v-col>
        </template>
        <!-- 目标点 -->
        <template
          v-if="[pathStateEnum.LINE, pathStateEnum.ARC_CENTER, pathStateEnum.ARC_POINT].indexOf(trajectoryPara.pathState) !== -1">
          <v-col class="v-col-12">
            <div class="text-h6">目标点</div>
          </v-col>
          <v-col class="v-col-4" v-for="(value, index) of trajectoryPara.x1.slice(0, 3)">
            {{ descartesName[index] }}: <input class="ml-4 input-number" type="number"
                                               v-fixed="{obj: trajectoryPara, key: 'x1', index: index}"/> (m)
          </v-col>
        </template>
        <template v-else-if="[pathStateEnum.POINTS].indexOf(trajectoryPara.pathState) !== -1">
          <v-col class="v-col-4 mx-auto">
            目标点数量: <input class="ml-4 input-number" type="number"
                          v-fixed="{obj: trajectoryPara, key: 'pointNum', digit: 0}"/>
          </v-col>
          <v-col class="v-col-12 pa-0"></v-col>
          <template v-for="(val, ind) in trajectoryPara.pointNum">
            <v-col class="v-col-4" v-for="(value, index) in 3">
              {{descartesName[index]}}: <input class="ml-4 input-number" type="number"
                                               v-fixed="{obj: trajectoryPara.points, key: ind, index}"/> (m)
            </v-col>
          </template>
        </template>
      </template>
    </v-row>
    <v-divider/>
    <!-- 姿态规划 -->
    <template v-if="spaceStateEnum.DESCARTES === trajectoryPara.spaceState">
      <v-container class="my-4 text-center">
        <v-row justify="center">
          <div class="text-h5">姿态规划</div>
        </v-row>

        <v-row justify="center">
          <v-col class="v-col-12 v-col-md-4">
            <input class="" type="radio" name="attitudeState" :value="0" v-model="trajectoryPara.attitudeState"/> 欧拉角
          </v-col>
          <v-col class="v-col-12 v-col-md-4">
            <input class="" type="radio" name="attitudeState" :value="1" v-model="trajectoryPara.attitudeState"/> 四元数
          </v-col>
          <v-col class="v-col-12 v-col-md-4">
            <input class="" type="radio" name="attitudeState" :value="2" v-model="trajectoryPara.attitudeState"/> 轴角
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col class="v-col-12 v-col-md-4" v-for="(value, index) of trajectoryPara.x1.slice(3, 6)">
            {{ descartesName[index + 3] }}: <input class="ml-4 input-number" type="number"
                                                   v-fixed="{obj: trajectoryPara, key: 'x1', index: index + 3}"/> (rad)
          </v-col>
        </v-row>
        <template v-if="attitudeStateEnum.QUATERNION === trajectoryPara.attitudeState">
          <v-row>
            <v-col class="v-col-12 v-col-md-3" v-for="(value, index) in 4">
              q{{index}}: <input class="ml-4 input-number" type="number" disabled :value="$filters.toFixed(trajectoryPara.quaternion[index])"/>
            </v-col>
          </v-row>
        </template>
        <template v-else-if="attitudeStateEnum.AXIS_ANGLE === trajectoryPara.attitudeState">
          <v-row justify="space-around">
            <v-col class="v-col-12 v-col-md-3">
              <div>轴线</div>
              <v-table>
                <tbody>
                <tr v-for="(value, index) in 3">
                  <td>{{$filters.toFixed(trajectoryPara.axisAngle.axis[index])}}</td>
                </tr>
                </tbody>
              </v-table>
            </v-col>
            <v-col class="v-col-12 v-col-md-3 d-inline-flex flex-column">
              <div>角度</div>
              <div class="my-auto" >{{$filters.toFixed(trajectoryPara.axisAngle.theta)}}</div>
            </v-col>
          </v-row>
        </template>
      </v-container>
      <v-divider/>
    </template>
    <v-btn @click="trajectoryPlan" class="mx-auto my-4 d-block text-h7 font-weight-black">规划</v-btn>
    <v-divider/>
    <!-- 绘图 -->
    <v-row class="my-4 text-center">
      <v-col class="v-col-12 v-col-md-6">
        <div class="text-h5 font-weight-medium">关节空间</div>
        <div ref="jointPosition" style="width: 100%; height: 300px"/>
        <div ref="jointVelocity" style="width: 100%; height: 300px"/>
        <div ref="jointAcceleration" style="width: 100%; height: 300px"/>
      </v-col>
      <v-col class="v-col-12 v-col-md-6">
        <div class="text-h5 font-weight-medium">笛卡尔空间</div>
        <div ref="descartesPosition" style="width: 100%; height: 300px"/>
        <div ref="descartesVelocity" style="width: 100%; height: 300px"/>
        <div ref="descartesAcceleration" style="width: 100%; height: 300px"/>
      </v-col>
    </v-row>
    <v-divider />
    <v-row class="my-4 text-center" justify="center">
      <div class="text-h5">路径</div>
    </v-row>
    <v-row class="my-4" justify="center">
      <v-col class="v-col-12 v-col-md-6">
        <div ref="xzPath" style="width: 100%; height: 300px;" />
        <div ref="xyPath" style="width: 100%; height: 300px;" />
      </v-col>
      <v-col class="v-col-12 v-col-md-6">
        <div ref="yzPath" style="width: 100%; height: 300px;" />
        <div ref="xyzPath" style="width: 100%; height: 300px;" />
      </v-col>
    </v-row>
  </v-card>
  <ErrorDialog :message="errorMessage" v-model:dialog="errorDialog" />
</template>

<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import {robot} from "@/utils/robot"
import {Transformation} from "@/utils/transformation";
import * as echarts from "echarts"
import 'echarts-gl'
import {spaceStateEnum, velStateEnum, jointStateEnum, pathStateEnum, attitudeStateEnum, Plan} from "@/utils/plan";
import {RobotService} from "@/services/robotService";
import ErrorDialog from "@/components/dialog/ErrorDialog"

const store = useStore()

const errorDialog = ref(false)
const errorMessage = reactive({
  title: "",
  text: ""
})

const jointPosition = ref()
const descartesPosition = ref()
const jointVelocity = ref()
const descartesVelocity = ref()
const jointAcceleration = ref()
const descartesAcceleration = ref()

const xzPath = ref()
const xyPath = ref()
const yzPath = ref()
const xyzPath = ref()

const timeArray = reactive([])
const timeStart = ref(0)
const fileInput = ref()
let jointPositionChart = null
let descartesPositionChart = null
let jointVelocityChart = null
let descartesVelocityChart = null
let jointAccelerationChart = null
let descartesAccelerationChart = null

let xzPathChart = null
let xyPathChart = null
let yzPathChart = null
let xyzPathChart = null

const qNowArray = []
const dqNowArray = []
const ddqNowArray = []
const xNowArray = []
const dxNowArray = []
const ddxNowArray = []

const trajectoryPara = reactive({
  tf: 1,
  vMax: [1, 1, 1, 1, 1, 1],
  aMax: [1, 1, 1, 1, 1, 1],
  spaceState: spaceStateEnum.JOINT,
  velState: velStateEnum.CUBIC,
  jointState: jointStateEnum.LINE,
  pathState: pathStateEnum.LINE,
  attitudeState: attitudeStateEnum.EULER,
  q0: [...store.state.Q],   // 关节起始角
  q1: [...store.state.Q],   // 关节终止角
  x0: [...store.getters.X], // 末端起始点
  x1: [...store.getters.X], // 末端终点点
  xc: [...store.getters.X], // 圆弧中心点/中间点
  pointNum: 1,
  points: [[...store.getters.X.slice(0, 3)]],
  quaternion: [...store.getters.quaternion],
  axisAngle: {
    axis: [...store.getters.axisAngle.axis],
    theta: store.getters.axisAngle.theta
  }
})

const jointName = reactive([
  'Joint1', 'Joint2', 'Joint3', 'Joint4', 'Joint5', 'Joint6'
])
const descartesName = reactive([
  'Px', 'Py', 'Pz', 'Roll', 'Pitch', 'Yaw'
])

watch(() => trajectoryPara.spaceState, ((newValue, oldValue) => {
  if (spaceStateEnum.JOINT === newValue) {
    trajectoryPara.q1.forEach((value, index, array) => {
      array[index] = store.state.Q[index]
    })
  } else if (spaceStateEnum.DESCARTES === newValue) {
    trajectoryPara.x1.forEach((value, index, array) => {
      array[index] = store.getters.X[index]
    })
    trajectoryPara.xc.forEach((value, index, array) => {
      array[index] = store.getters.X[index]
    })
    trajectoryPara.points[0].forEach((value, index, array) => {
      array[index] = store.getters.X[index]
    })
  }
}))

watch(() => trajectoryPara.pointNum, (newValue, oldValue) => {
  if (newValue < oldValue) {
    trajectoryPara.points.length = newValue
  } else {
    for (let i = 0; i < newValue - oldValue; i++) {
      trajectoryPara.points.push([...store.getters.X.slice(0, 3)])
    }
  }
})

watch(() => [...trajectoryPara.x1.slice(3, 6)], ((newValue, oldValue) => {
  Transformation.rpyToQuaternion(...newValue).forEach((value, index) => {
    trajectoryPara.quaternion[index] = value
  })

  const axisAngle = Transformation.rpyToAxisAngle(...newValue)
  trajectoryPara.axisAngle.theta = axisAngle.theta
  axisAngle.axis.forEach((value, index) => {
    trajectoryPara.axisAngle.axis[index] = value
  })
}))

let dt = 0.1
let timer = null;
const trajectoryPlan = async () => {
  if (timeArray.length) {
    var timeLast = timeArray.pop()
    var qNowLast = qNowArray.pop()
    var xNowLast =  xNowArray.pop()
    var dqNowLast = dqNowArray.pop()
    var dxNowLast = dxNowArray.pop()
    var ddqNowLast = ddqNowArray.pop()
    var ddxNowLast = ddxNowArray.pop()
  }

  let tf = 0

  if (jointStateEnum.MOTION === trajectoryPara.jointState) {
    var jointsArray = []
    const readMotionFile = () => new Promise(resolve => {
      const resultFile = fileInput.value.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(resultFile)
      reader.onload = async function (e) {
        const urlData = this.result
        const trajectory = window.atob(urlData.split(',')[1]).trim()
        const trajectoryData = trajectory.split('\r\n')
        trajectoryData.forEach(value => {
          const v = value.split(',')
          const joints = []
          for (let i = 1; i < v.length; i++) {
            joints.push(parseFloat(v[i]))
          }
          jointsArray.push(joints)
        })
        resolve()
      }
    })
    await readMotionFile()
    tf = (jointsArray.length - 1) * dt
  } else {
    // var robotService = new RobotService(trajectoryPara)
    var robotService = new RobotService()
    const planResult = robotService.planTrajectory(trajectoryPara)
    if (!planResult.flag) {
      timeArray.push(timeLast)
      qNowArray.push(qNowLast)
      xNowArray.push(xNowLast)
      dqNowArray.push(dqNowLast)
      dxNowArray.push(dxNowLast)
      ddqNowArray.push(ddqNowLast)
      ddxNowArray.push(ddxNowLast)

      errorMessage.title = planResult.message.title
      errorMessage.text = planResult.message.text
      errorDialog.value = true
      return
    }
    tf = robotService.getTf()
    robotService.setJConfig([...store.state.Q])
  }

  if (timer) {
    clearInterval(timer)
  }

  let t = 0
  let dqLast = [0, 0, 0, 0, 0, 0]
  const planning = () => new Promise(resolve => {
    timer = setInterval(async () => {
      if ((t > tf) || (Math.abs(t - tf) < 1e-6)) {
        clearInterval(timer)
        setTimeout(() => {
          timeStart.value += t - dt
          resolve()
        }, dt * 1000)
      }

      const dqNow = []
      const dxNow = []
      const ddqNow = []
      const ddxNow = []
      switch (trajectoryPara.spaceState) {
        case spaceStateEnum.JOINT:
          switch (trajectoryPara.jointState) {
            case jointStateEnum.LINE:
              const resultJointLine = robotService.getStateViaJoint(t)
              if (!resultJointLine.flag) {
                if (timer) {
                  clearInterval(timer)
                }

                // t = 0说明没有运动，但每次规划会pop最后一个，如果没有运动要把最后一个补回来
                if (t <= 0) {
                  timeArray.push(timeLast)
                  qNowArray.push(qNowLast)
                  xNowArray.push(xNowLast)
                  dqNowArray.push(dqNowLast)
                  dxNowArray.push(dxNowLast)
                  ddqNowArray.push(ddqNowLast)
                  ddxNowArray.push(ddxNowLast)
                } else {
                  timeStart.value += t - dt
                }
                resolve()
                errorMessage.title = resultJointLine.message.title
                errorMessage.text = resultJointLine.message.text
                errorDialog.value = true
                return
              }
              const {q, dq, ddq, dxs, ddxs} = resultJointLine.data
              store.commit("setQ", q)
              for (let i = 0; i < 6; i++) {
                dqNow.push(dq[i])
                ddqNow.push(ddq[i])
                dxNow.push(dxs[i])
                ddxNow.push(ddxs[i])
              }
              break
            case jointStateEnum.MOTION:
              if (jointsArray.length > 0) {
                const lastQ = [...store.state.Q]
                const thisQ = jointsArray.shift()
                store.commit("setQ", thisQ)
                for (let i = 0; i < 6; i++) {
                  dqNow.push((thisQ[i] - lastQ[i]) / dt)
                  ddqNow.push((dqNow[i] - dqLast[i]) / dt)
                }
                dqLast = [...dqNow]
                const {dxs, ddxs} = robot.getDescartesViaJoint(thisQ, dqNow, ddqNow)
                for (let i = 0; i < 6; i++) {
                  dxNow.push(dxs[i])
                  ddxNow.push(ddxs[i])
                }
              }
              break
            default:
              break
          }
          break
        case spaceStateEnum.DESCARTES:
          const resultDescartes = robotService.getStateViaDescartes(t, [...store.state.Q])
          if (!resultDescartes.flag) {
            console.log("求解失败")
            console.log(resultDescartes.message)
            if (timer) {
              clearInterval(timer)
            }

            // t = 0说明没有运动，但每次规划会pop最后一个，如果没有运动要把最后一个补回来
            if (t <= 0) {
              timeArray.push(timeLast)
              qNowArray.push(qNowLast)
              xNowArray.push(xNowLast)
              dqNowArray.push(dqNowLast)
              dxNowArray.push(dxNowLast)
              ddqNowArray.push(ddqNowLast)
              ddxNowArray.push(ddxNowLast)
            } else {
              timeStart.value += t - dt
            }
            resolve()
            errorMessage.title = resultDescartes.message.title
            errorMessage.text = resultDescartes.message.text
            errorDialog.value = true
            return
          }
          const {x, dx, ddx, qs, dqs, ddqs} = resultDescartes.data
          store.commit('setQ', qs)
          for (let i = 0; i < 6; i++) {
            dqNow.push(dqs[i])
            ddqNow.push(ddqs[i])
            dxNow.push(dx[i])
            ddxNow.push(ddx[i])
          }
          break
        default:
          break
      }

      timeArray.push((timeStart.value + t).toFixed(2))
      qNowArray.push([...store.state.Q])
      xNowArray.push([...store.getters.X])
      dqNowArray.push([...dqNow])
      dxNowArray.push([...dxNow])
      ddqNowArray.push([...ddqNow])
      ddxNowArray.push([...ddxNow])
      t += dt
    }, dt * 1000)
  })

  await planning()
  trajectoryPara.q0.forEach((value, index, array) => {
    array[index] = store.state.Q[index]
  })
  trajectoryPara.x0.forEach((value, index, array) => {
    array[index] = store.getters.X[index]
  })
  trajectoryPara.q1.forEach((value, index, array) => {
    array[index] = store.state.Q[index]
  })
  trajectoryPara.x1.forEach((value, index, array) => {
    array[index] = store.getters.X[index]
  })

  renderJointPosition()
  renderDescartesPosition()
  renderJointVelocity()
  renderDescartesVelocity()
  renderJointAcceleration()
  renderDescartesAcceleration()

  renderPath()
}

const initChart = () => {
  jointPositionChart = echarts.init(jointPosition.value)
  descartesPositionChart = echarts.init(descartesPosition.value)
  jointVelocityChart = echarts.init(jointVelocity.value)
  descartesVelocityChart = echarts.init(descartesVelocity.value)
  jointAccelerationChart = echarts.init(jointAcceleration.value)
  descartesAccelerationChart = echarts.init(descartesAcceleration.value)


  const initOption = {
    grid: {
      left: '3%',
      top: '35%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) => value.toFixed(3)
    },
    legend: {
      left: 20,
      top: '15%',
      icon: 'circle'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      name: "t(s)",
      nameLocation: 'center',
      nameTextStyle: {
        fontSize: 15
      },
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value, index) => {
          return value.toFixed(2)
        }
      }
    },
    title: {
      left: "center",
      top: "5%",
    }
  }

  const titleArray = ["Joint Position", "Descartes Position", "Joint Velocity",
    "Descartes Velocity", "Joint Acceleration", "Descartes Acceleration"]

  const titleOptions = titleArray.map((value) => {
    return {
      title: {
        text: value,
      }
    }
  })

  initOption && jointPositionChart.setOption(initOption)
  initOption && descartesPositionChart.setOption(initOption)
  initOption && jointVelocityChart.setOption(initOption)
  initOption && descartesVelocityChart.setOption(initOption)
  initOption && jointAccelerationChart.setOption(initOption)
  initOption && descartesAccelerationChart.setOption(initOption)
  jointPositionChart.setOption(titleOptions[0])
  descartesPositionChart.setOption(titleOptions[1])
  jointVelocityChart.setOption(titleOptions[2])
  descartesVelocityChart.setOption(titleOptions[3])
  jointAccelerationChart.setOption(titleOptions[4])
  descartesAccelerationChart.setOption(titleOptions[5])
}

const initPathChart = () => {
  xzPathChart = echarts.init(xzPath.value)
  xyPathChart = echarts.init(xyPath.value)
  yzPathChart = echarts.init(yzPath.value)
  xyzPathChart = echarts.init(xyzPath.value)

  const initOption = {
    animation: true,
    grid: {
      left: "3%",
      top: "35%",
      right: "4%",
      bottom: "10%",
      containLabel: true
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => value.toFixed(3)
    },
    legend: {
      left: 20,
      top: "15%",
      icon: "circle"
    },
    xAxis: {
      // type: "category",
      // type: "value",
      axisLabel: {
        formatter: (value) => {
          return parseFloat(value).toFixed(3)
        }
      },
      boundaryGap: false,
      nameLocation: 'center',
      nameTextStyle: {
        fontSize: 15
      },
      nameGap: 30
    },
    yAxis: {
      // type: "value",
      axisLabel: {
        formatter: (value) => {
          return value.toFixed(3)
        }
      },
      nameLocation: 'center',
      nameTextStyle: {
        fontSize: 15
      },
      nameGap: 30
    },
    series: {
      type: "line",
      showSymbol: false,
      clip: true,
    },
    title: {
      left: "center",
      top: "5%"
    }
  }

  const initOption3D = {
    animation: true,
    grid3D: {},
    xAxis3D: {
      name: "x(m)",
      nameLocation: "center",
      nameTextStyle: {
        fontSize: 15
      }
    },
    yAxis3D: {
      name: "y(m)",
      nameLocation: "center",
      nameTextStyle: {
        fontSize: 15
      }
    },
    zAxis3D: {
      name: "z(m)",
      nameLocation: "center",
      nameTextStyle: {
        fontSize: 15
      }
    },
    series: [
      {
        type: "line3D",
        showSymbol: false,
        clip: true,
      }
    ],
    title: {
      text: "X-Y-Z",
      left: "center",
      top: "5%"
    }
  }

  const xAxisNames = ["x(m)", "x(m)", "y(m)"]
  const yAxisNames = ["z(m)", "y(m)", "z(m)"]
  const titles = ["X-Z", "X-Y", "Y-Z"]
  const titleOptions = titles.map((value, index) => {
    return {
      xAxis: {
        name: xAxisNames[index]
      },
      yAxis: {
        name: yAxisNames[index]
      },
      title: {
        text: value
      }
    }
  })

  xzPathChart.setOption(initOption)
  xyPathChart.setOption(initOption)
  yzPathChart.setOption(initOption)
  xyzPathChart.setOption(initOption3D)
  xzPathChart.setOption(titleOptions[0])
  xyPathChart.setOption(titleOptions[1])
  yzPathChart.setOption(titleOptions[2])
}

onMounted(() => {
  initChart()
  initPathChart()
})

const renderJointPosition = () => {
  const series = []
  for (let i = 0; i < 6; i++) {
    series.push({
      data: qNowArray.map(value => {
        return value[i]
      }),
      type: 'line',
      name: jointName[i]
    })
  }

  const option = {
    xAxis: {
      data: timeArray
    },
    series
  }

  option && jointPositionChart.setOption(option)
}

const renderJointVelocity = () => {
  const series = []
  for (let i = 0; i < 6; i++) {
    series.push({
      data: dqNowArray.map(value => {
        return value[i];
      }),
      type: 'line',
      name: jointName[i]
    })
  }

  const option = {
    xAxis: {
      data: timeArray
    },
    series
  }
  option && jointVelocityChart.setOption(option)
}

const renderJointAcceleration = () => {
  const series = []
  for (let i = 0; i < 6; i++) {
    series.push({
      data: ddqNowArray.map(value => {
        return value[i]
      }),
      type: 'line',
      name: jointName[i]
    })
  }

  const option = {
    xAxis: {
      data: timeArray
    },
    series
  }
  option && jointAccelerationChart.setOption(option)
}

const renderDescartesPosition = () => {
  const series = []
  for (let i = 0; i < 6; i++) {
    series.push({
      data: xNowArray.map(value => {
        return value[i]
      }),
      type: 'line',
      name: descartesName[i]
    })
  }

  const option = {
    xAxis: {
      data: timeArray
    },
    series
  }
  option && descartesPositionChart.setOption(option)
}

const renderDescartesVelocity = () => {
  const series = []
  for (let i = 0; i < 6; i++) {
    series.push({
      data: dxNowArray.map(value => {
        return value[i];
      }),
      type: 'line',
      name: descartesName[i]
    })
  }

  const option = {
    xAxis: {
      data: timeArray
    },
    series
  }
  option && descartesVelocityChart.setOption(option)
}

const renderDescartesAcceleration = () => {
  const series = []
  for (let i = 0; i < 6; i++) {
    series.push({
      data: ddxNowArray.map(value => {
        return value[i]
      }),
      type: 'line',
      name: descartesName[i]
    })
  }

  const option = {
    xAxis: {
      data: timeArray
    },
    series
  }
  option && descartesAccelerationChart.setOption(option)
}

const renderPath = () => {
  const xz = []
  const xy = []
  const yz = []
  const xyz = []
  xNowArray.forEach(value => {
    xz.push([value[0], value[2]])
    yz.push([value[1], value[2]])
    xy.push([value[0], value[1]])
    xyz.push([value[0], value[1], value[2]])
  })


  const optionXZ = {
    series: {
      data: xz,
    },
  }

  const optionYZ = {
    series: {
      data: yz,
    },
  }

  const optionXY = {
    series: {
      data: xy,
    },
  }
  const optionXYZ = {
    series: {
      data: xyz
    }
  }

  xzPathChart.setOption(optionXZ)
  yzPathChart.setOption(optionYZ)
  xyPathChart.setOption(optionXY)
  xyzPathChart.setOption(optionXYZ)
}

</script>

<style lang="scss" scoped>
.input-number {
  width: 40%;
  border-width: 2px !important;
  border-color: #00000088;
  border-radius: 10px;
  border-style: solid;
}

</style>
