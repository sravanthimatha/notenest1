const postId=new URLSearchParams(location.search).get('id');
let currentPost=null;
if(requireAuth()){ initSidebar('forum'); mountTopbar(); loadPost(); }
async function loadPost(){ try{ const d=await api('/api/forum/'+postId); currentPost=d.post; const me=getUser();
  const mine=me && String(me.id||me._id)===String(currentPost.author);
  document.getElementById('postDetail').innerHTML=`<div class="panel"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="badge">${escapeHTML(currentPost.tag)}</span><span class="muted small">${formatDate(currentPost.createdAt)}</span>${mine?'<button class="btn btn-sm btn-danger" style="margin-left:auto" onclick="deletePost()">Delete Post</button>':''}</div><h1 style="font-size:25px;margin-top:10px">${escapeHTML(currentPost.title)}</h1><div class="uploader-row" style="margin-top:8px"><span class="avatar">${escapeHTML((currentPost.authorName||'S').charAt(0).toUpperCase())}</span><span class="small"><b>${escapeHTML(currentPost.authorName)}</b></span></div><p style="margin-top:14px;white-space:pre-wrap">${escapeHTML(currentPost.body)}</p></div>`;
  const list=document.getElementById('replyList');
  list.innerHTML=currentPost.replies.map(rp=>{ const canDel=me && (String(me.id||me._id)===String(rp.user)||String(me.id||me._id)===String(currentPost.author)); return `<div class="mini-item"><span class="avatar">${escapeHTML((rp.userName||'S').charAt(0).toUpperCase())}</span><div style="flex:1;min-width:0"><b>${escapeHTML(rp.userName)}</b> <span class="small muted">${formatDate(rp.createdAt)}</span><div class="small" style="white-space:pre-wrap">${escapeHTML(rp.text)}</div></div>${canDel?`<button class="btn btn-sm btn-light" onclick="deleteReply('${rp._id}')">✕</button>`:''}</div>`; }).join('');
  document.getElementById('replyEmpty').innerHTML=currentPost.replies.length?'':'<p class="muted small">No replies yet — be the first to help.</p>';
 }catch(e){ toast(e.message); } }
async function submitReply(){ const text=document.getElementById('replyText').value.trim(); if(!text) return toast('Write a reply first');
 try{ await api(`/api/forum/${postId}/replies`,{method:'POST',body:JSON.stringify({text})}); document.getElementById('replyText').value=''; toast('Reply posted'); loadPost(); }catch(e){ toast(e.message); } }
async function deletePost(){ if(!confirm('Delete this discussion?')) return; try{ await api('/api/forum/'+postId,{method:'DELETE'}); toast('Deleted'); setTimeout(()=>location.href='forum.html',500); }catch(e){ toast(e.message); } }
async function deleteReply(rid){ if(!confirm('Delete this reply?')) return; try{ await api(`/api/forum/${postId}/replies/${rid}`,{method:'DELETE'}); toast('Reply deleted'); loadPost(); }catch(e){ toast(e.message); } }
