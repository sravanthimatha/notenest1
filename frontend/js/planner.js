if(requireAuth()){ initSidebar('planner'); mountTopbar(); document.getElementById('taskDate').value=new Date().toISOString().slice(0,10); loadTasks(); }
function groupLabel(dateStr){ const today=new Date(); const t=today.toISOString().slice(0,10); const tm=new Date(today.getTime()+86400000).toISOString().slice(0,10);
 if(dateStr<t) return '⏰ Overdue'; if(dateStr===t) return '📌 Today'; if(dateStr===tm) return '🌅 Tomorrow'; return '🗓️ '+dateStr; }
async function loadTasks(){ try{ const d=await api('/api/planner');
  document.getElementById('progressLabel').textContent=`${d.done} of ${d.total} done`;
  const pct=d.total?Math.round(d.done/d.total*100):0; document.getElementById('progressPct').textContent=pct+'%'; document.getElementById('progressFill').style.width=pct+'%';
  const groups={}; d.tasks.forEach(t=>{ const g=t.done?'✅ Completed':groupLabel(t.date); (groups[g]=groups[g]||[]).push(t); });
  const order=Object.keys(groups).sort((a,b)=> (a==='✅ Completed')-(b==='✅ Completed') || a.localeCompare(b));
  document.getElementById('taskGroups').innerHTML=order.map(g=>`<div class="panel" style="margin-bottom:14px"><h3>${g}</h3><div class="mini-list">${groups[g].map(t=>`<div class="mini-item"><input type="checkbox" style="width:19px;height:19px;accent-color:var(--violet)" ${t.done?'checked':''} onchange="toggleTask('${t._id}',this.checked)"><div style="flex:1;min-width:0"><b style="${t.done?'text-decoration:line-through;color:var(--grey)':''}">${escapeHTML(t.title)}</b><span class="small muted">${escapeHTML(t.subject||'General')}${t.time?' • '+escapeHTML(t.time):''} • ${escapeHTML(t.date)}</span></div><button class="btn btn-sm btn-light" onclick="deleteTask('${t._id}')">✕</button></div>`).join('')}</div></div>`).join('');
  document.getElementById('plannerEmpty').innerHTML=d.tasks.length?'':'<div class="empty">No study tasks yet. Add your first task above.</div>';
 }catch(e){ toast(e.message); } }
async function addTask(){ const title=document.getElementById('taskTitle').value.trim(); const subject=document.getElementById('taskSubject').value.trim(); const date=document.getElementById('taskDate').value; const time=document.getElementById('taskTime').value;
 if(!title) return toast('Task title is required'); if(!date) return toast('Pick a date');
 try{ await api('/api/planner',{method:'POST',body:JSON.stringify({title,subject,date,time})}); document.getElementById('taskTitle').value=''; toast('Task added'); loadTasks(); }catch(e){ toast(e.message); } }
async function toggleTask(id,done){ try{ await api('/api/planner/'+id,{method:'PUT',body:JSON.stringify({done})}); loadTasks(); }catch(e){ toast(e.message); } }
async function deleteTask(id){ try{ await api('/api/planner/'+id,{method:'DELETE'}); toast('Task deleted'); loadTasks(); }catch(e){ toast(e.message); } }
