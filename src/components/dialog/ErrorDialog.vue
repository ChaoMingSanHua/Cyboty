<template>
  <v-row justify="center">
    <v-dialog
      :modelValue="dialog"
      persistent
      width="40%"
      class="text-center"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{message.title}}
        </v-card-title>
        <v-card-text>
          {{message.text}}
        </v-card-text>
        <v-card-actions>
          <v-btn
            class="mx-auto"
            color="green-darken-1"
            variant="text"
            @click="confirm"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import {ref} from "vue";
const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
    required: true
  },
  message: {
    type: Object,
    default: null,
    required: true
  },
})

const emit = defineEmits(['update:dialog'])

const confirm = () => {
  emit('update:dialog', false)
}

</script>

<style scoped>

</style>
