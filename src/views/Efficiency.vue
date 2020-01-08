<template>
  <div>
    <!-- Панель навигации -->
    <v-toolbar>
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
      <!--место для отладки
      <h3>{{this.ackTypeId}}</h3>-->
      <v-spacer></v-spacer>
      <!-- Кнопка "Пересчитать показатели сотрудников" -->
      <v-tooltip v-model="show1" left>
        <template v-slot:activator="{ on }">
          <v-btn fab small text v-on="on" @click="updateScorings" :loading="scoringsRecalculating">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </template>
        <span>Пересчитать показатели сотрудников</span>
      </v-tooltip>
    </v-toolbar>

    <!-- Таблица с показателями сотрудников -->
    <v-container fluid>
      <v-card>
        <v-card-title>Показатели сотрудников</v-card-title>
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
          :loading="scoringsRecalculating"
          loading-text="Загружаем данные"
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
      </v-card>
    </v-container>

    <!-- Панель с таблицей с событиями -->
    <v-container fluid v-show="selected.isShowDetails">
      <v-card>
        <v-card-title>
          События по выбранному сотруднику - {{eventsCount()}}
          <v-spacer></v-spacer>
          <v-btn-toggle v-model="ackTypeId" mandatory @change="showDetails">
            <v-btn>
              <v-icon>mdi-timer</v-icon>вовремя
            </v-btn>
            <v-btn>
              <v-icon>mdi-timer-off</v-icon>с опозданием
            </v-btn>
            <v-btn>
              <v-icon>mdi-close-octagon-outline</v-icon>не подтвердил
            </v-btn>
          </v-btn-toggle>
        </v-card-title>
        <!-- Таблица -->
        <v-data-table
          :headers="eventHeaders"
          :items="events"
          no-data-text="Нет данных"
          :loading="eventsLoading"
          loading-text="Загружаем данные"
        >
          <template v-slot:no-data></template>
          <template v-slot:item.tsStart="{ item }">{{msToDateString(item.tsStart)}}</template>
          <template v-slot:item.tsAck="{ item }">{{msToDateString(item.tsAck)}}</template>
          <template v-slot:item.tsEnd="{ item }">{{msToDateString(item.tsEnd)}}</template>
          <template v-slot:item.freeDuration="{ item }">{{Math.round(item.freeDuration/60000)}}</template>
        </v-data-table>
      </v-card>
    </v-container>
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
            : "",
          ackType: this.ackType
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
    employees: {
      query: ALL_EMPLOYEES_QUERY
    }
  },
  data: () => ({
    ackTypeId: 2,
    //Флаг показа подсказок
    show1: false,
    eventsLoading: false,
    scoringsRecalculating: false,
    focus: new Date(),
    selected: { item: [], isShowDetails: false },
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
      {
        text: "Событий длиннее 10 мин",
        value: "normalEventsCount",
        align: "right"
      },
      {
        text: "Событий короче 10 мин",
        value: "tooShortEventsCount",
        align: "right"
      }
    ],
    eventHeaders: [
      { text: "Время события", value: "tsStart" },
      { text: "Время подтверждения", value: "tsAck" },
      { text: "Время окончания", value: "tsEnd" },
      { text: "Сотрудник", value: "ADLogin" },
      { text: "Описание события", value: "text" },
      { text: "Хост", value: "host" },
      { text: "Критичность", value: "severity" },
      { text: "Время подтверждения, мин", value: "freeDuration" },
      { text: ":)", value: "isForgiven" }
    ]
  }),
  computed: {
    ackType() {
      if (this.ackTypeId === 0) return "inTime";
      if (this.ackTypeId === 1) return "late";
      if (this.ackTypeId === 2) return "none";
      return "none";
    }
  },
  watch: {
    events: function(val) {
      if (val.length > 0) {
        this.eventsLoading = false;
      }
    },
    scorings: function(val) {
      if (val.length > 0) {
        this.scoringsRecalculating = false;
      }
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
    //Запускает пересчет показателей сотрудников за выбранный месяц
    async updateScorings() {
      this.scorings = [];
      this.scoringsRecalculating = true;
      await this.$apollo.mutate({
        mutation: CALCULATE_SCORINGS,
        variables: {
          TS: this.focus.getTime().toString()
        }
      });
      this.$apollo.queries.scorings.refetch();
    },
    //Показывает события за смены сотрудника
    showDetails(arg) {
      if (typeof arg == "object") this.selected.isShowDetails = arg.value;
      this.eventsLoading = true;
      this.events = [];
      this.$apollo.queries.events.refetch();
    },
    //По идентификатору возвращает имя сотрудника
    nameOfEmployee(employeeId) {
      let name = "";
      if (this.employees) {
        if (this.employees.length > 0) {
          name = this.employees[
            this.employees.findIndex(el => el.id === employeeId)
          ].fullName;
        }
      }
      return name;
    },
    //Возвращает кол-во событий за смены сотрудника
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