<template>
  <div>
    <v-footer :fixed="true" app>
      <span>&copy; 2019</span>
      <v-spacer></v-spacer>
      Последнее импортированное событие - {{displayedLastEventTime}}
    </v-footer>
  </div>
</template>

<script>
// Import queries from queries.js
import { LAST_EVENT_TIME } from "@/queries/queries.js";
export default {
  computed: {
    displayedLastEventTime() {
      return this.msToDateString(Number.parseInt(this.lastEventTime));
    }
  },
  apollo: {
    //Закачивает в массив данные с бэкенда
    lastEventTime: {
      query: LAST_EVENT_TIME,
      variables() {}
    }
  },
  methods: {
    //Преобразовывает UNIX-time (в мс) в строку в формате "YYYY-MM-DD HH:MM"
    msToDateString(ms) {
      if (ms > 0) {
        const tempDate = new Date(Number.parseInt(ms));
        const tempString =
          tempDate.toISOString().slice(0, 10) +
          " " +
          tempDate.toISOString().slice(11, 16);
        return tempString;
      } else return "-";
    }
  }
};
</script>

<style lang="scss" scoped>
</style>