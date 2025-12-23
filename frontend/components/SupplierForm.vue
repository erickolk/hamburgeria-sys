<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-900">
          {{ props.supplier ? 'Editar Fornecedor' : 'Novo Fornecedor' }}
        </h2>
        <span class="text-sm text-gray-500">
          Passo {{ currentStep }} de {{ totalSteps }}
        </span>
      </div>
      
      <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      
      <div class="flex justify-between mb-6">
        <button
          v-for="(step, index) in steps"
          :key="step.id"
          @click="goToStep(index + 1)"
          class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
          :class="{
            'bg-blue-100 text-blue-700 border-2 border-blue-300': currentStep === index + 1,
            'bg-green-100 text-green-700 border-2 border-green-300': isStepCompleted(index + 1),
            'bg-gray-100 text-gray-600 hover:bg-gray-200': currentStep !== index + 1 && !isStepCompleted(index + 1)
          }"
        >
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
               :class="{
                 'bg-blue-600 text-white': currentStep === index + 1,
                 'bg-green-600 text-white': isStepCompleted(index + 1),
                 'bg-gray-400 text-white': currentStep !== index + 1 && !isStepCompleted(index + 1)
               }">
            <span v-if="isStepCompleted(index + 1)">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="font-medium">{{ step.title }}</span>
        </button>
      </div>
    </div>

    <form @submit.prevent="handleNext" class="space-y-6">
      <div v-show="currentStep === 1" class="animate-fade-in">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            Informações da Empresa
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nome Fantasia <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <input 
                  v-model="form.name" 
                  type="text" 
                  class="input w-full !pl-11"
                  placeholder="Nome comercial do fornecedor"
                  :class="{ 'border-red-300': errors.name }"
                >
              </div>
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Razão Social
              </label>
              <div class="relative">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <input 
                  v-model="form.legalName" 
                  type="text" 
                  class="input w-full !pl-11"
                  placeholder="Razão social completa"
                >
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                CNPJ <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <input 
                  v-model="form.cnpj" 
                  type="text" 
                  class="input w-full !pl-11"
                  placeholder="00.000.000/0000-00"
                  @input="formatCNPJ"
                  :class="{ 'border-red-300': errors.cnpj }"
                >
              </div>
              <p v-if="errors.cnpj" class="mt-1 text-sm text-red-600">{{ errors.cnpj }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Inscrição Estadual
              </label>
              <div class="relative">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
                <input 
                  v-model="form.stateRegistration" 
                  type="text" 
                  class="input w-full !pl-11"
                  placeholder="000.000.000.000"
                >
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center">
              <input 
                id="fornecedor-ativo" 
                v-model="form.isActive" 
                type="checkbox" 
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              >
              <label for="fornecedor-ativo" class="ml-2 text-sm font-medium text-gray-700">
                Fornecedor Ativo
              </label>
            </div>
            <span class="text-xs text-gray-500">O fornecedor poderá ser utilizado em compras</span>
          </div>
        </div>
      </div>

      <div v-show="currentStep === 2" class="animate-fade-in">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            Contato e Endereço
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Pessoa de Contato <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <input 
                  v-model="form.contact" 
                  type="text" 
                  class="input w-full !pl-11"
                  placeholder="Nome do responsável"
                  :class="{ 'border-red-300': errors.contact }"
                >
              </div>
              <p v-if="errors.contact" class="mt-1 text-sm text-red-600">{{ errors.contact }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Telefone <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <input 
                  v-model="form.phone" 
                  type="text" 
                  class="input w-full !pl-11"
                  placeholder="(00) 00000-0000"
                  @input="formatPhone"
                  :class="{ 'border-red-300': errors.phone }"
                >
              </div>
              <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
            </div>
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div class="relative">
              <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
              </svg>
              <input 
                v-model="form.email" 
                type="email" 
                class="input w-full !pl-11"
                placeholder="contato@empresa.com.br"
                :class="{ 'border-red-300': errors.email }"
              >
            </div>
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              CEP <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-3">
              <div class="relative flex-1">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <input 
                  v-model="form.addressZipCode" 
                  type="text" 
                  class="input w-full !pl-11"
                  placeholder="00000-000"
                  @input="formatCEP"
                  @blur="buscarCEP"
                  :class="{ 'border-red-300': errors.addressZipCode }"
                >
              </div>
              <button 
                type="button" 
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                @click="buscarCEP"
                :disabled="loadingCEP"
              >
                <svg v-if="!loadingCEP" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>{{ loadingCEP ? 'Buscando...' : 'Buscar' }}</span>
              </button>
            </div>
            <p v-if="errors.addressZipCode" class="mt-1 text-sm text-red-600">{{ errors.addressZipCode }}</p>
            <p v-if="cepMessage" class="mt-1 text-sm" :class="cepMessageType === 'success' ? 'text-green-600' : 'text-red-600'">
              {{ cepMessage }}
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Logradouro <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.addressStreet" 
                type="text" 
                class="input w-full"
                placeholder="Rua, Avenida, etc"
                :disabled="loadingCEP"
                :class="{ 'border-red-300': errors.addressStreet }"
              >
              <p v-if="errors.addressStreet" class="mt-1 text-sm text-red-600">{{ errors.addressStreet }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Número <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.addressNumber" 
                type="text" 
                class="input w-full"
                placeholder="123"
                :class="{ 'border-red-300': errors.addressNumber }"
              >
              <p v-if="errors.addressNumber" class="mt-1 text-sm text-red-600">{{ errors.addressNumber }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Complemento
              </label>
              <input 
                v-model="form.addressComplement" 
                type="text" 
                class="input w-full"
                placeholder="Apto, Sala, etc"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Bairro <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.addressNeighborhood" 
                type="text" 
                class="input w-full"
                placeholder="Centro"
                :disabled="loadingCEP"
                :class="{ 'border-red-300': errors.addressNeighborhood }"
              >
              <p v-if="errors.addressNeighborhood" class="mt-1 text-sm text-red-600">{{ errors.addressNeighborhood }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cidade <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.addressCity" 
                type="text" 
                class="input w-full"
                placeholder="São Paulo"
                :disabled="loadingCEP"
                :class="{ 'border-red-300': errors.addressCity }"
              >
              <p v-if="errors.addressCity" class="mt-1 text-sm text-red-600">{{ errors.addressCity }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Estado <span class="text-red-500">*</span>
              </label>
              <select 
                v-model="form.addressState" 
                class="input w-full"
                :disabled="loadingCEP"
                :class="{ 'border-red-300': errors.addressState }"
              >
                <option value="">Selecione o estado</option>
                <option v-for="estado in estados" :key="estado.sigla" :value="estado.sigla">
                  {{ estado.nome }}
                </option>
              </select>
              <p v-if="errors.addressState" class="mt-1 text-sm text-red-600">{{ errors.addressState }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-show="currentStep === 3" class="animate-fade-in">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Condições Comerciais e Finalização
          </h3>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Condições de Pagamento
            </label>
            <input 
              v-model="form.paymentTerms" 
              type="text" 
              class="input w-full"
              placeholder="Ex: 30 dias, 50% entrada + 50% 15 dias"
            >
          </div>
          
          <div class="bg-gray-50 rounded-lg p-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Resumo do Cadastro</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="font-medium text-gray-700">Nome Fantasia:</p>
                <p class="text-gray-900">{{ form.name || 'Não informado' }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-700">CNPJ:</p>
                <p class="text-gray-900">{{ form.cnpj || 'Não informado' }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-700">Pessoa de Contato:</p>
                <p class="text-gray-900">{{ form.contact || 'Não informado' }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-700">Telefone:</p>
                <p class="text-gray-900">{{ form.phone || 'Não informado' }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-700">Endereço:</p>
                <p class="text-gray-900">
                  {{ form.addressStreet ? `${form.addressStreet}, ${form.addressNumber}` : 'Não informado' }}
                </p>
              </div>
              <div>
                <p class="font-medium text-gray-700">Cidade/Estado:</p>
                <p class="text-gray-900">
                  {{ form.addressCity && form.addressState ? `${form.addressCity} - ${form.addressState}` : 'Não informado' }}
                </p>
              </div>
              <div v-if="form.paymentTerms">
                <p class="font-medium text-gray-700">Condições de Pagamento:</p>
                <p class="text-gray-900">{{ form.paymentTerms }}</p>
              </div>
            </div>
            
            <div class="mt-4 flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full" :class="form.isActive ? 'bg-green-500' : 'bg-red-500'"></div>
              <span class="text-sm font-medium" :class="form.isActive ? 'text-green-700' : 'text-red-700'">
                {{ form.isActive ? 'Fornecedor Ativo' : 'Fornecedor Inativo' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center pt-6">
        <button
          v-if="currentStep > 1"
          type="button"
          @click="previousStep"
          class="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span>Anterior</span>
        </button>
        
        <div v-else></div>
        
        <button
          v-if="currentStep < totalSteps"
          type="button"
          @click="handleNext"
          class="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <span>Próximo</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        <button
          v-else
          type="button"
          @click="saveSupplier"
          :disabled="loading"
          class="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>{{ loading ? 'Salvando...' : 'Finalizar Cadastro' }}</span>
        </button>
      </div>
    </form>

    <div class="flex justify-center mt-6">
      <button
        type="button"
        @click="$emit('cancel')"
        class="text-gray-500 hover:text-gray-700 font-medium transition-colors"
      >
        Cancelar Cadastro
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  supplier: Object
})

import { useToast } from 'vue-toastification'

const emit = defineEmits(['save', 'cancel'])
const toast = useToast()

// Estado de navegação
const currentStep = ref(1)
const totalSteps = 3
const loading = ref(false)
const loadingCEP = ref(false)

// Estado do formulário
const form = reactive({
  name: '',
  legalName: '',
  contact: '',
  phone: '',
  email: '',
  cnpj: '',
  stateRegistration: '',
  paymentTerms: '',
  isActive: true,
  addressStreet: '',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  addressZipCode: '',
  addressCountry: 'Brasil'
})

// Estado de validação
const errors = reactive({
  name: '',
  contact: '',
  phone: '',
  email: '',
  cnpj: '',
  addressStreet: '',
  addressNumber: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  addressZipCode: ''
})

// Mensagens de CEP
const cepMessage = ref('')
const cepMessageType = ref('')

// Configuração dos steps
const steps = [
  { id: 1, title: 'Dados da Empresa' },
  { id: 2, title: 'Contato e Endereço' },
  { id: 3, title: 'Condições' }
]

// Computed properties
const progressPercentage = computed(() => {
  return ((currentStep.value - 1) / (totalSteps - 1)) * 100
})

// Funções de navegação
const goToStep = (step) => {
  if (step >= 1 && step <= totalSteps) {
    currentStep.value = step
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleNext = () => {
  if (validateCurrentStep()) {
    if (currentStep.value < totalSteps) {
      currentStep.value++
    }
  }
}

// Validação por step
const validateCurrentStep = () => {
  // Limpar erros anteriores
  Object.keys(errors).forEach(key => errors[key] = '')
  
  let isValid = true
  
  if (currentStep.value === 1) {
    // Validações do Step 1
    if (!form.name) {
      errors.name = 'Nome fantasia é obrigatório'
      isValid = false
    } else if (form.name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres'
      isValid = false
    }
    
    if (!form.cnpj) {
      errors.cnpj = 'CNPJ é obrigatório'
      isValid = false
    } else if (form.cnpj.replace(/\D/g, '').length !== 14) {
      errors.cnpj = 'CNPJ inválido'
      isValid = false
    }
  }
  
  if (currentStep.value === 2) {
    // Validações do Step 2
    if (!form.contact) {
      errors.contact = 'Pessoa de contato é obrigatória'
      isValid = false
    }
    
    if (!form.phone) {
      errors.phone = 'Telefone é obrigatório'
      isValid = false
    } else if (form.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Telefone inválido'
      isValid = false
    }
    
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Email inválido'
      isValid = false
    }
    
    if (!form.addressZipCode) {
      errors.addressZipCode = 'CEP é obrigatório'
      isValid = false
    } else if (form.addressZipCode.replace(/\D/g, '').length !== 8) {
      errors.addressZipCode = 'CEP inválido'
      isValid = false
    }
    
    if (!form.addressStreet) {
      errors.addressStreet = 'Logradouro é obrigatório'
      isValid = false
    }
    
    if (!form.addressNumber) {
      errors.addressNumber = 'Número é obrigatório'
      isValid = false
    }
    
    if (!form.addressNeighborhood) {
      errors.addressNeighborhood = 'Bairro é obrigatório'
      isValid = false
    }
    
    if (!form.addressCity) {
      errors.addressCity = 'Cidade é obrigatória'
      isValid = false
    }
    
    if (!form.addressState) {
      errors.addressState = 'Estado é obrigatório'
      isValid = false
    }
  }
  
  return isValid
}

const isStepCompleted = (step) => {
  if (step === 1) {
    return form.name && form.cnpj
  }
  if (step === 2) {
    return form.contact && form.phone && form.addressZipCode && 
           form.addressStreet && form.addressNumber && form.addressNeighborhood && 
           form.addressCity && form.addressState
  }
  return true
}

// Estados do Brasil
const estados = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
]

// Funções de formatação
const formatCNPJ = () => {
  form.cnpj = form.cnpj.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

const formatPhone = () => {
  form.phone = form.phone.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

const formatCEP = () => {
  form.addressZipCode = form.addressZipCode.replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')
}

// Busca de CEP com melhor feedback
const buscarCEP = async () => {
  const cep = form.addressZipCode.replace(/\D/g, '')
  if (cep.length !== 8) {
    cepMessage.value = 'Por favor, digite um CEP válido com 8 dígitos'
    cepMessageType.value = 'error'
    return
  }
  
  loadingCEP.value = true
  cepMessage.value = 'Buscando endereço...'
  cepMessageType.value = 'info'
  
  try {
    const { get } = useApi()
    const response = await get(`/api/customers/cep/${cep}`)
    
    if (response.success && response.data) {
      form.addressStreet = response.data.street || ''
      form.addressNeighborhood = response.data.neighborhood || ''
      form.addressCity = response.data.city || ''
      form.addressState = response.data.state || ''
      form.addressCountry = response.data.country || 'Brasil'
      
      cepMessage.value = 'Endereço encontrado com sucesso!'
      cepMessageType.value = 'success'
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        cepMessage.value = ''
        cepMessageType.value = ''
      }, 3000)
    } else {
      cepMessage.value = 'CEP não encontrado. Por favor, preencha o endereço manualmente.'
      cepMessageType.value = 'error'
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    cepMessage.value = 'Erro ao buscar CEP. Verifique sua conexão.'
    cepMessageType.value = 'error'
  } finally {
    loadingCEP.value = false
  }
}

// Salvar fornecedor
const saveSupplier = async () => {
  if (!validateCurrentStep()) {
    return
  }
  
  loading.value = true
  try {
    const { post, put } = useApi()
    const endpoint = props.supplier ? put : post
    const url = props.supplier ? `/api/suppliers/${props.supplier.id}` : '/api/suppliers'
    
    const response = await endpoint(url, form)
    
    if (response.success) {
      emit('save', response.data)
      toast.success('Fornecedor salvo com sucesso!')
    } else {
      toast.error(response.error || 'Erro ao salvar fornecedor')
    }
  } catch (error) {
    console.error('Erro ao salvar fornecedor:', error)
    toast.error('Erro ao salvar fornecedor')
  } finally {
    loading.value = false
  }
}

// Inicializar formulário com dados do fornecedor
if (props.supplier) {
  Object.assign(form, props.supplier)
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Melhorias nos inputs */
.input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200;
}

.input:disabled {
  @apply bg-gray-100 cursor-not-allowed opacity-75;
}

/* Transições suaves */
* {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Scrollbar personalizada para textarea */
textarea {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>