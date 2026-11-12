const sem=document.getElementById('semester'); if(sem){ for(let i=1;i<=8;i++){ const o=document.createElement('option'); o.value=i; o.textContent='Semester '+i; sem.appendChild(o);} sem.value=1; }
const loginForm=document.getElementById('loginForm');
if(loginForm) loginForm.addEventListener('submit', async e=>{ e.preventDefault(); const btn=document.getElementById('loginBtn'); btn.disabled=true; btn.textContent='Logging in...';
  try{ const d=await api('/api/auth/login',{method:'POST',body:JSON.stringify({email:document.getElementById('email').value.trim(),password:document.getElementById('password').value})}); setAuth(d.token,d.user); window.location.href='dashboard.html'; }
  catch(err){ showAlert('alertBox',err.message); btn.disabled=false; btn.textContent='Login'; } });
const registerForm=document.getElementById('registerForm');
if(registerForm) registerForm.addEventListener('submit', async e=>{ e.preventDefault(); const btn=document.getElementById('registerBtn'); btn.disabled=true; btn.textContent='Creating account...';
  try{ const body={name:document.getElementById('name').value.trim(),email:document.getElementById('email').value.trim(),password:document.getElementById('password').value,college:document.getElementById('college').value.trim(),branch:document.getElementById('branch').value,semester:document.getElementById('semester').value};
  const d=await api('/api/auth/register',{method:'POST',body:JSON.stringify(body)}); setAuth(d.token,d.user); window.location.href='dashboard.html'; }
  catch(err){ showAlert('alertBox',err.message); btn.disabled=false; btn.textContent='Register'; } });
