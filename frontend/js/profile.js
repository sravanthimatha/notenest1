if(requireAuth()){ initSidebar('profile'); mountTopbar();
 (async()=>{ try{ const d=await api('/api/auth/me'); const u=d.user||getUser(); if(d.user) setUser(u);
   document.getElementById('profAvatar').textContent=(u.name||'S').trim().charAt(0).toUpperCase();
   document.getElementById('profName').textContent=u.name||'Student';
   document.getElementById('profEmail').textContent=u.email||'';
   document.getElementById('profCollege').textContent='🏫 '+(u.college||'College not set');
   document.getElementById('profBranch').textContent='🎓 '+(u.branch||'Branch not set');
   document.getElementById('profSem').textContent='📚 Semester '+(u.semester||1);
   const s=await api('/api/materials/stats');
   document.getElementById('pStatAvailable').textContent=s.stats.available;
   document.getElementById('pStatUploaded').textContent=s.stats.totalUploaded;
   document.getElementById('pStatDownloads').textContent=s.stats.totalDownloads;
   document.getElementById('pStatBookmarked').textContent=s.stats.bookmarked;
 }catch(e){ toast(e.message); } })();
}
