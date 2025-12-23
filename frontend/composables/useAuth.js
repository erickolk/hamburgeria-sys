// Habilitar autenticação real para uso do backend
const AUTH_DISABLED = false

export const useAuth = () => {
  // Se autenticação está desabilitada, sempre retornar como logado
  const mockUser = {
    id: 'temp-user-id',
    name: 'Usuário Teste',
    email: 'teste@mercadinho.com',
    role: 'ADMIN'
  }

  const user = useState('auth.user', () => AUTH_DISABLED ? mockUser : null)
  const token = useState('auth.token', () => AUTH_DISABLED ? 'temp-token' : null)
  const isLoggedIn = computed(() => AUTH_DISABLED ? true : !!token.value)

  const login = async (credentials) => {
    try {
      const { post } = useApi()
      console.log('[useAuth.login] iniciando', credentials)
      const res = await post('/auth/login', credentials)
      console.log('[useAuth.login] resposta', res)

      if (res.success) {
        const data = res.data
        token.value = data.token
        user.value = data.user

        if (process.client) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        return { success: true, data }
      }

      return { success: false, error: res.error || 'Erro ao fazer login' }
    } catch (error) {
      console.error('Erro no login:', error)
      return {
        success: false,
        error: error.data?.error || error.message || 'Erro ao fazer login'
      }
    }
  }

  const logout = async () => {
    token.value = null
    user.value = null

    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }

    await navigateTo('/login')
  }

  const initAuth = () => {
    if (process.client) {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (savedToken && savedUser) {
        token.value = savedToken
        try {
          user.value = JSON.parse(savedUser)
        } catch (e) {
          console.warn('[useAuth.initAuth] usuário salvo inválido, limpando', e?.message)
          localStorage.removeItem('user')
          user.value = null
        }
      }
    }
  }

  const hasRole = (roles) => {
    // Se autenticação está desabilitada, sempre retornar true para ADMIN
    if (AUTH_DISABLED) return true
    if (!user.value) return false
    if (typeof roles === 'string') roles = [roles]
    return roles.includes(user.value.role)
  }

  const isAdmin = computed(() => AUTH_DISABLED ? true : hasRole('ADMIN'))
  const isManager = computed(() => AUTH_DISABLED ? true : hasRole(['ADMIN', 'MANAGER']))
  const isCashier = computed(() => AUTH_DISABLED ? true : hasRole(['ADMIN', 'MANAGER', 'CASHIER']))

  return {
    user: readonly(user),
    token: readonly(token),
    isLoggedIn,
    isAdmin,
    isManager,
    isCashier,
    login,
    logout,
    initAuth,
    hasRole
  }
}