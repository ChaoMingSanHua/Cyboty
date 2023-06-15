<template>
  <v-card class="model-container w-50">
    <div class="my-4 text-center text-h4 font-weight-bold">结构配置</div>
    <v-divider />
    <v-row class="my-4 text-center">
      <v-col class="v-col-12">
        <div class="my-3 text-center text-h5 font-weight-medium">机型选择</div>
      </v-col>
      <v-col class="v-col-12 v-col-md-6">
        <input type="radio" name="robotType" :value="RobotTypeEnum.INDUSTRY" v-model="store.state.robotType"> 工业型
      </v-col>
      <v-col class="v-col-12 v-col-md-6">
        <input type="radio" name="robotType" :value="RobotTypeEnum.COOPERATION" v-model="store.state.robotType"> 协作型
      </v-col>
    </v-row>
    <v-divider />
    <v-row class="my-4 text-center">
      <v-col class="v-col-12">
        <div class="my-3 text-center text-h5 font-weight-medium">杆长配置</div>
      </v-col>
      <v-col class="v-col-12">
        <v-table>
          <thead>
          <tr>
            <th class="text-center v-col-6">
              名称
            </th>
            <th class="text-center v-col-6">
              杆长
            </th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) of paras">
            <td class="text-center">{{ item.name }}</td>
            <td class="text-center">
              <input type="number" class="text-center w-75" v-model="paras[index].value"/>
            </td>
          </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-divider />
    <confirm-configuration @confirm="confirm"/>
  </v-card>
</template>

<script setup>
import {computed, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import {RobotTypeEnum, robot} from "@/utils/robot";
import ConfirmConfiguration from "@/components/dialog/ConfirmConfiguration"

const store = useStore()

const robotType = ref(0)
const industryParameters = [0.5, 0.05, 0.5, 0, 0.05, 0.5, 0.1]
const cooperationParameters = [0.089, 0.425, 0.392, 0.109, 0.095, 0.08, 0.0]
const paras = reactive([
  {
    name: "L1",
    value: industryParameters[0],
  },
  {
    name: "L2",
    value: industryParameters[1],
  },
  {
    name: "L3",
    value: industryParameters[2],
  },
  {
    name: "L4",
    value: industryParameters[3],
  },
  {
    name: "L5",
    value: industryParameters[4],
  },
  {
    name: "L6",
    value: industryParameters[5],
  },
  {
    name: "L7",
    value: industryParameters[6],
  },
])

store.commit("clearConfirm")

watch(() => store.state.robotType, (value) => {
  switch (value) {
    case RobotTypeEnum.INDUSTRY:
      industryParameters.forEach((value1, index) => {
        paras[index].value = value1
      })
      break
    case RobotTypeEnum.COOPERATION:
      cooperationParameters.forEach((value1, index) => {
        paras[index].value = value1
      })
      break
    default:
      break
  }
})

const confirm = () => {
  store.commit("confirm", paras)
  const robotPara = {
    robotType: store.state.robotType,
    linkLengths: [
      paras[0].value,
      paras[1].value,
      paras[2].value,
      paras[3].value,
      paras[4].value,
      paras[5].value,
      paras[6].value,
    ]
  }
  robot.configRobot(robotPara)
  console.log('机器人已配置')
}
</script>
