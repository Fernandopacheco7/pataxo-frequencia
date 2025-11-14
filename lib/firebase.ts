import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do seu aplicativo da web do Firebase.
// Estes dados devem ser configurados como variáveis de ambiente no seu provedor de hospedagem (ex: Vercel).
// O prefixo VITE_ é necessário para que o Vite exponha as variáveis para o código do lado do cliente.
const firebaseConfig = {
  // FIX: Cast `import.meta` to `any` to resolve TypeScript errors. This is a common workaround
  // when the build environment (like Vite) provides `import.meta.env` but the TypeScript
  // configuration doesn't include the necessary type definitions.
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validação simples para depuração. Se a apiKey não estiver presente, o mais provável é que
// nenhuma das outras variáveis de ambiente esteja, devido à falta do prefixo VITE_ ou erro de configuração.
if (!firebaseConfig.apiKey) {
  const errorMessage = "Erro de configuração: As chaves do Firebase não foram encontradas. Verifique se as variáveis de ambiente na Vercel começam com o prefixo 'VITE_'.";
  console.error(errorMessage);
  // Lançar um erro impede que a inicialização defeituosa do Firebase continue, tornando o problema mais claro.
  throw new Error(errorMessage);
}


// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços do Firebase que serão usados na aplicação (Autenticação e Firestore)
export const auth = getAuth(app);
export const db = getFirestore(app);