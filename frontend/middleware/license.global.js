/**
 * Middleware de Licença
 * Verifica a licença antes de cada navegação
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Rotas que não precisam de verificação
  const publicRoutes = ['/activate', '/blocked', '/login']
  
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Só executar no cliente
  if (process.server) {
    return
  }

  const { checkLicense, isActivated, isBlocked, needsActivation } = useLicense()
  
  // Verificar status da licença
  await checkLicense()

  // Se não está ativado, redirecionar para ativação
  if (needsActivation.value) {
    return navigateTo('/activate')
  }

  // Se está bloqueado, redirecionar para página de bloqueio
  if (isBlocked.value) {
    // Permitir acesso a rotas de leitura
    const readOnlyRoutes = ['/reports', '/settings']
    const isReadOnlyRoute = readOnlyRoutes.some(route => to.path.startsWith(route))
    
    if (!isReadOnlyRoute) {
      return navigateTo('/blocked')
    }
  }
})

