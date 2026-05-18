const sampleListings = [
  {
  title: "Aurora Sky Resort",
  description: "Luxury hillside resort with panoramic skyline views and infinity pool.",
  Image: {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    filename: "aurora-sky-resort"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      filename: "aurora-sky-resort-1"
    },
    {
      url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
      filename: "aurora-sky-resort-2"
    }
  ],
  price: 9700,
  location: "Shimla",
  country: "India",
  category: "Mountain",
  roomType: "Skyline Suite",
  totalRooms: 20,
  availableRooms: 7,
  geometry: {
    type: "Point",
    coordinates: [77.1734, 31.1048]
  }
},

{
  title: "Velvet Horizon Hotel",
  description: "Premium city hotel with rooftop lounge and luxury interiors.",
  Image: {
    url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    filename: "velvet-horizon-hotel"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      filename: "velvet-horizon-hotel-1"
    },
    {
      url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
      filename: "velvet-horizon-hotel-2"
    }
  ],
  price: 8900,
  location: "Bengaluru",
  country: "India",
  category: "City",
  roomType: "Executive Deluxe",
  totalRooms: 28,
  availableRooms: 11,
  geometry: {
    type: "Point",
    coordinates: [77.5946, 12.9716]
  }
},

{
  title: "Whispering Waves Resort",
  description: "Beachfront escape with private cottages and ocean breeze.",
  Image: {
    url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    filename: "whispering-waves-resort"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
      filename: "whispering-waves-resort-1"
    },
    {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      filename: "whispering-waves-resort-2"
    }
  ],
  price: 8400,
  location: "Goa",
  country: "India",
  category: "Beach",
  roomType: "Beach Villa",
  totalRooms: 18,
  availableRooms: 6,
  geometry: {
    type: "Point",
    coordinates: [73.8278, 15.4909]
  }
},

{
  title: "Crystal Mirage Palace",
  description: "Royal heritage palace with grand architecture and premium suites.",
  Image: {
    url: "https://images.unsplash.com/photo-1570213489059-0aac6626cade?auto=format&fit=crop&w=1200&q=80",
    filename: "crystal-mirage-palace"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1570213489059-0aac6626cade?auto=format&fit=crop&w=1200&q=80",
      filename: "crystal-mirage-palace-1"
    },
    {
      url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
      filename: "crystal-mirage-palace-2"
    }
  ],
  price: 12500,
  location: "Udaipur",
  country: "India",
  category: "Heritage",
  roomType: "Royal Heritage Suite",
  totalRooms: 15,
  availableRooms: 4,
  geometry: {
    type: "Point",
    coordinates: [73.7125, 24.5854]
  }
},

{
  title: "Pinewood Serenity Lodge",
  description: "Cozy forest lodge surrounded by pine trees and scenic landscapes.",
  Image: {
    url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
    filename: "pinewood-serenity-lodge"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
      filename: "pinewood-serenity-lodge-1"
    },
    {
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      filename: "pinewood-serenity-lodge-2"
    }
  ],
  price: 7200,
  location: "Nainital",
  country: "India",
  category: "Forest",
  roomType: "Woodland Cabin",
  totalRooms: 17,
  availableRooms: 5,
  geometry: {
    type: "Point",
    coordinates: [79.4591, 29.3919]
  }
},

{
  title: "Golden Maple Retreat",
  description: "Elegant retreat with mountain scenery and luxury wooden interiors.",
  Image: {
    url: "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=80",
    filename: "golden-maple-retreat"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=80",
      filename: "golden-maple-retreat-1"
    },
    {
      url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      filename: "golden-maple-retreat-2"
    }
  ],
  price: 8100,
  location: "Kasauli",
  country: "India",
  category: "Mountain",
  roomType: "Premium Chalet",
  totalRooms: 14,
  availableRooms: 4,
  geometry: {
    type: "Point",
    coordinates: [76.9643, 30.8986]
  }
},

