<template>
  <v-row justify="center">
    <v-dialog
      :modelValue="dialog"
      persistent
      width="auto"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{title}}
        </v-card-title>
        <v-card-text>
          {{text}}
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            color="green-darken-1"
            variant="text"
            @click="confirm">
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
  title: {
    type: String,
    default: '',
    required: true
  },
  text: {
    type: String,
    default: '',
    required: false
  }
})

const emit = defineEmits(['update:dialog'])

const confirm = () => {
  emit('update:dialog', false)
}

</script>

<style scoped>

</style>
