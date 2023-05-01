<template>
  <v-card class="model-container w-50">
    <v-row class="my-4">
      <v-col>
        <div class="text-center text-h4 font-weight-bold">结构配置</div>
        <v-table>
          <thead>
          <tr>
            <th class="text-center v-col-6">
              Name
            </th>
            <th class="text-center v-col-6">
              Value
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
    <v-row class="my-4">
      <v-col>
        <div class="text-center text-h4 font-weight-bold">关节限位</div>
        <v-table>
          <thead>
          <tr>
            <th class="text-center v-col-6">
              Name
            </th>
            <th class="text-center v-col-6">
              Value
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
    <v-row class="my-4">
      <v-col>
        <div class="text-center text-h4 font-weight-bold">DH参数(SDH)</div>
        <v-table>
          <thead>
          <tr>
            <th class="text-center v-col-2">关节</th>
            <th class="text-center v-col-2">theta</th>
            <th class="text-center v-col-2">d</th>
            <th class="text-center v-col-2">a</th>
            <th class="text-center v-col-2">alpha</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td></td>
          </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row class="my-4">
      <v-col>
        <div class="text-center text-h4 font-weight-bold">DH参数(MDH)</div>
        <v-table>
          <thead>
          <tr>
            <th class="text-center v-col-2">关节</th>
            <th class="text-center v-col-2">alpha</th>
            <th class="text-center v-col-2">a</th>
            <th class="text-center v-col-2">d</th>
            <th class="text-center v-col-2">theta</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td></td>
          </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-btn class="mx-auto d-block" @click="confirm">确认</v-btn>
  </v-card>
</template>

<script setup>
import {computed, reactive} from "vue";
import {useStore} from "vuex";
import {robot} from "@/utils/robot";

const store = useStore()

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

const confirm = () => {
  store.commit("confirm", paras)
  // console.log(store.)
  const robotType = {
    robotType: 0,
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
  robot.configRobot(robotType)
  console.log('机器人已配置')
}
</script>
