/* ==========================================================================
   MIRELLE — site data & configuration
   Everything editable (prices, services, team, articles, reviews, config)
   lives in this one file. No build step needed.
   ========================================================================== */
window.MIRELLE = window.MIRELLE || {};

/* ---------- INTEGRATION CONFIG (replace with your real values) ---------- */
MIRELLE.config = {
  brand: 'MIRELLE',
  descriptor: 'Premium Beauty & Hair Studio',
  // Calendly: replace with your real scheduling link
  calendlyUrl: 'https://calendly.com/mirelle-studio/consultation',
  // Constant Contact: paste your sign-up form action URL here to enable live signup.
  // Until then, the newsletter form opens a pre-filled email request instead of faking success.
  constantContactAction: '',
  // Optional form backend (Formspree, Getform, etc.) for the contact form.
  // Until set, the contact form opens a pre-filled email to `email`.
  contactEndpoint: '',
  email: 'hello@mirelle-studio.com',
  phone: '+1 (212) 555-0142',
  whatsapp: '12125550142',
  address: ['28 Mercer Street', 'New York, NY 10013'],
  mapQuery: '28 Mercer Street, New York, NY 10013',
  hours: [
    ['Monday', 'Closed'],
    ['Tuesday – Friday', '10:00 – 19:00'],
    ['Saturday', '09:00 – 18:00'],
    ['Sunday', '11:00 – 16:00']
  ],
  social: [
    { name: 'Instagram', url: 'https://instagram.com/' },
    { name: 'Facebook', url: 'https://facebook.com/' },
    { name: 'Pinterest', url: 'https://pinterest.com/' },
    { name: 'TikTok', url: 'https://tiktok.com/' }
  ],
  siteUrl: 'https://mirelle-studio.com'
};

/* ---------- IMAGES ---------- */
MIRELLE.img = function (key, small) {
  var base = (MIRELLE.root || '') + 'assets/images/';
  return base + key + (small ? '-sm' : '') + '.webp';
};
/* focus crops so the 6 supplied photographs read as many different frames */
MIRELLE.crop = {
  interior:   { full: '50% 50%', mirrors: '12% 50%', wash: '88% 40%', lounge: '95% 80%', chairs: '30% 85%' },
  portrait:   { full: '50% 30%', stylist: '15% 22%', model: '70% 35%', hair: '45% 85%' },
  blowdry:    { full: '50% 40%', stylist: '28% 25%', model: '70% 40%', hair: '75% 75%' },
  reception:  { full: '50% 50%', lounge: '12% 70%', desk: '88% 55%', wall: '45% 40%' },
  team:       { full: '50% 40%', tools: '30% 80%', centre: '50% 30%', brushes: '80% 70%' },
  'team-isabella': { full: '50% 30%' }, 'member-isabella': { full: '50% 20%' }, 'member-amara': { full: '50% 20%' }, 'member-clara': { full: '50% 20%' }, 'member-sofia': { full: '50% 20%' }, 'team-amara': { full: '50% 30%' }, 'team-nina': { full: '50% 30%' },
  skin:       { full: '70% 35%', face: '75% 30%', tone: '40% 50%', shoulder: '85% 85%' }
};

/* ---------- NAVIGATION ---------- */
MIRELLE.nav = [
  { label: 'Home', href: 'index.html' },
  { label: 'Services', href: 'services.html' },
  { label: 'About', href: 'about.html' },
  { label: 'Journal', href: 'journal.html' },
  { label: 'Contact', href: 'contact.html' }
];

/* ---------- SERVICES ---------- */
MIRELLE.categories = [
  { id: 'cuts',     name: 'Haircuts & Styling' },
  { id: 'colour',   name: 'Hair Coloring' },
  { id: 'treat',    name: 'Hair Treatments' },
  { id: 'ext',      name: 'Hair Extensions' },
  { id: 'facial',   name: 'Facial Treatments' },
  { id: 'skin',     name: 'Skincare' },
  { id: 'bridal',   name: 'Bridal & Event Styling' }
];

