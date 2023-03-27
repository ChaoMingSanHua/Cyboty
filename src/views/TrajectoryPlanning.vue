<template>
  <v-card class="model-container">
    <h1 class="text-center">轨迹规划</h1>
    <v-row class="mt-4">
      <v-col md="3" cols="12">
        <input type="radio" name="trajSpace" :value="0" v-model="trajSpace"/> 关节空间
      </v-col>
      <v-col md="3" cols="12">
        <input type="radio" name="trajSpace" :value="1" v-model="trajSpace"/> 笛卡尔空间
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col md="3" cols="12">
        <input type="radio" name="planState" :value="0" v-model="planState"/> 三次多项式
      </v-col>
      <v-col md="3" cols="12">
        <input type="radio" name="planState" :value="1" v-model="planState"/> 梯型速度
      </v-col>
    </v-row>

    <v-row class="input-container">
      <v-col md="2" v-for="(value, index) of qTarget.list">
        <template v-if="trajSpace === trajSpaceEnum.JOINT">
          关节{{ index + 1 }}:<input class="ml-4" type="number" v-model="qTarget.list[index]"/>
        </template>
        <template v-else-if="trajSpace === trajSpaceEnum.DESCARTES">
          <input type="number" v-model="xTarget.list[index]"/>
        </template>
      </v-col>
    </v-row>

    <v-btn @click="trajPlanning" class="mx-auto d-block mt-4">规划</v-btn>

    <v-row class="mt-4">
      <v-col class="v-col-md-4 v-col-12">
        <div ref="jointPosition" style="width: 100%; height: 300px"></div>
      </v-col>
      <v-col class="v-col-md-4 v-col-12">
        <div ref="jointVelocity" style="width: 100%; height: 300px"></div>
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col class="v-col-md-4 v-col-12">
        <div ref="descartesPosition" style="width: 100%; height: 300px"></div>
      </v-col>
      <v-col class="v-col-md-4 v-col-12">
        <div ref="descartesVelocity" style="width: 100%; height: 300px"></div>
      </v-col>
    </v-row>


<!--    <div ref="descartesPosition" style="width: 500px; height: 500px"></div>-->

<!--    <div ref="jointVelocity" style="width: 500px; height: 500px"></div>-->
<!--    <div ref="descartesVelocity" style="width: 500px; height: 500px"></div>-->
  </v-card>
</template>

<script setup>
import {computed, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import * as math from "mathjs";
import * as transformation from "@/utils/transformation";
import * as robot from "@/utils/robot"
import * as echarts from "echarts"

const jointPosition = ref()
const descartesPosition = ref()
const jointVelocity = ref()
const descartesVelocity = ref()

const trajSpace = ref(0)
const planState = ref(0)
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
  let s, v;
  switch (planState.value) {
    case planStateEnum.CUBIC:
      if (t <= 0) {
        s = 0
        v = 0
      } else if (t >= trajPara.tf) {
        s = 1
        v = 0
      } else {
        s = math.multiply(math.matrix([
          [1, t, math.pow(t, 2), math.pow(t, 3)]
        ]), trajPara.para).get([0, 0])
        v = math.multiply(math.matrix([
          [0, 1, 2 * t, 3 * math.pow(t, 2)]
        ]), trajPara.para).get([0, 0])
      }
      break;
    case planStateEnum.TCURVE:
      if (t <= 0) {
        s = 0
        v = 0
      } else if (t <= trajPara.ta) {
        s = 0.5 * trajPara.amax * math.pow(t, 2)
        v = trajPara.amax * t
      } else if (t <= trajPara.tf - trajPara.ta) {
        s = 0.5 * trajPara.amax * math.pow(trajPara.ta, 2) + trajPara.amax * trajPara.ta * (t - trajPara.ta)
        v = trajPara.vmax
      } else if (t <= trajPara.tf) {
        s = 1 - 0.5 * trajPara.amax * math.pow(trajPara.tf - t, 2)
        v = trajPara.amax * (trajPara.tf - t)
      } else {
        s = 1
        v = 0
      }
      break
    default:
      break;
  }

  return [s, v]
}

let timer = null;
const trajPlanning = async () => {
  const tf = 2
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
      const [s, v] = interpolation(trajPara, t)

      let T, J;
      let xNow = [0, 0, 0, 0, 0, 0]
      // TODO: 不需要做成响应式
      switch (trajSpace.value) {
        case trajSpaceEnum.JOINT:
          for (let i = 0; i < 6; i++) {
            store.state.Q[i] = (qTarget.list[i] - qStart.list[i]) * s + qStart.list[i]
            dqNow.list[i] = (qTarget.list[i] - qStart.list[i]) * v
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
}

const renderJointPosition = () => {
  const mychart = echarts.init(jointPosition.value)

  const series = []
  for (let i = 0; i < 6; i++) {
    series.push({
      data: qNowArray.map(value => {
        return value[i]
      }),
      type: 'line'
    })
  }

  const option = {
    xAxis: {
      type: 'category'
    },
    yAxis: {
      type: 'value'
    },
    series
  }

  option && mychart.setOption(option)
}

const renderDescartesPosition = () => {
  const myChart = echarts.init(descartesPosition.value)

  const series = []
  for (let i = 0; i < 6; i++) {
    series.push({
      data: xNowArray.map(value => {
        return value[i]
      }),
      type: 'line'
    })
  }

  const option = {
    xAxis: {
      type: 'category'
    },
    yAxis: {
      type: 'value',
    },
    series
  }
  option && myChart.setOption(option)
}

const renderJointVelocity = () => {
  // const chartDom = document.getElementById('jointVelocity')
  const myChart = echarts.init(jointVelocity.value)

  const series = []
  for (let i = 0; i < 6; i++) {
    series.push({
      data: dqNowArray.map(value => {
        return value[i];
      }),
      type: 'line'
    })
  }

  const option = {
    xAxis: {
      type: 'category'
    },
    yAxis: {
      type: 'value',
    },
    series
  }
  option && myChart.setOption(option)
}

const renderDescartesVelocity = () => {
  const myChart = echarts.init(descartesVelocity.value)

  const series = []
  for (let i = 0; i < 6; i++) {
    series.push({
      data: dxNowArray.map(value => {
        return value[i];
      }),
      type: 'line'
    })
  }

  const option = {
    xAxis: {
      type: 'category'
    },
    yAxis: {
      type: 'value',
    },
    series
  }
  option && myChart.setOption(option)
}

</script>

<style lang="scss" scoped>
.model-container {
  .input-container {
    input {
      width: 40%;
      border-width: 2px !important;
      border-color: #00000088;
      border-radius: 10px;
      border-style: solid;
    }
  }
}
</style>
