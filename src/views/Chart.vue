
<!-- TODO:
показывать в статистике расшифровку каждой суммы - если это нужно...   mdi-sigma 
 -->
<template>
  <div>
    <!-- Календарь -->
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
          <v-toolbar-title>{{focus.slice(0,7)}}</v-toolbar-title>
          <!-- Кнопка "Вперед" -->
          <v-btn fab text small @click="next">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <!-- Кнопка "Пересчитать показатели сотрудников" -->
          <v-tooltip v-model="show1" bottom>
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
          <!-- Кнопка "Добавить смену" -->
          <v-tooltip v-model="show2" bottom>
            <template v-slot:activator="{ on }">
              <v-btn fab small text v-on="on" @click="dialogShift.isNew=true,openShiftDialog({})">
                <v-icon>mdi-plus-one</v-icon>
              </v-btn>
            </template>
            <span>Добавить смену</span>
          </v-tooltip>
          <!-- Кнопка "Заполнить график до конца месяца" -->
          <v-tooltip v-model="show3" bottom>
            <template v-slot:activator="{ on }">
              <v-btn fab small text v-on="on" @click="dialogFillMonthOpen()">
                <v-icon>mdi-playlist-plus</v-icon>
              </v-btn>
            </template>
            <span>Заполнить график до конца месяца</span>
          </v-tooltip>
          <!-- Переключатель формата календаря месяц/неделя-->
          <v-btn fab text small @click="changeCalendarType">
            <v-icon>{{typeToLabel[type]}}</v-icon>
          </v-btn>
        </v-card-title>
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          locale="ru"
          interval-height="25"
          :events="parsedShifts"
          :event-color="getEventColor"
          :event-margin-bottom="3"
          :event-more="false"
          :type="type"
          :weekdays="[1,2,3,4,5,6,0]"
          @click:event="openShiftDialog"
          @click:date="clickDate"
        ></v-calendar>
      </v-card>
    </v-container>

    <!-- Диалог создания/правки смены -->
    <v-dialog v-model="dialogShift.show" max-width="600px" @click:outside="closeShiftDialog('')">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
          <v-spacer></v-spacer>
          <v-icon v-if="this.dialogShift.id" @click="deleteShiftInDB">mdi-delete</v-icon>
        </v-card-title>
        <v-card-text>
          <v-expansion-panels v-model="dialogShift.panel" multiple>
            <v-expansion-panel>
              <v-expansion-panel-header>Настройки</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="dialogShift.employee"
                      :items="employees"
                      item-text="fullName"
                      item-value="id"
                      return-object
                      label="Сотрудник"
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      ref="startDate"
                      v-model="dialogShift.startDate"
                      label="Дата"
                      type="date"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      ref="startTime"
                      v-model="dialogShift.startTime"
                      label="Время начала"
                      type="time"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      ref="duration"
                      v-model="dialogShift.duration"
                      label="Длительность"
                      type="time"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel :disabled="!dialogShift.showStats">
              <v-expansion-panel-header>
                <div v-if="dialogShift.showStats">Статистика – самая точная из всех лженаук!</div>
                <div
                  v-if="!dialogShift.showStats"
                >Судя по данным статистики, со статистикой у нас будет все в порядке.</div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      ref="ackInTimeEventsCount"
                      v-model="dialogShift.ackInTimeEventsCount"
                      label="Подтвердил вовремя"
                      type="text"
                      disabled
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      ref="ackNotInTimeEventsCount"
                      v-model="dialogShift.ackNotInTimeEventsCount"
                      label="Подтвердил поздно"
                      type="text"
                      disabled
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      ref="noAckEventsCount"
                      v-model="dialogShift.noAckEventsCount"
                      label="Не подтвердил"
                      type="text"
                      disabled
                      dense
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      ref="normalEventsCount"
                      v-model="dialogShift.normalEventsCount"
                      label="Всего нормальных событий"
                      type="text"
                      disabled
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      ref="tooShortEventsCount"
                      v-model="dialogShift.tooShortEventsCount"
                      label="Слишком коротких событий"
                      type="text"
                      disabled
                      dense
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      ref="freeDurationSum"
                      v-model="dialogShift.freeDurationSum"
                      label="Среднее время реакции"
                      type="text"
                      disabled
                      dense
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="closeShiftDialog('')">Отмена</v-btn>
          <v-btn color="green" text @click="saveShift">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог заполнения графика на месяц-->
    <v-dialog v-model="dialogFillMonth.show" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Заполнить график на месяц</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="3">
              <v-select
                v-model="dialogFillMonth.employees[0]"
                :items="activeEmployees"
                label="Первый сотрудник"
                item-text="fullName"
                item-value="id"
                return-object
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-select
                v-model="dialogFillMonth.employees[1]"
                :items="activeEmployees"
                label="Второй сотрудник"
                item-text="fullName"
                item-value="id"
                return-object
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-select
                v-model="dialogFillMonth.employees[2]"
                :items="activeEmployees"
                label="Третий сотрудник"
                item-text="fullName"
                item-value="id"
                return-object
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-select
                v-model="dialogFillMonth.employees[3]"
                :items="activeEmployees"
                label="Четвертый сотрудник"
                item-text="fullName"
                item-value="id"
                return-object
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <v-text-field
                ref="startDate"
                v-model="dialogFillMonth.startDate"
                label="Первая смена"
                type="date"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field
                ref="startTime"
                v-model="dialogFillMonth.startTime"
                label="Начало смены"
                type="time"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field
                ref="duration"
                v-model="dialogFillMonth.duration"
                label="Длительность"
                type="time"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="dialogFillMonth.show=false">Отмена</v-btn>
          <v-btn color="green" text @click="fillShiftsForMonth">Заполнить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Всплывашка после действий -->
    <v-snackbar
      bottom
      right
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      @click="snackbar.show = false"
    >{{ snackbar.text }}</v-snackbar>
  </div>
