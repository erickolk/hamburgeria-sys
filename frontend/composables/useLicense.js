/**
 * Composable de Licenciamento
 * Gerencia o estado da licença no frontend
 */

export const useLicense = () => {
  // Importar API sem autenticação para rotas de licença públicas
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase

  // Chamada API direta para rotas de licença (não precisam de auth)
  const licenseApiCall = async (url, options = {}) => {
    let finalUrl = apiBase.replace(/\/$/, '') + (url.startsWith('/') ? url : `/${url}`)
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    try {
      const response = await $fetch(finalUrl, config)
      return { success: true, data: response }
    } catch (error) {
      console.error('[useLicense] Erro na API:', error?.data || error?.message)
      return {
        success: false,
        error: error?.data?.error || error?.message || 'Erro na requisição'
      }
    }
  }

  const get = (url) => licenseApiCall(url, { method: 'GET' })
  const post = (url, body) => licenseApiCall(url, { method: 'POST', body })
  const del = (url) => licenseApiCall(url, { method: 'DELETE' })
  
  // Estado reativo
  const licenseStatus = useState('license.status', () => null)
  const licenseInfo = useState('license.info', () => null)
  const isActivated = useState('license.activated', () => false)
  const isLoading = useState('license.loading', () => false)
  const lastCheck = useState('license.lastCheck', () => null)

  // Computed
  const isActive = computed(() => licenseStatus.value === 'active')
  const isWarning = computed(() => licenseStatus.value === 'warning')
  const isCritical = computed(() => licenseStatus.value === 'critical')
  const isBlocked = computed(() => licenseStatus.value === 'blocked')
  const needsActivation = computed(() => !isActivated.value)

  const statusMessage = computed(() => {
    if (!licenseInfo.value) return ''
    return licenseInfo.value.message || ''
  })

  const daysRemaining = computed(() => {
    if (!licenseInfo.value) return null
    return licenseInfo.value.daysRemaining
  })

  const daysUntilBlock = computed(() => {
    if (!licenseInfo.value) return null
    return licenseInfo.value.daysUntilBlock
  })

  const graceDays = computed(() => {
    if (!licenseInfo.value) return 0
    return licenseInfo.value.graceDays || 0
  })

  const companyName = computed(() => {
    if (!licenseInfo.value) return ''
    return licenseInfo.value.companyName || ''
  })

  /**
   * Verifica o status da licença
   */
  const checkLicense = async () => {
    isLoading.value = true
    try {
      const response = await get('/license/status')
      
      if (response.success) {
        const data = response.data
        isActivated.value = data.activated
        licenseStatus.value = data.status
        licenseInfo.value = data
        lastCheck.value = new Date()
        
        return { success: true, data }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      console.error('[useLicense] Erro ao verificar licença:', error)
      return { success: false, error: 'Erro ao verificar licença' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Ativa a licença com uma chave
   */
  const activateLicense = async (licenseKey) => {
    isLoading.value = true
    try {
      const response = await post('/license/activate', { licenseKey })
      
      if (response.success) {
        // Atualizar estado após ativação
        await checkLicense()
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.error || response.data?.error }
    } catch (error) {
      console.error('[useLicense] Erro ao ativar licença:', error)
      return { success: false, error: 'Erro ao ativar licença' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Tenta renovar a licença manualmente
   */
  const retryLicense = async () => {
    isLoading.value = true
    try {
      const response = await post('/license/retry')
      
      if (response.success) {
        await checkLicense()
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.error || response.data?.error }
    } catch (error) {
      console.error('[useLicense] Erro ao renovar licença:', error)
      return { success: false, error: 'Erro ao renovar licença' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verifica rapidamente se pode operar
   */
  const canOperate = async () => {
    try {
      const response = await get('/license/check')
      return response.success && response.data?.canOperate
    } catch (error) {
      return true // Fail-open
    }
  }

  /**
   * Remove a licença local
   */
  const deactivateLicense = async () => {
    isLoading.value = true
    try {
      const response = await del('/license/deactivate')
      
      if (response.success) {
        isActivated.value = false
        licenseStatus.value = null
        licenseInfo.value = null
        return { success: true }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      console.error('[useLicense] Erro ao desativar licença:', error)
      return { success: false, error: 'Erro ao desativar licença' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inicializa verificação de licença
   */
  const initLicense = async () => {
    // Verificar status ao inicializar
    await checkLicense()
    
    // Configurar verificação periódica (a cada 1 hora)
    if (process.client) {
      setInterval(async () => {
        if (isActivated.value) {
          await retryLicense()
        }
      }, 60 * 60 * 1000) // 1 hora
    }
  }

  /**
   * Formata a chave de licença enquanto digita
   */
  const formatLicenseKey = (value) => {
    // Remove tudo que não é letra ou número
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    
    // Divide em grupos de 4
    const groups = cleaned.match(/.{1,4}/g) || []
    
    // Junta com hífen
    return groups.slice(0, 4).join('-')
  }

  return {
    // Estado
    licenseStatus: readonly(licenseStatus),
    licenseInfo: readonly(licenseInfo),
    isActivated: readonly(isActivated),
    isLoading: readonly(isLoading),
    lastCheck: readonly(lastCheck),
    
    // Computed
    isActive,
    isWarning,
    isCritical,
    isBlocked,
    needsActivation,
    statusMessage,
    daysRemaining,
    daysUntilBlock,
    graceDays,
    companyName,
    
    // Métodos
    checkLicense,
    activateLicense,
    retryLicense,
    canOperate,
    deactivateLicense,
    initLicense,
    formatLicenseKey
  }
}

