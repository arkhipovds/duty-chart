<!-- TODO:
перенести расчеты в бекенд, там же сделать выдачу медалей, убрать мапинг массива
при пересчете показателей скрывать детализацию
 -->

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
      <h3>{{this.parsedScorings}}</h3>-->
    </v-toolbar>

    <!-- Таблица с показателями сотрудников -->
    <v-container fluid>
      <v-card>
        <v-card-title>
          Показатели сотрудников
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
        <v-data-table
          v-model="selected.item"
          :headers="scoringHeaders"
          :items="parsedScorings"
          item-key="id"
          :single-select="true"
          show-select
          @item-selected="showDetails"
          hide-default-footer
          no-data-text="Нет данных"
          :loading="this.$apollo.queries.scorings.loading"
          loading-text="Загружаем данные"
        >
          <template v-slot:item.employeeName="{ item }">
            {{item.employeeName}}
            <v-icon v-for="(item2,i) in item.icons" :key="`item.icons${i}`" small>{{item2}}</v-icon>
          </template>
          <template v-slot:item.percentAckInTime="{ item }">
            <b>{{item.percentAckInTime}}%</b>
          </template>
          <template v-slot:item.percentAckNotInTime="{ item }">{{item.percentAckNotInTime}}%</template>
          <template v-slot:item.percentNoAck="{ item }">{{item.percentNoAck}}%</template>
        </v-data-table>
      </v-card>
    </v-container>

    <!-- Панель с таблицей с событиями -->
    <v-container fluid v-show="selected.isShowDetails">
      <v-card>
        <v-card-title>
          События по выбранному сотруднику
          <v-spacer></v-spacer>
          <v-btn-toggle v-model="selectedAckTypeId" mandatory @change="showDetails">
            <v-btn>
              <v-icon>mdi-alarm-check</v-icon>вовремя
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
      query: ALL_EMPLOYEES_QUERY
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
      { text: "Сотрудник", value: "employeeName", align: "left" },
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
      { text: "Время без подтверждения, мин", value: "freeDuration" },
      { text: ":)", value: "isForgiven" }
    ]
  }),
  computed: {
    selectedAckType() {
      if (this.selectedAckTypeId === 0) return "inTime";
      if (this.selectedAckTypeId === 1) return "late";
      if (this.selectedAckTypeId === 2) return "none";
      return "none";
    },
    parsedScorings() {
      let newScorings = [];
      //Если массивы уже заполнены
      if (this.scorings && this.employees) {
        newScorings = this.scorings.slice();
        for (let i in newScorings) {
          newScorings[i].icons = [];
          //Имя сотрудника
          newScorings[i].employeeName = this.nameOfEmployee(
            newScorings[i].employeeId
          );
          if (newScorings[i].normalEventsCount > 0) {
            //среднее время подтверждения
            newScorings[i].avgAckTime =
              Math.round(
                (100 * newScorings[i].freeDurationSum) /
                  (newScorings[i].normalEventsCount * 60000)
              ) / 100;
            //% вовремя подтвержденных
            newScorings[i].percentAckInTime = Math.round(
              (newScorings[i].ackInTimeEventsCount * 100) /
                newScorings[i].normalEventsCount
            );
            //% невовремя подтвержденных
            newScorings[i].percentAckNotInTime = Math.round(
              (newScorings[i].ackNotInTimeEventsCount * 100) /
                newScorings[i].normalEventsCount
            );
            //% неподтвержденных
            newScorings[i].percentNoAck = Math.round(
              (newScorings[i].noAckEventsCount * 100) /
                newScorings[i].normalEventsCount
            );
          } else {
            newScorings[i].avgAckTime = 0;
            newScorings[i].percentAckInTime = 0;
            newScorings[i].percentAckNotInTime = 0;
            newScorings[i].percentNoAck = 0;
          }
        }
        var theQuickest = { item: newScorings[0], index: 0 };
        var theBest = { item: newScorings[0], index: 0 };
        for (let i in newScorings) {
          if (newScorings[i].avgAckTime > 0)
            if (newScorings[i].avgAckTime < theQuickest.item.avgAckTime)
              theQuickest = { item: newScorings[i], index: i };
          if (newScorings[i].percentAckInTime > theBest.item.percentAckInTime)
            theBest = { item: newScorings[i], index: i };
          if (newScorings[i].percentAckInTime > 94)
            newScorings[i].icons.push("mdi-check");
        }
        if (newScorings.length > 0) {
          newScorings[theQuickest.index].icons.push("mdi-flash");
          newScorings[theBest.index].icons.push("mdi-trophy");
        }
      }
      return newScorings;
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