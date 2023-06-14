<template>
  <v-card class="model-container">
    <h1 class="text-center">个人信息</h1>
    <div class="my-container px-12 mx-12">
      <div class="link-title mb-1">
        <v-icon color="blue">mdi-link-variant</v-icon> 个人信息
      </div>

      <div class="text-center my-4">
        <v-avatar class="mx-auto author-avatar" size="100">
          <v-img width="100" src="/headPortrait.png"/>
        </v-avatar>
        <div class="text-center my-2 text-h6 font-weight-bold author-name">潮鸣散花</div>
        <div class="text-center my-2 text-h7 font-weight-light author-intro">热爱可达星辰彼岸</div>

        <div class="blog-contact">
          <a class="mx-2 iconfont iconbilibili" target="_blank" :href="bilibiliHref"/>
          <a class="mx-2 iconfont icongitee-fill-round" target="_blank" :href="giteeHref"/>
          <a class="mx-2 iconfont icongithub" target="_blank" :href="githubHref"/>
        </div>
      </div>

      <a class="reward-btn text-center mt-4">
        <i />打赏
        <!-- 二维码 -->
        <div class="reward-main">
          <ul class="reward-all">
            <li class="reward-item">
              <img class="reward-img" :src="weixin" alt=""/>
              <div class="reward-desc">微信</div>
            </li>
            <li class="reward-item">
              <img class="reward-img" :src="zhifubao" alt="">
              <div class="reward-desc">支付宝</div>
            </li>
          </ul>
        </div>
      </a>
    </div>

    <div class="friend-container px-12 mx-12">
      <div class="link-title mb-1">
        <v-icon color="blue">mdi-link-variant</v-icon> 特别感谢
      </div>
      <v-row class="link-container">
        <v-col
          class="link-wrapper"
          cols="6"
          v-for="item of friendLinkList"
          :key="item.id"
        >
          <a class="link-item">
            <v-avatar size="65" class="link-avatar">
              <v-img :src="item.linkAvatar" cover />
            </v-avatar>
            <div style="width: 100%; z-index: 10;">
              <div class="link-name">{{ item.linkName }}</div>
              <div class="link-intro">{{ item.linkIntro }}</div>
            </div>
          </a>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script setup>
import {reactive, ref} from 'vue';
import weixin from "@/assets/payment/weixin.jpg"
import zhifubao from "@/assets/payment/zhifubao.jpg"
const friendModules = import.meta.glob("@/assets/friend/*.*", {eager: true})
const friendAvatars = []
Object.keys(friendModules).forEach(value => {
  friendAvatars.push(friendModules[value].default)
})
const friendLinkList = reactive([])

const friendNames = ["星夜未央", "zero的光剑", "兔角", "终极"]
const friendIntros = ["慎独", "吾身已成铁，吾心乃空灵", "世界充满了宽恕", "快乐要有悲伤作陪，雨过应该就有天晴"]

const bilibiliHref = ref("https://space.bilibili.com/209673001")
const giteeHref = ref("https://gitee.com/chaomingsanhua")
const githubHref = ref("https://github.com/chaomingsanhua")

friendNames.forEach((value, index) => {
  friendLinkList.push({
    id: index,
    linkAvatar: friendAvatars[index],
    linkName: value,
    linkIntro: friendIntros[index]
  })
})
</script>

<style lang="scss" scoped>
.reward-btn {
  position: relative;
  display: block;
  width: 100px;
  background-color: #49b1f5;
  margin: 0 auto;
  color: #fff !important;
  //text-align: 36px;
  line-height: 36px;
  font-size: 0.875rem;

  &:hover .reward-main {
    display: block;
  }

  .reward-main {
    display: none;
    position: absolute;
    bottom: 40px;
    left: 0;
    margin: 0;
    padding: 0 0 15px;
    width: 100%;

    .reward-all {
      display: inline-block;
      margin: 0 0 0 -110px;
      padding: 20px 10px 8px !important;
      width: 320px;
      border-radius: 4px;
      background-color: #f5f5f5;

      &::before {
        position: absolute;
        bottom: -10px;
        left: 0;
        width: 100%;
        height: 20px;
        content: "";
      }

      &::after {
        content: "";
        position: absolute;
        right: 0;
        bottom: 2px;
        left: 0;
        margin: 0 auto;
        width: 0;
        height: 0;
        border-top: 13px solid #f5f5f5;
        border-right: 13px solid transparent;
        border-left: 13px solid transparent;
      }

      .reward-item {
        display: inline-block;
        padding: 0 8px;
        list-style-type: none;

        .reward-img {
          width: 130px;
          height: 130px;
          display: block;
        }

        .reward-desc {
          margin: -5px 0;
          color: #858585;
          text-align: center;
        }
      }
    }
  }
}

.my-container {
  animation: main 1s;
  max-width: 970px;
  //padding: 50px 40px;
  //margin: 20px auto 40px auto;

  .author-avatar {
    transition: all 0.5s;

    &:hover {
      transform: rotate(360deg);
    }
  }

  .author-intro {
    color: #1f2d3d;
  }

  .blog-contact {
    height: 16px;
    line-height: 16px;
    a {
      &:link {
        text-decoration: none;
      }
      vertical-align: top;
      color: #49b1f5;
    }

    .iconbilibili {
      position: relative;
      display: inline-block;
      width: 16px;
      height: 16px;
      &:after {
        display: inline-block;
        width: 16px;
        height: 16px;
        position: absolute;
        bottom: 0;
        right: 0;
        content: "";
        background-image: url("../assets/favicon/bilibili.ico");
        background-size: cover;
      }
    }
  }
}

.link-title {
  color: #344c67;
  font-size: 21px;
  font-weight: bold;
  line-height: 2;
}

.friend-container {
  animation: main 1s;
  max-width: 970px;
  //padding: 0px 40px;
  //margin: 20px auto 40px auto;

  .link-container {
    margin: 10px 10px 0;

    .link-wrapper {
      position: relative;
      transition: all 0.3s;
      border-radius: 8px;

      &::before {
        position: absolute;
        border-radius: 8px;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: #49b1f5 !important;
        content: "";
        transition-timing-function: ease-out;
        transition-duration: 0.3s;
        transition-property: transform;
        transform: scale(0);
      }

      &:hover {
        box-shadow: 0 2px 20px #49b1f5;

        &::before {
          transform: scale(1);
        }

        a {
          color: #fff;
        }

        .link-intro {
          color: #fff;
        }

        .link-avatar {
          transform: rotate(360deg);
        }
      }

      a {
        color: #333;
        text-align: none;
        display: flex;
        height: 100%;
        width: 100%;
      }

      .link-avatar {
        margin-top: 5px;
        margin-left: 10px;
        transition: all 0.5s;
      }

      .link-name {
        text-align: center;
        font-size: 1.25rem;
        font-weight: bold;
        z-index: 1000;
      }

      .link-intro {
        text-align: center;
        padding: 16px 10px;
        height: 50px;
        font-size: 13px;
        color: #1f2d3d;
        font-weight: 100;
      }
    }
  }
}
</style>
