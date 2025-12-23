/**
 * Validadores e formatadores de documentos e outros dados
 */

/**
 * Remove caracteres não numéricos de uma string
 */
function onlyNumbers(str) {
  return str.replace(/\D/g, '');
}

/**
 * Valida CNPJ
 * @param {string} cnpj - CNPJ com ou sem formatação
 * @returns {boolean}
 */
function validateCNPJ(cnpj) {
  if (!cnpj) return false;

  const cleanCNPJ = onlyNumbers(cnpj);

  // CNPJ deve ter 14 dígitos
  if (cleanCNPJ.length !== 14) return false;

  // Validar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

  // Validar dígitos verificadores
  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != digits.charAt(0)) return false;

  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != digits.charAt(1)) return false;

  return true;
}

/**
 * Formata CNPJ
 * @param {string} cnpj - CNPJ sem formatação
 * @returns {string} - CNPJ formatado (00.000.000/0000-00)
 */
function formatCNPJ(cnpj) {
  const cleanCNPJ = onlyNumbers(cnpj);
  
  if (cleanCNPJ.length !== 14) return cnpj;

  return cleanCNPJ.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Valida CPF
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {boolean}
 */
function validateCPF(cpf) {
  if (!cpf) return false;

  const cleanCPF = onlyNumbers(cpf);

  // CPF deve ter 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Validar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Formata CPF
 * @param {string} cpf - CPF sem formatação
 * @returns {string} - CPF formatado (000.000.000-00)
 */
function formatCPF(cpf) {
  const cleanCPF = onlyNumbers(cpf);
  
  if (cleanCPF.length !== 11) return cpf;

  return cleanCPF.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/**
 * Valida CEP
 * @param {string} cep - CEP com ou sem formatação
 * @returns {boolean}
 */
function validateCEP(cep) {
  if (!cep) return false;

  const cleanCEP = onlyNumbers(cep);
  return cleanCEP.length === 8;
}

/**
 * Formata CEP
 * @param {string} cep - CEP sem formatação
 * @returns {string} - CEP formatado (00000-000)
 */
function formatCEP(cep) {
  const cleanCEP = onlyNumbers(cep);
  
  if (cleanCEP.length !== 8) return cep;

  return cleanCEP.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

/**
 * Formata telefone
 * @param {string} phone - Telefone sem formatação
 * @returns {string} - Telefone formatado
 */
function formatPhone(phone) {
  const cleanPhone = onlyNumbers(phone);
  
  if (cleanPhone.length === 10) {
    // (00) 0000-0000
    return cleanPhone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    // (00) 00000-0000
    return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Valida sigla de estado brasileiro
 * @param {string} state - Sigla do estado (UF)
 * @returns {boolean}
 */
function validateState(state) {
  const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  return validStates.includes(state?.toUpperCase());
}

/**
 * Valida email
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  validateCNPJ,
  formatCNPJ,
  validateCPF,
  formatCPF,
  validateCEP,
  formatCEP,
  formatPhone,
  validateState,
  validateEmail,
  onlyNumbers
};



