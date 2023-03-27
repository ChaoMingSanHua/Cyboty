<template>
  <v-card class="model-container">
    <div class="ikine">
      <h1>逆运动学</h1>
  <!--    <div v-for="(item, index) of Qs">-->
  <!--      <div>Theta{{index + 1}}</div>-->
  <!--      <div v-for="item1 of item">{{$filters.toFixed(item1)}}</div>-->
  <!--    </div>-->
      <v-table>
        <thead>
          <tr>
            <th v-for="(item, index) of Qs">Theta{{index + 1}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="index of Qs[0].length">
            <td v-for="index1 of Qs.length">{{$filters.toFixed(Qs[index1-1][index-1])}}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </v-card>
</template>

<script setup>
import {computed, defineAsyncComponent} from "vue";
import {useStore} from "vuex";
import * as math from "mathjs"
import * as robot from "@/utils/robot"

const STLModel = defineAsyncComponent(() => import('@/components/STLModel'))
const store = useStore()

const Qs = computed(() => {
  return robot.iKine8(store.getters.dhPara, store.getters.T)
})
</script>

<style lang="scss" scoped>
.ikine {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}
</style>
