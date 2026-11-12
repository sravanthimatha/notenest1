const API_BASE = window.location.origin.includes('5500') || window.location.protocol === 'file:' ? 'http://localhost:5000' : '';
function getToken(){ return localStorage.getItem('notenest_token'); }
function getUser(){ try{ return JSON.parse(localStorage.getItem('notenest_user')); }catch(e){ return null; } }
function setAuth(token,user){ localStorage.setItem('notenest_token',token); localStorage.setItem('notenest_user',JSON.stringify(user)); }
function logout(){ localStorage.removeItem('notenest_token'); localStorage.removeItem('notenest_user'); window.location.href='login.html'; }
function requireAuth(){ if(!getToken()){ window.location.href='login.html'; return false; } return true; }
async function api(path, options={}){
  const headers = { ...(options.headers||{}) };
  if(!(options.body instanceof FormData) && options.body) headers['Content-Type']='application/json';
  const token = getToken(); if(token) headers['Authorization']='Bearer '+token;
  const res = await fetch(API_BASE + path, { cache: 'no-store', ...options, headers });
  const data = await res.json().catch(()=>({ success:false, message:'Server error' }));
  if(!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}
function toast(msg){ const t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3200); }
function showAlert(id,msg,type='error'){ const el=document.getElementById(id); if(!el) return; el.textContent=msg; el.className='alert '+type; }
function starsHTML(avg,count){ const full=Math.round(avg||0); return `<span class="stars">${'★'.repeat(full)}${'☆'.repeat(5-full)}</span> <span class="small muted">${avg||0} (${count||0} ratings)</span>`; }
function formatDate(d){ return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
function formatSize(bytes){ if(!bytes) return ''; return bytes>1048576 ? (bytes/1048576).toFixed(1)+' MB' : Math.max(1,Math.round(bytes/1024))+' KB'; }
function escapeHTML(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function typeSymbol(type){ return { 'Notes':'📓','Question Paper':'📝','Assignment':'📂','Lab Record':'🧪','Reference Material':'📚' }[type] || '📄'; }
function coverClass(seed){ let h=0; const s=String(seed||''); for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return 'cv'+(h%6); }
function materialCard(m, opts={}){
  const initial=(m.uploaderName||'S').trim().charAt(0).toUpperCase();
  const me=getUser(); const own = me && m.uploader && String(m.uploader._id||m.uploader)===String(me._id||me.id);
  return `<article class="card">
    <div class="cover ${coverClass(m.subject)}"><span class="sym">${typeSymbol(m.type)}</span><span class="init">${escapeHTML((m.subject||'N').charAt(0))}</span><span class="dl">⬇ ${m.downloads||0}</span></div>
    <div class="card-body">
    <div class="meta">${own?'<span class="badge" style="background:#e7f6ec;color:#157347">⭐ Your upload</span>':''}<span class="badge">${escapeHTML(m.type)}</span><span class="badge" style="background:#f3efe4;color:#6b6242">Sem ${m.semester}</span><span class="badge" style="background:#f7ecd2;color:#8a6d1f">${escapeHTML(m.subject)}</span></div>
    <h3>${escapeHTML(m.title)}</h3><p class="muted small">${escapeHTML(m.description)}</p>
    <div>${starsHTML(m.averageRating,m.ratingsCount)}</div>
    <div class="uploader-row"><span class="avatar">${initial}</span><span class="small"><b>${escapeHTML(m.uploaderName)}</b> <span class="muted">• ${formatDate(m.createdAt)}${m.fileSize?' • '+formatSize(m.fileSize):''}</span></span>
    <button class="bm ${m.isBookmarked?'saved':''}" title="Bookmark" onclick="toggleBookmark('${m._id}',this)">🔖</button></div>
    <div class="actions">
      <a class="btn btn-sm" href="${API_BASE}/uploads/${encodeURIComponent(m.fileName)}" target="_blank" rel="noopener">👁 View</a>
      <a class="btn btn-sm btn-outline" href="${API_BASE}/api/materials/${m._id}/download">⬇ Download</a>
      <button class="btn btn-sm btn-light" onclick="openRate('${m._id}','${escapeHTML(m.title).replace(/'/g,"\'")}')">⭐ Rate</button>
      ${opts.mine?`<button class="btn btn-sm btn-danger" onclick="deleteMaterial('${m._id}')">Delete</button>`:''}
    </div></div></article>`;
}
async function toggleBookmark(id,btn){
  if(!getToken()){ window.location.href='login.html'; return; }
  try{ const d=await api(`/api/bookmarks/${id}`,{method:'POST'}); toast(d.message); if(btn && btn.classList.contains('bm')) btn.classList.toggle('saved', d.bookmarked); else if(btn) btn.textContent=d.bookmarked?'🔖 Saved':'🔖 Bookmark'; const el=document.querySelector(`[data-card="${id}"]`); if(window.location.pathname.includes('profile')) setTimeout(()=>location.reload(),600);
  }catch(e){ toast(e.message); }
}
let rateTarget=null, rateValue=0;
function openRate(id,title){ if(!getToken()){ location.href='login.html'; return; } rateTarget=id; rateValue=0; document.getElementById('rateTitle').textContent=title; document.getElementById('rateModal').classList.add('open'); renderRateStars(); document.getElementById('reviewText').value=''; }
function renderRateStars(){ document.querySelectorAll('.star-btn').forEach((b,i)=>b.classList.toggle('active', i<rateValue)); }
function closeRate(){ document.getElementById('rateModal').classList.remove('open'); }
async function submitRating(){ if(!rateValue){ toast('Please select stars'); return; } try{ const review=document.getElementById('reviewText').value; const d=await api(`/api/ratings/${rateTarget}`,{method:'POST',body:JSON.stringify({rating:rateValue,review})}); toast(`Thanks! Average is now ${d.averageRating} ★`); closeRate(); setTimeout(()=>location.reload(),700);}catch(e){ toast(e.message);} }
function rateModalHTML(){ return `<div class="modal" id="rateModal"><div class="modal-box"><h2>Rate this material</h2><p class="muted" id="rateTitle"></p><div style="margin:14px 0">${[1,2,3,4,5].map(i=>`<button class="star-btn" onclick="rateValue=${i};renderRateStars()">★</button>`).join('')}</div><textarea id="reviewText" rows="3" placeholder="Optional review..."></textarea><div style="display:flex;gap:10px;margin-top:14px"><button class="btn" onclick="submitRating()">Submit Rating</button><button class="btn btn-light" onclick="closeRate()">Cancel</button></div></div></div><div class="toast" id="toast"></div>`; }
const SIDE_LINKS=[
 ['dashboard','dashboard.html','🏠','Dashboard'],
 ['upload','upload.html','☁️','Upload Materials'],
 ['explore','index.html','🔍','Explore Materials'],
 ['mynotes','mynotes.html','📄','My Notes'],
 ['bookmarks','bookmarks.html','🔖','Bookmarks'],
 ['downloads','downloads.html','⬇️','My Downloads'],
 ['forum','forum.html','💬','Discussion Forum'],
 ['planner','planner.html','🗓️','Study Planner'],
 ['profile','profile.html','👤','My Profile'],
 ['settings','settings.html','⚙️','Settings']
];
function sidebarHTML(active){
  const u=getUser()||{};
  return `<aside class="sidebar" id="sidebar"><div class="logo"><span class="mark">🎓</span>Note<span>Nest</span></div>
  <div class="side-tag">Learn • Share • Grow</div>
  ${SIDE_LINKS.map(([key,href,icon,label])=>`<a class="side-link ${active===key?'active':''}" href="${href}"><span>${icon}</span>${label}</a>`).join('')}
  <div class="spacer"></div>
  <div class="user-chip"><b>${escapeHTML(u.name||'Student')}</b><div class="small">${escapeHTML(u.email||'')}</div></div>
  <button class="btn btn-light" style="margin-top:10px;width:100%" onclick="logout()">↩ Logout</button></aside>`;
}
function topbarHTML(){
  const u=getUser()||{};
  return `<div class="dash-top"><button class="btn btn-light btn-sm hamburger" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
  <div class="dash-search"><span>🔍</span><input id="dashSearchInput" placeholder="Search notes, subjects, or topics..."></div>
  <a class="profile-chip" href="profile.html"><span class="avatar">${escapeHTML((u.name||'S').trim().charAt(0).toUpperCase())}</span><span class="pname">${escapeHTML(u.name||'Student')}</span><span class="muted">▾</span></a></div>`;
}
function mountTopbar(){
  const m=document.getElementById('topbarMount'); if(!m) return;
  m.innerHTML=topbarHTML();
  const inp=document.getElementById('dashSearchInput');
  if(inp) inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ const q=inp.value.trim(); window.location.href='index.html'+(q?('?search='+encodeURIComponent(q)):'')+'#materials'; } });
  refreshBell();
}
async function refreshBell(){
  const b=document.getElementById('bellBadge'); if(!b||!getToken()) return;
  try{ const d=await api('/api/notifications/unread-count'); if(d.unread>0){ b.style.display='grid'; b.textContent=d.unread>99?'99+':d.unread; } else b.style.display='none'; }catch(e){}
}
function initSidebar(active){ const el=document.getElementById('sidebarMount'); if(el) el.innerHTML=sidebarHTML(active); }

// ---- 3D tilt effect on cards ----
document.addEventListener('mousemove', e=>{
  const c = e.target && e.target.closest ? e.target.closest('.card, .stat, .qa-tile, .quick a') : null;
  document.querySelectorAll('.tilt3d').forEach(el=>{ if(el!==c){ el.classList.remove('tilt3d'); el.style.transform=''; } });
  if(!c) return;
  const r=c.getBoundingClientRect(); if(r.width<40) return;
  const x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5;
  c.classList.add('tilt3d');
  c.style.transform='perspective(900px) rotateY('+(x*9).toFixed(2)+'deg) rotateX('+(-y*9).toFixed(2)+'deg) translateY(-3px)';
});
document.addEventListener('mouseout', e=>{
  const c = e.target && e.target.closest ? e.target.closest('.card, .stat, .qa-tile, .quick a') : null;
  if(c && !c.contains(e.relatedTarget)){ c.classList.remove('tilt3d'); c.style.transform=''; }
});
