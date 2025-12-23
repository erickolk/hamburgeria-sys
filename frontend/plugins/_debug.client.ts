export default defineNuxtPlugin(() => {
  if (process.client) {
    // Sinaliza que o runtime cliente está inicializado
    // e que plugins do Nuxt estão executando normalmente
    // Útil para confirmar hidratação/montagem em ambiente dev
    // sem depender de páginas específicas
    // eslint-disable-next-line no-console
    console.log('[debug] client plugin loaded')
    // @ts-ignore
    window.__debug = { ready: true, ts: Date.now() }
  }
})