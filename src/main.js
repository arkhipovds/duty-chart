import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import 'vuetify/dist/vuetify.min.css'
import VueApollo from "vue-apollo";
import ApolloClient from "apollo-boost";

Vue.config.productionTip = false

Vue.use(vuetify);
Vue.use(VueApollo);

const Client = new ApolloClient({
  uri: "http://localhost:4000/"
});
const apolloProvider = new VueApollo({
  defaultClient: Client
});

new Vue({
  router,
  vuetify,
  apolloProvider,
  render: h => h(App)
}).$mount('#app')