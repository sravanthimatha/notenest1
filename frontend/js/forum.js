let currentTag='';
if(requireAuth()){ initSidebar('forum'); mountTopbar(); loadPosts();
 document.querySelectorAll('#tagChips .chip').forEach(c=>c.addEventListener('click',()=>{ document.querySelectorAll('#tagChips .chip').forEach(x=>x.classList.remove('on')); c.classList.add('on'); currentTag=c.dataset.tag; loadPosts(); }));
}
async function loadPosts(){ try{ const q=currentTag?('?tag='+encodeURIComponent(currentTag)):''; const d=await api('/api/forum'+q);
  document.getElementById('postList').innerHTML=d.posts.map(p=>`<a class="panel post-card" href="forum-post.html?id=${p._id}"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="badge">${escapeHTML(p.tag)}</span><span class="muted small">${formatDate(p.updatedAt)}</span></div><h3 style="margin-top:8px">${escapeHTML(p.title)}</h3><p class="muted small" style="margin-top:4px">${escapeHTML(p.body.slice(0,160))}${p.body.length>160?'…':''}</p><div class="uploader-row" style="margin-top:10px"><span class="avatar">${escapeHTML((p.authorName||'S').charAt(0).toUpperCase())}</span><span class="small"><b>${escapeHTML(p.authorName)}</b></span><span class="small" style="margin-left:auto;color:var(--violet);font-weight:700">💬 ${p.repliesCount} replies</span></div></a>`).join('');
  document.getElementById('forumEmpty').innerHTML=d.posts.length?'':'<div class="empty">No discussions yet in this category. Start the first one!</div>';
 }catch(e){ toast(e.message); } }
function togglePostForm(){ const p=document.getElementById('postFormPanel'); p.style.display=p.style.display==='none'?'block':'none'; }
async function createPost(){ const title=document.getElementById('postTitle').value.trim(); const body=document.getElementById('postBody').value.trim(); const tag=document.getElementById('postTag').value;
 if(!title||!body) return toast('Title and details are required');
 try{ await api('/api/forum',{method:'POST',body:JSON.stringify({title,body,tag})}); toast('Discussion posted'); document.getElementById('postTitle').value=''; document.getElementById('postBody').value=''; togglePostForm(); loadPosts(); }catch(e){ toast(e.message); } }
