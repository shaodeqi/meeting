import { createApp } from 'vue';
import 'splitpanes/dist/splitpanes.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './styles/index.less';
import './styles/variables.less';
import VConsole from 'vconsole';
new VConsole({ theme: 'dark' });

import App from './app.vue';

createApp(App).mount('#app');
