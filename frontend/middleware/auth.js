/**
 * Middleware de Autenticação
 * Verifica se o usuário está logado antes de acessar páginas protegidas
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/activate', '/blocked']
  
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Verificar se está logado
  const { isLoggedIn, initAuth } = useAuth()
  
  // Inicializar autenticação (carregar token do localStorage)
  if (process.client) {
    initAuth()
  }
  
  // Se não está logado, redirecionar para login
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})