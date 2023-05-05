<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="auto"
    >
      <v-card>
        <v-card-text>
          机器人未配置，即将返回配置页面
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="backConfig">返回配置页面</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {ref} from "vue";

const dialog = ref(false)
const store = useStore()
const router = useRouter()
if (!store.state.configComplete) {
  dialog.value = true
}

const backConfig = () => {
  dialog.value = false
  router.push('/cyboty-dist5')
}


</script>

<style scoped>

</style>
