<template>
  <div>
    <!-- Панель управления таблицей -->
    <v-toolbar>
      <!-- Строка поиска -->
      <v-col cols="3">
        <v-text-field
          v-model="searchTerm"
          prepend-icon="mdi-account-search"
          label="Поиск"
          full-width
          hide-details
          clearable
        ></v-text-field>
      </v-col>
      <v-spacer></v-spacer>
      <!-- Кнопка "Добавить сотрудника" -->
      <v-tooltip v-model="show1" bottom>
        <template v-slot:activator="{ on }">
          <v-btn fab small text v-on="on" @click="employeeDialog.show=true">
            <v-icon>mdi-account-plus</v-icon>
          </v-btn>
        </template>
        <span>Добавить сотрудника</span>
      </v-tooltip>
    </v-toolbar>

    <!-- Таблица с сотрудниками -->
    <v-container fluid>
      <v-card>
        <v-data-table
          :headers="headers"
          :items="activeEmployees"
          item-key="id"
          max-width="600px"
          hide-default-footer
          class="elevation-1"
          :search="searchTerm"
          :loading="loading"
          loading-text="Загрузка данных ... подождите!"
        >
          <!-- Показываем цвет -->
          <template v-slot:item.visibleColor="{ item }">
            <v-chip :color="item.visibleColor"></v-chip>
          </template>
          <!-- Признак "дежурный" -->
          <template v-slot:item.isRegular="{ item }">
            <v-chip v-if="item.isRegular">
              <v-icon>mdi-check</v-icon>
            </v-chip>
          </template>
          <!-- Действия -->
          <template v-slot:item.action="{ item }">
            <v-icon class="mr-2" @click="openEmployeeDialog(item)">mdi-pencil</v-icon>
            <v-icon @click="deleteEmployee(item)">mdi-delete</v-icon>
          </template>
          <!--если нет данных при поиске -->
          <template v-slot:no-results>
            <v-alert
              :value="true"
              color="orange"
              icon="mdi-linux"
            >По фразе "{{ searchTerm }}" ничего не найдено.</v-alert>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <!-- Диалог создания/правки карточки сотрудника -->
    <v-dialog v-model="employeeDialog.show" max-width="500px" @click:outside="closeDialog">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formDialogTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <v-text-field ref="fullName" v-model="employeeDialog.fullName" label="ФИО"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field ref="ADLogin" v-model="employeeDialog.ADLogin" label="Логин в домене"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="8">
              <v-color-picker
                v-model="employeeDialog.visibleColor"
                :hide-canvas="true"
                :hide-inputs="true"
                :show-swatches="false"
                class="mx-auto"
              ></v-color-picker>
            </v-col>
            <v-col cols="4">
              <v-checkbox v-model="employeeDialog.isRegular" label="Дежурный"></v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="closeDialog">Отмена</v-btn>
          <v-btn color="green darken-1" text @click="saveEmployee">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Всплывашка-->
    <v-snackbar
      v-model="snackbar.show"
      bottom
      right
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >{{ snackbar.text }}</v-snackbar>
  </div>
</template>

<script>
// Import queries from queries.js
import {
  ACTIVE_EMPLOYEES_QUERY,
  ADD_EMPLOYEE_MUTATION,
  UPDATE_EMPLOYEE_MUTATION,
  DELETE_EMPLOYEE_MUTATION
} from "@/queries/queries.js";

