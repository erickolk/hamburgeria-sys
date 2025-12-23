// TEMPORÁRIO: Autenticação desabilitada para testes sem Docker
// TODO: Reabilitar autenticação quando necessário
export default defineNuxtRouteMiddleware((to, from) => {
  // Autenticação desabilitada - permitir acesso a todas as páginas
  // const { isLoggedIn, isAdmin } = useAuth()
  // if (!isLoggedIn.value) {
  //   return navigateTo('/login')
  // }
  // if (!isAdmin.value) {
  //   throw createError({
  //     statusCode: 403,
  //     statusMessage: 'Acesso negado. Apenas administradores podem acessar esta página.'
  //   })
  // }
})