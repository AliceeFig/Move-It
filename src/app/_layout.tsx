import { Stack } from 'expo-router'

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Screen name="(auth)/signup/page" />

      {/* Rotas dos usuários */}
      <Stack.Screen name="(gestor)/index" />

      <Stack.Screen name="(motorista)/index" />

      <Stack.Screen name="(aluno)/index" />


    </Stack>

  )
}