export default {
  data() {
    return {
      //Флаг показа подсказок
      show1: false,
      //Структура для всплывашки
      snackbar: {
        show: false,
        color: "green",
        text: "Сообщение",
        timeout: 5000 //само пропадет через 5 сек
      },
      //Структура для диалога с карточкой сотрудника
      employeeDialog: {
        show: false,
        id: "",
        fullName: "",
        ADLogin: "",
        isRegular: false,
        visibleColor: ""
      },
      //Поисковый запрос
      searchTerm: "",
      //Заголовки для таблицы
      headers: [
        {
          text: "ФИО",
          align: "left",
          sortable: true,
          value: "fullName"
        },
        {
          text: "Логин в домене",
          align: "right",
          sortable: true,
          value: "ADLogin"
        },
        {
          text: "Цвет",
          align: "right",
          sortable: false,
          value: "visibleColor"
        },
        {
          text: "Дежурный",
          align: "right",
          sortable: true,
          value: "isRegular"
        },
        {
          text: "",
          align: "right",
          value: "action",
          sortable: false
        }
      ]
    };
  },
  apollo: {
    //Закачивает в массив данные с бэкенда
    activeEmployees: {
      query: ACTIVE_EMPLOYEES_QUERY
    }
  },
  computed: {
    //Возвращает статус загрузки данных с бэкенда
    loading() {
      if (this.activeEmployees) {
        return false;
      } else {
        return true;
      }
    },
    //Возвращает заголовок для диалога
    formDialogTitle() {
      return this.employeeDialog.id === ""
        ? "Добавить сотрудника"
        : "Изменить данные сотрудника";
    }
  },
  methods: {
    //Заполняет данные диалога дефолтными значениями
    fillDialogWithDefaultValues() {
      this.employeeDialog.id = "";
      this.employeeDialog.fullName = "";
      this.employeeDialog.ADLogin = "";
      this.employeeDialog.isRegular = false;
      this.employeeDialog.visibleColor = "";
    },
    //Добавляет учетную запись в БД
    addEmployee() {
      this.$apollo.mutate({
        mutation: ADD_EMPLOYEE_MUTATION,
        variables: {
          fullName: this.employeeDialog.fullName,
          ADLogin: this.employeeDialog.ADLogin,
          isRegular: this.employeeDialog.isRegular,
          visibleColor: this.employeeDialog.visibleColor
        },
        refetchQueries: [
          {
            query: ACTIVE_EMPLOYEES_QUERY
          }
        ]
      });
    },
    //Обновляет данные учетной записи в БД
    updateEmployee() {
      this.$apollo.mutate({
        mutation: UPDATE_EMPLOYEE_MUTATION,
        variables: {
          id: this.employeeDialog.id,
          fullName: this.employeeDialog.fullName,
          ADLogin: this.employeeDialog.ADLogin,
          isRegular: this.employeeDialog.isRegular,
          visibleColor: this.employeeDialog.visibleColor
        },
        refetchQueries: [
          {
            query: ACTIVE_EMPLOYEES_QUERY
          }
        ]
      });
    },
    //Удаляет учетную запись из БД
    deleteEmployee(input) {
      if (confirm("Точно удалить запись?")) {
        this.$apollo.mutate({
          mutation: DELETE_EMPLOYEE_MUTATION,
          variables: {
            id: input.id
          },
          refetchQueries: [
            {
              query: ACTIVE_EMPLOYEES_QUERY
            }
          ]
        });
        this.snackbar.text = `Удалена учетная запись '${this.employeeDialog.fullName}'`;
        this.snackbar.color = "red";
        this.snackbar.show = true;
      }
    },
    //Открывает диалог с карточкой сотрудника
    openEmployeeDialog(input) {
      this.employeeDialog.id = input.id;
      this.employeeDialog.fullName = input.fullName;
      this.employeeDialog.ADLogin = input.ADLogin;
      this.employeeDialog.isRegular = input.isRegular;
      this.employeeDialog.visibleColor = input.visibleColor;
      this.employeeDialog.show = true;
    },
    //Сохраняет учетную запись сотрудника
    saveEmployee() {
      var mode = "Изменена учетная запись";
      if (this.employeeDialog.id != "") {
        this.updateEmployee();
      } else {
        this.addEmployee();
        mode = "Создана учетная запись";
      }
      this.snackbar.text = `${mode} ${this.employeeDialog.fullName}`;
      this.snackbar.color = "green";
      this.snackbar.show = true;
      this.closeDialog();
    },
    //Закрывает диалог с карточкой сотрудника
    closeDialog() {
      this.employeeDialog.show = false;
      this.fillDialogWithDefaultValues();
    }
  }
};
</script>