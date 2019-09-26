<template>
  <v-app>
    <app-header></app-header>
    <router-view/>
  </v-app>
</template>

<script>
import appHeader from '@/components/appHeader'
export default {
  components:{
    appHeader
  }
};
</script>
