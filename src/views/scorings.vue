<!-- TODO:
реализовать механизм "прощения" :))
показывать предупреждение, если есть неучтенные в оценке смены
 -->

<template>
  <div>
    <!-- Панель с показателями сотрудников -->
    <v-container fluid>
      <v-card>
        <v-card-title>
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
          <v-spacer></v-spacer>
          <!-- Кнопка "Пересчитать показатели сотрудников" -->
          <v-tooltip v-model="show1" left>
            <template v-slot:activator="{ on }">
              <v-btn
                fab
                small
                text
                v-on="on"
                @click="updateScorings"
                :loading="scoringsRecalculating"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </template>
            <span>Пересчитать показатели сотрудников</span>
          </v-tooltip>
        </v-card-title>
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
          :loading="this.$apollo.queries.scorings.loading"
          loading-text="Загружаем данные"
        >
          <template v-slot:item.employeeFullName="{ item }">
            {{item.employeeFullName}}
            <v-icon v-if="item.doneNorm" small>mdi-check</v-icon>
            <v-icon v-if="item.theBest" small>mdi-trophy</v-icon>
            <v-icon v-if="item.theQuickest" small>mdi-flash</v-icon>
          </template>
          <template v-slot:item.percentAckInTime="{ item }">
            <b>{{item.percentAckInTime}}%</b>
          </template>
          <template v-slot:item.percentAckNotInTime="{ item }">{{item.percentAckNotInTime}}%</template>
          <template v-slot:item.percentNoAck="{ item }">{{item.percentNoAck}}%</template>
        </v-data-table>
      </v-card>
    </v-container>

    <!-- Панель с событиями -->
    <v-container fluid v-show="selected.isShowDetails">
      <v-card>
        <v-card-title>
          События по выбранному сотруднику
          <v-spacer></v-spacer>
          <v-btn-toggle v-model="selectedAckTypeId" mandatory @change="showDetails">
            <v-btn title="подтвердил вовремя">
              <v-icon>mdi-alarm-check</v-icon>
            </v-btn>
            <v-btn title="подтвердил поздно">
              <v-icon>mdi-timer-off</v-icon>
            </v-btn>
            <v-btn title="не подтвердил">
              <v-icon>mdi-sleep</v-icon>
            </v-btn>
            <v-btn title="события во время обслуживания">
              <v-icon>mdi-wrench</v-icon>
            </v-btn>
            <v-btn title="руководитель сделал исключение">
              <v-icon>mdi-account-edit</v-icon>
            </v-btn>
            <v-btn title="события короче 10 минут">
              <v-icon>mdi-clock-fast</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-card-title>
        <!-- Таблица с событиями -->
        <v-data-table
          :headers="eventHeaders"
          :items="events"
          no-data-text="Нет данных"
          no-results-text="Нет данных"
          :loading="$apollo.queries.events.loading"
          loading-text="Загружаем данные"
          dense
          :items-per-page="eventsPerPage"
        >
          <template v-slot:item.tsStart="{ item }">{{msToDateString(item.tsStart)}}</template>
          <template v-slot:item.tsAck="{ item }">{{msToDateString(item.tsAck)}}</template>
          <template v-slot:item.tsEnd="{ item }">{{msToDateString(item.tsEnd)}}</template>
          <template v-slot:item.freeDuration="{ item }">{{Math.round(item.freeDuration/60000)}}</template>
          <template v-slot:item.severity="{ item }">
            <v-chip
              :color="severityNumberToColor(item.severity)"
            >{{severityNumberToName(item.severity)}}</v-chip>
          </template>
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
  EMPLOYEES_QUERY
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
          ackType: this.selectedAckType
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
      query: EMPLOYEES_QUERY,
      variables() {
        return {
          type: "all"
        };
      }
    }
  },
  data: () => ({
    selectedAckTypeId: 2,
    eventsPerPage: 5,
    //Флаг показа подсказок
    show1: false,
    scoringsRecalculating: false,
    focus: new Date(),
    selected: { item: [], isShowDetails: false },
    scoringHeaders: [
      { text: "Сотрудник", value: "employeeFullName", align: "left" },
      { text: "Время реакции, мин", value: "avgAckTime", align: "right" },
      {
        text: "Подтвердил вовремя",
        value: "percentAckInTime",
        align: "right"
      },
      {
        text: "Подтвердил поздно",
        value: "percentAckNotInTime",
        align: "right"
      },
      { text: "Не подтвердил", value: "percentNoAck", align: "right" },
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
      { text: "Начало", value: "tsStart" },
      { text: "Подтверждение", value: "tsAck" },
      { text: "Окончание", value: "tsEnd" },
      { text: "Сотрудник", value: "ADLogin" },
      { text: "Описание", value: "text" },
      { text: "Хост", value: "host" },
      { text: "Критичность", value: "severity" },
      { text: "Время без подтверждения, мин", value: "freeDuration" }
      //  { text: ":)", value: "isForgiven" }
    ]
  }),
  computed: {
    selectedAckType() {
      if (this.selectedAckTypeId === 0) return "inTime";
      if (this.selectedAckTypeId === 1) return "late";
      if (this.selectedAckTypeId === 2) return "none";
      if (this.selectedAckTypeId === 3) return "maintenance";
      if (this.selectedAckTypeId === 4) return "forgiven";
      if (this.selectedAckTypeId === 5) return "tooShort";
      return "none";
    }
  },
  watch: {
    scorings: function(val) {
      if (val.length > 0) {
        this.scoringsRecalculating = false;
      }
    }
  },
  methods: {
    setToday() {
      this.focus = new Date();
      this.selected.isShowDetails = false;
      this.selected.item = [];
    },
    prev() {
      const month = this.focus.getMonth() - 1;
      this.focus = new Date(this.focus.setMonth(month));
      this.selected.isShowDetails = false;
      this.selected.item = [];
    },
    next() {
      const month = this.focus.getMonth() + 1;
      this.focus = new Date(this.focus.setMonth(month));
      this.selected.isShowDetails = false;
      this.selected.item = [];
    },
    //Запускает пересчет показателей сотрудников за выбранный месяц
    async updateScorings() {
      this.scorings = [];
      this.selected.isShowDetails = false;
      this.selected.item = [];
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
    async showDetails(arg) {
      if (typeof arg == "object") this.selected.isShowDetails = arg.value;
      this.events = [];
      await this.$apollo.queries.events.refetch();
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
    },
    //Возвращает название уровня критичности
    severityNumberToName(number) {
      if (number == "5") return "Disaster";
      if (number == "4") return "High";
      if (number == "3") return "Average";
      if (number == "2") return "Warning";
      return "Unknown";
    },
    //Возвращает название уровня критичности
    severityNumberToColor(number) {
      if (number == "5") return "#e45959";
      if (number == "4") return "#e97659";
      if (number == "3") return "#ffa059";
      if (number == "2") return "#ffc859";
      return "#777777";
    }
  }
};
</script>