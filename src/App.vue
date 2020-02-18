<template>
  <v-app>
    <app-header></app-header>
    <v-content>
      <router-view />
    </v-content>
    <app-footer></app-footer>
  </v-app>
</template>

<script>
import appHeader from "@/components/AppHeader";
import appFooter from "@/components/AppFooter";
export default {
  components: {
    appHeader,
    appFooter
  }
};
</script>