MIRELLE.services = [
  { slug: 'signature-cut', cat: 'cuts', name: 'Signature Cut & Style', from: 95, duration: '60 min', img: ['portrait', 'full'],
    short: 'A precision cut shaped around your face, texture and routine, finished with a salon blow-dry.',
    long: 'Every signature cut begins with a conversation. Your stylist studies your hair\'s natural fall, density and growth pattern, then designs a cut that moves well and grows out gracefully. Includes a restorative wash, precision cut and a finished blow-dry.',
    includes: ['Personal consultation', 'Restorative wash & scalp massage', 'Precision cut', 'Blow-dry finish', 'Take-home styling guidance'] },
  { slug: 'blowout-styling', cat: 'cuts', name: 'Blowout & Occasion Styling', from: 65, duration: '45 min', img: ['blowdry', 'full'],
    short: 'Voluminous, glossy, long-lasting styling — from soft waves to sleek polish.',
    long: 'Our blowouts are built for hold and shine. Using heat-protective prep, round-brush technique and finishing oils, we create movement that lasts well beyond the evening.',
    includes: ['Wash & prep', 'Heat-protection treatment', 'Round-brush blowout', 'Finishing gloss'] },
  { slug: 'balayage', cat: 'colour', name: 'Hand-Painted Balayage', from: 220, duration: '3 hrs', img: ['portrait', 'hair'],
    short: 'Soft, sun-kissed dimension painted by hand for a natural grow-out.',
    long: 'Balayage at MIRELLE is a bespoke art. Colour is painted freehand to follow your cut, then toned and glossed for depth, warmth and a seamless grow-out between appointments.',
    includes: ['Colour consultation', 'Hand-painted lightening', 'Custom toner & gloss', 'Bond-protecting treatment', 'Finishing blow-dry'] },
  { slug: 'global-colour', cat: 'colour', name: 'Global Colour & Gloss', from: 140, duration: '2 hrs', img: ['blowdry', 'hair'],
    short: 'Rich, even colour with a mirror-like gloss — from deep espresso to warm caramel.',
    long: 'A single, considered shade applied with precision and sealed with a high-shine gloss. Ideal for refreshing tone, covering grey or deepening your natural colour.',
    includes: ['Shade consultation', 'Root-to-end colour', 'High-shine gloss', 'Blow-dry finish'] },
  { slug: 'keratin-smoothing', cat: 'treat', name: 'Keratin Smoothing Treatment', from: 260, duration: '2.5 hrs', img: ['portrait', 'model'],
    short: 'Frizz-free, silky movement that lasts for months.',
    long: 'A professional smoothing ritual that tames frizz, adds shine and cuts styling time dramatically while keeping natural movement intact.',
    includes: ['Clarifying prep', 'Keratin application', 'Heat seal', 'Aftercare kit'] },
  { slug: 'repair-ritual', cat: 'treat', name: 'Bond Repair Ritual', from: 85, duration: '45 min', img: ['blowdry', 'model'],
    short: 'Deep strengthening treatment for colour-treated or heat-stressed hair.',
    long: 'A three-step ritual that rebuilds strength from within, restoring elasticity and shine to tired, over-processed hair.',
    includes: ['Bond-building treatment', 'Deep conditioning mask', 'Steam infusion', 'Blow-dry'] },
  { slug: 'tape-in-extensions', cat: 'ext', name: 'Tape-In Extensions', from: 380, duration: '2 hrs', img: ['team', 'tools'],
    short: 'Seamless length and volume with ethically sourced, lightweight hair.',
    long: 'Lightweight, flat-lying tape-ins blended into your own hair for undetectable fullness. Includes colour matching and a custom blend cut.',
    includes: ['Colour matching', 'Application', 'Custom blend cut', 'Maintenance plan'] },
  { slug: 'signature-facial', cat: 'facial', name: 'MIRELLE Signature Facial', from: 120, duration: '75 min', img: ['skin', 'face'],
    short: 'A deeply restorative facial tailored to your skin\'s needs on the day.',
    long: 'Skin analysis, deep cleanse, gentle exfoliation, massage and a targeted mask — finished with professional-grade serums for visible radiance.',
    includes: ['Skin analysis', 'Deep cleanse & exfoliation', 'Facial massage', 'Treatment mask', 'SPF finish'] },
  { slug: 'glow-facial', cat: 'facial', name: 'Radiance Glow Facial', from: 150, duration: '60 min', img: ['skin', 'tone'],
    short: 'Brightening treatment for dull, tired or uneven skin.',
    long: 'Vitamin-rich acids and hydrating infusions refine texture and restore luminosity for an instant, healthy glow.',
    includes: ['Cleanse & prep', 'Brightening peel', 'Hydration infusion', 'LED finish'] },
  { slug: 'skin-consultation', cat: 'skin', name: 'Skin Consultation & Routine', from: 60, duration: '40 min', img: ['skin', 'full'],
    short: 'A personalised at-home routine built by a skin specialist.',
    long: 'Understand your skin type and goals, then leave with a simple, effective morning and evening routine curated from professional products.',
    includes: ['Skin analysis', 'Routine design', 'Product guidance', '4-week follow-up'] },
  { slug: 'hydration-treatment', cat: 'skin', name: 'Deep Hydration Treatment', from: 110, duration: '60 min', img: ['skin', 'shoulder'],
    short: 'Intensive moisture therapy for dry or dehydrated skin.',
    long: 'Layered hydration with hyaluronic infusions and a cooling mask to plump, soothe and strengthen the skin barrier.',
    includes: ['Cleanse', 'Hyaluronic infusion', 'Cooling mask', 'Barrier-repair serum'] },
  { slug: 'bridal-styling', cat: 'bridal', name: 'Bridal Hair & Trial', from: 320, duration: '2.5 hrs', img: ['blowdry', 'stylist'],
    short: 'Your wedding look, designed and rehearsed — with a full trial.',
    long: 'From romantic waves to polished updos, we design your bridal hair around your dress, veil and venue, with a full trial beforehand and on-the-day styling.',
    includes: ['Pre-wedding consultation', 'Full trial', 'Wedding-day styling', 'Veil placement', 'Touch-up kit'] },
  { slug: 'event-styling', cat: 'bridal', name: 'Event & Editorial Styling', from: 120, duration: '90 min', img: ['portrait', 'stylist'],
    short: 'Camera-ready styling for galas, shoots and special evenings.',
    long: 'Polished, long-lasting styling designed to look as good in person as it does on camera.',
    includes: ['Consultation', 'Prep & styling', 'Long-wear finish', 'Touch-up guidance'] }
];

