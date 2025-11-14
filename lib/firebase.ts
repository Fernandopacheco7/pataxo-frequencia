import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig.js';

// Validação para garantir que o arquivo de configuração foi gerado corretamente.
if (!firebaseConfig || !firebaseConfig.apiKey) {
  const errorMessage = "Erro de configuração: O arquivo firebaseConfig.js não foi encontrado ou está vazio. Verifique o 'Build Command' nas configurações do seu projeto na Vercel.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

// Inicializa o Firebase com a configuração importada.
const app = initializeApp(firebaseConfig);

// Exporta os serviços do Firebase que serão usados na aplicação (Autenticação e Firestore)
export const auth = getAuth(app);
export const db = getFirestore(app);
