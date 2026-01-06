/**
 * Composable para gerenciamento de licenças
 */
export const useLicenses = () => {
  const { get, post, put } = useApi()
  
  const licenses = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  /**
   * Lista todas as licenças
   */
  const listLicenses = async (filters = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)
      
      const queryString = params.toString()
      const url = queryString ? `/licenses?${queryString}` : '/licenses'
      
      const res = await get(url)
      
      if (res.success) {
        licenses.value = res.data
        return { success: true, data: res.data }
      }
      
      error.value = res.error
      return { success: false, error: res.error }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Busca uma licença por ID
   */
  const getLicense = async (id) => {
    loading.value = true
    try {
      const res = await get('/licenses')
      if (res.success) {
        const license = res.data.find(l => l.id === id)
        return license ? { success: true, data: license } : { success: false, error: 'Não encontrada' }
      }
      return { success: false, error: res.error }
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Cria nova licença
   */
  const createLicense = async (data) => {
    loading.value = true
    try {
      const res = await post('/licenses', data)
      if (res.success) await listLicenses()
      return res
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Atualiza licença
   */
  const updateLicense = async (id, data) => {
    loading.value = true
    try {
      const res = await put(`/licenses/${id}`, data)
      if (res.success) await listLicenses()
      return res
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Renova licença
   */
  const renewLicense = async (licenseKey, months = 1) => {
    loading.value = true
    try {
      const res = await post(`/licenses/${licenseKey}/renew`, { months })
      if (res.success) await listLicenses()
      return res
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Suspende licença
   */
  const suspendLicense = async (licenseKey, reason = 'Inadimplência') => {
    loading.value = true
    try {
      const res = await post(`/licenses/${licenseKey}/suspend`, { reason })
      if (res.success) await listLicenses()
      return res
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Reativa licença
   */
  const reactivateLicense = async (licenseKey) => {
    loading.value = true
    try {
      const res = await post(`/licenses/${licenseKey}/reactivate`)
      if (res.success) await listLicenses()
      return res
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Calcula status visual
   */
  const getStatusInfo = (license) => {
    const now = new Date()
    const validUntil = new Date(license.validUntil)
    const diffDays = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24))
    
    if (license.status === 'CANCELLED') {
      return { label: 'Cancelada', badge: 'bg-red-100 text-red-800', color: 'red' }
    }
    if (license.status === 'SUSPENDED') {
      return { label: 'Suspensa', badge: 'bg-yellow-100 text-yellow-800', color: 'yellow' }
    }
    if (license.status === 'TRIAL') {
      return { label: 'Teste', badge: 'bg-blue-100 text-blue-800', color: 'blue' }
    }
    if (diffDays < 0) {
      return { label: 'Expirada', badge: 'bg-red-100 text-red-800', color: 'red', days: diffDays }
    }
    if (diffDays <= 5) {
      return { label: `${diffDays}d restantes`, badge: 'bg-orange-100 text-orange-800', color: 'orange', days: diffDays }
    }
    
    return { label: 'Ativa', badge: 'bg-green-100 text-green-800', color: 'green', days: diffDays }
  }
  
  /**
   * Formata CNPJ
   */
  const formatCnpj = (cnpj) => {
    if (!cnpj) return ''
    const c = cnpj.replace(/\D/g, '')
    return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }
  
  /**
   * Formata data
   */
  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }
  
  /**
   * Formata data e hora
   */
  const formatDateTime = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('pt-BR')
  }
  
  return {
    licenses: readonly(licenses),
    loading: readonly(loading),
    error: readonly(error),
    listLicenses,
    getLicense,
    createLicense,
    updateLicense,
    renewLicense,
    suspendLicense,
    reactivateLicense,
    getStatusInfo,
    formatCnpj,
    formatDate,
    formatDateTime
  }
}