/* ---------- TEAM ---------- */
MIRELLE.team = [
  { slug: 'isabella-reyes', name: 'Isabella Reyes', title: 'Founder & Creative Director', spec: 'Precision cutting & signature styling', exp: '18 years',
    img: ['member-isabella', 'full'], bio: 'Isabella founded MIRELLE with a simple belief: beauty should feel personal. Trained in London and Paris, she leads the studio\'s creative direction and still takes a select number of clients each week.' },
  { slug: 'amara-okafor', name: 'Amara Okafor', title: 'Senior Colour Specialist', spec: 'Balayage, tonal colour & curls', exp: '12 years',
    img: ['member-amara', 'full'], bio: 'Amara is known for lived-in, luminous colour. Her approach starts with texture and skin tone, creating shades that look effortlessly natural.' },
  { slug: 'clara-bennett', name: 'Clara Bennett', title: 'Lead Hair Stylist', spec: 'Cuts, blowouts & occasion styling', exp: '10 years',
    img: ['member-clara', 'full'], bio: 'Clara\'s signature is movement — cuts that fall beautifully without effort and blowouts that last. She is a favourite for editorial and event work.' },
  { slug: 'sofia-marchetti', name: 'Sofia Marchetti', title: 'Bridal & Event Artist', spec: 'Bridal hair, updos & trials', exp: '14 years',
    img: ['member-sofia', 'full'], bio: 'Sofia has styled hundreds of weddings. Calm, meticulous and endlessly creative, she designs bridal looks that photograph — and last — beautifully.' }
];

