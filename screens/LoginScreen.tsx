import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  // State for login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for signup
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change will handle navigation
    } catch (err: any) {
      switch (err.code) {
        case 'auth/invalid-email':
          setError('O formato do email é inválido.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Email ou senha incorretos.');
          break;
        default:
          setError('Ocorreu um erro ao tentar entrar. Tente novamente.');
          console.error(err);
      }
    }
  };
  
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      // Auth state change will handle navigation
    } catch (err: any) {
       switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Este email já está em uso.');
          break;
        case 'auth/weak-password':
          setError('A senha deve ter pelo menos 6 caracteres.');
          break;
        default:
          setError('Ocorreu um erro ao criar a conta. Tente novamente.');
          console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="bg-brand-dark-2 p-8 rounded-lg shadow-xl w-full max-w-md">
        {isLoginView ? (
          <>
            <h1 className="text-3xl font-bold text-center text-white mb-2">Pataxó Frequência</h1>
            <p className="text-center text-gray-400 mb-8">Bem-vindo(a) de volta!</p>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-brand-dark-3 border border-brand-dark-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2" htmlFor="password">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-brand-dark-3 border border-brand-dark-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Entrar
              </button>
            </form>
            <p className="text-center mt-6 text-sm text-gray-400">
              Não tem uma conta?{' '}
              <button onClick={() => setIsLoginView(false)} className="font-medium text-brand-blue hover:underline focus:outline-none">
                Crie uma
              </button>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center text-white mb-2">Criar Nova Conta</h1>
            <p className="text-center text-gray-400 mb-8">Preencha os dados para se registrar.</p>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <form onSubmit={handleSignupSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="signup-email">
                  Email
                </label>
                <input
                  type="email"
                  id="signup-email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-brand-dark-3 border border-brand-dark-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2" htmlFor="signup-password">
                  Senha
                </label>
                <input
                  type="password"
                  id="signup-password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-brand-dark-3 border border-brand-dark-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2" htmlFor="confirm-password">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-brand-dark-3 border border-brand-dark-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Criar Conta
              </button>
            </form>
            <p className="text-center mt-6 text-sm text-gray-400">
              Já tem uma conta?{' '}
              <button onClick={() => {setIsLoginView(true); setError('')}} className="font-medium text-brand-blue hover:underline focus:outline-none">
                Entre aqui
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;