import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role:'assistant', text:"👋 Hi! I'm Healthier AI - your offline health assistant.\n\nI can help with:\n• Symptom checking\n• Finding right doctor\n• Health tips\n• General health questions\n\nHow can I help? Try: 'I have fever and cough'", suggestions: ["Check Symptoms with AI", "Find Doctor", "Health Tips", "Emergency Help"] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    const userMsg = { role:'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/chat', { message: text.trim() });
      setMessages(prev => [...prev, { role:'assistant', text: res.data.response, suggestions: res.data.suggestions, isEmergency: res.data.isEmergency }]);
    } catch {
      setMessages(prev => [...prev, { role:'assistant', text:"Sorry, AI is offline. Try symptom checker page." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{padding:'20px', maxWidth:900}}>
      <div style={{textAlign:'center', marginBottom:20}}>
        <h1 style={{fontSize:28}}>🤖 AI Health Assistant</h1>
        <p style={{color:'var(--muted)'}}>Offline AI - No API key needed - Works on your PC</p>
      </div>

      <div className="card" style={{padding:0, display:'flex', flexDirection:'column', height:650}}>
        <div style={{padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontWeight:700}}>💬 Chat with Healthier AI</span>
          <span className="badge badge-success">Offline • Private</span>
        </div>

        <div style={{flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:16, background:'#f9fafb'}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:'flex', flexDirection:'column', alignItems: m.role==='user' ? 'flex-end' : 'flex-start'}}>
              <div style={{
                background: m.role==='user' ? 'var(--primary)' : m.isEmergency ? '#fef2f2' : 'white',
                color: m.role==='user' ? 'white' : 'var(--text)',
                padding:'12px 16px',
                borderRadius: m.role==='user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                maxWidth:'85%',
                fontSize:14,
                whiteSpace:'pre-wrap',
                boxShadow:'0 1px 3px rgba(0,0,0,0.1)',
                border: m.isEmergency ? '1px solid #fecaca' : '1px solid var(--border)'
              }}>
                {m.text}
              </div>
              {m.suggestions && (
                <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:8, maxWidth:'85%'}}>
                  {m.suggestions.map((s,j)=>(
                    <button key={j} className="btn btn-outline btn-sm" style={{fontSize:11, padding:'4px 10px'}} onClick={()=>sendMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && <div style={{color:'var(--muted)', fontSize:13}}>🤖 AI typing...</div>}
          <div ref={endRef} />
        </div>

        <form onSubmit={e=>{ e.preventDefault(); sendMessage(); }} style={{padding:12, borderTop:'1px solid var(--border)', display:'flex', gap:8}}>
          <input className="input" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about symptoms, doctors, health tips..." style={{flex:1}} />
          <button className="btn btn-primary" type="submit" disabled={loading}>Send</button>
        </form>

        <div style={{padding:'8px 12px', background:'#ecfdf5', fontSize:11, color:'#065f46', display:'flex', justifyContent:'space-between'}}>
          <span>🔒 Private & offline - your chats stay on your PC</span>
          <span>⚠️ Not a medical diagnosis</span>
        </div>
      </div>

      <div className="grid grid-3" style={{marginTop:16}}>
        <Link to="/ai-symptom-checker" className="card" style={{textDecoration:'none', color:'inherit', textAlign:'center'}}>
          <div style={{fontSize:30}}>🔍</div>
          <h3 style={{fontSize:16, marginTop:8}}>Symptom Checker</h3>
          <p style={{fontSize:12, color:'var(--muted)'}}>Detailed AI analysis</p>
        </Link>
        <Link to="/doctors" className="card" style={{textDecoration:'none', color:'inherit', textAlign:'center'}}>
          <div style={{fontSize:30}}>👨‍⚕️</div>
          <h3 style={{fontSize:16, marginTop:8}}>Find Doctor</h3>
          <p style={{fontSize:12, color:'var(--muted)'}}>Book consultation</p>
        </Link>
        <div className="card" style={{textAlign:'center'}}>
          <div style={{fontSize:30}}>💡</div>
          <h3 style={{fontSize:16, marginTop:8}}>Health Tips</h3>
          <p style={{fontSize:12, color:'var(--muted)'}}>Ask AI for tips</p>
        </div>
      </div>
    </div>
  );
}
