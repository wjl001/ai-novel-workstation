// 后台跟踪那条多参考图视频任务直到出 url / 失败 / 超时
import fs from 'fs';
const key = (fs.readFileSync('.env','utf8').match(/VITE_AGNES_API_KEY=(.+)/)||[])[1]?.trim()||'';
const VIDEO_ID = 'task_Oa0DzS7A0YJpbkDZ5YG808E7JALOxu0i';
const MODEL = 'agnes-video-2.5-flash';
for (let k=0; k<60; k++){
  await new Promise(r=>setTimeout(r,10000));
  try{
    const q = await fetch(`https://apihub.agnes-ai.com/agnesapi?video_id=${encodeURIComponent(VIDEO_ID)}&model_name=${encodeURIComponent(MODEL)}`,{headers:{Authorization:`Bearer ${key}`}});
    if(q.status===429){ await new Promise(r=>setTimeout(r,15000)); continue; }
    const d = (await q.json().catch(()=>({})) ); const dd=d.data||d; const st=String(dd.status||'').toLowerCase();
    if(st==='completed'){
      const url = dd.metadata?.url||dd.url||dd.remixed_from_video_id;
      console.log(`RESULT:COMPLETED url=${url}`);
      break;
    }
    if(st==='failed'){ console.log(`RESULT:FAILED ${JSON.stringify(dd.error||st).slice(0,300)}`); break; }
    if(k%5===0) console.log(`poll ${k+1}: ${st}`);
  }catch(e){ console.log(`poll ${k+1}: net err ${e.message}`); }
}
console.log('TRACK_DONE');
