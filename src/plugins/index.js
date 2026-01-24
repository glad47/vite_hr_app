import tab from './tab'
import auth from './auth'
import modal from './modal'

export default {
  install(app) {
    // Vue 3 way to add global properties
    app.config.globalProperties.$tab = tab
    app.config.globalProperties.$auth = auth
    app.config.globalProperties.$modal = modal
  }
}
