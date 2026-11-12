if(requireAuth()){ initSidebar('downloads'); mountTopbar();
 (async()=>{ try{ const d=await api('/api/downloads/my'); const list=document.getElementById('dlList');
   list.innerHTML=d.downloads.map(x=>`<div class="mini-item"><span class="ic" style="background:var(--violet-soft)">${typeSymbol(x.material.type)}</span><div style="min-width:0;flex:1"><b>${escapeHTML(x.material.title)}</b><span class="small muted">${escapeHTML(x.material.subject)} • Sem ${x.material.semester} • by ${escapeHTML(x.material.uploaderName||'Student')} • downloaded ${formatDate(x.downloadedAt)}</span></div><a class="btn btn-sm btn-outline" href="/api/materials/${x.material._id}/download">⬇ Again</a><a class="btn btn-sm" href="/uploads/${encodeURIComponent(x.material.fileName)}" target="_blank" rel="noopener">👁 View</a></div>`).join('');
   if(!d.downloads.length) document.getElementById('dlEmpty').innerHTML='<div class="empty">No downloads yet. Downloaded notes will appear here.</div>';
 }catch(e){ toast(e.message); } })();
}