{
  title: "Azure Coast Residency",
  description: "Modern oceanfront residency with spacious rooms and sea views.",
  Image: {
    url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
    filename: "azure-coast-residency"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
      filename: "azure-coast-residency-1"
    },
    {
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      filename: "azure-coast-residency-2"
    }
  ],
  price: 8600,
  location: "Kovalam",
  country: "India",
  category: "Beach",
  roomType: "Ocean Premium Room",
  totalRooms: 22,
  availableRooms: 9,
  geometry: {
    type: "Point",
    coordinates: [76.9784, 8.3988]
  }
},

{
  title: "Moonlight Orchid Resort",
  description: "Luxury resort with tropical gardens and elegant night ambiance.",
  Image: {
    url: "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80",
    filename: "moonlight-orchid-resort"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80",
      filename: "moonlight-orchid-resort-1"
    },
    {
      url: "https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?auto=format&fit=crop&w=1200&q=80",
      filename: "moonlight-orchid-resort-2"
    }
  ],
  price: 9300,
  location: "Munnar",
  country: "India",
  category: "Mountain",
  roomType: "Luxury Garden Suite",
  totalRooms: 19,
  availableRooms: 8,
  geometry: {
    type: "Point",
    coordinates: [77.0595, 10.0889]
  }
},

{
  title: "Silver Palm Escape",
  description: "Relaxing luxury property with private pools and premium hospitality.",
  Image: {
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    filename: "silver-palm-escape"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      filename: "silver-palm-escape-1"
    },
    {
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      filename: "silver-palm-escape-2"
    }
  ],
  price: 9900,
  location: "Alleppey",
  country: "India",
  category: "Beach",
  roomType: "Private Pool Villa",
  totalRooms: 13,
  availableRooms: 3,
  geometry: {
    type: "Point",
    coordinates: [76.3388, 9.4981]
  }
},

