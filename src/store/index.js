import { useUserStore } from './modules/user'

// Backwards compatible getters object for auth.js plugin
const getters = {
  get token() {
    const store = useUserStore()
    return store.token
  },
  get avatar() {
    const store = useUserStore()
    return store.avatar
  },
  get id() {
    const store = useUserStore()
    return store.id
  },
  get name() {
    const store = useUserStore()
    return store.name
  },
  get roles() {
    const store = useUserStore()
    return store.roles || []
  },
  get permissions() {
    const store = useUserStore()
    return store.permissions || []
  },
  get hrUser() {
    const store = useUserStore()
    return store.hrUser
  }
}

// Export a store-like object for backwards compatibility with plugins
export default {
  getters
}

export { useUserStore }
