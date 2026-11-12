let currentSort='newest';
document.getElementById('modalMount').innerHTML = rateModalHTML();
const u=getUser();
document.getElementById('authLinks').innerHTML = u ? `<a class="btn btn-sm" href="dashboard.html">Hi, ${escapeHTML(u.name.split(' ')[0])}</a>` : `<a href="login.html">Login</a><a class="btn btn-sm" href="register.html">Register Free</a>`;
const semSel=document.getElementById('semesterFilter'); for(let i=1;i<=8;i++){ const o=document.createElement('option'); o.value=i; o.textContent='Semester '+i; semSel.appendChild(o); }
['searchInput'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{ if(e.key==='Enter') loadMaterials(); }));
['subjectFilter','semesterFilter','typeFilter'].forEach(id=>document.getElementById(id).addEventListener('change',loadMaterials));
function setSort(s){ currentSort=s; loadMaterials(); }
async function loadSubjects(){ try{ const d=await api('/api/materials/subjects'); const sel=document.getElementById('subjectFilter'); d.subjects.forEach(s=>{ const o=document.createElement('option'); o.value=s; o.textContent=s; sel.appendChild(o); }); }catch(e){} }
async function loadMaterials(){
  const searchVal=document.getElementById('searchInput').value;
  // When searching, look across ALL semesters so the student's own uploads are always found
  const semVal=(personalSem && searchVal.trim()) ? '' : document.getElementById('semesterFilter').value;
  const q=new URLSearchParams({ search:searchVal, subject:document.getElementById('subjectFilter').value, semester:semVal, type:document.getElementById('typeFilter').value, sort:currentSort });
  const grid=document.getElementById('materialsGrid'); grid.innerHTML='<p class="muted">Loading materials...</p>';
  try{ const d=await api('/api/materials?'+q.toString()); document.getElementById('resultsInfo').textContent=`${d.total} material(s) found`;
    grid.innerHTML=d.materials.map(m=>materialCard(m)).join('');
    document.getElementById('emptyState').innerHTML=d.materials.length?'':`<div class="empty">No materials found. Try a different search or <a href="upload.html" style="color:var(--green);font-weight:700">upload the first one</a>.</div>`;
  }catch(e){ grid.innerHTML=''; document.getElementById('emptyState').innerHTML=`<div class="empty">Could not load materials. Make sure the backend is running on port 5000.<br>${escapeHTML(e.message)}</div>`; }
}
// Prefill from URL params (dashboard search / filters)
const params=new URLSearchParams(window.location.search);
if(params.get('search')) document.getElementById('searchInput').value=params.get('search');
if(params.get('semester')) semSel.value=params.get('semester');
if(params.get('type')) document.getElementById('typeFilter').value=params.get('type');
// Personalization: default Explore to the logged-in student's own semester
let personalSem=null;
function renderPersonalChip(){
  const el=document.getElementById('personalChip'); if(!el) return;
  if(personalSem){ el.innerHTML=`<div class="personal-chip">🎯 Showing <b>Semester ${personalSem}</b> materials for you, ${escapeHTML((u.name||'Student').split(' ')[0])} — from your profile. <button type="button" onclick="showAllSemesters()">Show all semesters</button></div>`; }
  else el.innerHTML='';
}
function showAllSemesters(){ personalSem=null; semSel.value=''; renderPersonalChip(); loadMaterials(); }
if(u && u.semester && !params.get('semester') && !params.get('search')){ personalSem=Number(u.semester); semSel.value=String(personalSem); }
semSel.addEventListener('change',()=>{ if(personalSem && semSel.value!==String(personalSem)){ personalSem=null; renderPersonalChip(); } });
renderPersonalChip();
loadSubjects().then(()=>{ if(params.get('subject')){ document.getElementById('subjectFilter').value=params.get('subject'); } loadMaterials(); });
