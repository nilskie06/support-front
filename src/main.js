import { createApp, defineAsyncComponent } from 'vue';
import App from './App.vue';
import router from "./router";
import AOS from 'aos';
import 'aos/dist/aos.css';
import i18n from './i18n';
import store from "./state/store";

// AG Grid and ApexCharts are large, so they load only on pages that render them
const AgGridVue = defineAsyncComponent(() =>
    import('@/helpers/agGrid').then(m => m.AgGridVue)
);
const ApexChart = defineAsyncComponent(() =>
    import('vue3-apexcharts')
);

import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import BootstrapVueNext from 'bootstrap-vue-next';
import vClickOutside from "click-outside-vue3";
import VueApexCharts from "vue3-apexcharts";
import { vMaska } from "maska"

import VueFeather from 'vue-feather';

import '@/assets/scss/config/galaxy/app.scss';
import '@/assets/scss/mermaid.min.css';
import 'bootstrap/dist/js/bootstrap.bundle'
import { initAppTheme } from './helpers/themeConfig';

initAppTheme();

// FakeBackend authentication
// import { configureFakeBackend } from './helpers/fake-backend';
// configureFakeBackend();


// Firebase authentication
// import { initFirebaseBackend } from './authUtils';

// const firebaseConfig = {
//     apiKey: process.env.VUE_APP_APIKEY,
//     authDomain: process.env.VUE_APP_AUTHDOMAIN,
//     databaseURL: process.env.VUE_APP_VUE_APP_DATABASEURL,
//     projectId: process.env.VUE_APP_PROJECTId,
//     storageBucket: process.env.VUE_APP_STORAGEBUCKET,
//     messagingSenderId: process.env.VUE_APP_MEASUREMENTID
// };

// initFirebaseBackend(firebaseConfig);



AOS.init({
    easing: 'ease-out-back',
    duration: 1000
});

const app = createApp(App);

app
    .use(store)
    .use(router)
    .use(VueApexCharts)
    .use(BootstrapVueNext)
    .component('AgGridVue', AgGridVue)
    .component('apexchart', ApexChart)
    .component(VueFeather.type, VueFeather)
    .directive("maska", vMaska)
    .use(i18n)
    .use(VueSweetalert2)
    .use(vClickOutside).mount('#app');
