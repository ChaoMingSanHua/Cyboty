<template>
  <back-configuration />
  <v-card class="model-container">
    <div class="my-4 text-center text-h4 font-weight-bold">DH参数</div>
    <v-divider />
    <v-row class="my-4 text-center">
      <v-col>
        <div class="my-3 text-center text-h5 font-weight-medium">DH参数(SDH)</div>
        <v-divider />
        <v-table>
          <thead>
          <tr>
            <th class="text-center v-col-2">关节</th>
            <th class="text-center v-col-2">&theta;(rad)</th>
            <th class="text-center v-col-2">d(m)</th>
            <th class="text-center v-col-2">a(m)</th>
            <th class="text-center v-col-2">&alpha;(rad)</th>
            <th class="text-center v-col-2">关节类型</th>
          </tr>
          </thead>
          <tbody>
          <tr class="text-center" v-for="index in robot.getDof">
            <td>关节{{index}}</td>
            <td>{{$filters.toFixed(robot.getSDHParameter.Thetas[index-1])}}</td>
            <td>{{$filters.toFixed(robot.getSDHParameter.Ds[index-1])}}</td>
            <td>{{$filters.toFixed(robot.getSDHParameter.As[index-1])}}</td>
            <td>{{$filters.toFixed(robot.getSDHParameter.Alphas[index-1])}}</td>
            <td>{{jointType(robot.getMDHParameter.Sigmas[index - 1])}}</td>
          </tr>
          </tbody>
        </v-table>
        <v-divider />
      </v-col>
    </v-row>
    <v-divider />
    <v-row class="my-4 text-center">
      <v-col>
        <div class="my-3 text-center text-h5 font-weight-medium">DH参数(MDH)</div>
        <v-divider />
        <v-table>
          <thead>
          <tr>
            <th class="text-center v-col-2">关节</th>
            <th class="text-center v-col-2">&alpha;(rad)</th>
            <th class="text-center v-col-2">a(m)</th>
            <th class="text-center v-col-2">d(m)</th>
            <th class="text-center v-col-2">&theta;(rad)</th>
            <th class="text-center v-col-2">关节类型</th>
          </tr>
          </thead>
          <tbody>
          <tr class="text-center" v-for="index in robot.getDof">
            <td>关节{{index}}</td>
            <td>{{$filters.toFixed(robot.getMDHParameter.Alphas[index-1])}}</td>
            <td>{{$filters.toFixed(robot.getMDHParameter.As[index-1])}}</td>
            <td>{{$filters.toFixed(robot.getMDHParameter.Ds[index-1])}}</td>
            <td>{{$filters.toFixed(robot.getMDHParameter.Thetas[index-1])}}</td>
            <td>{{jointType(robot.getMDHParameter.Sigmas[index - 1])}}</td>
          </tr>
          </tbody>
        </v-table>
        <v-divider />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import {JointTypeEnum, robot} from "@/utils/robot"
import {computed} from "vue";

const jointType = computed(() => (sigma) => {
  switch (sigma) {
    case JointTypeEnum.PRISMATIC:
      return "平移"
    case JointTypeEnum.REVOLUTE:
      return "转动"
    default:
      return null
  }
  return null
})

</script>

<style scoped>

</style>
