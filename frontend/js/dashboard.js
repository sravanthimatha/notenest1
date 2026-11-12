if(requireAuth()){ initSidebar('dashboard'); mountTopbar();; document.getElementById('modalMount').innerHTML=rateModalHTML();
  const sem=document.getElementById('fSemester'); for(let i=1;i<=8;i++){ const o=document.createElement('option'); o.value=i; o.textContent='Semester '+i; sem.appendChild(o); }
  document.querySelectorAll('#fTypes .chip').forEach(c=>c.addEventListener('click',()=>{ document.querySelectorAll('#fTypes .chip').forEach(x=>x.classList.remove('on')); c.classList.add('on'); }));
 (async()=>{
   try{ const s=await api('/api/materials/subjects'); const sel=document.getElementById('fSubject'); s.subjects.forEach(x=>{ const o=document.createElement('option'); o.value=x; o.textContent=x; sel.appendChild(o); }); }catch(e){}
   try{ const d=await api('/api/materials/stats'); document.getElementById('statUploaded').textContent=d.stats.totalUploaded; document.getElementById('statAvailable').textContent=d.stats.available; document.getElementById('statDownloads').textContent=d.stats.totalDownloads; document.getElementById('statBookmarked').textContent=d.stats.bookmarked;
     const grid=document.getElementById('recentGrid'); grid.innerHTML=d.recent.map(m=>materialCard(m)).join(''); if(!d.recent.length) document.getElementById('recentEmpty').innerHTML='<div class="empty">No materials yet. Be the first to upload!</div>';
   }catch(e){ toast(e.message); if(e.message.toLowerCase().includes('authorized')||e.message.toLowerCase().includes('token')) logout(); }
   try{ const m=await api('/api/materials/my'); const list=document.getElementById('myNotesList');
     list.innerHTML=m.materials.slice(0,4).map(x=>`<div class="mini-item"><span class="ic" style="background:var(--violet-soft)">${typeSymbol(x.type)}</span><div style="min-width:0"><b>${escapeHTML(x.title)}</b><span class="small muted">Sem ${x.semester} • ${escapeHTML(x.subject)} • ⬇ ${x.downloads||0}</span></div></div>`).join('');
     if(!m.materials.length) document.getElementById('myNotesEmpty').innerHTML='<p class="muted small">No uploads yet. <a href="upload.html" style="color:var(--violet);font-weight:700">Upload your first note</a></p>';
   }catch(e){}
   try{ const b=await api('/api/bookmarks'); const list=document.getElementById('bmList');
     list.innerHTML=b.bookmarks.slice(0,4).map(x=>`<div class="mini-item"><span class="ic" style="background:#fdf3d7">${typeSymbol(x.material.type)}</span><div style="min-width:0"><b>${escapeHTML(x.material.title)}</b><span class="small muted">${escapeHTML(x.material.subject)} • Sem ${x.material.semester}</span></div></div>`).join('');
     if(!b.bookmarks.length) document.getElementById('bmEmpty').innerHTML='<p class="muted small">No bookmarks yet. Bookmark useful notes from Browse.</p>';
   }catch(e){}
   try{ const me=getUser(); if(me && me.semester){ document.getElementById('pickedTitle').firstChild.textContent='🎯 Picked for Your Semester '+me.semester+' ';
     const d=await api('/api/materials?semester='+me.semester+'&sort=popular'); const g=document.getElementById('pickedGrid');
     g.innerHTML=d.materials.slice(0,4).map(m=>materialCard(m)).join('');
     if(!d.materials.length) document.getElementById('pickedEmpty').innerHTML='<div class="empty">No materials for your semester yet. <a href="upload.html" style="color:var(--violet);font-weight:700">Upload the first one</a></div>';
   } }catch(e){}
 })();
}
let filterType='';
function applyFilters(){ const subject=document.getElementById('fSubject').value; const semester=document.getElementById('fSemester').value; const on=document.querySelector('#fTypes .chip.on'); const type=on?on.dataset.type:''; const q=new URLSearchParams(); if(subject)q.set('subject',subject); if(semester)q.set('semester',semester); if(type)q.set('type',type); window.location.href='index.html'+(q.toString()?('?'+q.toString()):'')+'#materials'; }
async function deleteMaterial(id){ if(!confirm('Delete this material?')) return; try{ await api(`/api/materials/${id}`,{method:'DELETE'}); toast('Deleted'); setTimeout(()=>location.reload(),600);}catch(e){toast(e.message);} }
