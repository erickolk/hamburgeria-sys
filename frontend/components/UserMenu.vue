<template>
  <div v-if="user" class="flex items-center gap-3">
    <div class="text-sm">
      <div class="font-medium">{{ user.name }}</div>
      <div class="text-gray-500">{{ user.role }}</div>
    </div>
    <button class="btn btn-outline btn-sm" @click="onLogout">Sair</button>
  </div>
  <div v-else>
    <NuxtLink to="/login" class="btn btn-primary btn-sm">Entrar</NuxtLink>
  </div>
</template>

<script setup>
const { user, logout } = useAuth()
const onLogout = async () => {
  await logout()
}
</script>