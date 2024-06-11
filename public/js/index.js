import '@babel/polyfill';
import { login, logout } from './login';

const logginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');

if (logginForm)
  logginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);
