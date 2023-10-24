import { createApp } from 'vue';
import 'splitpanes/dist/splitpanes.css';
// import 'element-plus/theme-chalk/dark/css-vars.css';
import './styles/index.less';
import './styles/variables.less';
import VConsole from 'vconsole';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

if (new URLSearchParams(location.search).get('debug') !== null) {
  new VConsole({ theme: 'dark' });
}

import App from './app.vue';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');
