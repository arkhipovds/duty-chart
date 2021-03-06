//TODO при пересчете показателей блокировать весь интерфейс
//завязать снекбары на результаты работы функций

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import "vuetify/dist/vuetify.min.css";
import VueApollo from "vue-apollo";
import ApolloClient from "apollo-boost";

Vue.config.productionTip = false;
Vue.use(vuetify);
Vue.use(VueApollo);

const configuration = { apolloURI: "http://localhost:4000/" };

const Client = new ApolloClient({
  uri: configuration.apolloURI
});
const apolloProvider = new VueApollo({
  defaultClient: Client
});

new Vue({
  router,
  vuetify,
  apolloProvider,
  render: h => h(App)
}).$mount("#app");
