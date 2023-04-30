<template>
  <v-card class="model-container">
    <h1 class="text-center">轨迹规划</h1>
    <!-- 空间规划 -->
    <v-row class="my-4 text-center">
      <v-col cols="12">
        <div class="text-h5">规划空间</div>
      </v-col>
      <v-col class="v-col-12 v-col-md-6">
        <input type="radio" name="trajSpace" :value="0" v-model="trajSpace"/> 关节空间
      </v-col>
      <v-col class="v-col-12 v-col-md-6">
        <input type="radio" name="trajSpace" :value="1" v-model="trajSpace"/> 笛卡尔空间
      </v-col>
    </v-row>
    <hr />
    <!-- 速度规划 -->
    <v-row class="my-4 text-center">
      <v-col cols="12">
        <div class="text-h5">速度规划</div>
      </v-col>
      <v-col class="v-col-12 v-col-md-4">
        <input type="radio" name="planState" :value="0" v-model="planState"/> 三次多项式
      </v-col>
      <v-col class="v-col-12 v-col-md-4">
        <input type="radio" name="planState" :value="2" v-model="planState"/> 五次多项式
      </v-col>
      <v-col class="v-col-12 v-col-md-4">
        <input type="radio" name="planState" :value="1" v-model="planState"/> 梯型速度
      </v-col>
      <template class="mx-auto" v-if="[0, 2].indexOf(planState) !== -1">
        <v-col class="v-col-4 mx-auto">
          tf: <input class="ml-4 input-number" type="number" v-model="trajectoryPara.tf"/> (s)
        </v-col>
      </template>
      <template class="mx-auto" v-else-if="[1].indexOf(planState) !== -1">
        <v-col class="v-col-12">
          <div class="text-h6">最大速度</div>
        </v-col>
        <v-col class="v-col-12 v-col-md-4" v-for="index in 6">
          {{jointName[index - 1]}}: <input class="ml-4 input-number" type="number" v-model="trajectoryPara.vMax[index - 1]"/> (m/s)
        </v-col>
        <v-col class="v-col-12">
          <div class="text-h6">最大加速度</div>
        </v-col>
        <v-col class="v-col-12 v-col-md-4" v-for="index in 6">
          {{jointName[index - 1]}}: <input class="ml-4 input-number" type="number" v-model="trajectoryPara.aMax[index - 1]"/> (m/s^2)
        </v-col>
      </template>
    </v-row>
    <hr />
    <!--   路径规划   -->
    <v-row class="my-4 text-center">
        <v-col class="v-col-12">
          <div class="text-h5">路径规划</div>
        </v-col>
        <template v-if="trajSpace === trajSpaceEnum.JOINT">
          <v-col class="v-col-12">
            <div class="text-h6">目标点</div>
          </v-col>
          <v-col class="v-col-4"  v-for="(value, index) of qTarget.list">
            {{jointName[index]}}: <input class="ml-4 input-number" type="number" v-model="qTarget.list[index]"/>
          </v-col>
        </template>
        <template v-else-if="trajSpace === trajSpaceEnum.DESCARTES">
          <v-col class="v-col-3">
            <input type="radio" name="pathState" :value="0" v-model="pathState" /> 直线
          </v-col>
          <v-col class="v-col-3">
            <input type="radio" name="pathState" :value="1" v-model="pathState" /> 圆弧(中心)
          </v-col>
          <v-col class="v-col-3">
            <input type="radio" name="pathState" :value="2" v-model="pathState" /> 圆弧(途径点)
          </v-col>
          <v-col class="v-col-3">
            <input type="radio" name="pathState" :value="3" v-model="pathState" /> 多点
          </v-col>

          <!-- 中间点 -->
          <template v-if="[1, 2].indexOf(pathState) !== -1">
            <v-col class="v-col-12">
              <div class="text-h6">中间点</div>
            </v-col>
            <v-col class="v-col-4"  v-for="(value, index) of xTarget.list.slice(0, 3)">
              {{descartesName[index]}}: <input class="ml-4 input-number" type="number" v-model="xTarget.list[index]"/>
            </v-col>
          </template>
          <!-- 目标点 -->
          <template v-if="[0, 1, 2].indexOf(pathState) !== -1">
            <v-col class="v-col-12">
              <div class="text-h6">目标点</div>
            </v-col>
            <v-col class="v-col-4" v-for="(value, index) of xTarget.list.slice(0, 3)">
              {{descartesName[index]}}: <input class="ml-4 input-number" type="number" v-model="xTarget.list[index]"/>
            </v-col>
          </template>
        </template>
      </v-row>
    <hr />
    <!-- 姿态规划 -->
    <template v-if="trajSpace === trajSpaceEnum.DESCARTES">
      <v-row class="my-4 text-center">
        <v-col class="v-col-12">
          <div class="text-h5">姿态规划</div>
        </v-col>
        <v-col class="v-col-4">
          <input class="" type="radio" name="attitudeState" :value="0" v-model="attitudeState" /> 欧拉角
        </v-col>
        <v-col class="v-col-4">
          <input class="" type="radio" name="attitudeState" :value="1" v-model="attitudeState" /> 四元数
        </v-col>
        <v-col class="v-col-4">
          <input class="" type="radio" name="attitudeState" :value="2" v-model="attitudeState" /> 轴角
        </v-col>

        <v-col class="v-col-4" v-for="(value, index) of xTarget.list.slice(3, 6)">
          {{descartesName[index + 3]}}: <input class="ml-4 input-number" type="number" v-model="xTarget.list[index + 3]"/>
        </v-col>
      </v-row>
      <hr />
    </template>

    <v-btn @click="trajPlanning" class="mx-auto my-4 d-block text-h7 font-weight-black">规划</v-btn>

    <hr />

    <v-row class="my-4 text-center">
      <v-col class="v-col-12 v-col-md-6">
        <div class="text-h5 font-weight-medium">关节空间</div>
        <div ref="jointPosition" style="width: 100%; height: 300px" />
        <div ref="jointVelocity" style="width: 100%; height: 300px" />
        <div ref="jointAcceleration" style="width: 100%; height: 300px" />
      </v-col>
      <v-col class="v-col-12 v-col-md-6">
        <div class="text-h5 font-weight-medium">笛卡尔空间</div>
        <div ref="descartesPosition" style="width: 100%; height: 300px" />
        <div ref="descartesVelocity" style="width: 100%; height: 300px" />
        <div ref="descartesAcceleration" style="width: 100%; height: 300px" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import * as math from "mathjs";