/* ---------- JOURNAL ---------- */
MIRELLE.articleCats = ['Haircare', 'Beauty Trends', 'Styling Guides', 'Skincare', 'Professional Advice', 'Salon News'];
MIRELLE.articles = [
  { slug: 'the-art-of-the-perfect-cut', cat: 'Styling Guides', title: 'The Art of the Perfect Cut', date: '2026-10-28', read: '5 min', featured: true, img: ['portrait', 'full'],
    excerpt: 'How a great cut starts long before the scissors come out.',
    body: ['A great haircut is a collaboration. Before any scissors appear, your stylist should be reading your hair — how it falls, where it parts, how it behaves on a humid day.',
      'At MIRELLE, every cut begins with a conversation about your routine, your wardrobe and the way you like to feel. We look at face shape, but also at lifestyle: how much time you want to spend styling, and how often you plan to return.',
      'The best cuts are not the most dramatic; they are the ones that make mornings easier. Ask your stylist how the cut will grow out — a well-designed shape should look good for weeks, not days.'] },
  { slug: 'warm-neutrals-colour-trend', cat: 'Beauty Trends', title: 'Warm Neutrals: The Colour Story of the Season', date: '2026-10-14', read: '4 min', featured: true, img: ['blowdry', 'hair'],
    excerpt: 'Espresso, caramel and champagne tones are replacing high-contrast colour.',
    body: ['This season, colour is softening. Rich espresso roots melt into caramel and champagne ribbons, creating dimension that looks expensive rather than obvious.',
      'The key is placement. Hand-painted balayage follows the natural fall of your hair, so light lands exactly where it would if the sun had done the work.',
      'Pair the colour with a glossing treatment every six to eight weeks to keep tone fresh and shine mirror-like.'] },
  { slug: 'five-habits-for-healthier-hair', cat: 'Haircare', title: 'Five Habits for Healthier-Looking Hair', date: '2026-09-30', read: '6 min', img: ['blowdry', 'model'],
    excerpt: 'Small changes to your routine that make a visible difference.',
    body: ['Healthy hair is built on habits. Start with water temperature — lukewarm water protects your cuticle and keeps colour from fading.',
      'Use a heat protectant every time you style, and let hair air-dry partway before using a blow-dryer. Replace one weekly wash with a deep-conditioning mask.',
      'Finally, book regular trims. Removing split ends every eight to twelve weeks prevents damage from travelling up the hair shaft.'] },
  { slug: 'building-a-simple-skin-routine', cat: 'Skincare', title: 'Building a Simple, Effective Skin Routine', date: '2026-09-12', read: '5 min', img: ['skin', 'face'],
    excerpt: 'Less is more — a three-step approach that works.',
    body: ['You do not need ten products. A cleanser, a treatment serum and a daily SPF form the foundation of almost every healthy routine.',
      'Introduce new products one at a time, giving skin two weeks to respond. This makes it easy to spot what works.',
      'A professional skin consultation can save months of trial and error — it is the fastest route to a routine that fits.'] },
  { slug: 'how-to-prepare-for-your-first-visit', cat: 'Professional Advice', title: 'How to Prepare for Your First Salon Visit', date: '2026-08-25', read: '3 min', img: ['reception', 'full'],
    excerpt: 'Bring inspiration, be honest about your routine, and ask questions.',
    body: ['Save a few reference photos, but also take pictures of your hair at its best and worst. This helps your stylist understand your texture and habits.',
      'Be honest about history: colour, treatments and how much time you really spend styling.',
      'Arrive a few minutes early and enjoy the space — the consultation is part of the experience.'] },
  { slug: 'welcome-to-the-new-mirelle-studio', cat: 'Salon News', title: 'Welcome to the New MIRELLE Studio', date: '2026-08-05', read: '2 min', img: ['interior', 'full'],
    excerpt: 'A new space designed for calm, craft and care.',
    body: ['We are delighted to open the doors to our new studio — a space of warm stone, soft light and quiet luxury, designed to make every appointment feel exceptional.',
      'Highlights include private styling stations, a dedicated skin suite and a lounge for pre-appointment consultations.',
      'We cannot wait to welcome you.'] },
  { slug: 'bridal-hair-timeline', cat: 'Styling Guides', title: 'The Bridal Hair Timeline: Six Months to Wedding Day', date: '2026-07-18', read: '7 min', img: ['blowdry', 'stylist'],
    excerpt: 'When to colour, trim, trial and treat in the lead-up.',
    body: ['Six months out: begin a hair-health plan with regular treatments and trims.',
      'Three months out: finalise colour and book your trial, bringing your veil or accessories.',
      'Two weeks out: final trim and gloss. On the day, trust your artist — and enjoy it.'] },
  { slug: 'glass-skin-facts', cat: 'Skincare', title: 'Glass Skin: What Actually Works', date: '2026-06-30', read: '4 min', img: ['skin', 'tone'],
    excerpt: 'Hydration, barrier care and patience beat any trend product.',
    body: ['The luminous, even look known as glass skin comes down to hydration and barrier health.',
      'Layer lightweight hydrating serums, protect with SPF and avoid over-exfoliating.',
      'Professional facials every four to six weeks help maintain texture and tone.'] }
];

