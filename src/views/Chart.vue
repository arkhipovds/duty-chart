<template>
  <v-row class="fill-height">
    <v-col>
      <!-- Панель навигации по календарю -->
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

      <!-- Место для отладки  TODO удалить-->
      <h3>{{shiftsSequence}}</h3>
      

      <!-- TODO  сделать календарь с понедельника -->
      <!-- Календарь -->
      <v-sheet>
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          locale="ru"
          interval-height="25"
          :events="shifts"
          :event-color="getEventColor"
          :event-margin-bottom="3"
          :type="type"
          @click:event="openShift"
          @click:date="clickDate"
        ></v-calendar>
        <!-- Кнопка "заполнить график на месяц" -->
        <v-btn color="success" @click="dialogFillMonth.show=true">
          <v-icon dark>mdi-plus</v-icon>Заполнить график на месяц
        </v-btn>
      </v-sheet>

      <!-- Всплывашка после действий -->
      <v-snackbar
        bottom
        right
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
      >
        {{ snackbar.text }}
        <v-btn fab :color="snackbar.color" @click="snackbar.show = false">
          <v-icon dark>mdi-close</v-icon>
        </v-btn>
      </v-snackbar>

      <!-- Диалог создания/правки смены -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
            <v-spacer></v-spacer>
            <v-icon v-if="this.selectedEvent.id" @click="deleteShift">mdi-delete</v-icon>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-select
                    v-model="selectedEvent.employee"
                    :items="Employees"
                    item-text="fullName"
                    item-value="id"
                    return-object
                    single-line
                  ></v-select>
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
            <v-btn color="red" text @click="close('')">Отмена</v-btn>
            <v-btn color="green" text @click="saveShift">Сохранить</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Диалог заполнения графика на месяц -->
      <v-dialog v-model="dialogFillMonth.show" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Заполнение графика на месяц</span>
          </v-card-title>
          <v-card-text>
            <v-layout row wrap>
              <v-select max-width="200"
                v-model="dialogFillMonth.employees[0]"
                :items="Employees"
                hint="Первый сотрудник"                
                item-text="fullName"
                item-value="id"
                persistent-hint
                return-object
                single-line
              ></v-select>
              <v-spacer></v-spacer>
              <v-text-field
                ref="startDate"
                v-model="dialogFillMonth.startDate"
                label="Дата"
                type="date"
              ></v-text-field>
            </v-layout>
            <v-layout row wrap>
              <v-select max-width="200"
                v-model="dialogFillMonth.employees[1]"
                :items="Employees"
                hint="Второй сотрудник"
                item-text="fullName"
                item-value="id"
                persistent-hint
                return-object
                single-line
              ></v-select>
              <v-spacer></v-spacer>
              <v-text-field
                ref="startTime"
                v-model="dialogFillMonth.startTime"
                label="Время"
                type="time"
              ></v-text-field>
            </v-layout>
            <v-layout row wrap>
              <v-select lg3 xl3 md3
                v-model="dialogFillMonth.employees[2]"
                :items="Employees"
                hint="Третий сотрудник"
                item-text="fullName"
                item-value="id"
                persistent-hint
                return-object
                single-line
              ></v-select>

              <v-spacer></v-spacer>

              <v-text-field
                ref="duration"
                v-model="dialogFillMonth.duration"
                label="Длительность"
                type="time"
              ></v-text-field>
            </v-layout>
            <v-layout row wrap>
              <v-select
                v-model="dialogFillMonth.employees[3]"
                :items="Employees"
                hint="Четвертый сотрудник"
                item-text="fullName"
                item-value="id"
                persistent-hint
                return-object
                single-line
              ></v-select>
              <v-spacer></v-spacer>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="dialogFillMonth.show=false">Отмена</v-btn>
            <v-btn color="green" text @click="fillShiftsForMonth">Заполнить</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import {
  ALL_SHIFTS_QUERY,
  ADD_SHIFT_MUTATION,
  UPDATE_SHIFT_MUTATION,
  DELETE_SHIFT_MUTATION,
  ALL_EMPLOYEES_QUERY
} from "@/queries/queries.js";

