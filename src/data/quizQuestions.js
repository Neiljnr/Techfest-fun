// Stage 3: Prompt Blitz Question Bank (Jos TechFest 2026)
// Theme: AI x Industry · Sarau Event Center, Jos
// The server owns the answer key and scores ten points for each correct answer.

export const QUIZ_QUESTIONS = [
  {
    id: 'blitz-1',
    sponsor: 'PICTDA & Plateau Innovates',
    topic: 'Plateau Agritech AI',
    question: 'How is computer vision currently deployed by agritech startups on the Jos Plateau to protect Irish potato harvests?',
    options: [
      'Using AI to dig the soil with robotic spoons',
      'Playing classical symphony music to potato roots',
      'Automated early blight detection via drone & smartphone leaf imagery',
      'Watermarking potatoes with NFT barcodes'
    ],
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
    explanation: 'Edge AI runs neural models directly on gateways and local microcontrollers, guaranteeing real-time safety shutoffs and zero dependency on unstable internet.'
  },
  {
    id: 'blitz-3',
    sponsor: 'Paystack',
    topic: 'Fintech Automation',
    question: 'What technique do modern payment processors use to detect and halt automated credit card fraud in under 100 milliseconds?',
    options: [
      'Calling each customer on landline before charging',
      'Flipping a coin at checkout',
      'Asking the customer to mail a handwritten signature',
      'Real-time anomaly detection models analyzing velocity and device fingerprints'
    ],
    explanation: 'Machine learning classifiers analyze hundreds of transaction features within milliseconds to flag suspicious velocity spikes and synthetic identities.'
  },
  {
    id: 'blitz-4',
    sponsor: 'nHub Nigeria',
    topic: 'Plateau Tech History',
    question: 'Why is Jos, Plateau State historically celebrated as a premier technology talent hub in Nigeria?',
    options: [
      'Being the only city with access to electricity',
      'Pioneering tech communities (nHub), cooler climate for hardware labs, and high graduate density',
      'Having the world’s largest underwater data cables',
      'Having no competitive developers'
    ],
    explanation: 'Jos enjoys a thriving developer ecosystem nurtured since 2015 by nHub, premier universities (UNIJOS, Plateau Poly), and an ideal temperate climate for knowledge work.'
  },
  {
    id: 'blitz-5',
    sponsor: 'GDG Jos',
    topic: 'Generative AI & LLMs',
    question: 'What does "Retrieval-Augmented Generation" (RAG) provide to an enterprise LLM system?',
    options: [
      'Retraining the entire base model from scratch every evening',
      'Generating random fictional responses for fun',
      'Grounding the model’s answers with private, up-to-date company documents and databases',
      'Translating text into 1990s HTML tags'
    ],
    explanation: 'RAG retrieves relevant private knowledge chunks from vector databases at query time, drastically reducing hallucinations and keeping responses accurate.'
  },
  {
    id: 'blitz-6',
    sponsor: 'Sarau Event Hub',
    topic: 'Autonomous Systems',
    question: 'In industrial robotics, what is an "Operator in the Loop" (HITL) architecture designed to do?',
    options: [
      'Forcing humans to manually approve every single microsecond calculation',
      'Letting AI handle routine automation while escalating ambiguous edge cases to a human expert',
      'Eliminating all human involvement permanently',
      'Creating an infinite loop that crashes the server'
    ],
    explanation: 'Human-in-the-Loop (HITL) automates 95% of routine workflows while giving human operators oversight on high-stakes anomaly exceptions.'
  },
  {
    id: 'blitz-7',
    sponsor: 'AltSchool Africa',
    topic: 'Model Optimization',
    question: 'What is the purpose of "Quantization" (e.g. 4-bit or 8-bit) when deploying AI models onto consumer devices?',
    options: [
      'Multiplying the model size by 10 to fill up storage',
      'Deleting the training weights randomly',
      'Changing the coding language from Python to Fortran',
      'Reducing model memory footprint and compute requirements with minimal accuracy loss'
    ],
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
    explanation: 'A Digital Twin is a software representation of physical equipment fed with live IoT sensor telemetry to predict component failure before downtime occurs.'
  },
  {
    id: 'blitz-9',
    sponsor: 'NITDA',
    topic: 'African AI Sovereignty',
    question: 'Why is collecting local linguistic and cultural datasets critical for Nigerian AI development?',
    options: [
      'Because global models already speak all local slang perfectly',
      'To sell user phone books to spam marketers',
      'Preventing cultural bias and ensuring AI tools effectively serve indigenous languages like Hausa, Yoruba & Igbo',
      'It has no practical importance'
    ],
    explanation: 'Without local datasets, AI tools fail to understand Nigerian nuances, local trade dialects, and contextual community needs.'
  },
  {
    id: 'blitz-10',
    sponsor: 'Jos AI Collective',
    topic: 'Autonomous Agents',
    question: 'What distinguishes an "Autonomous AI Agent" from a standard chatbot like ChatGPT?',
    options: [
      'Agents can only reply with emojis',
      'Agents do not use machine learning',
      'Agents can only run when you plug in headphones',
      'Agents can plan multi-step tasks, use external tools/APIs, and execute actions to achieve a goal'
    ],
    explanation: 'Autonomous agents evaluate objectives, plan sequences, execute tool calls (e.g., database writes, emails, code runs), and inspect intermediate outputs autonomously.'
  },
  {
    id: 'blitz-11',
    sponsor: 'Jos TechFest',
    topic: 'Responsible AI',
    question: 'Why should a high-impact AI workflow include human review for uncertain cases?',
    options: [
      'To make every decision slower, even when the result is clear',
      'To review consequential or uncertain decisions and give people a path to appeal',
      'To remove the need to measure model performance',
      'To let the model collect any data it wants'
    ],
    explanation: 'Human review adds accountability where mistakes can have serious consequences, and gives people a way to challenge decisions.'
  },
  {
    id: 'blitz-12',
    sponsor: 'Jos TechFest',
    topic: 'Cybersecurity',
    question: 'How does multi-factor authentication help protect an account if its password is stolen?',
    options: [
      'It asks for another proof of identity, such as an authenticator code or security key',
      'It makes the stolen password expire on every website',
      'It hides the account from the internet',
      'It automatically reverses any fraudulent payment'
    ],
    explanation: 'A second, separate proof of identity makes a stolen password alone less likely to be enough to access the account.'
  },
  {
    id: 'blitz-13',
    sponsor: 'Jos TechFest',
    topic: 'Prompt Design',
    question: 'Which instruction is most likely to produce a useful, consistent AI response?',
    options: [
      'Tell the model to guess what you need',
      'Repeat the same request several times',
      'State the goal, relevant context, constraints, and desired output format',
      'Remove all context so the prompt is shorter'
    ],
    explanation: 'A clear goal, context, constraints, and output format give the model a practical target to follow.'
  },
  {
    id: 'blitz-14',
    sponsor: 'Jos TechFest',
    topic: 'Reliable Fintech',
    question: 'A payment request times out, so an app retries it. What does an idempotency key help prevent?',
    options: [
      'The payment being processed twice for the same request',
      'The customer seeing the payment receipt',
      'The bank applying exchange rates',
      'The app encrypting its network connection'
    ],
    explanation: 'An idempotency key lets a payment service recognize a retry as the same request and avoid charging twice.'
  },
  {
    id: 'blitz-15',
    sponsor: 'Jos TechFest',
    topic: 'Data Privacy',
    question: 'What does data minimization mean when building a digital service?',
    options: [
      'Collect and keep only the personal data needed for the stated purpose',
      'Collect every available detail in case it becomes useful later',
      'Keep personal data forever to simplify future updates',
      'Share user records with every connected service by default'
    ],
    explanation: 'Data minimization reduces privacy risk by limiting collection and retention to what the service actually needs.'
  }
];
