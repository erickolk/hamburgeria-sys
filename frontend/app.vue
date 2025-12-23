<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
onMounted(() => {
  console.log('[App] Nuxt montado com sucesso')
  if (process.client) {
    // Sinal simples para confirmar hidratação do app
    // e facilitar diagnóstico no console
    // @ts-ignore
    window.__debug = { ready: true, source: 'app.vue', ts: Date.now() }
  }
})
</script>