export default {
  data: () => ({
    //Открыт ли диалог редактирования смены
    dialog: false,
    //Структура для диалога заполнения граифка на месяц
    dialogFillMonth: {
      show: false,
      employees: [null, null, null, null],
      startDate: new Date().toISOString().slice(0, 10),
      startTime: "08:00",
      duration: "12:00"
    },
    selectedDay: "",
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
    shiftsSequence: [0,1,0,1,2,3,2,3,1,0,1,0,3,2,3,2]
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
        startDate: this.selectedDay
          ? this.selectedDay
          : new Date().toISOString().slice(0, 10),
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
    shifts() {
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
    addShiftsToEndOfMonth() {},
    clickDate({ date }) {
      this.selectedDay = date.toString();
      this.openShift(this.defaultEvent);
    },
    close(text, color) {
      setTimeout(() => {
        this.selectedEvent = this.defaultEvent;
        this.dialog = false;
      }, 50);
      if (text) {
        this.snackbar.text = text;
        this.snackbar.color = color;
        this.snackbar.show = true;
      }
    },
    saveShift() {
      var theText = "";
      this.selectedEvent.start =
        this.selectedEvent.startDate +
        " " +
        this.selectedEvent.startTime +
        ":00";
      const theStart = new Date(this.selectedEvent.start);
      const tempDate = new Date(
        theStart.getTime() -
          theStart.getTimezoneOffset() * 60000 +
          Number.parseInt(this.selectedEvent.duration.slice(0, 2)) * 3600000 +
          Number.parseInt(this.selectedEvent.duration.slice(3, 5)) * 60000
      );
      this.selectedEvent.end =
        tempDate.toISOString().slice(0, 10) +
        " " +
        tempDate.toISOString().slice(11, 16);
      this.selectedEvent.employeeId = this.selectedEvent.employee.id;
      if (this.selectedEvent.id != "") {
        this.updateShift(this.selectedEvent);
        theText = "Смена обновлена";
      } else {
        this.addShift(this.selectedEvent);
        theText = "Новая смена добавлена";
      }
      this.close(theText, "green");
    },
    //Преобразовывает UNIX-time в строку в формате "YYYY-MM-DD HH:MM"
    msToDateString(ms){
      const tempDate = new Date(ms);
      const tempString =
        tempDate.toISOString().slice(0, 10) +
        " " +
        tempDate.toISOString().slice(11, 16);
      return tempString;
    },
    fillShiftsForMonth (){
      //вычисляем UNIX-time начала первой смены
      var iStartTime = (new Date(this.dialogFillMonth.startDate)).getTime() + 
        this.dialogFillMonth.startTime.slice(0, 2) * 3600000 + 
        this.dialogFillMonth.startTime.slice(3, 5) * 60000;
      //вычисляем месяц, который будем заполнять сменами
      const tempStartMonth = (new Date(iStartTime)).getMonth();
      //месяц окончания рассчитываемой смены
      var tempCurrentMonth = tempStartMonth;
      //переводим длительность смены в мс
      const iDuration = this.dialogFillMonth.duration.slice(0, 2) * 3600000 + 
        this.dialogFillMonth.duration.slice(3, 5) * 60000;
      while(tempCurrentMonth == tempStartMonth){
        for (let employee of this.shiftsSequence) {
          var tempEvent = {
            start: this.msToDateString(iStartTime),
            end: this.msToDateString(iStartTime + iDuration),
            employeeId: this.dialogFillMonth.employees[employee].id
          }
          this.addShift(tempEvent);
          iStartTime += iDuration;
          tempCurrentMonth = (new Date(tempEvent.end)).getMonth();
          /*
          if(tempCurrentMonth != tempStartMonth)
            break;
          */
        }
      }
      this.dialogFillMonth.show = false;
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
    openShift({ event }) {
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
      //Если смена не новая (редактируем существующую)
      if (this.selectedEvent.id.length != 0) {
        this.selectedEvent.startDate = this.selectedEvent.start.slice(0, 10);
        this.selectedEvent.startTime = this.selectedEvent.start.slice(11, 16);
        const theDiff =
          new Date(this.selectedEvent.end).getTime() -
          new Date(this.selectedEvent.start).getTime();
        this.selectedEvent.duration = new Date(theDiff)
          .toISOString()
          .slice(11, 16);
      }
      //Если смена новая
      else {
        this.selectedEvent.start =
          this.selectedEvent.startDate +
          " " +
          this.selectedEvent.startTime +
          ":00";
        const theStart = new Date(this.selectedEvent.start);
        const tempDate = new Date(
          theStart.getTime() -
            theStart.getTimezoneOffset() * 60000 +
            Number.parseInt(this.selectedEvent.duration.slice(0, 2)) * 3600000 +
            Number.parseInt(this.selectedEvent.duration.slice(3, 5)) * 60000
        );
        this.selectedEvent.end =
          tempDate.toISOString().slice(0, 10) +
          " " +
          tempDate.toISOString().slice(11, 16);
      }
      //Показываем окно с диалогом
      this.dialog = true;
    },
    nth(d) {
      return d > 3 && d < 21
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][d % 10];
    },
    addShift(event) {
      this.$apollo.mutate({
        mutation: ADD_SHIFT_MUTATION,
        variables: {
          start: event.start,
          end: event.end,
          employeeId: event.employeeId
        },
        refetchQueries: [
          {
            query: ALL_SHIFTS_QUERY
          }
        ]
      });
    },
    updateShift(event) {
      this.$apollo.mutate({
        mutation: UPDATE_SHIFT_MUTATION,
        variables: {
          id: event.id,
          start: event.start,
          end: event.end,
          employeeId: event.employeeId
        },
        refetchQueries: [
          {
            query: ALL_SHIFTS_QUERY
          }
        ]
      });
    },
    deleteShift() {
      if (confirm("Удалить смену ?")) {
        this.$apollo.mutate({
          mutation: DELETE_SHIFT_MUTATION,
          variables: {
            id: this.selectedEvent.id
          },
          refetchQueries: [
            {
              query: ALL_SHIFTS_QUERY
            }
          ]
        });
        this.close("Смена удалена", "red");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
</style>