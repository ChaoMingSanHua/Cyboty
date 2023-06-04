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
import {computed, reactive, ref} from "vue";
import {useStore} from "vuex";
import {RobotTypeEnum, robot} from "@/utils/robot";
import ConfirmConfiguration from "@/components/dialog/ConfirmConfiguration"

const store = useStore()

const robotType = ref(0)
const paras = reactive([
  {
    name: "l1",
    value: store.state.D[0],
  },
  {
    name: "l2",
    value: store.state.A[1],
  },
  {
    name: "l3",
    value: store.state.A[2],
  },
  {
    name: "l4",
    value: store.state.D[2],
  },
  {
    name: "l5",
    value: store.state.A[3],
  },
  {
    name: "l6",
    value: store.state.D[3],
  },
  {
    name: "l7",
    value: store.state.D[5],
  },
])

store.commit("clearConfirm")

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
