import { createApp } from 'vue';
import VueECharts from 'vue-echarts';
import App from './App.vue';
import router from './router';
import { pinia } from './stores';
import './plugins/echarts';
import './assets/main.css';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.component('VChart', VueECharts);

app.mount('#app');
