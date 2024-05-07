<template>

  <q-page class="flex flex-center">
<!--    <q-input class="col-9" v-model="inputName" readonly />-->
<!--    <h3 class="text-2xl text-green-900 uppcase">{{ inputName }}</h3>-->

<!--    需要显示的数据是通过异步方法拿到的，一开始在初始数据为空，用v-if控制一下-->
<!--    <div class="flex justify-center" v-if="pokemon">
      <img class="w-48" :src="pokemon.sprites.front_default" alt="" />
    </div>-->

    <div class="column">

      <div class="col">
        <div v-if="pokemon" class="q-pa-lg">

          <div class="column" style="height: 700px">

            <div class="col" >
              <q-card class="my-card">
                <q-img :src=pokemonImg>
                  <div class="absolute-bottom text-subtitle2 text-center">
                    {{ name_zh }}
                  </div>
                </q-img>
              </q-card>
            </div>

            <div class="col">
              <q-table
                :title="inputName"
                :rows="rows"
                :columns="columns"
                row-key="name"
                hide-bottom
                hide-header
                wrap-cells
              />
            </div>
          </div>

        </div>
      </div>

      <div class="col">

        <div v-show="pokemon" class="q-pa-lg">

          <!--种族值 图表-->
          <div id="main" style="height: 300px;"></div>

        </div>

      </div>

      <div class="col" >
        <!--进化链-->
        <div v-if="evolutionChain" class="q-pa-lg">
          <h2 class="title">进化链</h2>
          <vue3-tree-org
            :data="treeData"
            :horizontal="true"
            :node-draggable="true"
            :scalable="false"
            :toolBar="false"
            :disabled="true"
            :default-expand-level="1"
            @on-node-click="onNodeClick"
          >
            <!-- 自定义节点内容 -->
            <template v-slot="{node}">
              <div class="tree-org-node__text node-label">
                <img style="width: 60px" :src="'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'+node.id+'.png'" alt="Node image" />
                <div class="custom-content"></div>
                <div class="custom-label">{{node.label}}</div>
              </div>
            </template>
          </vue3-tree-org>

        </div>

      </div>
    </div>


  </q-page>

</template>

<script setup>
import {ref, onMounted, watch, onBeforeMount } from "vue";
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import {reactive, toRefs, provide} from "vue";
import pokename from "../assets/allPokemon.json"

// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口
import * as echarts from 'echarts/core';
// 引入折线图图表，图表后缀都为 Chart
import { BarChart } from 'echarts/charts';
// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components';
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers';
// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

defineOptions({
  name: 'PokeDetail'
});


const pokemon = ref();
const pokemonImg = ref();
const rows = ref();
const columns = ref();
const musicStr = ref()
const statsArr = ref([])
const evolutionChain = ref();
const treeData = ref();

const inputName = ref('');
const name_zh = ref('');
import { useRoute, useRouter } from "vue-router"
const route = useRoute()
console.log("route.query", route.query);
inputName.value = route.query.name;

onMounted(() => {
  getDetail(inputName.value)
  //initChart();
});

//监听路由变化
watch(() => route.query.name, (newName) => {
  inputName.value = newName;
  getDetail(newName);
});
/**
 * 初始化种族值图表
 * @param statsArr 种族值数组
 */
function initChart(statsArr) {
  //这里一定要设置时延 否则会报错Initialize failed: invalid dom.
  setTimeout(()=>{
    let myChart = echarts.init(document.getElementById("main"));
    myChart.setOption({
      title: {
        text: "种族值"
      },
      tooltip: {},
      yAxis: {
        data: ["速度", "特防", "特攻", "防御", "攻击", "HP"],
      },
      xAxis: {
        max: 250
      },
      series: [{
        name: "能力值",
        type: "bar",
        itemStyle: {
          normal: {
            label: {
              show: true, //开启显示
              position: 'right', //在上方显示
              textStyle: { //数值样式
                color: 'grey',
                fontSize: 14
              }
            }
          }
        },
        data: [statsArr[5],
          {
            value:statsArr[4],
            itemStyle: {color: 'green'}
          }, statsArr[3], statsArr[2], statsArr[1], statsArr[0]],
      }, ],
    });
    window.onresize = function() {
      myChart.resize();
    };
  },200)
}

