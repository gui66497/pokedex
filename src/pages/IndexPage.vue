<template>
  <q-page class="flex flex-center bg-image">
    <!--<img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    >-->

    <div class="column q-gutter-md ">

      <div class="row justify-center">
<!--        下拉框，支持选择和输入，默认显示中文名称
        后续优化每个选项上展示宝可梦小图标-->
<!--        <q-input class="col-9" outlined v-model="text" label="输入宝可梦名称" />-->
        <div class="q-pa-md" style="max-width: 300px">

<!--          <div class="q-gutter-md">
            <q-badge color="secondary" multi-line>
              Model: "{{ model }}"
            </q-badge>

            <q-select filled v-model="model" :options="options" label="Standard" />
          </div>-->
          <div class="q-gutter-md row">
            <q-select
              filled
              v-model="model"
              transition-show="flip-up"
              transition-hide="flip-down"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :options="options"
              @filter="filterFn"
              label="输入名字进行检索"
              @update:model-value="selectPokemon"
              style="width: 250px; padding-bottom: 32px"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </div>
      <div class="row justify-center">
        <q-btn push color="primary" @click="startCamera" label="打开摄像头" icon="camera_enhance" />
      </div>

      <div class="row justify-center" v-show="who!=''">
        <div class="col-3">
          <q-input class="col-8" input-style="text-align: right" borderless model-value="我是谁" ></q-input>
        </div>
        <div class="col-6">
          <q-input class="col-8" input-style="text-align: center" borderless v-model="whoZh" />
        </div>
        <div class="col-3">
          <q-input class="col-8" input-style="text-align: left" borderless v-model="pred" />
        </div>
      </div>

<!--      <q-btn @click="stopCamera">aaa</q-btn>-->

      <div class="row justify-center" >
<!--        <q-video id="camera-stream" autoplay playsinline></q-video>-->
        <video id="camera-stream" width="300px" autoplay playsinline></video>
      </div>
    </div>


    <div id="name" style="height: 200px"></div>

  </q-page>
</template>

<script setup>
defineOptions({
  name: 'IndexPage'
});
import * as tf from '@tensorflow/tfjs';
import * as automl from '@tensorflow/tfjs-automl';
import { useRoute, useRouter } from "vue-router"
import {computed, ref} from 'vue';
import pokename from "../assets/allPokemon.json"

const model = ref(null);
let stopCatch = false;
const options = ref([]);
for (const poke of pokename) {
  let temp = {
    "label": "No." + poke.index + " " + poke.nameZh,
    "value": poke.nameEn
  }
  options.value.push(temp);
}

//置信度
const pred = ref("");

//下拉框过滤
function filterFn(val, update, abort) {
  update(() => {
    options.value = [];
    const needle = val.toLowerCase()
    for (const poke of pokename) {
      if (poke.nameZh.toLowerCase().indexOf(needle) > -1) {
        let temp = {
          "label": "No." + poke.index + " " + poke.nameZh,
          "value": poke.nameEn
        }
        options.value.push(temp);
      }
    }
  })
}

//选择了具体的宝可梦，跳转到详情页面
function selectPokemon(val) {
  toDetail(val.value);
}

const who = ref('');

const whoZh = computed(() => {
  let name = who.value;
  for (const poke of pokename) {
    if (poke.nameEn === name) {
      return poke.nameZh;
    }
  }
  return '';
});
console.log("whoZh", whoZh);

const router = useRouter();

function toDetail(who) {
  console.log("who", who);
  stopCatch = true;
  stopCamera();
  router.push({path: `/detail`, query: {name: who.toLowerCase()}});
}

let stream = {};

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },  // 摄像头后置
    // video: { facingMode: "user" },
  });
  const nameContainer = document.getElementById("name");
  const videoElement = document.getElementById("camera-stream");
  videoElement.srcObject = stream;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  videoElement.addEventListener("play", async () => {
    var interval = setInterval(function () {
      if (stopCatch) {
        clearInterval(interval);
      }
      requestAnimationFrame(processVideoFrame);
    }, 3000);
  });


  async function processVideoFrame() {
    if (!videoElement.paused && !videoElement.ended) {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
      console.log("imageData:", imageData);

      await run(imageData);

    }
  }
}

async function stopCamera() {
  stopCatch = true;
  stream.getTracks().forEach(function(track) {
    track.stop();
  });
  var video = document.getElementById('camera-stream');
  video.pause();
  video.src = "";
}

/**
 * 识别
 * @param imageData
 * @returns {Promise<void>}
 */
async function run(imageData) {
  let start = new Date().getTime();

  const model = await automl.loadImageClassification(
    "tensorflow/model.json"
  );

  const predictions = await model.classify(imageData);
  //sort prediction by highest prob, take the first one
  predictions.sort(sortByProperty("prob"));
  console.log("first:", predictions[0]);
  let end = new Date().getTime()
  console.log('cost is', `${end - start}ms`)
  who.value = predictions[0].label.replace(/\r|\n/ig,"");
  pred.value = parseInt(predictions[0].prob * 100) + "%"
  if (predictions[0].prob > 0.8) {
    toDetail(who.value);
  }
}

function sortByProperty(property) {
  return function (a, b) {
    if (a[property] < b[property]) return 1;
    else if (a[property] > b[property]) return -1;
    return 0;
  };
}

function talk2(str) {
  console.log("index talk!!")
}

defineExpose({
  talk2
})

</script>
<style>
/*.bg-image {
  background-image: url(some-pokemon-wallpaper-i-did-recently-v0-mtawjm7a4kq81.webp);
  background-repeat: no-repeat;
  background-size: cover;
}*/
</style>
