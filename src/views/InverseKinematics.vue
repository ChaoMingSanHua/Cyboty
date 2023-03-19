<template>
  <div class="ikine">
    <h1>逆运动学</h1>
    <div v-for="(item, index) of Qs">
      <div>Theta{{index + 1}}</div>
      <div v-for="item1 of item">{{item1}}</div>
    </div>
  </div>
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
