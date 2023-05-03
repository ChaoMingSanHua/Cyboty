<template>
  <back-configuration />
  <v-card class="model-container">
    <div class="my-4 text-center text-h4 font-weight-bold">工作空间</div>
    <v-divider />
    <v-row class="my-4 text-center">
      <v-col class="v-col-12">
        <div class="my-3 text-center text-h5 font-weight-medium">限位下限</div>
      </v-col>
      <v-col class="v-col-12 v-col-md-4" v-for="(value, index) in 6" :key="index">
        {{jointName[index]}}: <input class="ml-4 input-number" type="number" v-fixed="{obj: qLimit, key:'lower', index}"/> (rad)
      </v-col>
      <v-divider />
      <v-col class="v-col-12">
        <div class="my-3 text-center text-h5 font-weight-medium">限位上限</div>
      </v-col>
      <v-col class="v-col-12 v-col-md-4" v-for="(value, index) in 6" :key="index">
        {{jointName[index]}}: <input class="ml-4 input-number" type="number" v-fixed="{obj: qLimit, key:'upper', index}"/> (rad)
      </v-col>
    </v-row>
    <v-divider />
    <v-btn class="mx-auto my-4 d-block text-h7 font-weight-black" @click="confirm">计算工作空间</v-btn>
    <!-- 绘图 -->
    <v-row class="my-4 text-center">
      <v-col class="v-col-12 v-col-md-6">
        <div ref="xzView" class="mx-auto" style="width: 100%; height: 500px" />
        <div ref="xyView" class="mx-auto" style="width: 100%; height: 500px" />
      </v-col>
      <v-col class="v-col-12 v-col-md-6">
        <div ref="yzView" class="mx-auto" style="width: 100%; height: 500px" />
        <div ref="xyzView" class="mx-auto" style="width: 100%; height: 500px" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue";
import {robot} from "@/utils/robot";
import * as echarts from "echarts"
import 'echarts-gl'

const count = 10000
let pxArray = []
let pyArray = []
let pzArray = []
const qLimit = reactive({
  lower: [-3.1415, -3.1415, -3.1415, -3.1415, -3.1415, -3.1415],
  upper: [3.1415, 3.1415, 3.1415, 3.1415, 3.1415, 3.1415]
})
const jointName = reactive([
  'Joint1', 'Joint2', 'Joint3', 'Joint4', 'Joint5', 'Joint6'
])

const xzView = ref()
const xyView = ref()
const yzView = ref()
const xyzView = ref()
let xzViewChart = null
let xyViewChart = null
let yzViewChart = null
let xyzViewChart = null

const initChart = () => {
  xzViewChart = echarts.init(xzView.value)
  xyViewChart = echarts.init(xyView.value)
  yzViewChart = echarts.init(yzView.value)
  xyzViewChart = echarts.init(xyzView.value)

  const initOption = {
    xAxis: {
      nameLocation: 'center',
      nameTextStyle: {
        fontSize: 15
      },
      nameGap: 30
    },
    yAxis: {
      nameLocation: 'center',
      nameTextStyle: {
        fontSize: 15
      },
      nameGap: 30
    },
    series:[
      {
        type: 'scatter'
      }
    ],
    title: {
      left: "center",
      top: "5%",
    }
  }

  const initOption3D = {
    grid3D: {},
    xAxis3D: {
      name: 'x(m)',
      nameLocation: 'center',
      nameTextStyle: {
        fontSize: 15
      }
    },
    yAxis3D: {
      name: 'y(m)',
      nameLocation: 'center',
      nameTextStyle: {
        fontSize: 15
      }
    },
    zAxis3D: {
      name: 'z(m)',
      nameLocation: 'center',
      nameTextStyle: {
        fontSize: 15
      }
    },
    series: [{
      type: 'scatter3D',
    }],
    title: {
      text: "X-Y-Z",
      left: "center",
      top: "5%",
    }
  }

  const xAxisNames = ['x(m)', 'x(m)', 'y(m)']
  const yAxisNames = ['z(m)', 'y(m)', 'z(m)']
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
        text: value,
      }
    }
  })

  xzViewChart.setOption(initOption)
  xyViewChart.setOption(initOption)
  yzViewChart.setOption(initOption)
  xyzViewChart.setOption(initOption3D)
  xzViewChart.setOption(titleOptions[0])
  xyViewChart.setOption(titleOptions[1])
  yzViewChart.setOption(titleOptions[2])
}

onMounted(() => {
  initChart()
})

const calWorkspace = () => {
  const {pxArray: px, pyArray: py, pzArray: pz} = robot.getWorkspace(qLimit)
  pxArray = px
  pyArray = py
  pzArray = pz
}

const confirm = () => {
  calWorkspace()
  renderXZView()
  renderXYView()
  renderYZView()
  renderXYZView()
}

const renderXZView = () => {
  const data = pxArray.map((value, index) => {
    return [value, pzArray[index]]
  })
  const series = {
    data
  }
  const option = {
    series
  }

  xzViewChart.setOption(option)
}

const renderXYView = () => {
  const data = pxArray.map((value, index) => {
    return [value, pyArray[index]]
  })
  const series = {
    data
  }
  const option = {
    series
  }

  xyViewChart.setOption(option)
}

const renderYZView = () => {
  const data = pyArray.map((value, index) => {
    return [value, pzArray[index]]
  })
  const series = {
    data
  }
  const option = {
    series
  }

  yzViewChart.setOption(option)
}

const renderXYZView = () => {
  const data = pxArray.map((value, index) => {
    return [value, pyArray[index], pzArray[index]]
  })
  const series = {
    data
  }
  const option = {
    series
  }

  xyzViewChart.setOption(option)
}

</script>

<style scoped>
.input-number {
  width: 40%;
  border-width: 2px !important;
  border-color: #00000088;
  border-radius: 10px;
  border-style: solid;
}
</style>
