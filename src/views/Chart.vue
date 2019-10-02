<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <!-- Панель навигации по календарю -->
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

      <h3>{{selectedEvent}} - {{defaultEvent}}</h3>
      <!-- Место для отладки  TODO удалить -->

      <v-sheet>
        <!-- Календарь -->
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
        <v-btn color="success" @click="openShift">
          <!-- Кнопка "добавить смену" -->
          <v-icon dark>mdi-plus</v-icon>Смена
        </v-btn>

        <v-dialog v-model="dialog" :activator="selectedElement" max-width="500px">
          <!-- Диалог создания/правки смены -->
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm6 md4>
                    <!--
                    <v-text-field
                      ref="fullName"
                      v-model="selectedEvent.name"
                      label="ФИО"
                      :color="selectedEvent.color"
                    ></v-text-field>
                    -->
                    <v-select
                      v-model="selectedEvent.employee"
                      :items="Employees"
                      item-text="fullName"
                      item-value="id"
                      label="123"
                      persistent-hint
                      return-object
                      single-line
                    ></v-select>

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
    //Открыт ли диалог редактирования смены
    dialog: false,
    select: null,
    //Объект для всплывашки
    snackbar: {
      show: false,
      color: "green",
      text: "Сообщение",
      timeout: 5000
    },
    focus: null,
    type: "month",
    typeToLabel: {
      month: "Месяц",
      week: "Неделя"
    },
    start: null,
    end: null,

    //Выбранная смена
    selectedEvent: {
      id: "",
      startDate: "",
      startTime: "",
      duration: "",
      start: "",
      end: "",
      name: "",
      fullName: "",
      color: "",
      employee: null,
      employeeId: ""
    },
    selectedElement: null,
    //Тестовые данные - удалить !!!!!!!!!!!!!!!!!!!!!!!!!!!!!  TODO
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
    //Значения по умолчанию для новой смены
    defaultEvent() {
      return {
        id: "",
        startDate: new Date().toISOString().slice(0, 10),
        startTime: "08:00",
        duration: "12:00",
        start: "",
        end: "",
        employeeId: this.Employees ? this.Employees[0].id : "",
        employee: null,
        name: "",
        fullName: "",
        color: ""
      };
    },
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
    /*
id: "",
        id: "",
        startDate: new Date().toISOString().slice(0, 10),
        startTime: "08:00",
        duration: "12:00",
        start: "",
        end: "",
        employeeId: this.Employees ? this.Employees[0].id : "",
        employee: null,
        name: "",
        fullName: "",
        color: ""*/

    openShift({ nativeEvent, event }) {
      //Если чеерз аргумент пришло событие, то заполняем значения из него
      this.selectedEvent = event ? event : this.defaultEvent;
      //По employeeId возвращаем объект employee
      this.selectedEvent.employee = this.Employees.find(
        o => o.id === this.selectedEvent.employeeId
      );
      //Из объекта employee берем нужные данные
      this.selectedEvent.name = this.selectedEvent.employee.fullName;
      this.selectedEvent.fullName = this.selectedEvent.employee.fullName;
      this.selectedEvent.color = this.selectedEvent.employee.visibleColor;
      if (event) {
        this.selectedEvent.startDate = this.selectedEvent.start.slice(0, 10);
        this.selectedEvent.startTime = this.selectedEvent.start.slice(11, 16);
        const theDiff =
          new Date(this.selectedEvent.end).getTime() -
          new Date(this.selectedEvent.start).getTime();
        this.selectedEvent.duration = new Date(theDiff)
          .toISOString()
          .slice(11, 16);
      } else {
        this.selectedEvent.start =
          this.selectedEvent.startDate +
          " " +
          this.selectedEvent.startTime +
          ":00";
        const theStart = new Date(this.selectedEvent.start);
        this.selectedEvent.end = new Date(
          theStart.getTime() -
            theStart.getTimezoneOffset() * 60000 +
            Number.parseInt(this.selectedEvent.duration.slice(0, 2)) * 3600000 +
            Number.parseInt(this.selectedEvent.duration.slice(3, 5)) * 60000
        );
      }
      //Показываем окно с диалогом
      this.dialog = true;
      
      if (nativeEvent) {
        this.selectedElement = nativeEvent.target;
        nativeEvent.stopPropagation();
      }
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