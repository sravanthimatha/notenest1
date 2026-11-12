if(requireAuth()){ initSidebar('mynotes'); mountTopbar(); document.getElementById('modalMount').innerHTML=rateModalHTML();
 (async()=>{ try{ const d=await api('/api/materials/my'); document.getElementById('resultsInfo').textContent=`${d.materials.length} material(s) uploaded by you`;
   document.getElementById('myGrid').innerHTML=d.materials.map(m=>materialCard(m,{mine:true})).join('');
   if(!d.materials.length) document.getElementById('emptyState').innerHTML='<div class="empty">You have not uploaded anything yet.<br><br><a class="btn" href="upload.html">☁️ Upload your first note</a></div>';
 }catch(e){ toast(e.message); } })();
}
async function deleteMaterial(id){ if(!confirm('Delete this material permanently?')) return; try{ await api(`/api/materials/${id}`,{method:'DELETE'}); toast('Deleted'); setTimeout(()=>location.reload(),600);}catch(e){toast(e.message);} }
