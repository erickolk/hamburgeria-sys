export default defineNuxtPlugin(() => {
  const { initAuth, logout } = useAuth()

  try {
    initAuth()
  } catch (error) {
    const message = (error as Error)?.message ?? String(error)
    console.warn('[init-auth] falha ao inicializar sessão', message)
  }

  if (!process.client) return

  const savedToken = localStorage.getItem('token')
  const savedUser = localStorage.getItem('user')
  const isMockToken = savedToken === 'temp-token'

  let isMockUser = false
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser)
      isMockUser = parsed?.email === 'teste@mercadinho.com' || parsed?.name === 'Usuário Teste'
    } catch (error) {
      const message = (error as Error)?.message ?? String(error)
      console.warn('[init-auth] usuário salvo inválido. Limpando cache.', message)
      localStorage.removeItem('user')
    }
  }

  if (isMockToken || isMockUser) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Evitar mutação direta em refs readonly; usar ação de logout
    logout()
  }
})
