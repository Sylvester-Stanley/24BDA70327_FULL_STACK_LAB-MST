import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function AISymptomChecker() {
  const [form, setForm] = useState({ symptoms:'', age:'', gender:'Male', duration:'', severity:'mild' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('/api/ai/symptom-check', form);
      setResult(res.data);
      // Also triage
      const triageRes = await axios.post('/api/ai/triage', form);
      setResult(prev => ({ ...prev, triage: triageRes.data }));
    } catch (err) {
      alert('AI check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{padding:'30px 20px', maxWidth:900}}>
      <div style={{textAlign:'center', marginBottom:30}}>
        <span className="badge badge-success" style={{marginBottom:12}}>🤖 AI Powered - Works Offline, No API Key Needed</span>
        <h1 style={{fontSize:32}}>AI Symptom Checker</h1>
        <p style={{color:'var(--muted)', maxWidth:600, margin:'8px auto 0'}}>Describe your symptoms and get instant AI analysis - possible conditions, urgency, and which specialist to consult. <b>Not a medical diagnosis</b>.</p>
      </div>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:20}}>
        <div className="card">
          <h3 style={{marginBottom:16}}>📝 Tell AI Your Symptoms</h3>
          <form onSubmit={handleCheck}>
            <div className="form-group">
              <label className="label">Describe Symptoms in detail</label>
              <textarea className="input" rows="4" value={form.symptoms} onChange={e=>setForm({...form, symptoms:e.target.value})} required placeholder="e.g. I have fever 101°F, cough, sore throat for 2 days, headache, fatigue..."></textarea>
              <div style={{fontSize:12, color:'var(--muted)', marginTop:4}}>Be specific: duration, severity, other symptoms</div>
            </div>
            <div className="grid grid-3">
              <div className="form-group">
                <label className="label">Age</label>
                <input className="input" type="number" value={form.age} onChange={e=>setForm({...form, age:e.target.value})} placeholder="28" />
              </div>
              <div className="form-group">
                <label className="label">Gender</label>
                <select className="input" value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Duration</label>
                <select className="input" value={form.duration} onChange={e=>setForm({...form, duration:e.target.value})}>
                  <option value="">Select</option>
                  <option value="1">1 day</option>
                  <option value="2">2-3 days</option>
                  <option value="7">1 week</option>
                  <option value="14">2 weeks+</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Severity</label>
              <div className="tabs" style={{width:'100%'}}>
                {['mild','moderate','severe'].map(s=>(
                  <button key={s} type="button" className={`tab ${form.severity===s?'active':''}`} style={{flex:1}} onClick={()=>setForm({...form, severity:s})}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" style={{width:'100%', padding:14, justifyContent:'center'}} disabled={loading}>
              {loading ? '🤖 AI Analyzing...' : '🔍 Check with AI'}
            </button>
          </form>

          <div style={{marginTop:16, display:'flex', gap:8, flexWrap:'wrap'}}>
            <span style={{fontSize:12, color:'var(--muted)'}}>Try:</span>
            {['fever and cough','chest pain','skin rash and itching','headache for 3 days'].map(ex=>(
              <button key={ex} className="btn btn-outline btn-sm" style={{fontSize:11}} onClick={()=>setForm({...form, symptoms:ex})}>{ex}</button>
            ))}
          </div>
        </div>

        <div>
          {!result ? (
            <div className="card" style={{textAlign:'center', padding:40, color:'var(--muted)'}}>
              <div style={{fontSize:50, marginBottom:12}}>🤖</div>
              <h3>AI Ready to Help</h3>
              <p style={{fontSize:14, marginTop:8}}>Enter symptoms on left and AI will analyze instantly - works offline, no internet needed for AI logic!</p>
              <div style={{marginTop:16, textAlign:'left', background:'#f9fafb', padding:12, borderRadius:8, fontSize:12}}>
                <b>AI can:</b><br/>
                • Detect possible conditions<br/>
                • Suggest specialist<br/>
                • Assess urgency<br/>
                • Give home care tips<br/>
                • Triage level
              </div>
            </div>
          ) : (
            <div className="card" style={{border: result.aiAnalysis.isEmergency ? '2px solid #ef4444' : result.aiAnalysis.urgency==='high' ? '2px solid #f59e0b' : '1px solid var(--border)'}}>
              {result.aiAnalysis.isEmergency && (
                <div className="alert alert-error" style={{marginBottom:12}}>🚨 EMERGENCY DETECTED - Seek immediate medical help!</div>
              )}
              <h3 style={{marginBottom:12}}>🤖 AI Analysis Result</h3>
              
              <div style={{marginBottom:16}}>
                <div style={{fontWeight:700, fontSize:14, marginBottom:6}}>Possible Conditions:</div>
                <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                  {result.aiAnalysis.possibleConditions.map((c,i)=>(
                    <span key={i} className="badge badge-info">{c}</span>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:16}}>
                <div style={{fontWeight:700, fontSize:14, marginBottom:6}}>Recommended Specialists:</div>
                <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                  {result.aiAnalysis.recommendedSpecialists.map((s,i)=>(
                    <Link key={i} to={`/doctors?specialization=${s}`} className="badge badge-success" style={{textDecoration:'none'}}>👨‍⚕️ {s}</Link>
                  ))}
                </div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16}}>
                <div style={{background: result.aiAnalysis.urgency==='high' ? '#fef2f2' : result.aiAnalysis.urgency==='medium' ? '#fffbeb' : '#ecfdf5', padding:12, borderRadius:10, textAlign:'center'}}>
                  <div style={{fontSize:12, color:'var(--muted)'}}>Urgency</div>
                  <div style={{fontWeight:800, fontSize:18, color: result.aiAnalysis.urgency==='high' ? '#dc2626' : result.aiAnalysis.urgency==='medium' ? '#d97706' : '#059669'}}>{result.aiAnalysis.urgency.toUpperCase()}</div>
                </div>
                <div style={{background:'#f3f4f6', padding:12, borderRadius:10, textAlign:'center'}}>
                  <div style={{fontSize:12, color:'var(--muted)'}}>Triage</div>
                  <div style={{fontWeight:800, fontSize:16}}>{result.triage?.triageLevel || 'routine'}</div>
                  <div style={{fontSize:11}}>{result.triage?.recommendedWait}</div>
                </div>
              </div>

              <div style={{background:'#f9fafb', padding:12, borderRadius:10, marginBottom:12}}>
                <div style={{fontWeight:700, fontSize:13, marginBottom:4}}>💡 AI Advice:</div>
                <div style={{fontSize:13}}>{result.aiAnalysis.advice}</div>
              </div>

              <div style={{marginBottom:12}}>
                <div style={{fontWeight:700, fontSize:13, marginBottom:4}}>🏠 Home Care:</div>
                <ul style={{fontSize:13, color:'var(--muted)', paddingLeft:18}}>
                  {result.aiAnalysis.homeCare.map((h,i)=><li key={i}>{h}</li>)}
                </ul>
              </div>

              <div style={{display:'flex', gap:8, marginTop:16}}>
                <Link to="/doctors" className="btn btn-primary btn-sm">Find {result.aiAnalysis.recommendedSpecialists[0]} →</Link>
                <button className="btn btn-outline btn-sm" onClick={()=>{ setForm({ symptoms:'', age:'', gender:'Male', duration:'', severity:'mild' }); setResult(null); }}>Check Again</button>
              </div>

              <div style={{marginTop:16, fontSize:11, color:'var(--muted)', background:'#fffbeb', padding:8, borderRadius:6}}>
                {result.disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
