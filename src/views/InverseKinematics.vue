<template>
  <config-dialog />
  <template v-if="store.state.configComplete">
    <v-card class="model-container">
      <div class="ikine">
        <h1>逆运动学</h1>
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
</template>

<script setup>
import {computed} from "vue";
import {useStore} from "vuex";
import {robot} from "@/utils/robot";

const store = useStore()
const Qs = computed(() => {
  return robot.iKineAll(store.getters.T)
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
