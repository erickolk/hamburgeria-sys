// Usar autenticação real (JWT)
const AUTH_DISABLED = false

export const useApi = () => {
  const { token } = useAuth()
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase

  const apiCall = async (url, options = {}) => {
    // Sempre usar apiBase (tanto dev quanto produção).
    // Se url for relativa, concatenar com apiBase e remover prefixo /api quando presente.
    let finalUrl = url
    if (!/^https?:\/\//i.test(url)) {
      const path = url.startsWith('/api') ? url.slice(4) : url
      finalUrl = apiBase.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`)
    }

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    }

    // Adicionar token de autenticação apenas quando houver token real
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`
    }

    try {
      console.log('[useApi] request', { url: finalUrl, method: config.method || 'GET', hasBody: !!config.body })
      const response = await $fetch(finalUrl, config)
      console.log('[useApi] sucesso', { url: finalUrl })
      return { success: true, data: response }
    } catch (error) {
      console.error('Erro na API:', { url: finalUrl, status: error?.status, message: error?.message, data: error?.data })
      
      // Se erro 401 e autenticação está habilitada, fazer logout
      // Apenas deslogar quando já há um token válido (evita reload na tela de login)
      if (error.status === 401 && !AUTH_DISABLED && token.value) {
        const { logout } = useAuth()
        await logout()
      }

      // Melhorar mensagem de erro mostrando detalhes de validação se houver
      let errorMessage = error.data?.error || error.message || 'Erro na requisição'
      if (error.data?.details && Array.isArray(error.data.details)) {
        const detailMessages = error.data.details.map(d => `${d.field}: ${d.message}`).join('; ')
        errorMessage += ` (${detailMessages})`
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Métodos HTTP
  const get = (url, options = {}) => apiCall(url, { method: 'GET', ...options })
  const post = (url, body, options = {}) => apiCall(url, { method: 'POST', body, ...options })
  const put = (url, body, options = {}) => apiCall(url, { method: 'PUT', body, ...options })
  const del = (url, options = {}) => apiCall(url, { method: 'DELETE', ...options })

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
    del
  }
}