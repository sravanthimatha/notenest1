if(requireAuth()){ initSidebar('bookmarks'); mountTopbar(); document.getElementById('modalMount').innerHTML=rateModalHTML();
 (async()=>{ try{ const d=await api('/api/bookmarks');
   document.getElementById('bmGrid').innerHTML=d.bookmarks.map(b=>materialCard({...b.material, isBookmarked:true})).join('');
   if(!d.bookmarks.length) document.getElementById('emptyState').innerHTML='<div class="empty">No bookmarks yet.<br><br><a class="btn" href="index.html#materials">🔍 Explore materials</a></div>';
 }catch(e){ toast(e.message); } })();
}
async function deleteMaterial(id){ toast('Bookmarks page shows saved notes only'); }
