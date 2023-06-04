<template>
  <div class="text-center">
    <v-btn
      class="my-4"
      :disabled="dialog"
      :loading="dialog"
      color="white"
      @click="dialog = true"
    >
      确认
    </v-btn>
    <v-dialog
      v-model="dialog"
      :scrim="false"
      persistent
      width="auto"
    >
      <v-card
        color="primary"
      >
        <v-card-text>
          参数配置中...
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {ref, watch} from "vue";
import {useRouter} from "vue-router";

const dialog = ref(false)
const emit = defineEmits(["confirm"])
const router = useRouter()

watch(dialog, (value => {
  if (!value) {
    return
  }
  emit("confirm")
  setTimeout(() => {
    dialog.value = false
    router.push("/dh_parameter")
  }, 1000)
}))

</script>

<style scoped>

</style>
