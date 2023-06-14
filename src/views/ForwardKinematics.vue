<template>
  <back-configuration />
  <v-card class="model-container">
    <div class="my-4 text-center text-h4 font-weight-bold">正运动学</div>
    <v-divider />
    <v-container class="my-4 text-center">
      <v-row>
        <v-col class="v-col-12 v-col-md-4 mx-auto" v-for="(value, index) of store.state.Q" :key="index">
          Joint{{ index + 1 }}:
          <input type="number" class="ml-4 input-number" v-fixed="{obj:store.state.Q, key: index}">
          rad
        </v-col>
      </v-row>
    </v-container>

    <v-divider />

    <v-container class="my-4 text-center">
      <div class="text-h5 my-3">位置</div>
      <v-row>
        <v-col class="v-col-12 v-col-md-4 mx-auto" v-for="(value, index) in 3" :key="index">
          {{descartesName[index]}}: {{ $filters.toFixed(store.getters.X[index]) }}
        </v-col>
      </v-row>
    </v-container>

    <v-divider />

    <v-container class="my-4 text-center">
      <div class="text-h5 my-3">姿态</div>
      <div class="text-h6 my-2">旋转矩阵</div>
      <v-row justify="center">
        <v-col class="v-col-12 v-col-md-4">
          <v-table>
            <tbody>
            <tr v-for="i in 3">
              <td v-for="j in 3">{{ $filters.toFixed(store.getters.T.get([i - 1, j - 1])) }}</td>
            </tr>
            </tbody>
          </v-table>
        </v-col>
      </v-row>

      <v-divider />

      <div class="text-h6 my-2">欧拉角</div>
      <v-row justify="center">
        <v-col class="v-col-12 v-col-md-4 mx-auto" v-for="(value, index) in 3" :key="index">
          {{descartesName[index + 3]}} : {{ $filters.toFixed(store.getters.X[index + 3]) }}
        </v-col>
      </v-row>

      <v-divider />

      <div class="text-h6 my-2">四元数</div>
      <v-row>
        <v-col class="v-col-12 v-col-md-3 mx-auto" v-for="(value, index) in 4" :key="index">
          {{quaternionName[index]}} : {{$filters.toFixed(store.getters.quaternion[index])}}
        </v-col>
      </v-row>

      <v-divider />

      <div class="text-h6 my-2">轴角</div>
      <v-row justify="space-around">
        <v-col class="v-col-12 v-col-md-3">
          <div>轴线</div>
          <v-table>
            <tbody>
              <tr v-for="(value, index) in 3">
                <td>{{$filters.toFixed(store.getters.axisAngle.axis[index])}}</td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
        <v-col class="v-col-12 v-col-md-3 d-inline-flex flex-column">
          <div>角度</div>
          <div class="my-auto" >{{$filters.toFixed(store.getters.axisAngle.theta)}}</div>
        </v-col>
      </v-row>
      <v-divider />
    </v-container>

    <v-container class="my-4 text-center">
      <div class="text-h5 my-3">雅可比矩阵</div>
      <v-row justify="center">
        <v-col class="v-col-12">
          <v-table>
            <tbody>
            <tr v-for="i in 6">
              <td v-for="j in 6">{{ $filters.toFixed(store.getters.Jacobian.get([i - 1, j - 1])) }}</td>
            </tr>
            </tbody>
          </v-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
import {useStore} from "vuex";
import {reactive} from "vue";

const store = useStore()
const descartesName = reactive([
  "Px", "Py", "Pz", "Roll", "Pitch", "Yaw"
])
const quaternionName = reactive([
  "w", "x", "y", "z"
])

</script>

<style lang="scss" scoped>
.model-container {
  .input-container {
    display: flex;

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
  }
}

.input-number {
  width: 40%;
  border-width: 2px !important;
  border-color: #00000088;
  border-radius: 10px;
  border-style: solid;
}
</style>
