// 10+ Partners for Jos TechFest 2026 at Sarau Event Center
// Theme: AI x Industry

export const PARTNERS = [
  {
    id: 'partner-pictda',
    name: 'Plateau Innovates / PICTDA',
    booth: 'Booth 01 · Main Foyer',
    category: 'Government & Digital Policy',
    color: '#00E676',
    tagline: 'Driving Plateau State’s AI & Digital Economy',
    description: 'Plateau State Information and Communication Technology Development Agency is spearheading statewide innovation hubs and digital skills training for over 20,000 youth.',
    boothCode: 'JTF26-PICTDA-B01',
    task: {
      title: 'PICTDA AI Policy Micro-Challenge',
      prompt: 'Which sector has PICTDA prioritized for initial AI automation pilots across Plateau State in 2026?',
      options: [
        'Agritech & Grain Yield Forecasting',
        'Cryptocurrency Speculation',
        'Manual Paper Archival',
        'Offshore Gaming'
      ],
      correctIndex: 0,
      rewardText: 'Spot on! Plateau State’s AI pilots focus heavily on Agritech, potato blight detection, and farmer productivity.'
    }
  },
  {
    id: 'partner-sarau',
    name: 'Sarau Event & Tech Hub',
    booth: 'Booth 02 · Central Arena',
    category: 'Venue & Smart Logistics',
    color: '#00B0FF',
    tagline: 'The Home of Premier Plateau Tech Gatherings',
    description: 'Sarau Event Center is Jos’s flagship tech venue, featuring fiber gigabit infrastructure and smart attendee access control.',
    boothCode: 'JTF26-SARAU-B02',
    task: {
      title: 'Sarau Automation Demo',
      prompt: 'What IoT automation powers Sarau Event Center’s smart energy and air management system?',
      options: [
        'Smart occupancy-sensing IoT climate regulation',
        'Manual generator crank pulling',
        'Paper token turnstiles',
        'Candlelight backup'
      ],
      correctIndex: 0,
      rewardText: 'Correct! Sarau uses dynamic occupancy sensors to optimize cooling and cut power waste.'
    }
  },
  {
    id: 'partner-nhub',
    name: 'nHub Nigeria',
    booth: 'Booth 03 · Innovation Row',
    category: 'Incubator & Dev Community',
    color: '#FF9100',
    tagline: 'The Pioneer Tech Hub of Northern Nigeria',
    description: 'Founded in Jos, nHub has trained thousands of software engineers and seeded over 30 tech startups across Plateau and beyond.',
    boothCode: 'JTF26-NHUB-B03',
    task: {
      title: 'nHub Startup Trivia',
      prompt: 'In what year was nHub founded in Jos, inaugurating Northern Nigeria’s tech ecosystem?',
      options: [
        '2015',
        '2024',
        '1999',
        '2010'
      ],
      correctIndex: 0,
      rewardText: 'Legendary history! nHub was founded in 2015 and ignited the tech revolution on the Plateau.'
    }
  },
  {
    id: 'partner-altschool',
    name: 'AltSchool Africa',
    booth: 'Booth 04 · Talent Pavilion',
    category: 'EdTech & AI Engineering',
    color: '#7C4DFF',
    tagline: 'Upskilling the Next Million African Builders',
    description: 'AltSchool provides industry-certified diplomas in Software Engineering, Data Engineering, and Machine Learning.',
    boothCode: 'JTF26-ALTSCH-B04',
    task: {
      title: 'AltSchool Curriculum Sprint',
      prompt: 'Which specialized track prepares engineers to build custom RAG pipelines and deploy LLM agents?',
      options: [
        'AI & Machine Learning Engineering',
        'Basic Typing 101',
        'Calligraphy Fundamentals',
        'VHS Tape Restoration'
      ],
      correctIndex: 0,
      rewardText: 'Awesome! AltSchool’s AI Engineering track empowers developers to deploy production LLM agents.'
    }
  },
  {
    id: 'partner-paystack',
    name: 'Paystack',
    booth: 'Booth 05 · FinTech Alley',
    category: 'Payment Infrastructure',
    color: '#00C853',
    tagline: 'Modern Payments & Financial APIs for African Businesses',
    description: 'Paystack powers automated payment collections, recurring subscriptions, and transfers for modern companies.',
    boothCode: 'JTF26-PAYSTACK-B05',
    task: {
      title: 'Paystack Webhook Challenge',
      prompt: 'What webhook event notifies your application server when a customer completes a card or transfer payment?',
      options: [
        'charge.success',
        'user.crying',
        'wifi.disconnected',
        'card.melted'
      ],
      correctIndex: 0,
      rewardText: 'Precise! `charge.success` is the foundational webhook event for automating order fulfillment.'
    }
  },
  {
    id: 'partner-mtn',
    name: 'MTN 5G & Broadband',
    booth: 'Booth 06 · Connectivity Hub',
    category: 'Telecommunications & 5G',
    color: '#FFD700',
    tagline: 'Connecting Jos with Ultra-Low Latency 5G',
    description: 'MTN provides the high-capacity backbone powering real-time video streaming, cloud AI inference, and IoT sensors at TechFest.',
    boothCode: 'JTF26-MTN5G-B06',
    task: {
      title: '5G Edge Inference Query',
      prompt: 'Why is ultra-low latency 5G essential for autonomous robotics and industrial AI on factory floors?',
      options: [
        'Sub-millisecond feedback loop between sensors and edge AI models',
        'It changes the color of the robots',
        'It makes coffee brew faster',
        'It replaces human thought completely'
      ],
      correctIndex: 0,
      rewardText: 'Spot on! Low latency enables edge models to react to safety and operational hazards in real-time.'
    }
  },
  {
    id: 'partner-gdgjos',
    name: 'Google Developer Group Jos',
    booth: 'Booth 07 · Community Square',
    category: 'Developer Community',
    color: '#4285F4',
    tagline: 'Building with Google Cloud & Gemini in Jos',
    description: 'GDG Jos brings together hundreds of Plateau builders every month to hack on Android, Google Cloud, and AI.',
    boothCode: 'JTF26-GDGJOS-B07',
    task: {
      title: 'Gemini Multimodal Sprint',
      prompt: 'What key capability distinguishes Gemini 1.5/2.0 in processing industrial documents and video feeds?',
      options: [
        'Native multimodal context window of up to 2 million tokens',
        'Only reading plain text without images',
        'Requiring an 8-track magnetic tape',
        'Printing out physical dot-matrix pages'
      ],
      correctIndex: 0,
      rewardText: 'Nailed it! The massive multimodal context allows full video and blueprint reasoning.'
    }
  },
  {
    id: 'partner-nitda',
    name: 'NITDA Nigeria',
    booth: 'Booth 08 · Regulation & Standard',
    category: 'National Agency',
    color: '#00897B',
    tagline: 'National AI Strategy & Digital Innovation',
    description: 'The National Information Technology Development Agency leads Nigeria’s National Artificial Intelligence Strategy (NAIS).',
    boothCode: 'JTF26-NITDA-B08',
    task: {
      title: 'National AI Ethics Pulse',
      prompt: 'What pillar is central to Nigeria’s National AI Strategy to protect citizen sovereignty?',
      options: [
        'Ethical AI, Data Sovereignty, and Inclusive Local Language NLP',
        'Exporting all national data without restrictions',
        'Eliminating local software development',
        'Banning all computer algorithms'
      ],
      correctIndex: 0,
      rewardText: 'Excellent! Inclusive local data sovereignty and ethical AI guidelines safeguard national progress.'
    }
  },
  {
    id: 'partner-boi',
    name: 'Bank of Industry Tech Fund',
    booth: 'Booth 09 · Capital Corner',
    category: 'Venture & Capital Fund',
    color: '#2E7D32',
    tagline: 'Financing Scalable Hardware & Software Enterprises',
    description: 'BOI provides low-interest tech equity and debt financing for Nigerian hardware labs, agro-processing, and software ventures.',
    boothCode: 'JTF26-BOIFUND-B09',
    task: {
      title: 'Founder Capital Assessment',
      prompt: 'What metric do institutional venture lenders prioritize when assessing an industrial automation startup?',
      options: [
        'Unit economics, operational ROI for clients, and defensible tech',
        'Number of followers on Instagram alone',
        'How loud the pitch music is played',
        'Having a gold-plated laptop'
      ],
      correctIndex: 0,
      rewardText: 'Direct hit! Proven client ROI and sustainable unit economics unlock venture capital.'
    }
  },
  {
    id: 'partner-josaicollective',
    name: 'Jos AI Collective',
    booth: 'Booth 10 · Research Lab',
    category: 'Grassroots AI Research',
    color: '#EC407A',
    tagline: 'Plateau Language Models & Computer Vision for Agro-Yields',
    description: 'An open-source collective of Jos-based ML researchers building Hausa, Berom, and Ngas datasets for LLMs.',
    boothCode: 'JTF26-JOSAIC-B10',
    task: {
      title: 'Low-Resource NLP Challenge',
      prompt: 'What technique enables large language models to adapt efficiently to local Nigerian languages with small data?',
      options: [
        'Parameter-Efficient Fine-Tuning (LoRA / QLoRA) and multilingual tokenization',
        'Deleting the vocabulary file',
        'Converting text into Morse code',
        'Rebooting the server 10 times'
      ],
      correctIndex: 0,
      rewardText: 'Brilliant! LoRA and careful tokenization unlock high performance on low-resource African languages.'
    }
  }
];
