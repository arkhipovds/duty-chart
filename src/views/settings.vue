<template>
  <div>
    <v-container fluid>
      <v-card class="elevation-12">
        <v-tabs class="secondary" right>
          <v-tab>Zabbix</v-tab>
          <v-tab>Бизнес-логика</v-tab>
          <!-- Вкладка zabbix  -->
          <v-tab-item>
            <v-container fluid>
              <v-text-field v-model="zabbix.host" label="Хост"></v-text-field>
              <v-text-field v-model="zabbix.user" label="Логин"></v-text-field>
              <v-text-field v-model="zabbix.password" label="Пароль" type="password"></v-text-field>
              <v-text-field v-model="zabbix.database" label="База данных"></v-text-field>
              <v-text-field
                v-model="zabbix.timeZoneOffset"
                label="Часовой пояс"
                max="12"
                min="-12"
                step="1"
                type="number"
              ></v-text-field>
              <v-text-field
                v-model="zabbix.minStartOffset"
                label="Глубина сбора данных при пустой БД (день)"
                step="1"
                min="60"
                type="number"
              ></v-text-field>
              <v-text-field
                v-model="zabbix.delta"
                label="Размер выборки из БД (ч)"
                step="1"
                min="1"
                type="number"
              ></v-text-field>
              <v-text-field
                v-model="zabbix.interval"
                label="Интервал между запросами к БД (с)"
                step="1"
                min="30"
                type="number"
              ></v-text-field>
              <v-text-field
                v-model="zabbix.cooldown"
                label="На сколько можно приближаться к настоящему времени при выкачивании данных (ч)"
                step="1"
                min="1"
                type="number"
              ></v-text-field>
            </v-container>
          </v-tab-item>
          <!-- Вкладка бизнес-логика  -->
          <v-tab-item>
            <v-container fluid>
              <v-text-field
                v-model="maxAckTime"
                label="Допустимое время подтверждения события (ММ:СС)"
                type="time"
              ></v-text-field>
              <v-slider
                v-model="goodAckInTimePercent"
                :thumb-size="24"
                thumb-label="always"
                min="80"
                max="100"
                label="Норма подтверждения"
              ></v-slider>
            </v-container>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      login: null,
      password: null,
      zabbix: {
        host: "lms-db1-noc.unix.tensor.ru",
        user: "user",
        password: "defaultPassword",
        database: "zabbix",
        timeZoneOffset: 3, //* 60 * 60 на сколько нужно сдвинуть время в базе zabbix
        minStartOffset: 60,
        delta: 1,
        interval: 30,
        cooldown: 12
      },
      maxAckTime: "10:00",
      goodAckInTimePercent: "95"
    };
  }
};
</script>

<style lang="scss" scoped>
</style>