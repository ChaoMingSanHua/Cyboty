<template>
  <v-app>
    <v-row class="px-10">
      <v-col md="9" cols="12">
        <top-nav-bar />
        <router-view />
      </v-col>
      <v-col md="3" cols="12">
        <template v-if="store.state.configComplete">
          <Suspense>
            <STLModel />
          </Suspense>
        </template>
        <template v-else>
          <structure-diagram />
        </template>
      </v-col>
    </v-row>
  </v-app>
</template>

<script setup>
  import {defineAsyncComponent} from "vue";
  import TopNavBar from "@/components/layout/TopNavBar";
  const STLModel = defineAsyncComponent(() => import('@/components/STLModel'))
  import StructureDiagram from "@/components/StructureDiagram"

  import {useStore} from "vuex";
  const store = useStore()
</script>