//调用父组件方法
/*const emit = defineEmits(['customChange'])
emit('getIndex', "detail")*/

async function getDetail(name) {
  //请求
  api.get('https://pokeapi.co/api/v2/pokemon/' + name)
    .then((data) => {
      console.log(data);
      const generalData = data;
      api.get('https://pokeapi.co/api/v2/pokemon-species/' + name)
        .then((speciesData) => {
          //合并数据
          data = { ...speciesData.data, ...generalData.data };
          console.log("allData", data);

          //中文名
          name_zh.value = data.names.filter(
            (e) => e.language.name === "zh-Hans"
          )[0].name;

          //图片
          pokemonImg.value = data.sprites.other["official-artwork"]["front_default"];

          //描述
          const zh_descriptions = data.flavor_text_entries.filter(
            (e) => e.language.name === "zh-Hans"
          );
          const zh_description = zh_descriptions[zh_descriptions.length - 1].flavor_text;

          //类型
          const genera = data.genera.filter(
            (e) => e.language.name === "zh-Hans"
          )[0].genus;
          console.log("genera", genera);

          //播放介绍声音
          musicStr.value = name_zh.value + ", " + genera + ", " + zh_description;

          pokemon.value = data;

          //属性
          let typeStr = "";
          for (const key in data.types) {
            typeStr = typeStr + data.types[key].type.name + " "
          }
          console.log("typeStr", typeStr);

          //基本信息表格数据
          rows.value = [
            {name: '类型', calories: genera},
            {name: '描述', calories: zh_description},
            {name: '属性', calories: typeStr},
            {name: '身高', calories: data.height/10 + 'm'},
            {name: '体重', calories: data.weight/10 + 'kg'},
          ]

          columns.value = [
            { name: 'name', field: 'name', align:'center' , style: 'min-width: 60px'},
            { name: 'calories',  field: 'calories', align: 'left' },
          ]

          statsArr.value = [];
          //种族值
          for (const stat of data.stats) {
            statsArr.value.push(stat.base_stat);
          }
          //初始化图表
          initChart(statsArr.value);

          //进化链
          console.log("evolution_chain url:", data.evolution_chain.url);
          api.get(data.evolution_chain.url)
            .then((evolutionData) => {
              console.log("evolutionChain:", evolutionData);
              evolutionChain.value = evolutionData.data.chain;
              let tree = [evolutionChain.value]
              const actual = treeMap(tree);
              console.log("actual:", actual[0]);
              treeData.value = actual[0];
            });

        });

    })
    .catch((e) => {
      console.log(e);
    });

}

//tree数据格式转换
const treeMap = (inputTree) => inputTree.map(t => ({
  label: pokename.find(p => p.nameEn.toLowerCase() === t.species.name.toLowerCase()).nameZh,
  id: pokename.find(p => p.nameEn.toLowerCase() === t.species.name.toLowerCase()).index,
  children: treeMap(t.evolves_to)
}));

const router = useRouter();

/**
 * 点击节点
 * @param node
 */
function onNodeClick(e, data) {
  const nameEn = pokename.find(p => p.index === data.id).nameEn;
  console.log("nameEn", nameEn.toLowerCase());
  router.push({path: '/detail', query: {name: nameEn.toLowerCase()}});
}
/**
 * 语音讲解
 * 有兼容性问题 部分手机浏览器打不开
 */
function talk() {
  console.log("talk!!!")
  const synth = window.speechSynthesis; // 启用文本
  const msg = new SpeechSynthesisUtterance(); // 表示一次发音请求。其中包含了将由语音服务朗读的内容，以及如何朗读它（例如：语种、音高、音量）。
  msg.text = musicStr.value; // 文字内容: 测试内容
  msg.lang = "zh-CN"; // 使用的语言:中文
  msg.volume = 1; // 声音音量：1
  msg.rate = 2; // 语速：1
  msg.pitch = 1; // 音高：1
  synth.speak(msg); // 播放
}

defineExpose({
  talk
})


</script>
<style lang="scss" scoped>
.zm-tree-org {
  height: 300px;
  padding: 0;
}
.tree-org-node__text {
  text-align: left;
  font-size: 14px;
  .custom-content {
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid currentColor;
  }
  .custom-label {
    text-align: center;
  }
}
.title {
  font-size: 20px;
  font-weight: bold;
}
</style>

