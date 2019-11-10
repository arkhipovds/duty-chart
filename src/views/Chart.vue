<template>
  <v-row class="fill-height">
    <v-col>
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
          <v-toolbar-title>{{focus.slice(0,7)}}</v-toolbar-title>
          <!-- Кнопка "Вперед" -->
          <v-btn fab text small @click="next">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <!-- Переключатель формата календаря месяц/неделя-->
          <v-btn fab text small @click="changeCalendarType">
            <v-icon>{{typeToLabel[type]}}</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <!-- Кнопка "Добавить смену" -->
          <v-btn fab text small @click="dialogShift.isNew=true,openShiftDialog({})">
            <v-icon color="green">mdi-plus-one</v-icon>
          </v-btn>
          <!-- Кнопка "Заполнить график на месяц" -->
          <!-- TODO: навесить методы на кнопки, в методы перенести подготовку интерфейса. Конкретно тут заполнить сотрудников 1-4 -->
          <v-btn fab text small @click="dialogFillMonth.show=true">
            <v-icon color="green">mdi-playlist-plus</v-icon>
          </v-btn>
        </v-toolbar>
      </v-sheet>

      <!-- Место для отладки  TODO удалить
      <h3>{{ focus }} --- </h3>-->

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
          :weekdays="[1,2,3,4,5,6,0]"
          @click:event="openShiftDialog"
          @click:date="clickDate"
        ></v-calendar>
      </v-sheet>

      <!-- Всплывашка после действий -->
      <v-snackbar
        bottom
        right
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
        @click="snackbar.show = false"
      >{{ snackbar.text }}</v-snackbar>

      <!-- Диалог создания/правки смены -->
      <v-dialog v-model="dialogShift.show" max-width="500px" @click:outside="closeShiftDialog('')">
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
            <v-spacer></v-spacer>
            <v-icon v-if="this.dialogShift.id" @click="deleteShiftInDB">mdi-delete</v-icon>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-select
                    v-model="dialogShift.employee"
                    :items="Employees"
                    item-text="fullName"
                    item-value="id"
                    return-object
                    single-line
                  ></v-select>
                  <v-text-field
                    ref="startDate"
                    v-model="dialogShift.startDate"
                    label="Дата"
                    type="date"
                  ></v-text-field>
                  <v-text-field
                    ref="startTime"
                    v-model="dialogShift.startTime"
                    label="Время"
                    type="time"
                  ></v-text-field>
                  <v-text-field
                    ref="duration"
                    v-model="dialogShift.duration"
                    label="Длительность"
                    type="time"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" text @click="closeShiftDialog('')">Отмена</v-btn>
            <v-btn color="green" text @click="saveShift">Сохранить</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Диалог заполнения графика на месяц-->
      <v-dialog v-model="dialogFillMonth.show" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Заполнить график на месяц</span>
          </v-card-title>
          <v-card-text>
            <v-layout row wrap>
              <v-select
                max-width="200"
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
              <v-select
                max-width="200"
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
              <v-select
                lg3
                xl3
                md3
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
  //Запрашиваем данные о сменах и сотрудниках из БД
  apollo: {
    Shifts: {
      query: ALL_SHIFTS_QUERY,
      variables() {
        return {
          utPointInMonth: this.calendarFocus
        };
      } /*
      skip() {
        return !this.calendarFocus;
      }*/
    },
    Employees: {
      query: ALL_EMPLOYEES_QUERY
    }
  },
  //Данные для интерфейса
  data() {
    return {
      //Структура для диалога заполнения граифка на месяц
      dialogFillMonth: {
        show: false,
        employees: [null, null, null, null],
        startDate: new Date().toISOString().slice(0, 8) + "01",
        startTime: "08:00",
        duration: "12:00",
        //Порядок смен при заполнении месяца
        shiftsSequence: [0, 1, 0, 1, 2, 3, 2, 3, 1, 0, 1, 0, 3, 2, 3, 2]
      },
      //Выбранный в календаре день
      selectedDay: "",
      //Объект для всплывашки
      snackbar: {
        show: false,
        color: "green",
        text: "Сообщение",
        timeout: 5000
      },
      //Фокус календаря
      focus: new Date().toISOString(),
      type: "month",
      typeToLabel: {
        month: "mdi-view-module",
        week: "mdi-view-week"
      },
      //Структура для диалога с карточкой смены
      dialogShift: {
        //Идентификатор
        id: "",
        //Открыт ли диалог
        show: false,
        //Новая смена?
        isNew: false,
        //Значение поля "Сотрудник" карточки смены
        employee: null,
        //Значение поля "Дата" карточки смены
        startDate: "",
        //Значение поля "Время" карточки смены
        startTime: "",
        //Значение поля "Длительность" карточки смены
        duration: "",
        //Начало смены в UNIX-time формате
        utStart: 0,
        //Конец смены в UNIX-time формате
        utEnd: 0,
        //Длительность смены в UNIX-time формате
        utDuration: 0
      }
    };
  },
  computed: {
    calendarFocus() {
      //alert(this.focus);
      return this.focus
        ? new Date(this.focus).getTime().toString()
        : new Date().getTime().toString();
    },
    //Формируем заголовок карточки смены
    formTitle() {
      return this.dialogShift.isNew ? "Добавить смену" : "Исправить смену";
    },
    //Преобразовываем массив со сменами в формат, подходящий для календаря
    shifts() {
      //!!!!!!!!!!!!!!!TODO переписать стрелочную функцию на нормальную, с проверками существования всех объектов и дефолтным поведением
      var newShifts = [];
      if (this.Shifts && this.Employees)
        newShifts = this.Shifts.map(n => ({
          id: n.id,
          start: this.msToDateString(n.start),
          end: this.msToDateString(n.end),
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
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: "UTC",
        month: "long"
      });
    }
  },
  mounted() {
    this.$refs.calendar.checkChange();
  },
  methods: {
    changeCalendarType() {
      if (this.type === "month") this.type = "week";
      else this.type = "month";
    },
    clickDate({ date }) {
      this.selectedDay = date.toString();
      this.dialogShift.isNew = true;
      this.openShiftDialog({});
    },
    //Открыть диалог с карточкой смены
    openShiftDialog({ event }) {
      //Если смена не новая (редактируем существующую)
      if (event) {
        //Записываем идентификатор выбранного события
        this.dialogShift.id = event.id;
        //По employeeId возвращаем объект employee
        this.dialogShift.employee = this.Employees.find(
          o => o.id === event.employeeId
        );
        this.dialogShift.startDate = event.start.slice(0, 10);
        this.dialogShift.startTime = event.start.slice(11, 16);

        const theDiff =
          new Date(event.end).getTime() - new Date(event.start).getTime();
        this.dialogShift.duration = new Date(theDiff)
          .toISOString()
          .slice(11, 16);
      }
      //Если смена новая
      else {
        this.dialogShift.startDate = this.selectedDay
          ? this.selectedDay
          : this.focus.slice(0, 10);
        this.dialogShift.employee = this.Employees[0]
          ? this.Employees[0]
          : null;
        this.dialogShift.startTime = "08:00";
        this.dialogShift.duration = "12:00";
      }
      //Показываем окно с диалогом
      this.dialogShift.show = true;
    },
    //Обработчик кнопки "Отмена" в карточке смены
    closeShiftDialog(text, color) {
      this.defaultShift();
      //Показываем всплывашку, если переменная с текстом не пустая
      if (text) {
        this.snackbar.text = text;
        this.snackbar.color = color;
        this.snackbar.show = true;
      }
    },
    //Обработчик кнопки "Сохранить" в карточке смены
    saveShift() {
      //Текст всплывашки
      var theText = "";
      //Вычисляем UNIX-time начала смены
      this.dialogShift.utStart =
        new Date(this.dialogShift.startDate).getTime() +
        this.dialogShift.startTime.slice(0, 2) * 3600000 +
        this.dialogShift.startTime.slice(3, 5) * 60000;
      //Переводим длительность смены в мс
      this.dialogShift.utDuration =
        this.dialogShift.duration.slice(0, 2) * 3600000 +
        this.dialogShift.duration.slice(3, 5) * 60000;
      //Вычисляем UNIX-time конца смены
      this.dialogShift.utEnd =
        this.dialogShift.utStart + this.dialogShift.utDuration;
      //Если выбрана существующая смена, то обновляем ее значение, иначе создаем новую смену
      if (this.dialogShift.isNew == false) {
        this.updateShiftInDB(this.dialogShift);
        theText = "Смена обновлена";
      } else {
        this.addShiftInDB(this.dialogShift);
        theText = "Новая смена добавлена";
      }
      //Закрываем окно с показом вчплывашки
      this.closeShiftDialog(theText, "green");
    },
    //Значения по умолчанию для смены
    defaultShift() {
      this.dialogShift.id = "";
      this.dialogShift.show = false;
      this.dialogShift.isNew = false;
      this.dialogShift.employee = null;
      this.dialogShift.startDate = "";
      this.dialogShift.startTime = "";
      this.dialogShift.duration = "";
      this.dialogShift.utStart = 0;
      this.dialogShift.utEnd = 0;
      this.dialogShift.utDuration = 0;
    },
    //Заполнить график до конца месяца
    fillShiftsForMonth() {
      //вычисляем UNIX-time начала первой смены
      var iStartTime =
        new Date(this.dialogFillMonth.startDate).getTime() +
        this.dialogFillMonth.startTime.slice(0, 2) * 3600000 +
        this.dialogFillMonth.startTime.slice(3, 5) * 60000;
      //вычисляем месяц, который будем заполнять сменами
      const tempStartMonth = new Date(iStartTime).getMonth();
      //месяц окончания рассчитываемой смены
      var tempCurrentMonth = tempStartMonth;
      //переводим длительность смены в мс
      const iDuration =
        this.dialogFillMonth.duration.slice(0, 2) * 3600000 +
        this.dialogFillMonth.duration.slice(3, 5) * 60000;
      //Пока не залезем на следующий месяц, заполняем график
      while (tempCurrentMonth == tempStartMonth) {
        for (let employee of this.dialogFillMonth.shiftsSequence) {
          var tempEvent = {
            utStart: iStartTime,
            utEnd: iStartTime + iDuration,
            employee: this.dialogFillMonth.employees[employee]
          };
          this.addShiftInDB(tempEvent);
          iStartTime += iDuration;
          tempCurrentMonth = new Date(tempEvent.utEnd).getMonth();
        }
      }
      this.dialogFillMonth.show = false;
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = new Date().toISOString();
      this.dialogFillMonth.startDate = this.focus.slice(0, 8) + "01";
    },
    prev() {
      this.$refs.calendar.prev();
      this.dialogFillMonth.startDate = this.focus.slice(0, 8) + "01";
      //Обновляем список смен
      this.$apollo.queries.Shifts.refetch();
    },
    next() {
      this.$refs.calendar.next();
      this.dialogFillMonth.startDate = this.focus.slice(0, 8) + "01";
      //Обновляем список смен
      this.$apollo.queries.Shifts.refetch();
    },
    nth(d) {
      return d > 3 && d < 21
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][d % 10];
    },

    //Добавить смену в БД
    addShiftInDB(event) {
      this.$apollo.mutate({
        mutation: ADD_SHIFT_MUTATION,
        variables: {
          start: event.utStart.toString(),
          end: event.utEnd.toString(),
          employeeId: event.employee.id
        },
        refetchQueries: [
          {
            query: ALL_SHIFTS_QUERY,
            variables: {
              utPointInMonth: new Date(this.focus).getTime().toString()
            }
          }
        ]
      });
    },
    //Обновить смену в БД
    updateShiftInDB(event) {
      this.$apollo.mutate({
        mutation: UPDATE_SHIFT_MUTATION,
        variables: {
          id: event.id,
          start: event.utStart.toString(),
          end: event.utEnd.toString(),
          employeeId: event.employee.id
        },
        refetchQueries: [
          {
            query: ALL_SHIFTS_QUERY,
            variables: {
              utPointInMonth: new Date(this.focus).getTime().toString()
            }
          }
        ]
      });
    },
    //Удалить смену из БД
    deleteShiftInDB() {
      if (confirm("Удалить смену ?")) {
        this.$apollo.mutate({
          mutation: DELETE_SHIFT_MUTATION,
          variables: {
            id: this.dialogShift.id
          },
          refetchQueries: [
            {
              query: ALL_SHIFTS_QUERY,
              variables: {
                utPointInMonth: new Date(this.focus).getTime().toString()
              }
            }
          ]
        });
        this.closeShiftDialog("Смена удалена", "red");
      }
    },

    //Преобразовывает UNIX-time (в мс) в строку в формате "YYYY-MM-DD HH:MM"
    msToDateString(ms) {
      const tempDate = new Date(Number.parseInt(ms));
      const tempString =
        tempDate.toISOString().slice(0, 10) +
        " " +
        tempDate.toISOString().slice(11, 16);
      return tempString;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>