/* ---------- PRICING ---------- */
MIRELLE.pricing = [
  { cat: 'Haircuts & Styling', rows: [['Signature Cut & Style', '60 min', '$95'], ['Cut & Finish (Senior Stylist)', '75 min', '$125'], ['Blowout & Styling', '45 min', '$65'], ['Fringe / Bang Trim', '15 min', '$20']] },
  { cat: 'Hair Coloring', rows: [['Root Retouch & Gloss', '90 min', '$110'], ['Global Colour & Gloss', '2 hrs', '$140'], ['Hand-Painted Balayage', '3 hrs', '$220'], ['Full Highlights', '3 hrs', '$260']] },
  { cat: 'Hair Treatments', rows: [['Bond Repair Ritual', '45 min', '$85'], ['Deep Conditioning Mask', '30 min', '$45'], ['Keratin Smoothing', '2.5 hrs', '$260']] },
  { cat: 'Hair Extensions', rows: [['Consultation & Colour Match', '30 min', 'Complimentary'], ['Tape-In Extensions', '2 hrs', '$380'], ['Maintenance Move-Up', '90 min', '$180']] },
  { cat: 'Facial Treatments', rows: [['MIRELLE Signature Facial', '75 min', '$120'], ['Radiance Glow Facial', '60 min', '$150'], ['Express Refresh Facial', '30 min', '$70']] },
  { cat: 'Skincare', rows: [['Skin Consultation & Routine', '40 min', '$60'], ['Deep Hydration Treatment', '60 min', '$110']] },
  { cat: 'Bridal & Event Styling', rows: [['Bridal Hair & Trial', '2.5 hrs', '$320'], ['Event & Editorial Styling', '90 min', '$120'], ['Bridal Party Styling (per person)', '60 min', '$135']] }
];
MIRELLE.packages = [
  { name: 'The Refresh', price: '$185', desc: 'Signature cut, gloss and a finishing blowout.', items: ['Signature Cut & Style', 'Gloss treatment', 'Finishing blowout'] },
  { name: 'The Glow', price: '$265', desc: 'A head-to-toe radiance ritual for hair and skin.', items: ['Bond Repair Ritual', 'Radiance Glow Facial', 'Blowout'], featured: true },
  { name: 'The Bridal Edit', price: '$520', desc: 'Everything you need for the wedding week.', items: ['Bridal trial', 'Wedding-day hair', 'Signature Facial', 'Touch-up kit'] }
];
MIRELLE.memberships = [
  { name: 'Essential', price: '$79', per: '/ month', perks: ['One blowout each month', '10% off all services', 'Priority booking'] },
  { name: 'Signature', price: '$149', per: '/ month', perks: ['Cut or facial each month', '15% off all services', 'Complimentary gloss add-on', 'Priority booking'], featured: true },
  { name: 'Atelier', price: '$289', per: '/ month', perks: ['Two services each month', '20% off all services', 'Complimentary take-home treatment', 'Dedicated stylist & concierge'] }
];

