<template>
  <back-configuration />
  <v-card class="model-container">
    <div class="text-center text-h4 font-weight-bold">正运动学</div>
    <div class="input-container mt-4">
      <div v-for="(value, index) of store.state.Q">
        关节{{ index + 1 }}:
<!--        <input type="number" class="ml-4" v-model="store.state.Q[index]">-->
        <input type="number" class="ml-4" v-fixed="{obj:store.state.Q, key: index}">
        rad
      </div>
    </div>
    <v-row class="mt-4">
      <v-col class="position-attitude" md="4" cols="12">
        <h2>位置</h2>
        <v-table>
          <tbody>
          <tr>
            <td>Px:</td>
            <td>{{ $filters.toFixed(store.getters.px) }}</td>
          </tr>
          <tr>
            <td>Py</td>
            <td>{{ $filters.toFixed(store.getters.py) }}</td>
          </tr>
          <tr>
            <td>Pz:</td>
            <td>{{ $filters.toFixed(store.getters.pz) }}</td>
          </tr>
          </tbody>
        </v-table>
      </v-col>
      <v-col class="position-attitude" md="4" cols="12">
        <h2>欧拉角</h2>
        <v-table>
          <tbody>
          <tr>
            <td>roll:</td>
            <td>{{ $filters.toFixed(store.getters.roll) }}</td>
          </tr>
          <tr>
            <td>pitch:</td>
            <td>{{ $filters.toFixed(store.getters.pitch) }}</td>
          </tr>
          <tr>
            <td>yaw:</td>
            <td>{{ $filters.toFixed(store.getters.yaw) }}</td>
          </tr>
          </tbody>
        </v-table>
      </v-col>
      <v-col class="position-attitude" md="4" cols="12">
        <h2>变换矩阵</h2>
        <v-table>
          <tbody>
          <tr v-for="i in 3">
            <td v-for="j in 3">{{ $filters.toFixed(store.getters.T.get([i - 1, j - 1])) }}</td>
          </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import {useStore} from "vuex";

const store = useStore()

</script>

<style lang="scss" scoped>
.model-container {
  .input-container {
    display: flex;
    //flex-direction: row;

    input {
      width: 40%;
      border-width: 2px !important;
      border-color: #000000;
      border-radius: 10px;
      border-style: solid;
    }
  }

  .position-attitude {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    //.position-attitude {
    //  display: flex;
    //  flex-direction: row;
    //  justify-content: space-around;
    //  align-items: center;
    //}
    //
    //.rotationMatrix {
    //  display: flex;
    //  flex-direction: column;
    //  justify-content: space-around;
    //  align-items: center;
    //}
  }
}
</style>
