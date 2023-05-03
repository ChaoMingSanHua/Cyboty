<template>
  <v-app-bar flat height="60">
    <div class="d-md-block nav-container px-9 py-3">
      <div class="float-left app-title">
        <router-link to="/">
          Cyboty
        </router-link>
      </div>
      <div class="float-right nav-title">
        <div class="menus-item" v-for="(value, index) of navTitle">
          <router-link class="menu-btn" :to="navLink[index]">
            {{value}}
          </router-link>
        </div>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup>
import {reactive} from "vue";

const navTitle = reactive([
  "参数配置",
  "DH参数",
  "正运动学",
  "逆运动学",
  "轨迹规划",
  "个人信息"
])

const navLink = reactive([
  "parameter_configuration",
  "dh_parameter",
  "forward_kinematics",
  "inverse_kinematics",
  "trajectory_planning",
  "personal_information"
])

</script>

<style lang="scss" scoped>
.nav-container {
  font-size: 14px;
  width: 100%;
  height: 100%;

  .app-title {
    display: flex;
    align-items: center;
    height: 100%;

    a {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .nav-title {
    display: flex;
    align-items: center;
    height: 100%;

    .menus-item {
      margin: 0 0 0 0.875rem;

      .menu-btn {
        text-shadow: 0.05rem 0.05rem 0.1rem rgba(0, 0, 0, 0.3);

        &:hover {
          color: #49b1f5;
        }
      }
    }
  }
}
</style>
