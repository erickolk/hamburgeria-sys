// TEMPORÁRIO: Autenticação desabilitada para testes sem Docker
// TODO: Reabilitar autenticação quando necessário
export default defineNuxtRouteMiddleware((to, from) => {
  // Autenticação desabilitada - permitir acesso a todas as páginas
  // const { isLoggedIn } = useAuth()
  // if (!isLoggedIn.value && to.path !== '/login') {
  //   return navigateTo('/login')
  // }
})