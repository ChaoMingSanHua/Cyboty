<template>
  <v-card class="container animated zoomIn">
    <v-img :src="diagrams[robotType]" />
  </v-card>
</template>

<script setup>
import {ref, watch} from "vue";
import {RobotTypeEnum} from "@/utils/robot";
import {useStore} from "vuex";
const diagramModule = import.meta.glob("@/assets/description/diagram/*.*", {eager: true})


const diagrams = []

const store = useStore()

const robotType = ref()
Object.keys(RobotTypeEnum).forEach(value => {
  if (RobotTypeEnum[value] === store.state.robotType) {
    robotType.value = value.toLowerCase()
  }
})

Object.keys(diagramModule).forEach(filename => {
  const type = filename.split("/").at(-1).split(".")[0]
  diagrams[type] = diagramModule[filename].default
})
console.log(diagrams)

watch(() => store.state.robotType, (a) => {
  Object.keys(RobotTypeEnum).forEach(value => {
    if (RobotTypeEnum[value] === store.state.robotType) {
      robotType.value = value.toLowerCase()
    }
  })
})
</script>

<style lang="scss" scoped>
.container {
  height: 500px;
  margin-top: 160px;
  position: sticky;
  top: 100px;

  .canvas {
    height: 100%;
    width: 100%;
  }
}
</style>
