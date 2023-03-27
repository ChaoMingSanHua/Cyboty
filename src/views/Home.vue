<template>
  <v-card class="model-container w-50">
    <h1 class="text-center">结构配置</h1>
    <v-table>
      <thead>
        <tr>
          <th class="text-center v-col-6">
            Name
          </th>
          <th class="text-center v-col-12">
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) of paras">
          <td class="text-center">{{item.name}}</td>
          <td class="text-center">
            <input type="number" class="text-center w-75" v-model="paras[index].value"/>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-btn class="mx-auto d-block" @click="confirm">确认</v-btn>
  </v-card>
</template>

<script setup>
import {computed, reactive} from "vue";
import {useStore} from "vuex";

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

  // const links = computed(()=> {
  //   return paras.map(value => {
  //     return value.value
  //   });
  // })

// const links = computed({
//   set: (values) => {
//     paras.forEach((value, index, array) => {
//       array[index] = values[index]
//     })
//     console.log(paras)
//   },
//   get: () => {
//     return paras.map(value => {
//       return value.value
//     })
//   }
// })

const confirm = () => {
  store.commit("confirm", paras)
  console.log(paras)
  // console.log(store.)
}
</script>
