import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Medical Knowledge Base for AI
const medicalKB = {
  symptoms: {
    'fever': { conditions: ['Viral Fever', 'Flu', 'COVID-19', 'Bacterial Infection'], specialist: 'General Physician', urgency: 'medium' },
    'cough': { conditions: ['Common Cold', 'Bronchitis', 'Asthma', 'COVID-19'], specialist: 'General Physician', urgency: 'low' },
    'chest pain': { conditions: ['Angina', 'Acid Reflux', 'Muscle Strain', 'Heart Issue'], specialist: 'Cardiologist', urgency: 'high' },
    'headache': { conditions: ['Tension Headache', 'Migraine', 'Sinusitis', 'Dehydration'], specialist: 'General Physician', urgency: 'low' },
    'skin rash': { conditions: ['Allergic Reaction', 'Eczema', 'Dermatitis', 'Fungal Infection'], specialist: 'Dermatologist', urgency: 'medium' },
    'joint pain': { conditions: ['Arthritis', 'Gout', 'Injury', 'Lupus'], specialist: 'Orthopedic', urgency: 'medium' },
    'stomach pain': { conditions: ['Gastritis', 'Food Poisoning', 'IBS', 'Ulcer'], specialist: 'General Physician', urgency: 'medium' },
    'breathing difficulty': { conditions: ['Asthma', 'Anxiety', 'Pneumonia', 'Heart Issue'], specialist: 'General Physician', urgency: 'high' },
    'child fever': { conditions: ['Viral Infection', 'Teething', 'Ear Infection'], specialist: 'Pediatrician', urgency: 'medium' },
    'pregnancy': { conditions: ['Prenatal Care', 'Routine Checkup'], specialist: 'Gynecologist', urgency: 'low' },
    'back pain': { conditions: ['Muscle Strain', 'Slipped Disc', 'Poor Posture'], specialist: 'Orthopedic', urgency: 'low' },
    'sore throat': { conditions: ['Viral Pharyngitis', 'Strep Throat', 'Allergy'], specialist: 'ENT', urgency: 'low' },
    'dizziness': { conditions: ['Vertigo', 'Low BP', 'Dehydration', 'Anemia'], specialist: 'General Physician', urgency: 'medium' },
    'anxiety': { conditions: ['Anxiety Disorder', 'Stress', 'Panic Attack'], specialist: 'General Physician', urgency: 'low' },
  },
  healthTips: [
    "💧 Drink 8 glasses of water daily",
    "🏃 30 mins exercise daily improves heart health",
    "😴 7-8 hours sleep is essential",
    "🥗 Eat more fruits and vegetables",
    "🧼 Wash hands frequently to prevent infections",
    "💉 Keep vaccinations up to date",
    "🚭 Avoid smoking and limit alcohol",
    "🧘 Practice meditation for mental health"
  ],
  emergencySigns: ['chest pain', 'breathing difficulty', 'severe bleeding', 'unconscious', 'stroke', 'heart attack']
};

