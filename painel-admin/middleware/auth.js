/**
 * Middleware de autenticação do painel admin
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/login') return
  
  const { isLoggedIn, initAuth } = useAdminAuth()
  
  if (process.client) {
    initAuth()
  }
  
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})

