<template>
  <div>
    <input type="search" v-model="search" @input="filterPokemons" placeholder="搜索宝可梦...">

    <div class="pokedex">
      <div class="pokemon" v-for="pokemon in filteredPokemons" :key="pokemon.name">
        <img :src="pokemon.image" :alt="pokemon.name" />
        <h2>{{ pokemon.name }}</h2>
        <p>{{ pokemon.attribute }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const search = ref('');

const pokemons = ref([
  // 你的宝可梦数据
  { name: '皮卡丘', attribute: '电', image: 'pikachu.jpg' },
  { name: '妙蛙种子', attribute: '草/毒', image: 'bulbasaur.jpg' },
  // ...
]);

const filteredPokemons = computed(() => {
  if (!search.value) {
    return pokemons.value;
  }
  return pokemons.value.filter(pokemon => pokemon.name.includes(search.value));
});

function filterPokemons() {
  filteredPokemons.value = pokemons.value.filter(pokemon => pokemon.name.includes(search.value));
}
</script>

<style>
.pokedex {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.pokemon {
  text-align: center;
}

.pokemon img {
  width: 100%;
  height: auto;
}
</style>
