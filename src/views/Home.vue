<template>
<!--  <HelloWorld />-->
  <Suspense>
    <template #default>
      <STLModel />
    </template>
  </Suspense>
</template>

<script setup>
  import {defineAsyncComponent} from "vue";
  import HelloWorld from '@/components/HelloWorld.vue'
  // import STLModel from '@/components/STLModel'
  const STLModel = defineAsyncComponent(() => import('@/components/STLModel'))
</script>
