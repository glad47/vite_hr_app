import { defineStore } from 'pinia'
import config from '@/config'
import storage from '@/utils/storage'
import constant from '@/utils/constant'
import { isHttp, isEmpty } from '@/utils/validate'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/static/images/profile.jpg'
import { getEmp } from '@/api/api/emp'

const baseUrl = config.baseUrl

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    id: storage.get(constant.id),
    name: storage.get(constant.name),
    avatar: storage.get(constant.avatar),
    roles: storage.get(constant.roles) || [],
    permissions: storage.get(constant.permissions) || [],
    hrUser: storage.get(constant.hrUser),
    typeUser: storage.get('typeUser') || 'normal'
  }),

  getters: {
    getToken: (state) => state.token,
    getAvatar: (state) => state.avatar,
    getId: (state) => state.id,
    getName: (state) => state.name,
    getRoles: (state) => state.roles,
    getPermissions: (state) => state.permissions,
    getHrUser: (state) => state.hrUser,
    getTypeUser: (state) => state.typeUser
  },

  actions: {
    setToken(token) {
      this.token = token
    },
    setId(id) {
      this.id = id
      storage.set(constant.id, id)
    },
    setName(name) {
      this.name = name
      storage.set(constant.name, name)
    },
    setAvatar(avatar) {
      this.avatar = avatar
      storage.set(constant.avatar, avatar)
    },
    setRoles(roles) {
      this.roles = roles
      storage.set(constant.roles, roles)
    },
    setPermissions(permissions) {
      this.permissions = permissions
      storage.set(constant.permissions, permissions)
    },
    setHrUser(hrUser) {
      this.hrUser = hrUser
      storage.set(constant.hrUser, hrUser)
    },
    setTypeUser(typeUser) {
      this.typeUser = typeUser
      storage.set('typeUser', typeUser)
    },

    // 登录
    async Login(userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      
      const res = await login(username, password, code, uuid)
      setToken(res.token)
      this.setToken(res.token)
      return res
    },

    // 获取用户信息
    async GetInfo() {
      const res = await getInfo()
      const user = res.user
      let avatar = user.avatar || ''
      
      if (!isHttp(avatar)) {
        avatar = isEmpty(avatar) ? defAva : baseUrl + avatar
      }
      
      const userid = isEmpty(user) || isEmpty(user.userId) ? '' : user.userId
      const username = isEmpty(user) || isEmpty(user.userName) ? '' : user.userName
      
      if (res.roles && res.roles.length > 0) {
        this.setRoles(res.roles)
        this.setPermissions(res.permissions)
      } else {
        this.setRoles(['ROLE_DEFAULT'])
      }
      
      this.setId(userid)
      this.setName(username)
      this.setAvatar(avatar)
      this.setTypeUser(user.typeUser || 'normal')
      
      // Call getEmp and block login if no HR user
      if (username) {
        console.log('before login i am getting the hr information')
        const empRes = await getEmp(username)
        console.log(empRes)
        
        if (empRes.data) {
          this.setHrUser(empRes.data)
          return res
        } else {
          throw new Error('HR user not found')
        }
      } else {
        throw new Error('Username is missing')
      }
    },

    // 退出系统
    async LogOut() {
      await logout(this.token)
      this.setToken('')
      this.setRoles([])
      this.setPermissions([])
      removeToken()
      storage.clean()
    }
  }
})
