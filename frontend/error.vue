<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
    <div class="max-w-lg w-full bg-white border border-gray-200 rounded-lg p-6">
      <h1 class="text-2xl font-bold mb-2">Ocorreu um erro</h1>
      <p class="text-gray-700 mb-4">{{ error?.message || 'Falha inesperada' }}</p>
      <pre class="bg-gray-100 text-xs p-3 rounded overflow-auto" v-if="error">{{ error }}</pre>
      <NuxtLink to="/" class="btn btn-primary mt-4">Voltar para o início</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const error = useError()
</script>