// AI Symptom Checker
router.post('/symptom-check', (req, res) => {
  try {
    const { symptoms, age, gender } = req.body;
    if (!symptoms) return res.status(400).json({ message: 'Symptoms required' });

    const input = symptoms.toLowerCase();
    let matched = [];
    let specialists = new Set();
    let maxUrgency = 'low';
    const urgencyOrder = { low: 1, medium: 2, high: 3 };

    // Find matching symptoms
    for (const [key, data] of Object.entries(medicalKB.symptoms)) {
      if (input.includes(key) || key.split(' ').some(word => input.includes(word))) {
        matched.push({ symptom: key, ...data });
        specialists.add(data.specialist);
        if (urgencyOrder[data.urgency] > urgencyOrder[maxUrgency]) maxUrgency = data.urgency;
      }
    }

    // If no direct match, try keyword matching
    if (matched.length === 0) {
      const words = input.split(/[^a-z]+/);
      for (const word of words) {
        if (word.length < 3) continue;
        for (const [key, data] of Object.entries(medicalKB.symptoms)) {
          if (key.includes(word) || word.includes(key)) {
            if (!matched.find(m => m.symptom === key)) {
              matched.push({ symptom: key, ...data });
              specialists.add(data.specialist);
            }
          }
        }
      }
    }

    // Default if still no match
    if (matched.length === 0) {
      matched.push({ symptom: 'general', conditions: ['General Health Concern'], specialist: 'General Physician', urgency: 'low' });
      specialists.add('General Physician');
    }

    // Check emergency
    const isEmergency = medicalKB.emergencySigns.some(sign => input.includes(sign));
    if (isEmergency) maxUrgency = 'high';

    // Generate AI response
    const allConditions = [...new Set(matched.flatMap(m => m.conditions))];
    const recommendations = {
      possibleConditions: allConditions.slice(0, 5),
      recommendedSpecialists: Array.from(specialists),
      urgency: maxUrgency,
      isEmergency,
      advice: isEmergency 
        ? "🚨 URGENT: Please visit emergency or call doctor immediately! This could be serious."
        : maxUrgency === 'high' 
        ? "⚠️ Please consult doctor within 24 hours. Don't ignore these symptoms."
        : maxUrgency === 'medium'
        ? "📋 Consult doctor in 2-3 days. Monitor symptoms and take rest."
        : "✅ Likely minor issue. Home care and monitor. Consult if worsens in 3-5 days.",
      homeCare: [
        "Rest and stay hydrated",
        "Monitor temperature if fever",
        "Avoid self-medication with antibiotics",
        "Keep track of symptoms duration",
        "Maintain healthy diet"
      ],
      whenToSeekHelp: [
        "Symptoms worsen or persist >3 days",
        "High fever >101°F for >2 days",
        "Difficulty breathing or chest pain",
        "Severe pain or bleeding"
      ],
      matchedSymptoms: matched.map(m => m.symptom)
    };

    res.json({
      input: symptoms,
      age, gender,
      aiAnalysis: recommendations,
      disclaimer: "⚠️ This is AI-generated information for educational purposes only. Not a medical diagnosis. Always consult a qualified doctor.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AI Health Chat Assistant (rule-based, offline)
router.post('/chat', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const input = message.toLowerCase().trim();
    let response = "";
    let suggestions = [];

    // Greetings
    if (/^(hi|hello|hey|good morning|good evening)/i.test(input)) {
      response = "👋 Hello! I'm your Healthier AI Assistant. I can help with:\n\n• Symptom checking\n• Health tips\n• Finding right specialist\n• General health questions\n\nHow can I help you today? (e.g., 'I have fever and cough')";
    }
    // Emergency
    else if (medicalKB.emergencySigns.some(s => input.includes(s)) || input.includes('emergency') || input.includes('urgent')) {
      response = "🚨 If this is an emergency (chest pain, breathing difficulty, severe bleeding, unconsciousness), please:\n\n1. Call emergency: 102 (India) or 911\n2. Go to nearest ER immediately\n3. Don't wait for AI response\n\nIf not emergency, describe your symptoms and I can guide you to right specialist.";
      suggestions = ["Find Cardiologist", "Book Appointment", "Emergency Contacts"];
    }
    // Symptom related
    else if (input.includes('fever') || input.includes('cough') || input.includes('pain') || input.includes('symptom')) {
      response = `I see you mentioned health concerns. Let me help!\n\nFor "${message}", I recommend:\n\n1. Use our **AI Symptom Checker** for detailed analysis\n2. Book appointment with suggested specialist\n3. Meanwhile: rest, hydrate, monitor symptoms\n\nWould you like me to check your symptoms in detail?`;
      suggestions = ["Check Symptoms with AI", "Find Doctor", "Health Records"];
    }
    // Doctor booking
    else if (input.includes('doctor') || input.includes('appointment') || input.includes('book')) {
      response = "📅 I can help you find the right doctor!\n\n• Tell me your symptoms → I'll suggest specialist\n• Go to Doctors page → Filter by specialization\n• Book instantly → Video/Chat/In-person\n\nWhat symptoms do you have? Or which specialist do you need?";
      suggestions = ["Cardiologist", "Dermatologist", "Pediatrician", "General Physician"];
    }
    // Medicine / prescription
    else if (input.includes('medicine') || input.includes('prescription') || input.includes('tablet')) {
      response = "💊 About medicines:\n\n• Never self-medicate with antibiotics\n• Always follow doctor's prescription\n• Check dosage and timing carefully\n• Complete full course if prescribed\n• Store medicines properly\n\nIf you have a prescription from consultation, you can view it in Dashboard → Consultation Room.\n\nDo you have a specific medicine question?";
      suggestions = ["View My Prescriptions", "Health Records", "Consult Doctor"];
    }
    // Health tips
    else if (input.includes('health tip') || input.includes('healthy') || input.includes('diet') || input.includes('exercise')) {
      const tips = medicalKB.healthTips.sort(() => 0.5 - Math.random()).slice(0, 3);
      response = `🌟 Health Tips for you:\n\n${tips.join('\n')}\n\nWant more personalized tips? Tell me your age and lifestyle!`;
      suggestions = ["More Tips", "Book Health Checkup", "Symptom Checker"];
    }
    // Default
    else {
      response = `Thanks for asking: "${message}"\n\nI'm Healthier AI - your offline health assistant. I can:\n\n🔍 **Symptom Check**: Describe symptoms (e.g., "fever and headache for 2 days")\n👨‍⚕️ **Find Doctor**: Tell me specialist needed\n📋 **Health Info**: Ask about diet, exercise, prevention\n🚨 **Emergency**: I detect urgency and guide you\n\n⚠️ I'm not a doctor - for diagnosis, please consult qualified doctor via our video consultation!\n\nWhat would you like to know?`;
      suggestions = ["Check Symptoms", "Find Doctor", "Health Tips", "Emergency Help"];
    }

    res.json({
      query: message,
      response,
      suggestions,
      isEmergency: medicalKB.emergencySigns.some(s => input.includes(s)),
      disclaimer: "AI for education only, not medical diagnosis",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AI Triage - before booking
router.post('/triage', (req, res) => {
  try {
    const { symptoms, age, duration, severity } = req.body;
    const input = (symptoms || '').toLowerCase();
    
    let score = 0;
    if (severity === 'severe') score += 3;
    else if (severity === 'moderate') score += 2;
    else score += 1;

    if (duration && parseInt(duration) > 7) score += 1;
    if (age && (parseInt(age) < 5 || parseInt(age) > 65)) score += 1;
    if (medicalKB.emergencySigns.some(s => input.includes(s))) score += 5;

    let level = 'routine';
    let waitTime = '2-3 days';
    if (score >= 5) { level = 'emergency'; waitTime = 'Immediately / ER'; }
    else if (score >= 3) { level = 'urgent'; waitTime = 'Within 24 hours'; }
    else if (score >= 2) { level = 'semi-urgent'; waitTime = '1-2 days'; }

    res.json({
      triageLevel: level,
      score,
      recommendedWait: waitTime,
      action: level === 'emergency' ? 'Go to ER / Call doctor now' : level === 'urgent' ? 'Book appointment today' : 'Book within few days',
      disclaimer: "Triage for guidance only"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Health tips random
router.get('/tips', (req, res) => {
  const tips = medicalKB.healthTips.sort(() => 0.5 - Math.random()).slice(0, 5);
  res.json({ tips, count: tips.length });
});

export default router;
