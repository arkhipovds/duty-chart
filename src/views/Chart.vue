<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn outlined class="mr-4" @click="setToday">Сегодня</v-btn>
          <v-btn fab text small @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <div class="flex-grow-1"></div>
          <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn outlined v-on="on">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Неделя</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Месяц</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>

      <h3>{{selectedEvent}} - {{selectedElement}}</h3>

      <v-sheet>
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          locale="ru"
          interval-height="25"
          :events="shift"
          :event-color="getEventColor"
          :event-margin-bottom="3"
          :type="type"
          @click:event="openShift"
          @click:more="viewDay"
          @change="updateRange"
        ></v-calendar>
        <v-btn color="success" @click="openShift = true">
          <v-icon dark>mdi-plus</v-icon>Смена
        </v-btn>

        <v-dialog v-model="dialog" :activator="selectedElement" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm6 md4>
                    <v-text-field
                      ref="fullName"
                      v-model="selectedEvent.name"
                      label="ФИО"
                      :color="selectedEvent.color"
                    ></v-text-field>
                    <!--
                    <v-select
                      v-model="select"
                      :hint="`${select.state}, ${select.abbr}`"
                      :items="items"
                      item-text="state"
                      item-value="abbr"
                      label="Select"
                      persistent-hint
                      return-object
                      single-line
                    ></v-select>
                    -->
                    <!--
                    <v-autocomplete
                      ref="fullName"
                      v-model="selectedEvent.name"
                      :rules="[() => !!country || 'This field is required']"
                      :items="Employees.fullName"
                      label="ФИО"
                      placeholder="Select..."
                      required
                    ></v-autocomplete>
                    -->
                    <v-text-field
                      ref="startDate"
                      v-model="selectedEvent.startDate"
                      label="Дата"
                      type="date"
                    ></v-text-field>
                    <v-text-field
                      ref="startTime"
                      v-model="selectedEvent.startTime"
                      label="Время"
                      type="time"
                    ></v-text-field>
                    <v-text-field
                      ref="duration"
                      v-model="selectedEvent.duration"
                      label="Длительность"
                      type="time"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red darken-1" text @click="close">Отмена</v-btn>
              <v-btn color="green darken-1" text @click="save">Сохранить</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-sheet>
      <v-snackbar v-model="snackbar.show" top :color="snackbar.color" :timeout="snackbar.timeout">
        {{ snackbar.text }}
        <v-btn fab text :color="snackbar.color" @click="snackbar.show = false">
          <v-icon dark>mdi-close</v-icon>
        </v-btn>
      </v-snackbar>
    </v-col>
  </v-row>
</template>

<script>
import { ALL_SHIFTS_QUERY, ALL_EMPLOYEES_QUERY } from "@/queries/queries.js";

