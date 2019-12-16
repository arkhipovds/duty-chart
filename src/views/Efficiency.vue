<template>
  <div>
    <!-- Панель навигации по календарю -->
    <v-sheet height="64">
      <v-toolbar flat color="white">
        <!-- Кнопка "Сегодня" -->
        <v-btn fab text small @click="setToday">
          <v-icon>mdi-calendar-today</v-icon>
        </v-btn>
        <!-- Кнопка "Назад" -->
        <v-btn fab text small @click="prev">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <!-- Текущие год и месяц -->
        <v-toolbar-title>{{focus.toISOString().slice(0,7)}}</v-toolbar-title>
        <!--Кнопка "Вперед" -->
        <v-btn fab text small @click="next">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <!--<h3>{{this.selected}}</h3>-->
        <v-spacer></v-spacer>
        <!-- Кнопка "Вперед" -->
        <v-btn fab text small @click="calculateScorings">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-toolbar>
    </v-sheet>

    <v-subheader>Показатели сотрудников</v-subheader>
    <!-- Таблица с показателями сотрудников -->
    <v-data-table
      v-model="selected.item"
      :headers="scoringHeaders"
      :items="scorings"
      item-key="id"
      :single-select="true"
      show-select
      @item-selected="showDetails"
      hide-default-footer
      no-data-text="Нет данных"
    >
      <template v-slot:item.employeeId="{ item }">{{nameOfEmployee(item.employeeId)}}</template>
      <template v-slot:item.freeDurationSum="{ item }">
        {{Math.round(
        item.freeDurationSum / (item.normalEventsCount*60000)
        )}}
      </template>
      <template v-slot:item.ackInTimeEventsCount="{ item }">
        <b>
          {{Math.round(
          (item.ackInTimeEventsCount * 100) / item.normalEventsCount
          )}}%
        </b>
      </template>
      <template v-slot:item.ackNotInTimeEventsCount="{ item }">
        {{Math.round(
        (item.ackNotInTimeEventsCount * 100) / item.normalEventsCount
        )}}%
      </template>
      <template v-slot:item.noAckEventsCount="{ item }">
        {{Math.round(
        (item.noAckEventsCount * 100) / item.normalEventsCount
        )}}%
      </template>
    </v-data-table>

    <v-subheader v-show="selected.showDetails">События по выбранному сотруднику - {{eventsCount()}}</v-subheader>
    <!-- Таблица с событиями -->
    <v-data-table
      v-show="selected.showDetails"
      :headers="headers"
      :items="events"
      no-data-text="Нет данных"
      loading-text="Загружаем данные"
    >
      <template v-slot:no-data></template>
      <template v-slot:item.tsStart="{ item }">{{msToDateString(item.tsStart)}}</template>
      <template v-slot:item.tsAck="{ item }">{{msToDateString(item.tsAck)}}</template>
      <template v-slot:item.tsEnd="{ item }">{{msToDateString(item.tsEnd)}}</template>
      <template v-slot:item.freeDuration="{ item }">{{Math.round(item.freeDuration/60000)}}</template>
    </v-data-table>
  </div>
</template>


<script>
import {
  ALL_EVENTS_QUERY,
  ALL_SCORINGS_QUERY,
  CALCULATE_SCORINGS,
  ALL_EMPLOYEES_QUERY
} from "@/queries/queries.js";

export default {
  apollo: {
    events: {
      query: ALL_EVENTS_QUERY,
      variables() {
        return {
          TS: this.focus.getTime().toString(),
          employeeId: this.selected.item[0]
            ? this.selected.item[0].employeeId
            : ""
        };
      }
    },
    scorings: {
      query: ALL_SCORINGS_QUERY,
      variables() {
        return {
          TS: this.focus.getTime().toString()
        };
      }
    },
    Employees: {
      query: ALL_EMPLOYEES_QUERY
    }
  },
  data: () => ({
    focus: new Date(),
    selected: { item: [], showDetails: false },
    scoringHeaders: [
      { text: "Сотрудник", value: "employeeId", align: "left" },
      { text: "Время реакции, мин", value: "freeDurationSum", align: "right" },
      {
        text: "Подтвердил вовремя",
        value: "ackInTimeEventsCount",
        align: "right"
      },
      {
        text: "Подтвердил поздно",
        value: "ackNotInTimeEventsCount",
        align: "right"
      },
      { text: "Не подтвердил", value: "noAckEventsCount", align: "right" },
      { text: "Всего событий", value: "normalEventsCount", align: "right" },
      {
        text: "Слишком коротких событий",
        value: "tooShortEventsCount",
        align: "right"
      }
    ],
    headers: [
      {
        text: "Время события",
        //align: "left",
        //sortable: false,
        value: "tsStart"
      },
      { text: "Время подтверждения", value: "tsAck" },
      { text: "Время окончания", value: "tsEnd" },
      { text: "Сотрудник", value: "ADlogin" },
      { text: "Описание события", value: "text" },
      { text: "Хост", value: "host" },
      { text: "Критичность", value: "severity" },
      { text: "Время подтверждения, мин", value: "freeDuration" },
      { text: ":)", value: "isForgiven" }
    ]
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    }
  },
  methods: {
    setToday() {
      this.focus = new Date();
    },
    prev() {
      const month = this.focus.getMonth() - 1;
      this.focus = new Date(this.focus.setMonth(month));
    },
    next() {
      const month = this.focus.getMonth() + 1;
      this.focus = new Date(this.focus.setMonth(month));
    },
    calculateScorings() {
      this.$apollo.mutate({
        mutation: CALCULATE_SCORINGS,
        variables: {
          TS: this.focus.getTime().toString()
        },
        refetchQueries: [
          {
            query: ALL_SCORINGS_QUERY,
            variables: {
              TS: this.focus.getTime().toString()
            }
          }
        ]
      });
    },
    showDetails(arg) {
      this.$apollo.queries.events.refetch();
      this.selected.showDetails = arg.value;
    },
    nameOfEmployee(employeeId) {
      let name = "";
      if (this.Employees) {
        if (this.Employees.length > 0) {
          name = this.Employees[
            this.Employees.findIndex(el => el.id === employeeId)
          ].fullName;
        }
      }
      return name;
    },
    eventsCount() {
      if (this.events) {
        return this.events.length;
      } else {
        return 0;
      }
    },
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