if(requireAuth()){ initSidebar('settings'); mountTopbar();
 const sem=document.getElementById('setSemester'); for(let i=1;i<=8;i++){ const o=document.createElement('option'); o.value=i; o.textContent='Semester '+i; sem.appendChild(o); }
 const fillForm=(u)=>{ if(!u) return; document.getElementById('setName').value=u.name||''; document.getElementById('setEmail').value=u.email||''; document.getElementById('setCollege').value=u.college||''; document.getElementById('setBranch').value=u.branch||''; document.getElementById('setSemester').value=u.semester||1; };
 fillForm(getUser());
 (async()=>{ try{ const d=await api('/api/auth/me'); if(d.user){ setUser(d.user); fillForm(d.user); } }catch(e){ /* stored profile already shown */ } })();
}
function showAlert(id,msg,ok){ const a=document.getElementById(id); a.className='alert '+(ok?'success':'error'); a.textContent=msg; }
async function saveProfile(){ const body={ name:document.getElementById('setName').value.trim(), college:document.getElementById('setCollege').value.trim(), branch:document.getElementById('setBranch').value, semester:Number(document.getElementById('setSemester').value) };
 if(body.name.length<2) return showAlert('profileAlert','Name is too short');
 try{ const d=await api('/api/auth/profile',{method:'PUT',body:JSON.stringify(body)}); setUser(d.user); showAlert('profileAlert','Profile updated successfully',true); toast('Profile saved'); }catch(e){ showAlert('profileAlert',e.message); } }
async function changePw(){ const cur=document.getElementById('pwCurrent').value; const nw=document.getElementById('pwNew').value; const cf=document.getElementById('pwConfirm').value;
 if(!cur||!nw) return showAlert('pwAlert','Fill both password fields');
 if(nw.length<6) return showAlert('pwAlert','New password must be at least 6 characters');
 if(nw!==cf) return showAlert('pwAlert','New passwords do not match');
 try{ await api('/api/auth/password',{method:'PUT',body:JSON.stringify({currentPassword:cur,newPassword:nw})}); showAlert('pwAlert','Password changed successfully. Use it next time you login.',true); document.getElementById('pwCurrent').value=''; document.getElementById('pwNew').value=''; document.getElementById('pwConfirm').value=''; }catch(e){ showAlert('pwAlert',e.message); } }
