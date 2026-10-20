// Stage 3: Prompt Blitz Question Bank (Jos TechFest 2026)
// Theme: AI x Industry · Sarau Event Center, Jos
// 10 questions, 20s timer per question, speed-weighted scoring (5 - 15 points)

export const QUIZ_QUESTIONS = [
  {
    id: 'blitz-1',
    sponsor: 'PICTDA & Plateau Innovates',
    topic: 'Plateau Agritech AI',
    question: 'How is computer vision currently deployed by agritech startups on the Jos Plateau to protect Irish potato harvests?',
    options: [
      'Automated early blight detection via drone & smartphone leaf imagery',
      'Using AI to dig the soil with robotic spoons',
      'Playing classical symphony music to potato roots',
      'Watermarking potatoes with NFT barcodes'
    ],
    correctIndex: 0,
    explanation: 'Computer vision models trained on local foliage identify early and late blight on potato crops days before visible damage spreads, saving up to 40% of yields.'
  },
  {
    id: 'blitz-2',
    sponsor: 'Jos TechFest Theme',
    topic: 'AI x Industry Architecture',
    question: 'In industrial AI applications, what is the primary role of "Edge AI" compared to central Cloud AI?',
    options: [
      'Processing sensor data directly on venue/factory hardware with zero cloud latency',
      'Storing data on external floppy disks',
      'Sending paper faxes between factory machines',
      'Increasing energy bills unnecessarily'
    ],
    correctIndex: 0,
    explanation: 'Edge AI runs neural models directly on gateways and local microcontrollers, guaranteeing real-time safety shutoffs and zero dependency on unstable internet.'
  },
  {
    id: 'blitz-3',
    sponsor: 'Paystack',
    topic: 'Fintech Automation',
    question: 'What technique do modern payment processors use to detect and halt automated credit card fraud in under 100 milliseconds?',
    options: [
      'Real-time anomaly detection models analyzing velocity and device fingerprints',
      'Calling each customer on landline before charging',
      'Flipping a coin at checkout',
      'Asking the customer to mail a handwritten signature'
    ],
    correctIndex: 0,
    explanation: 'Machine learning classifiers analyze hundreds of transaction features within milliseconds to flag suspicious velocity spikes and synthetic identities.'
  },
  {
    id: 'blitz-4',
    sponsor: 'nHub Nigeria',
    topic: 'Plateau Tech History',
    question: 'Why is Jos, Plateau State historically celebrated as a premier technology talent hub in Nigeria?',
    options: [
      'Pioneering tech communities (nHub), cooler climate for hardware labs, and high graduate density',
      'Being the only city with access to electricity',
      'Having the world’s largest underwater data cables',
      'Having no competitive developers'
    ],
    correctIndex: 0,
    explanation: 'Jos enjoys a thriving developer ecosystem nurtured since 2015 by nHub, premier universities (UNIJOS, Plateau Poly), and an ideal temperate climate for knowledge work.'
  },
  {
    id: 'blitz-5',
    sponsor: 'GDG Jos',
    topic: 'Generative AI & LLMs',
    question: 'What does "Retrieval-Augmented Generation" (RAG) provide to an enterprise LLM system?',
    options: [
      'Grounding the model’s answers with private, up-to-date company documents and databases',
      'Retraining the entire base model from scratch every evening',
      'Generating random fictional responses for fun',
      'Translating text into 1990s HTML tags'
    ],
    correctIndex: 0,
    explanation: 'RAG retrieves relevant private knowledge chunks from vector databases at query time, drastically reducing hallucinations and keeping responses accurate.'
  },
  {
    id: 'blitz-6',
    sponsor: 'Sarau Event Hub',
    topic: 'Autonomous Systems',
    question: 'In industrial robotics, what is an "Operator in the Loop" (HITL) architecture designed to do?',
    options: [
      'Letting AI handle routine automation while escalating ambiguous edge cases to a human expert',
      'Forcing humans to manually approve every single microsecond calculation',
      'Eliminating all human involvement permanently',
      'Creating an infinite loop that crashes the server'
    ],
    correctIndex: 0,
    explanation: 'Human-in-the-Loop (HITL) automates 95% of routine workflows while giving human operators oversight on high-stakes anomaly exceptions.'
  },
  {
    id: 'blitz-7',
    sponsor: 'AltSchool Africa',
    topic: 'Model Optimization',
    question: 'What is the purpose of "Quantization" (e.g. 4-bit or 8-bit) when deploying AI models onto consumer devices?',
    options: [
      'Reducing model memory footprint and compute requirements with minimal accuracy loss',
      'Multiplying the model size by 10 to fill up storage',
      'Deleting the training weights randomly',
      'Changing the coding language from Python to Fortran'
    ],
    correctIndex: 0,
    explanation: 'Quantization reduces floating-point precision (FP16/FP32 down to INT8/INT4), enabling LLMs to run smoothly on edge servers and affordable mobile phones.'
  },
  {
    id: 'blitz-8',
    sponsor: 'MTN 5G',
    topic: 'Industrial IoT',
    question: 'In automated smart manufacturing and mining on the Plateau, what is a "Digital Twin"?',
    options: [
      'A real-time virtual simulation that mirrors physical assets and operational states',
      'An identical twin brother who works as a programmer',
      'A backup copy of Windows 98',
      'A second monitor on your desk'
    ],
    correctIndex: 0,
    explanation: 'A Digital Twin is a software representation of physical equipment fed with live IoT sensor telemetry to predict component failure before downtime occurs.'
  },
  {
    id: 'blitz-9',
    sponsor: 'NITDA',
    topic: 'African AI Sovereignty',
    question: 'Why is collecting local linguistic and cultural datasets critical for Nigerian AI development?',
    options: [
      'Preventing cultural bias and ensuring AI tools effectively serve indigenous languages like Hausa, Yoruba & Igbo',
      'Because global models already speak all local slang perfectly',
      'To sell user phone books to spam marketers',
      'It has no practical importance'
    ],
    correctIndex: 0,
    explanation: 'Without local datasets, AI tools fail to understand Nigerian nuances, local trade dialects, and contextual community needs.'
  },
  {
    id: 'blitz-10',
    sponsor: 'Jos AI Collective',
    topic: 'Autonomous Agents',
    question: 'What distinguishes an "Autonomous AI Agent" from a standard chatbot like ChatGPT?',
    options: [
      'Agents can plan multi-step tasks, use external tools/APIs, and execute actions to achieve a goal',
      'Agents can only reply with emojis',
      'Agents do not use machine learning',
      'Agents can only run when you plug in headphones'
    ],
    correctIndex: 0,
    explanation: 'Autonomous agents evaluate objectives, plan sequences, execute tool calls (e.g., database writes, emails, code runs), and inspect intermediate outputs autonomously.'
  }
];

export const calculateBlitzScore = (secondsLeft) => {
  // 20s timer
  // 15-20s left: 15 points (lightning fast)
  // 10-14s left: 12 points
  // 5-9s left: 9 points
  // 1-4s left: 6 points
  // 0s: 5 points
  if (secondsLeft >= 15) return 15;
  if (secondsLeft >= 10) return 12;
  if (secondsLeft >= 5) return 9;
  if (secondsLeft >= 1) return 6;
  return 5;
};
