/**
 * Composable para autenticação do painel admin
 * Usa credenciais do sistema principal (usuários ADMIN)
 */
export const useAdminAuth = () => {
  const user = useState('admin.user', () => null)
  const token = useState('admin.token', () => null)
  const isLoggedIn = computed(() => !!token.value)
  
  const { post } = useApi()
  
  const login = async (credentials) => {
    try {
      const res = await post('/auth/login', credentials)
      
      if (res.success) {
        // Verificar se é ADMIN
        if (res.data.user.role !== 'ADMIN') {
          return { success: false, error: 'Acesso permitido apenas para administradores' }
        }
        
        token.value = res.data.token
        user.value = res.data.user
        
        if (process.client) {
          localStorage.setItem('admin_token', res.data.token)
          localStorage.setItem('admin_user', JSON.stringify(res.data.user))
        }
        
        return { success: true }
      }
      
      return { success: false, error: res.error || 'Credenciais inválidas' }
    } catch (error) {
      return { success: false, error: error.message || 'Erro ao fazer login' }
    }
  }
  
  const logout = () => {
    token.value = null
    user.value = null
    
    if (process.client) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    }
    
    navigateTo('/login')
  }
  
  const initAuth = () => {
    if (process.client) {
      const savedToken = localStorage.getItem('admin_token')
      const savedUser = localStorage.getItem('admin_user')
      
      if (savedToken && savedUser) {
        token.value = savedToken
        try {
          user.value = JSON.parse(savedUser)
        } catch (e) {
          localStorage.removeItem('admin_user')
        }
      }
    }
  }
  
  return {
    user: readonly(user),
    token: readonly(token),
    isLoggedIn,
    login,
    logout,
    initAuth
  }
}

