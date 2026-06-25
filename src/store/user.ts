import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

interface UserInfo {
  id: string
  name: string
  avatar: string
  roles: string[]
  teamId?: string
  teamRole?: 'owner' | 'admin' | 'member'
}

interface UserState {
  token: string | null
  userInfo: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    hasPermission: (state) => (role: string) => state.userInfo?.roles.includes(role),
    isTeamMember: (state) => !!state.userInfo?.teamId,
  },
  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },
    setUserInfo(info: UserInfo) {
      this.userInfo = info
      localStorage.setItem('userInfo', JSON.stringify(info))
    },
    clearAuth() {
      this.token = null
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },
    // SSO Login - 恒智易平台携带 Token
    async ssoLogin(token: string) {
      // 真实环境这里应该去后端验证 token 并获取用户信息
      this.setToken(token)
      // Mock 用户信息
      this.setUserInfo({
        id: 'sso_user_1',
        name: '恒智易用户',
        avatar: '',
        roles: ['user'],
        teamId: 'team_01',
        teamRole: 'member'
      })
    },
    // 密码登录
    async loginByPassword(form: any) {
      // 真实环境调用后端接口
      console.log('Password login:', form)

      // 检查成员是否被冻结（模拟后端校验）
      const savedMembers = localStorage.getItem('team_members')
      if (savedMembers) {
        const members = JSON.parse(savedMembers)
        const member = members.find((m: any) => m.username === form.username)
        if (member && member.status === 'frozen') {
          ElMessage.error('您的账号已被冻结，无法登录。请联系管理员！')
          throw new Error('Account frozen')
        }
      }

      this.setToken('mock_token_password_' + Date.now())
      this.setUserInfo({
        id: 'local_user_1',
        name: form.username || '本地用户',
        avatar: '',
        roles: ['user', 'admin'],
        teamId: 'team_01',
        teamRole: 'owner'
      })
    },
    // 短信登录
    async loginBySms(form: any) {
      // 真实环境调用后端接口
      console.log('SMS login:', form)
      this.setToken('mock_token_sms_' + Date.now())
      this.setUserInfo({
        id: 'local_user_2',
        name: form.phone || '手机用户',
        avatar: '',
        roles: ['user']
      })
    },
    // 注册
    async register(form: any) {
      // 真实环境调用后端接口
      console.log('Register:', form)
      // 模拟注册成功并登录
      this.setToken('mock_token_reg_' + Date.now())
      this.setUserInfo({
        id: 'local_user_' + Date.now(),
        name: form.phone || '新用户',
        avatar: '',
        roles: ['user']
      })
    },
    // 注销
    async logout() {
      // 真实环境可能需要调用后端注销接口
      this.clearAuth()
    }
  }
})
