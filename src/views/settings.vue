<template>
  <div>
    <v-container fluid>
      <v-card class="elevation-12">
        <!--
  mongodb: {
    DBHost: "10.76.70.51",
    DBPort: "27017",
    DBName: "test"
  },
  apolloURI: "http://localhost:4000/"

  zabbix: {
    host: "lms-db1-noc.unix.tensor.ru",
    user: "alekseevea", //TODO: change login
    password: process.argv[2] ? process.argv[2] : "defaultPassword",
    database: "zabbix",
    timeZoneOffset: 3 * 60 * 60 //на сколько нужно сдвинуть время в базе zabbix
  },  
  minStartOffset: 60 * 60 * 24 * 70, //глубина сбора данных при пустой БД (с)
  delta: 60 * 60 * 12, //шаг выборки из БД (с)
  interval: 5, //интервал между запросами к БД (с)  
  cooldown: 60 * 60 * 12, //на сколько можно приближаться к настоящему времени при выкачивании данных (с)

  maxAckTime: 60 * 10 //Макс. время реакции дежурного (с)
  goodAckInTimePercent: 95, //устраивающий % подтверждения событий за месяц
  
        -->
        <v-tabs background-color="white" color="deep-purple accent-4" right>
          <v-tab>Бэкэнд</v-tab>
          <v-tab>Zabbix</v-tab>
          <v-tab>Бизнес-логика</v-tab>

          <v-tab-item v-for="n in 3" :key="n">
            <v-container fluid>
              <v-row>
                <v-col v-for="i in 6" :key="i" cols="12" md="4">
                  <v-img
                    :src="`https://picsum.photos/500/300?image=${i * n * 5 + 10}`"
                    :lazy-src="`https://picsum.photos/10/6?image=${i * n * 5 + 10}`"
                    aspect-ratio="1"
                  ></v-img>
                </v-col>
              </v-row>
            </v-container>
          </v-tab-item>
        </v-tabs>

        <v-form>
          <v-text-field label="учетная запись" name="login" prepend-icon="mdi-account" type="text"></v-text-field>
          <v-text-field
            id="password"
            label="пароль"
            name="password"
            prepend-icon="mdi-lock-outline"
            type="password"
          ></v-text-field>
        </v-form>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary">Войти</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      login: null,
      password: null
    };
  }
};
</script>

<style lang="scss" scoped>
</style>