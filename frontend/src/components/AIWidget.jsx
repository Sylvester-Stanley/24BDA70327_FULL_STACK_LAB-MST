import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AIWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={()=>setOpen(!open)}
        style={{
          position:'fixed', bottom:20, right:20, width:60, height:60, borderRadius:'50%',
          background:'linear-gradient(135deg, #0e9f6e, #1c64f2)', color:'white', border:'none',
          fontSize:28, cursor:'pointer', boxShadow:'0 8px 24px rgba(0,0,0,0.2)', zIndex:99,
          display:'flex', alignItems:'center', justifyContent:'center'
        }}
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Widget Panel */}
      {open && (
        <div style={{
          position:'fixed', bottom:90, right:20, width:320, background:'white',
          borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,0.2)', zIndex:98,
          border:'1px solid var(--border)', overflow:'hidden'
        }}>
          <div style={{background:'linear-gradient(135deg, #0e9f6e, #1c64f2)', color:'white', padding:'16px 20px'}}>
            <div style={{fontWeight:700, display:'flex', alignItems:'center', gap:8}}>🤖 Healthier AI</div>
            <div style={{fontSize:12, opacity:0.9, marginTop:4}}>Offline • Private • No API needed</div>
          </div>
          <div style={{padding:16}}>
            <div style={{fontSize:14, marginBottom:12}}>Hi! I'm your AI health assistant. I can:</div>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              <Link to="/ai-symptom-checker" onClick={()=>setOpen(false)} className="btn btn-outline btn-sm" style={{justifyContent:'flex-start'}}>🔍 Check Symptoms with AI</Link>
              <Link to="/ai-chat" onClick={()=>setOpen(false)} className="btn btn-outline btn-sm" style={{justifyContent:'flex-start'}}>💬 Chat with AI Assistant</Link>
              <Link to="/doctors" onClick={()=>setOpen(false)} className="btn btn-outline btn-sm" style={{justifyContent:'flex-start'}}>👨‍⚕️ Find Doctor</Link>
              <div style={{background:'#f9fafb', padding:10, borderRadius:10, fontSize:12, color:'var(--muted)', marginTop:8}}>
                💡 Try: "I have fever and cough for 2 days" - AI will suggest specialist and urgency!
              </div>
            </div>
          </div>
          <div style={{padding:'8px 16px', background:'#f9fafb', fontSize:11, color:'var(--muted)', textAlign:'center', borderTop:'1px solid var(--border)'}}>
            ⚠️ AI for education only, not medical diagnosis
          </div>
        </div>
      )}
    </>
  );
}