import * as transformation from "@/utils/transformation";
import * as robot from "@/utils/robot"
import * as echarts from "echarts"
import {Plan} from "@/utils/plan";

const jointPosition = ref()
const descartesPosition = ref()
const jointVelocity = ref()
const descartesVelocity = ref()
const jointAcceleration = ref()
const descartesAcceleration = ref()

const timeArray = reactive([])
const timeStart = ref(0)
const fileInput = ref()
let jointPositionChart = null
let descartesPositionChart = null
let jointVelocityChart = null
let descartesVelocityChart = null
let jointAccelerationChart = null
let descartesAccelerationChart = null

const trajectoryPara = reactive({
  tf: 0,
  vMax: [1, 1, 1, 1, 1, 1],
  aMax: [1, 1, 1, 1, 1, 1]
})

const trajSpace = ref(0)
const planState = ref(0)
const pathState = ref(0)
const attitudeState = ref(0)
const qStart = reactive({
  list: [0, 0, 0, 0, 0, 0]
})
const qTarget = reactive({
  list: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
})
const qNowArray = reactive([])
const dqNow = reactive({
  list: [0, 0, 0, 0, 0, 0]
})
const dqNowArray = reactive([])
const ddqNowArray = []

const xStart = reactive({
  list: [0, 0, 0, 0, 0, 0]
})
const xTarget = reactive({
  list: [0, 0.0, 0.0, 0.0, 0.0, 0.0]
})
const xNowArray = reactive([])
const dxNow = reactive({
  list: [0, 0, 0, 0, 0, 0]
})
const dxNowArray = reactive([])

const store = useStore()

const trajSpaceEnum = {
  JOINT: 0,
  DESCARTES: 1
}
const planStateEnum = {
  CUBIC: 0,
  TCURVE: 1
}

const jointName = reactive([
  'joint1', 'joint2', 'joint3', 'joint4', 'joint5', 'joint6'
])
const descartesName = reactive([
  'px', 'py', 'pz', 'roll', 'pitch', 'yaw'
])

watch(trajSpace, ((newValue, oldValue) => {
  if (newValue === trajSpaceEnum.JOINT) {
    qTarget.list.forEach((value, index, array) => {
      array[index] = store.state.Q[index]
    })
  } else if (newValue === trajSpaceEnum.DESCARTES) {
    xTarget.list.forEach((value, index, array) => {
      array[index] = store.getters.X[index]
    })
  }
}))

const trajCubic = (tf) => {
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
  return {
    para: A,
    tf: tf
  }
}

const trajTCurve = (vmax, amax) => {
  let ta = vmax / amax;
  const pa = 0.5 * amax * math.pow(ta, 2)
  const tm = (1 - 2 * pa) / vmax
  let tf = tm + 2 * ta;

  if (tf - 2 * ta < 0) {
    ta = math.sqrt(1 / amax)
    tf = 2 * ta
  }

  return {
    ta,
    tf,
    vmax,
    amax
  }
}

