import {Stack} from 'expo-router'

export default function MainLayout() {
  return(
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false}}
      />

      <Stack.Screen
        name="(auth)/signup/page"
        options={{ headerShown: false}}
      />

      {/* Rotas dos usuários */}
      <Stack.Screen 
      name="(gestor)/index" 
      options={{ headerShown: false }} 
      />

      <Stack.Screen 
      name="(motorista)/index"
      options={{ headerShown: false }} 
      />

      <Stack.Screen 
      name="(aluno)/inicio" 
      options={{ headerShown: false }} 
      />


    </Stack>

  )
}