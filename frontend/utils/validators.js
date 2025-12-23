/**
 * Utilitários de validação e formatação para frontend
 */

/**
 * Remove caracteres não numéricos
 */
export function onlyNumbers(str) {
  if (!str) return ''
  return str.replace(/\D/g, '')
}

/**
 * Valida CNPJ
 */
export function validateCNPJ(cnpj) {
  if (!cnpj) return false

  const cleanCNPJ = onlyNumbers(cnpj)

  if (cleanCNPJ.length !== 14) return false
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false

  let length = cleanCNPJ.length - 2
  let numbers = cleanCNPJ.substring(0, length)
  const digits = cleanCNPJ.substring(length)
  let sum = 0
  let pos = length - 7

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result != digits.charAt(0)) return false

  length = length + 1
  numbers = cleanCNPJ.substring(0, length)
  sum = 0
  pos = length - 7

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result != digits.charAt(1)) return false

  return true
}

/**
 * Formata CNPJ (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj) {
  const cleanCNPJ = onlyNumbers(cnpj)
  if (cleanCNPJ.length !== 14) return cnpj
  return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

/**
 * Valida CPF
 */
export function validateCPF(cpf) {
  if (!cpf) return false

  const cleanCPF = onlyNumbers(cpf)

  if (cleanCPF.length !== 11) return false
  if (/^(\d)\1+$/.test(cleanCPF)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

/**
 * Formata CPF (000.000.000-00)
 */
export function formatCPF(cpf) {
  const cleanCPF = onlyNumbers(cpf)
  if (cleanCPF.length !== 11) return cpf
  return cleanCPF.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

/**
 * Valida CEP
 */
export function validateCEP(cep) {
  if (!cep) return false
  const cleanCEP = onlyNumbers(cep)
  return cleanCEP.length === 8
}

/**
 * Formata CEP (00000-000)
 */
export function formatCEP(cep) {
  const cleanCEP = onlyNumbers(cep)
  if (cleanCEP.length !== 8) return cep
  return cleanCEP.replace(/^(\d{5})(\d{3})$/, '$1-$2')
}

/**
 * Formata telefone
 */
export function formatPhone(phone) {
  const cleanPhone = onlyNumbers(phone)
  
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }
  
  return phone
}

/**
 * Valida sigla de estado
 */
export function validateState(state) {
  const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]
  
  return validStates.includes(state?.toUpperCase())
}

/**
 * Valida email
 */
export function validateEmail(email) {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Mascara de input para CNPJ
 */
export function maskCNPJ(value) {
  let v = onlyNumbers(value)
  v = v.substring(0, 14) // Limita a 14 dígitos
  
  if (v.length <= 2) return v
  if (v.length <= 5) return `${v.substring(0, 2)}.${v.substring(2)}`
  if (v.length <= 8) return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5)}`
  if (v.length <= 12) return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8)}`
  return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8, 12)}-${v.substring(12)}`
}

/**
 * Mascara de input para CEP
 */
export function maskCEP(value) {
  let v = onlyNumbers(value)
  v = v.substring(0, 8) // Limita a 8 dígitos
  
  if (v.length <= 5) return v
  return `${v.substring(0, 5)}-${v.substring(5)}`
}

/**
 * Mascara de input para telefone
 */
export function maskPhone(value) {
  let v = onlyNumbers(value)
  v = v.substring(0, 11) // Limita a 11 dígitos
  
  if (v.length <= 2) return v
  if (v.length <= 6) return `(${v.substring(0, 2)}) ${v.substring(2)}`
  if (v.length <= 10) return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`
  return `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`
}

/**
 * Estados brasileiros
 */
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
]