const interpolation = (trajPara, t) => {
  let s, ds, dds;
  switch (planState.value) {
    case planStateEnum.CUBIC:
      if (t <= 0) {
        s = 0
        ds = 0
        dds = math.multiply(math.matrix([
          [0, 0, 2, 0]
        ]), trajPara.para).get([0, 0])
      } else if (t >= trajPara.tf) {
        s = 1
        ds = 0
        dds = math.multiply(math.matrix([
          [0, 0, 2, 6 * trajPara.tf]
        ]), trajPara.para).get([0, 0])
      } else {
        s = math.multiply(math.matrix([
          [1, t, math.pow(t, 2), math.pow(t, 3)]
        ]), trajPara.para).get([0, 0])
        ds = math.multiply(math.matrix([
          [0, 1, 2 * t, 3 * math.pow(t, 2)]
        ]), trajPara.para).get([0, 0])
        dds = math.multiply(math.matrix([
          [0, 0, 2, 6 * t]
        ]), trajPara.para).get([0, 0])
      }
      break;
    case planStateEnum.TCURVE:
      if (t <= 0) {
        s = 0
        ds = 0
        dds = 0
      } else if (t <= trajPara.ta) {
        s = 0.5 * trajPara.amax * math.pow(t, 2)
        ds = trajPara.amax * t
        dds = trajPara.amax
      } else if (t <= trajPara.tf - trajPara.ta) {
        s = 0.5 * trajPara.amax * math.pow(trajPara.ta, 2) + trajPara.amax * trajPara.ta * (t - trajPara.ta)
        ds = trajPara.vmax
        dds = 0
      } else if (t <= trajPara.tf) {
        s = 1 - 0.5 * trajPara.amax * math.pow(trajPara.tf - t, 2)
        ds = trajPara.amax * (trajPara.tf - t)
        dds = -trajPara.amax
      } else {
        s = 1
        ds = 0
        dds = 0
      }
      break
    default:
      break;
  }

  return [s, ds, dds]
}

let timer = null;
const trajPlanning = async () => {
  const tf = trajectoryPara.tf
  let trajPara;
  switch (planState.value) {
    case planStateEnum.CUBIC:
      trajPara = trajCubic(tf)
      break
    case planStateEnum.TCURVE:
      trajPara = trajTCurve(0.4, 0.1)
      break
    default:
      return
  }

  if (timer) {
    clearInterval(timer)
  }

  let t = 0;
  const dt = 0.1

  // TODO
  const plan = () => new Promise(resolve => {
    timer = setInterval(() => {
      if (t > trajPara.tf) {
        clearInterval(timer)
        resolve()
      }
      const [s, ds, dds] = interpolation(trajPara, t)

      let T, J;
      let xNow = [0, 0, 0, 0, 0, 0]
      let ddqNow = []
      // TODO: 不需要做成响应式
      switch (trajSpace.value) {
        case trajSpaceEnum.JOINT:
          for (let i = 0; i < 6; i++) {
            store.state.Q[i] = (qTarget.list[i] - qStart.list[i]) * s + qStart.list[i]
            dqNow.list[i] = (qTarget.list[i] - qStart.list[i]) * ds
            ddqNow.push((qTarget.list[i] - qStart.list[i]) * dds)
          }
          const xyzrpy = transformation.Tr2xyzrpy(store.getters.T)
          xStart.list.forEach((value, index, array) => {
            array[index] = xyzrpy[index]
          })
          J = robot.getJacobian(store.getters.dhPara, store.state.Q)
          dxNow.list = math.multiply(J, math.transpose(math.matrix(dqNow.list))).valueOf()

          break
        case trajSpaceEnum.DESCARTES:
          for (let i = 0; i < 6; i++) {
            xNow[i] = (xTarget.list[i] - xStart.list[i]) * s + xStart.list[i]
            dxNow.list[i] = (xTarget.list[i] - xStart.list[i]) * v
          }
          T = transformation.xyzrpy2Tr(xNow);
          store.state.Q = robot.iKine6s(store.getters.dhPara, T, qStart.list)
          J = robot.getJacobian(store.getters.dhPara, store.state.Q)
          dqNow.list = math.multiply(math.inv(J), math.transpose(math.matrix(dxNow.list))).valueOf()
          break
        default:
          break
      }

      qNowArray.push([...store.state.Q])
      xNowArray.push([...store.getters.X])
      dqNowArray.push([...dqNow.list])
      dxNowArray.push([...dxNow.list])
      ddqNowArray.push([...ddqNow])
      t += dt
    }, dt * 1000)
  })

  await plan()
  qStart.list.forEach((value, index, array) => {
    array[index] = store.state.Q[index]
  })
  renderJointPosition()
  renderDescartesPosition()
  renderJointVelocity()
  renderDescartesVelocity()
  renderJointAcceleration()
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
      bottom: '1%',
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
      boundaryGap: false
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

onMounted(() => {
  initChart()
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
    series
  }
  option && jointVelocityChart.setOption(option)
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
    series
  }
  option && descartesVelocityChart.setOption(option)
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
    series
  }
  option && jointAccelerationChart.setOption(option)
}

</script>

<style lang="scss" scoped>
//.model-container {
//  .input-container {
//    input {
//      width: 40%;
//      border-width: 2px !important;
//      border-color: #00000088;
//      border-radius: 10px;
//      border-style: solid;
//    }
//  }
//}

.input-number {
  width: 40%;
  border-width: 2px !important;
  border-color: #00000088;
  border-radius: 10px;
  border-style: solid;
}

</style>
