import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import plugins from './plugins'
import './permission'
import { getDicts } from '@/api/system/dict/data'

// Compatibility store wrapper
const createStoreWrapper = () => {
  let userStore = null
  
  const getStore = () => {
    if (!userStore) {
      const { useUserStore } = require('@/store/modules/user')
      userStore = useUserStore()
    }
    return userStore
  }
  
  return {
    get getters() {
      const store = getStore()
      return {
        get token() { return store.token },
        get avatar() { return store.avatar },
        get id() { return store.id },
        get name() { return store.name },
        get roles() { return store.roles || [] },
        get permissions() { return store.permissions || [] },
        get hrUser() { return store.hrUser }
      }
    },
    dispatch(action, payload) {
      const store = getStore()
      if (action === 'Login') {
        return store.Login(payload)
      } else if (action === 'GetInfo') {
        return store.GetInfo()
      } else if (action === 'LogOut') {
        return store.LogOut()
      }
      console.warn(`Unknown action: ${action}`)
      return Promise.resolve()
    }
  }
}

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
  app.use(plugins)
  
  // Global properties (Vue 3 way)
  app.config.globalProperties.getDicts = getDicts
  
  // Add $store compatibility layer for existing code
  app.config.globalProperties.$store = createStoreWrapper()
  
  return {
    app,
    pinia
  }
}