export default {
  data: () => ({
    dialog: false,
    snackbar: {
      show: false,
      color: "green",
      text: "Сообщение",
      timeout: 5000 //само пропадет через 5 сек
    },
    focus: null,
    type: "month",
    typeToLabel: {
      month: "Месяц",
      week: "Неделя"
    },
    start: null,
    end: null,
    defaultEvent: {
      id: "",
      startDate: "",
      startTime: "",
      duration: "",
      start: "",
      end: "",
      name: "",
      color: "",
      employeeId: ""
    },
    selectedEvent: {
      id: "",
      startDate: "",
      startTime: "",
      duration: "",
      start: "",
      end: "",
      name: "",
      color: "",
      employeeId: ""
    },
    selectedElement: null,
    //  events: [],

    events: [
      {
        name: "Иванов",

        start: "2019-09-01 08:00",
        end: "2019-09-01 20:00",
        color: "#FF00B2FF"
      },
      {
        name: "Петров",

        start: "2019-09-01 20:00",
        end: "2019-09-02 08:00",
        color: "deep-purple"
      },
      {
        name: "Иванов",

        start: "2019-09-02 08:00",
        end: "2019-09-02 20:00",
        color: "indigo"
      },
      {
        name: "Петров",
        details: "Типовой текст",
        start: "2019-09-02 20:00",
        end: "2019-09-03 08:00",
        color: "deep-purple"
      },
      {
        name: "Сидоров",
        details: "Типовой текст",
        start: "2019-09-03 08:00",
        end: "2019-09-03 20:00",
        color: "red"
      },
      {
        name: "Огурцов",
        details: "Типовой текст",
        start: "2019-09-03 20:00",
        end: "2019-09-04 08:00",
        color: "green"
      },
      {
        name: "Сидоров",
        details: "Типовой текст",
        start: "2019-09-04 08:00",
        end: "2019-09-04 20:00",
        color: "red"
      },
      {
        name: "Огурцов",
        details: "Типовой текст",
        start: "2019-09-04 20:00",
        end: "2019-09-05 08:00",
        color: "green"
      }
    ]
  }),
  apollo: {
    Shifts: {
      query: ALL_SHIFTS_QUERY
    },
    Employees: {
      query: ALL_EMPLOYEES_QUERY
    }
  },
  computed: {
    formTitle() {
      return this.selectedEvent.id === ""
        ? "Добавить смену"
        : "Исправить смену";
    },
    shift() {
      //!!!!!!!!!!!!!!!TODO переписать стрелочную функцию на нормальную, с проверками существования всех объектов и дефолтным поведением
      var newShifts = [];
      if (this.Shifts && this.Employees)
        newShifts = this.Shifts.map(n => ({
          id: n.id,
          start: n.start,
          end: n.end,
          name: this.Employees[
            this.Employees.findIndex(el => el.id === n.employeeId)
          ].fullName,
          color: this.Employees[
            this.Employees.findIndex(el => el.id === n.employeeId)
          ].visibleColor,
          employeeId: n.employeeId
        }));
      return newShifts;
    },
    title() {
      const { start, end } = this;
      if (!start || !end) {
        return "";
      }

      const startMonth = this.monthFormatter(start);
      const endMonth = this.monthFormatter(end);
      const suffixMonth = startMonth === endMonth ? "" : endMonth;

      const startYear = start.year;
      const endYear = end.year;
      const suffixYear = startYear === endYear ? "" : endYear;

      const startDay = start.day + this.nth(start.day);
      const endDay = end.day + this.nth(end.day);

      switch (this.type) {
        case "month":
          return `${startMonth} ${startYear}`;
        case "week":
          return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`;
      }
      return "";
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: "UTC",
        month: "long"
      });
    },
    nowTime() {
      return new Date();
    }
  },
  mounted() {
    this.$refs.calendar.checkChange();
  },
  methods: {
    close() {
      setTimeout(() => {
        this.selectedEvent = Object.assign({}, this.defaultEvent);
        this.editedIndex = -1;
      }, 300);
    },
    save() {
      var mode = "ИСПРАВЛЕНО!";
      if (this.selectedEvent.id != "") {
        //  this.updateEmployee();  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!здесь обновим событие (смену)
      } else {
        //   this.addEmployee(); !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!здесь добавим событие (смену)
        mode = "ДОБАВЛЕНО!";
      }
      this.snackbar.text = `${mode} ${this.selectedEvent.name}`;
      this.snackbar.color = "green";
      this.snackbar.show = true;
      this.close();
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = this.today;
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    openShift({ nativeEvent, event }) {
      this.dialog = true;
      this.selectedEvent = event;
      this.selectedEvent.startDate = this.selectedEvent.start.slice(0, 10);
      this.selectedEvent.startTime = this.selectedEvent.start.slice(11, 16);
      const theDiff =
        new Date(this.selectedEvent.end).getTime() -
        new Date(this.selectedEvent.start).getTime();
      this.selectedEvent.duration = new Date(theDiff)
        .toISOString()
        .slice(11, 16);

      this.selectedElement = nativeEvent.target;
      nativeEvent.stopPropagation();
    },
    updateRange({ start, end }) {
      // You could load events from an outside source (like database) now that we have the start and end dates on the calendar
      this.start = start;
      this.end = end;
    },
    nth(d) {
      return d > 3 && d < 21
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][d % 10];
    }
  }
};
</script>

<style lang="scss" scoped>
</style>