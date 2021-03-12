import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

import es from 'vuetify/lib/locale/es';

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#2196F3',
        secondary: '#8BC34A',
        accent: '#FFAA2C',
        error: '#F83E70'
      }
    }
  },

  lang: {
    locales: { es },
    current: 'es',
  }
});
