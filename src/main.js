import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'
import plugins from './plugins'
import { useUserStore } from '@/store/modules/user'

// Create store wrapper for backwards compatibility with this.$store
// This wrapper provides reactive access to the Pinia store
const createStoreWrapper = (pinia) => {
  // Store instance will be created after pinia is installed
  let _userStore = null
  
  const getUserStore = () => {
    if (!_userStore) {
      try {
        _userStore = useUserStore(pinia)
      } catch (e) {
        console.warn('Store access error:', e)
        return null
      }
    }
    return _userStore
  }
  
  return {
    get state() {
      const store = getUserStore()
      return {
        user: {
          token: store?.token || '',
          avatar: store?.avatar || '',
          id: store?.id || '',
          name: store?.name || '',
          roles: store?.roles || [],
          permissions: store?.permissions || [],
          hrUser: store?.hrUser || null
        }
      }
    },
    get getters() {
      const store = getUserStore()
      return {
        token: store?.token || '',
        avatar: store?.avatar || '',
        id: store?.id || '',
        name: store?.name || '',
        roles: store?.roles || [],
        permissions: store?.permissions || [],
        hrUser: store?.hrUser || null
      }
    },
    dispatch(action, payload) {
      const store = getUserStore()
      if (!store) return Promise.reject('Store not initialized')
      
      if (action === 'Login') {
        return store.Login(payload)
      } else if (action === 'GetInfo') {
        return store.GetInfo()
      } else if (action === 'LogOut') {
        return store.LogOut()
      }
      return Promise.resolve()
    }
  }
}

export function createApp() {
  const app = createSSRApp(App)
  
  // Create Pinia instance FIRST
  const pinia = Pinia.createPinia()
  app.use(pinia)
  
  // Register plugins ($tab, $auth, $modal)
  app.use(plugins)
  
  // Add backwards-compatible $store wrapper
  // Pass pinia instance so the store can be properly initialized
  app.config.globalProperties.$store = createStoreWrapper(pinia)
  
  return { app, pinia }
}
