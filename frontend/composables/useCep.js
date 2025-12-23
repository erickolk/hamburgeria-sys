/**
 * Composable para buscar endereço via CEP usando a API ViaCEP
 */
export const useCep = () => {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Busca endereço por CEP
   * @param {string} cep - CEP com ou sem formatação
   * @returns {Object} Dados do endereço ou null em caso de erro
   */
  const searchCep = async (cep) => {
    if (!cep) {
      error.value = 'CEP é obrigatório'
      return null
    }

    // Remove formatação
    const cleanCep = cep.replace(/\D/g, '')

    // Valida formato
    if (cleanCep.length !== 8) {
      error.value = 'CEP inválido'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      if (data.erro) {
        error.value = 'CEP não encontrado'
        return null
      }

      // Retorna dados formatados
      return {
        zipCode: cleanCep,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        complement: data.complemento || ''
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err)
      error.value = 'Erro ao buscar CEP. Verifique sua conexão.'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Formata CEP para exibição (00000-000)
   */
  const formatCep = (cep) => {
    if (!cep) return ''
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return cep
    return cleanCep.replace(/^(\d{5})(\d{3})$/, '$1-$2')
  }

  /**
   * Remove formatação do CEP
   */
  const unformatCep = (cep) => {
    if (!cep) return ''
    return cep.replace(/\D/g, '')
  }

  return {
    loading,
    error,
    searchCep,
    formatCep,
    unformatCep
  }
}