{
  title: "Forest Echo Retreat",
  description: "Nature retreat near dense forest with eco-friendly luxury cottages.",
  Image: {
    url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
    filename: "forest-echo-retreat"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
      filename: "forest-echo-retreat-1"
    },
    {
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      filename: "forest-echo-retreat-2"
    }
  ],
  price: 7600,
  location: "Coorg",
  country: "India",
  category: "Forest",
  roomType: "Eco Cottage",
  totalRooms: 16,
  availableRooms: 5,
  geometry: {
    type: "Point",
    coordinates: [75.8069, 12.3375]
  }
},
  {
    title: "Taj Mahal Palace Hotel",
    description: "Historic luxury hotel with sweeping views of the Arabian Sea, elegant rooms and world-class service.",
    Image: {
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      filename: "taj-mahal-palace"
    },
    images: [
      { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", filename: "taj-mahal-palace-1" },
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", filename: "taj-mahal-palace-2" }
    ],
    price: 12000,
    location: "Colaba",
    country: "India",
    category: "City",
    roomType: "Deluxe Room",
    totalRooms: 25,
    availableRooms: 9,
    geometry: {
      type: "Point",
      coordinates: [72.8204, 18.9220]
    }
  },
  {
    title: "Oberoi Udaivilas",
    description: "Royal lakeside resort with heritage architecture, private courtyards and scenic views of Lake Pichola.",
    Image: {
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      filename: "oberoi-udaivilas"
    },
    images: [
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", filename: "oberoi-udaivilas-1" },
      { url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80", filename: "oberoi-udaivilas-2" }
    ],
    price: 14000,
    location: "Udaipur",
    country: "India",
    category: "Heritage",
    roomType: "Court Room",
    totalRooms: 20,
    availableRooms: 5,
    geometry: {
      type: "Point",
      coordinates: [73.6804, 24.5768]
    }
  },
  {
    title: "Alila Diwa Goa",
    description: "Tranquil resort in scenic South Goa with spacious rooms, rice-paddy views and a private pool experience.",
    Image: {
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      filename: "alila-diwa-goa"
    },
    images: [
      { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", filename: "alila-diwa-goa-1" },
      { url: "https://images.unsplash.com/photo-1524777314-02b9e39f87f5?auto=format&fit=crop&w=1200&q=80", filename: "alila-diwa-goa-2" }
    ],
    price: 7800,
    location: "Majorda Beach",
    country: "India",
    category: "Beach",
    roomType: "Pool View Room",
    totalRooms: 22,
    availableRooms: 7,
    geometry: {
      type: "Point",
      coordinates: [73.9149, 15.2880]
    }
  },
  {
    title: "Taj Lake Palace",
    description: "Iconic heritage hotel floating on Lake Pichola, offering landmark luxury and panoramic palace views.",
    Image: {
      url: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1200&q=80",
      filename: "taj-lake-palace"
    },
    images: [
      { url: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1200&q=80", filename: "taj-lake-palace-1" },
      { url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80", filename: "taj-lake-palace-2" }
    ],
    price: 16000,
    location: "Udaipur",
    country: "India",
    category: "Heritage",
    roomType: "Heritage Suite",
    totalRooms: 18,
    availableRooms: 4,
    geometry: {
      type: "Point",
      coordinates: [73.6482, 24.5755]
    }
  },
  {
    title: "The Leela Kovalam",
    description: "Cliff-top beach resort in Kerala with private cabanas, ayurvedic spa treatments and sweeping sea views.",
    Image: {
      url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
      filename: "leela-kovalam"
    },
    images: [
      { url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80", filename: "leela-kovalam-1" },
      { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", filename: "leela-kovalam-2" }
    ],
    price: 8500,
    location: "Kovalam",
    country: "India",
    category: "Beach",
    roomType: "Sea View Suite",
    totalRooms: 24,
    availableRooms: 10,
    geometry: {
      type: "Point",
      coordinates: [76.9756, 8.4119]
    }
  },
  {
    title: "The Oberoi Vanyavilas",
    description: "Luxury tented resort near Ranthambore, perfect for wildlife safaris and elegant jungle stays.",
    Image: {
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      filename: "oberoi-vanyavilas"
    },
    images: [
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", filename: "oberoi-vanyavilas-1" },
      { url: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80", filename: "oberoi-vanyavilas-2" }
    ],
    price: 11000,
    location: "Ranthambore",
    country: "India",
    category: "Forest",
    roomType: "Luxury Tent",
    totalRooms: 16,
    availableRooms: 6,
    geometry: {
      type: "Point",
      coordinates: [76.5026, 26.0173]
    }
  },
  {
    title: "Rambagh Palace",
    description: "Grand palace hotel in Jaipur with royal interiors, sprawling gardens and signature dining.",
    Image: {
      url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
      filename: "rambagh-palace"
    },
    images: [
      { url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80", filename: "rambagh-palace-1" },
      { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", filename: "rambagh-palace-2" }
    ],
    price: 12500,
    location: "Jaipur",
    country: "India",
    category: "Heritage",
    roomType: "Heritage Room",
    totalRooms: 20,
    availableRooms: 8,
    geometry: {
      type: "Point",
      coordinates: [75.8068, 26.9190]
    }
  },
  {
    title: "The Fern Gir Forest Resort",
    description: "Eco-friendly villa retreat near Gir National Park with open terraces, wildlife vibes and warm hospitality.",
    Image: {
      url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      filename: "fern-gir-forest"
    },
    images: [
      { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", filename: "fern-gir-forest-1" },
      { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", filename: "fern-gir-forest-2" }
    ],
    price: 6800,
    location: "Gir",
    country: "India",
    category: "Forest",
    roomType: "Forest Villa",
    totalRooms: 12,
    availableRooms: 5,
    geometry: {
      type: "Point",
      coordinates: [70.9218, 21.1200]
    }
  },
  {
  title: "Blue Lagoon Resort",
  description: "Modern beachfront resort with spacious suites, sunset views and premium hospitality services.",
  Image: {
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    filename: "blue-lagoon-resort"
  },
  images: [
    { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", filename: "blue-lagoon-resort-1" },
    { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", filename: "blue-lagoon-resort-2" }
  ],
  price: 7500,
  location: "Goa",
  country: "India",
  category: "Beach",
  roomType: "Ocean Suite",
  totalRooms: 24,
  availableRooms: 11,
  geometry: {
    type: "Point",
    coordinates: [73.8278, 15.4989]
  }
},
{
  title: "Royal Desert Palace",
  description: "Elegant desert palace hotel with royal interiors and authentic cultural experiences.",
  Image: {
    url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
    filename: "royal-desert-palace"
  },
  images: [
    { url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80", filename: "royal-desert-palace-1" },
    { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", filename: "royal-desert-palace-2" }
  ],
  price: 9800,
  location: "Jaisalmer",
  country: "India",
  category: "Heritage",
  roomType: "Royal Suite",
  totalRooms: 20,
  availableRooms: 9,
  geometry: {
    type: "Point",
    coordinates: [70.9083, 26.9157]
  }
},

{
  title: "Emerald Forest Lodge",
  description: "Nature-inspired forest lodge near wildlife sanctuary with peaceful wooden interiors.",
  Image: {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    filename: "emerald-forest-lodge"
  },
  images: [
    { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", filename: "emerald-forest-lodge-1" },
    { url: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80", filename: "emerald-forest-lodge-2" }
  ],
  price: 7200,
  location: "Jim Corbett",
  country: "India",
  category: "Forest",
  roomType: "Forest Cottage",
  totalRooms: 16,
  availableRooms: 7,
  geometry: {
    type: "Point",
    coordinates: [78.7747, 29.5300]
  }
},
{
  title: "Cedar Woods Resort",
  description: "Luxury forest resort surrounded by cedar trees and peaceful landscapes.",
  Image: {
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    filename: "cedar-woods-resort"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      filename: "cedar-woods-resort-1"
    },
    {
      url: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80",
      filename: "cedar-woods-resort-2"
    }
  ],
  price: 6400,
  location: "Jaipur",
  country: "India",
  category: "Heritage",
  roomType: "Deluxe Room",
  totalRooms: 20,
  availableRooms: 7,
  geometry: {
    type: "Point",
    coordinates: [75.7873, 26.9124]
  }
},

{
  title: "Golden Tulip Inn",
  description: "Modern luxury inn with premium rooms and elegant interiors.",
  Image: {
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    filename: "golden-tulip-inn"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      filename: "golden-tulip-inn-1"
    },
    {
      url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      filename: "golden-tulip-inn-2"
    }
  ],
  price: 7100,
  location: "Delhi",
  country: "India",
  category: "City",
  roomType: "Executive Suite",
  totalRooms: 25,
  availableRooms: 10,
  geometry: {
    type: "Point",
    coordinates: [77.1025, 28.7041]
  }
},

{
  title: "Misty River Retreat",
  description: "Beautiful riverside retreat with peaceful nature surroundings.",
  Image: {
    url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
    filename: "misty-river-retreat"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
      filename: "misty-river-retreat-1"
    },
    {
      url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      filename: "misty-river-retreat-2"
    }
  ],
  price: 6900,
  location: "Rishikesh",
  country: "India",
  category: "Mountain",
  roomType: "River View Room",
  totalRooms: 18,
  availableRooms: 5,
  geometry: {
    type: "Point",
    coordinates: [78.2676, 30.0869]
  }
},

{
  title: "Sunset Paradise Villa",
  description: "Elegant villa resort offering breathtaking sunset and beach views.",
  Image: {
    url: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1200&q=80",
    filename: "sunset-paradise-villa"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1200&q=80",
      filename: "sunset-paradise-villa-1"
    },
    {
      url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      filename: "sunset-paradise-villa-2"
    }
  ],
  price: 9200,
  location: "Goa",
  country: "India",
  category: "Beach",
  roomType: "Luxury Villa",
  totalRooms: 16,
  availableRooms: 6,
  geometry: {
    type: "Point",
    coordinates: [73.8278, 15.4909]
  }
},

{
  title: "Coral Bay Resort",
  description: "Premium coastal resort with modern beachside rooms and pools.",
  Image: {
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    filename: "coral-bay-resort"
  },
  images: [
    {
      url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      filename: "coral-bay-resort-1"
    },
    {
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      filename: "coral-bay-resort-2"
    }
  ],
  price: 8600,
  location: "Andaman",
  country: "India",
  category: "Beach",
  roomType: "Ocean Deluxe",
  totalRooms: 22,
  availableRooms: 9,
  geometry: {
    type: "Point",
    coordinates: [92.7265, 11.7401]
  }
}
];

module.exports = { data: sampleListings };
