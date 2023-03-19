<template>
  <h1>Cyboty</h1>
  <input type="number" v-for="(value, index) of store.state.Q" v-model="store.state.Q[index]">
  <div class="fkine">
    <h1>正运动学</h1>
    <div class="positionAndAttitude">
      <div class="position">
        <div>Px: {{store.getters.px}}</div>
        <div>Py: {{store.getters.py}}</div>
        <div>Pz: {{store.getters.pz}}</div>
      </div>
      <div class="attiture">
        <div>roll: {{store.getters.roll}}</div>
        <div>pitch: {{store.getters.pitch}}</div>
        <div>yaw: {{store.getters.yaw}}</div>
      </div>
    </div>

    <div>
      <h2>变换矩阵</h2>
      <table>
        <tr v-for="i in 4">
          <td v-for="j in 4">{{store.getters.T.get([i-1, j-1])}}</td>
        </tr>
      </table>
    </div>
  </div>

  <inverse-kinematics />

  <trajectory-planning />

  <Suspense>
    <template #default>
      <STLModel />
    </template>
  </Suspense>
</template>

<script setup>
  import {defineAsyncComponent} from "vue";
  import {useStore} from "vuex";
  import InverseKinematics from "@/views/InverseKinematics"
  import TrajectoryPlanning from "@/views/TrajectoryPlanning"

  const STLModel = defineAsyncComponent(() => import('@/components/STLModel'))
  const store = useStore()
  // console.log(store.state.Q)

</script>

<style lang="scss" scoped>
.fkine {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .positionAndAttitude {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

</style>
