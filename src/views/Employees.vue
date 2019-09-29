<template>
  <v-app>
    <div class="text-xs-center">
        <v-dialog v-model="dialog" max-width="500px" data-app>
            <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md4>
                                <v-text-field ref="fullName" v-model="editedItem.fullName" label="ФИО"></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-switch v-model="editedItem.isRegular" label="Штатный"></v-switch>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-color-picker
                                    v-model="editedItem.visibleColor"
                                    :hide-canvas="true"
                                    :hide-inputs="true"
                                    :show-swatches="false"
                                    class="mx-auto"
                                >
                                </v-color-picker>
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
    </div>

    <v-card color="grey lighten-4" flat height="200px" tile>
      <v-toolbar>
        <v-text-field
          v-model="searchTerm"
          prepend-icon="mdi-account-search"
          label="Поиск"
          single-line
          sm="2" md="2" lg="2"
          hide-details
          clearable
          full-width
          width="200px"
        >
        </v-text-field>
        <v-spacer></v-spacer>
        <v-btn color="green" dark class="mb-2" @click="dialog = true">
          <v-icon dark>mdi-plus</v-icon>Сотрудник
        </v-btn>
      </v-toolbar>


      <!-- таблица с данными
        :headers="headers" // источник заголовков столбцов
        :items="Employees" // источник данных
        :page.sync="pagination.page" // текущая страница
        :items-per-page="pagination.rowsPerPage" // сколько записей на страницу
        :single-expand="true" // разворачивать только одну строку
        show-expand // показывать или нет разворот строки
        item-key="id" // ключевое поле
        hide-default-footer // убрать встроенную пагинацию
        class="elevation-1" // чтобы тень была
        :loading="false" // включить бегунук на таблице, типа загрузка
        loading-text="Загрузка данных ... подождите!" // собственно текст выводимый при загрузке
      -->
      <v-data-table
        :headers="headers"
        :items="Employees"
        :page.sync="pagination.page"
        :items-per-page="pagination.rowsPerPage"
        item-key="id"
        hide-default-footer
        class="elevation-1"
        :calculate-widths="true"
        :search="searchTerm"
        :loading="loading"
        loading-text="Загрузка данных ... подождите!"
      >
        <!-- у таблицы есть несколько предопределенных слотов, скрытых элментов, которым можно
        описать шаблон и выводить при опреденных событиях-->
        <template v-slot:item.visibleColor="{ item }">
            <v-chip :color="item.visibleColor"><v-icon>mdi-account-box-outline</v-icon></v-chip>
        </template>
        <template v-slot:item.isRegular="{ item }">
            <v-chip v-if="item.isRegular"><v-icon>mdi-check</v-icon></v-chip>
        </template>
        <template v-slot:item.action="{ item }">
            <v-icon class="mr-2" @click="selectEmployee(item)">mdi-pencil</v-icon>
            <v-icon @click="deleteEmployee(item)">mdi-delete</v-icon>
        </template>
        <!--если нет данных при поиске -->
        <template v-slot:no-results>
            <v-alert :value="true" color="orange" icon="mdi-linux"
            >По фразе "{{ searchTerm }}" ничего не найдено.
            </v-alert>
        </template>
        <!--Если бекенд не вернул ничего -->
        <template v-slot:no-data>
            <v-alert :value="true" color="error" icon="mdi-linux">
                Нет данных.
            </v-alert>
        </template>
      </v-data-table>
      <!--элемент пагинации. Собственно ему надо передовать текущую страницу и всего страниц -->
      <div class="text-xs-center pt-3">
        <v-pagination v-model="pagination.page" :length="pages"></v-pagination>
      </div>
    </v-card>
    <!--снекбар, уведоплялочка всплывашка, внутри снекбара можно описать любой шаблон -->
    <v-snackbar
      v-model="snackbar.show"
      top
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <v-btn fab text :color="snackbar.color" @click="snackbar.show = false">
        <v-icon dark>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
// Import queries from queries.js
import {
    ALL_EMPLOYEES_QUERY,
    ADD_EMPLOYEE_MUTATION,
    DELETE_EMPLOYEE_MUTATION
} from "@/queries/queries.js";

