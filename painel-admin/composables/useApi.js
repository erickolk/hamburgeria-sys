/**
 * Composable para chamadas à API
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase
  
  const getToken = () => {
    if (process.client) {
      return localStorage.getItem('admin_token')
    }
    return null
  }
  
  const apiCall = async (method, endpoint, body = null) => {
    const token = getToken()
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body)
    }
    
    try {
      const response = await fetch(`${baseURL}${endpoint}`, options)
      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Erro na requisição', status: response.status }
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('[API Error]', error)
      return { success: false, error: error.message || 'Erro de conexão' }
    }
  }
  
  return {
    get: (endpoint) => apiCall('GET', endpoint),
    post: (endpoint, body) => apiCall('POST', endpoint, body),
    put: (endpoint, body) => apiCall('PUT', endpoint, body),
    delete: (endpoint) => apiCall('DELETE', endpoint)
  }
}

