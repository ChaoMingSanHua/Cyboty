/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import router from '../router'
import store from "../store"
import "../assets/css/index.css"
import Ui from "@/library/index"

export function registerPlugins (app) {
  loadFonts()
  app
    .use(vuetify)
    .use(router)
    .use(store)
    .use(Ui)
  app.config.globalProperties.$filters = {
    toFixed(value) {
      return value.toFixed(3)
    }
  }
}