export default {
    name: "App",
    data() {
        return {
            loading: true,
            dialog: false,
            // структура для уведомлений
            snackbar: {
                show: false,
                color: "green",
                text: "Сообщение",
                timeout: 5000 //само пропадет через 5 сек
            },
            // структура данных при редактировании
            editedItem: {
                id: "",
                fullName: "",
                isRegular: false,
                visibleColor: ""
            },
            // структура данных для простоты очистки после правки этот объект вливаем в editedItem
            defaultItem: {
                id: "",
                fullName: "",
                isRegular: false,
                visibleColor: ""
            },
            searchTerm: "", // переременная, где будет строка поиска
            //параметры пагинации
            pagination: {
                descending: false, // сортировка по убыванию выключена
                sortBy: "id", // поле сортировки по умолчанию
                page: 1, // текущая страница
                rowsPerPage: 15 // по сколько выводить строк в таблицу
            },
            headers: [
                // у vuetify таблицы более богатые возможности
                // описания заголовков столбцов
                {
                    text: "ФИО",
                    align: 'start',
                    sortable: true,
                    value: "fullName"
                },
                {
                    text: "Цвет", // название в интерфейсе
                    align: 'end',
                    sortable: false, // возможность сортировки
                    value: "visibleColor" // поле в базе
                },
                {
                    text: "Дежурный", // название в интерфейсе
                    align: 'end',
                    sortable: true, // возможность сортировки
                    value: "isRegular" // поле в базе
                },
                // это фиктивный столбец, для инструментов правки и удаления
                // обязательно нужно указать имя столбца, это имя используется в slot для вывода
                // содержимого
                { 
                    text: "", 
                    align: 'end',
                    value: "action", 
                    sortable: false 
                }
            ]
        };
  },
  apollo: {
    Employees: {
      query: ALL_EMPLOYEES_QUERY
    }
  },
  computed: {
    formTitle() {
      return this.editedItem.id === ""
        ? "Добавить сотрудника"
        : "Исправить :) сотрудника";
    },
    pages() {
      // если количество записей на странице нулевое, то на ноль делить нельзя
      // выводим сразу количество страниц 0 и пагинатора не будет
      if (
        this.Employees &&
        (this.pagination.rowsPerPage != null ||
          this.pagination.rowsPerPage != 0)
      ) {
        // если данные с бэкенда есть, то считаем
        return Math.ceil(this.Employees.length / this.pagination.rowsPerPage);
      } else return 0; //
    }
  },
  watch: {
    pages() {
      // отслеживаем изменение расчета страниц, если оно было, то данные есть с бэкенда
      // и загрузчик выключаем
      if (this.Employees) this.loading = false;
    },
    dialog(val) {
      val || this.close();
    }
  },
  methods: {
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    addEmployee() {
        // после изменение данных читаем состояние в базе через запрос refetchQueries
        // Vue обновит данные в интерфейсе сам
        this.$apollo.mutate({
            mutation: ADD_EMPLOYEE_MUTATION,
            variables: {
                fullName: this.editedItem.fullName,
                isRegular: this.editedItem.isRegular,
                visibleColor: this.editedItem.visibleColor
            },
            refetchQueries: [
                {
                    query: ALL_EMPLOYEES_QUERY
                }
            ]
        });
    },
    deleteEmployee(input) {
      if (confirm("Удалить номер ?")) {
        this.$apollo.mutate({ 
          mutation: DELETE_EMPLOYEE_MUTATION,
          variables: {
            id: input.id
          },
          refetchQueries: [
            {
              query: ALL_EMPLOYEES_QUERY
            }
          ]
        });
        this.snackbar.text = `УДАЛЕНО! ${this.editedItem.fullName}`;
        this.snackbar.color = "red";
        this.snackbar.show = true;
      }
    },
    // эта функция заполняет поля ввода в форме редактирования
    selectEmployee(input) {
      this.editedItem.id = input.id;
      this.editedItem.fullName = input.fullName;
      this.editedItem.isRegular = input.isRegular;
      this.editedItem.visibleColor = input.visibleColor;
      this.dialog = true;
    },
    //в реализации этого метода используются в качестве параметров поля раздельно
    // это не обязательно, просто в качестве примера. При добавлении объект, а тут поля
    updateEmployee() {
        /*
      this.$apollo.mutate({
        mutation: UPDATE_EMPLOYEE_MUTATION,
        variables: {
          id: this.editedItem.id,
          number: this.editedItem.number,
          name: this.editedItem.name
        },
        refetchQueries: [
          {
            query: ALL_EMPLOYEES_QUERY
          }
        ]
      });
      */
    },
    save() {
      var mode = "ИСПРАВЛЕНО! ";
      if (this.editedItem.id != "") {
        this.updateEmployee();
      } else {
        this.addEmployee();
        // this.Employees.push(this.editedItem);
        this.pagination.sortBy = "id";
        this.pagination.descending = false;
        this.pagination.page = this.pages;
        mode = "ДОБАВЛЕНО!";
      }
      this.snackbar.text = `${mode} ${this.editedItem.fullName}`;
      this.snackbar.color = "green";
      this.snackbar.show = true;
      this.close();
    }
  }
};
</script>