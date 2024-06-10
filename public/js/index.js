import '@babel/polyfill';
import { login, logout } from './login';

const logginForm = document.querySelector('.form');

if (logginForm)
  logginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

logout();