</template>

<script>
import {
  CALCULATE_SCORINGS,
  ALL_SHIFTS_QUERY,
  ADD_SHIFT_MUTATION,
  UPDATE_SHIFT_MUTATION,
  DELETE_SHIFT_MUTATION,
  EMPLOYEES_QUERY
} from "@/queries/queries.js";

export default {
  //Запрашиваем данные о сменах и сотрудниках из БД
  apollo: {
    shifts: {
      query: ALL_SHIFTS_QUERY,
      variables() {
        return {
          TS: this.calendarFocus
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
  //Данные для интерфейса
  data() {
    return {
      //Флаги показа подсказок
      show1: false,
      show2: false,
      show3: false,
      //Флаг процесса пересчета показателей
      scoringsRecalculating: false,
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
        utDuration: 0,
        ackInTimeEventsCount: 0,
        ackNotInTimeEventsCount: 0,
        noAckEventsCount: 0,
        tooShortEventsCount: 0,
        normalEventsCount: 0,
        freeDurationSum: 0,
        panel: [0],
        showStats: false
      }
    };
  },
  computed: {
    activeEmployees() {
      let newArray = [];
      if (this.employees) {
        for (let item of this.employees) {
          if (item.isActive) newArray.push(item);
        }
      }
      return newArray;
    },
    calendarFocus() {
      return this.focus
        ? new Date(this.focus).getTime().toString()
        : new Date().getTime().toString();
    },
    //Формируем заголовок карточки смены
    formTitle() {
      return this.dialogShift.isNew ? "Новая смена" : "Cмена";
    },
    //Преобразовываем массив со сменами в формат, подходящий для календаря
    parsedShifts() {
      //!!!!!!!!!!!!!!!TODO переписать функцию с проверками существования всех объектов и дефолтным поведением
      var newShifts = [];
      if (this.shifts && this.employees)
        newShifts = this.shifts.map(element => {
          var shiftIndicator = "";
          if (
            element.normalEventsCount > 0 ||
            element.tooShortEventsCount > 0
          ) {
            shiftIndicator =
              " " +
              Math.round(
                (element.ackInTimeEventsCount * 100) / element.normalEventsCount
              ) +
              "% от " +
              element.normalEventsCount +
              " шт";
          }
          var newElement = {
            id: element.id,
            start: this.msToDateString(element.start),
            end: this.msToDateString(element.end),
            name:
              this.employees[
                this.employees.findIndex(el => el.id === element.employeeId)
              ].fullName + shiftIndicator,
            color: this.employees[
              this.employees.findIndex(el => el.id === element.employeeId)
            ].visibleColor,
            employeeId: element.employeeId,
            ackInTimeEventsCount: element.ackInTimeEventsCount,
            ackNotInTimeEventsCount: element.ackNotInTimeEventsCount,
            noAckEventsCount: element.noAckEventsCount,
            tooShortEventsCount: element.tooShortEventsCount,
            normalEventsCount: element.normalEventsCount,
            freeDurationSum: element.freeDurationSum
          };
          return newElement;
        });
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
    //Запускает пересчет показателей сотрудников за выбранный месяц
    async updateScorings() {
      this.scoringsRecalculating = true;
      await this.$apollo.mutate({
        mutation: CALCULATE_SCORINGS,
        variables: {
          TS: new Date(this.focus).getTime().toString()
        }
      });
      this.$apollo.queries.shifts.refetch();
      this.scoringsRecalculating = false;
      this.snackbar.text = "Показатели сотрудников обновлены";
      this.snackbar.color = "green";
      this.snackbar.show = true;
    },
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
        this.dialogShift.employee = this.employees.find(
          o => o.id === event.employeeId
        );
        this.dialogShift.startDate = event.start.slice(0, 10);
        this.dialogShift.startTime = event.start.slice(11, 16);

        const theDiff =
          new Date(event.end).getTime() - new Date(event.start).getTime();
        this.dialogShift.duration = new Date(theDiff)
          .toISOString()
          .slice(11, 16);
        this.dialogShift.ackInTimeEventsCount = event.ackInTimeEventsCount;
        this.dialogShift.ackNotInTimeEventsCount =
          event.ackNotInTimeEventsCount;
        this.dialogShift.noAckEventsCount = event.noAckEventsCount;
        this.dialogShift.tooShortEventsCount = event.tooShortEventsCount;
        this.dialogShift.normalEventsCount = event.normalEventsCount;
        if (event.normalEventsCount > 0) {
          this.dialogShift.freeDurationSum = Math.round(
            event.freeDurationSum / event.normalEventsCount / 60000
          );
          this.dialogShift.showStats = true;
        } else {
          this.dialogShift.freeDurationSum = 0;
        }
      }
      //Если смена новая
      else {
        this.dialogShift.startDate = this.selectedDay
          ? this.selectedDay
          : this.focus.slice(0, 10);
        this.dialogShift.employee = this.employees[0]
          ? this.employees[0]
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
      this.dialogShift.ackInTimeEventsCount = 0;
      this.dialogShift.ackNotInTimeEventsCount = 0;
      this.dialogShift.noAckEventsCount = 0;
      this.dialogShift.tooShortEventsCount = 0;
      this.dialogShift.normalEventsCount = 0;
      this.dialogShift.freeDurationSum = 0;
      this.dialogShift.panel = [0];
      this.dialogShift.showStats = false;
    },
    //Открываем окно заполнения графика на месяц
    dialogFillMonthOpen() {
      //Заполням форму первыми попавшимися сотрудниками
      for (let i = 0; i < 4; i++) {
        this.dialogFillMonth.employees[i] = this.activeEmployees[i]
          ? this.activeEmployees[i]
          : null;
      }
      //Показываем окно
      this.dialogFillMonth.show = true;
    },
    //Заполнить график до конца месяца
    fillShiftsForMonth() {
      if (
        confirm(
          "Тут сейчас такое начнется! Точно заполнить график сменами с выбранной даты до конца месяца?"
        )
      ) {
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
      }
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
      this.$apollo.queries.shifts.refetch();
    },
    next() {
      this.$refs.calendar.next();
      this.dialogFillMonth.startDate = this.focus.slice(0, 8) + "01";
      //Обновляем список смен
      this.$apollo.queries.shifts.refetch();
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
              TS: new Date(this.focus).getTime().toString()
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
              TS: new Date(this.focus).getTime().toString()
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
                TS: new Date(this.focus).getTime().toString()
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