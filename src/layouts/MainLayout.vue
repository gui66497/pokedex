<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          :icon=iconType
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          宝可梦图鉴
        </q-toolbar-title>

        <q-btn
          v-show="showSpeak"
          flat
          dense
          round
          icon="queue_music"
          aria-label="Menu"
          @click="callChildRef"
        />

<!--        <div>Quasar v{{ $q.version }}</div>-->
      </q-toolbar>
    </q-header>

<!--    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>-->

    <q-page-container>
      <router-view v-slot="{Component}" @getIndex="activeChange">
        <component ref="routerViewRef" :is="Component"/>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import {useRouter, useRoute, onBeforeRouteUpdate} from "vue-router";

defineOptions({
  name: 'MainLayout'
})

const router = useRouter();
const routerViewRef = ref();
const showSpeak = ref(false);

function callChildRef() {
  console.log("click");
  routerViewRef.value.talk()
}

onMounted(() => {
  activeChange("main")

  //获取当前路由地址
  const currentPath = router.currentRoute.value.path;
  iconType.value = currentPath === "/" ? "menu" : "west";
  console.log(currentPath);
  showSpeak.value = currentPath === "/detail";
});

//左上角按钮图标类型
const iconType = ref('menu');

function activeChange(val) {
  iconType.value = val === "detail" ? 'west' : "menu";
}

onBeforeRouteUpdate((to, from) => {
/*  const toRouteIndex = to.meta.index as number
  const fromRouteIndex = from.meta.index as number
  if (toRouteIndex > fromRouteIndex) {
    //设置动画名称
    transitionName.value = 'slide-left'
  } else {
    transitionName.value = 'slide-right'
  }*/
  console.log("to", to);
  console.log("from", from);

  if (to.path === "/") {
    iconType.value = "menu";
    showSpeak.value = false;
  } else {
    iconType.value = "west";
    showSpeak.value = true;
  }
})


const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  iconType.value = "menu";
  router.push({path: `/`});
}
</script>