/* ---------- REVIEWS ---------- */
MIRELLE.reviews = [
  { name: 'Sarah Mitchell', role: 'Client since 2023', rating: 5, img: ['skin', 'face'],
    text: 'MIRELLE has completely changed my salon experience. The attention to detail and quality of service are exceptional.' },
  { name: 'Olivia Parker', role: 'Colour client', rating: 5, img: ['portrait', 'model'],
    text: 'From the moment I walked in, everything felt special. My stylist understood exactly what I wanted.' },
  { name: 'Emma Wilson', role: 'Bridal client', rating: 5, img: ['blowdry', 'model'],
    text: 'A beautiful atmosphere, talented professionals, and incredible results. I always look forward to coming back.' },
  { name: 'Grace Thompson', role: 'Facial client', rating: 5, img: ['skin', 'tone'],
    text: 'The best facial I have ever had. My therapist listened carefully and my skin has never looked better.' },
  { name: 'Natalie Cruz', role: 'Balayage client', rating: 5, img: ['team-nina', 'full'],
    text: 'Amara\'s colour is pure artistry. Soft, dimensional and it grew out beautifully. I will not go anywhere else.' },
  { name: 'Hannah Brooks', role: 'Treatment client', rating: 4, img: ['portrait', 'full'],
    text: 'My hair feels stronger and so much shinier after the repair ritual. Lovely team and a calm, elegant space.' }
];

/* ---------- GALLERY ---------- */
MIRELLE.galleryCats = ['Hair Transformation', 'Hair Styling', 'Hair Coloring', 'Bridal', 'Skincare', 'Salon Interior'];
MIRELLE.gallery = [
  { cat: 'Salon Interior', title: 'The Styling Floor', img: ['interior', 'full'], ratio: 'wide' },
  { cat: 'Hair Styling', title: 'Soft Editorial Waves', img: ['portrait', 'full'], ratio: 'tall' },
  { cat: 'Hair Coloring', title: 'Caramel Balayage', img: ['portrait', 'hair'], ratio: 'square' },
  { cat: 'Skincare', title: 'Radiance Facial', img: ['skin', 'full'], ratio: 'wide' },
  { cat: 'Hair Transformation', title: 'Volume & Movement', img: ['blowdry', 'full'], ratio: 'wide' },
  { cat: 'Salon Interior', title: 'Arched Mirror Stations', img: ['interior', 'mirrors'], ratio: 'tall' },
  { cat: 'Bridal', title: 'Bridal Trial', img: ['blowdry', 'stylist'], ratio: 'square' },
  { cat: 'Hair Styling', title: 'The Finishing Touch', img: ['portrait', 'stylist'], ratio: 'tall' },
  { cat: 'Salon Interior', title: 'Wash Suite', img: ['interior', 'wash'], ratio: 'square' },
  { cat: 'Skincare', title: 'Natural Glow', img: ['skin', 'face'], ratio: 'tall' },
  { cat: 'Hair Coloring', title: 'Warm Chestnut Gloss', img: ['blowdry', 'hair'], ratio: 'square' },
  { cat: 'Hair Transformation', title: 'Lived-In Layers', img: ['portrait', 'model'], ratio: 'tall' },
  { cat: 'Salon Interior', title: 'Arrival Lounge', img: ['reception', 'full'], ratio: 'wide' },
  { cat: 'Bridal', title: 'Romantic Finish', img: ['blowdry', 'model'], ratio: 'square' },
  { cat: 'Salon Interior', title: 'The Lounge', img: ['interior', 'lounge'], ratio: 'square' },
  { cat: 'Hair Styling', title: 'The MIRELLE Team', img: ['team', 'full'], ratio: 'wide' }
];

/* ---------- BRANDS (fictional placeholders — swap for your real partners) ---------- */
MIRELLE.brands = ['Maison Aurelle', 'Lumière Botanique', 'Vesper & Oak', 'Atelier Soleil', 'Noir Cashmere', 'Éclat Labs', 'Ondine Paris', 'Halcyon Hair', 'Solène', 'Velvet Root'];

/* ---------- FAQ ---------- */
MIRELLE.faq = [
  ['How far ahead should I book?', 'We recommend booking one to two weeks ahead, and four to six weeks for colour, bridal or weekend appointments.'],
  ['Do you offer consultations?', 'Yes. Every new client receives a complimentary consultation before any service begins.'],
  ['What is your cancellation policy?', 'Please give at least 24 hours\' notice to change or cancel an appointment.'],
  ['Which products do you use?', 'We work with carefully selected professional haircare and skincare brands chosen for performance and ingredient quality.']
];
