<script setup lang="ts">
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

const { login } = useAuthStore();
</script>

<template>
  <button @click="login('vernom2003@gmail.com', 'password123')">
    Zaloguj się
  </button>
</template>