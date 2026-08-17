// Database Engine wrapper around localStorage for persistence

// Kerala 14 Districts and representative Local Self-Government (LSG) bodies
const KERALA_LOCATIONS = {
  "Thiruvananthapuram": [
    "Thiruvananthapuram Corporation", "Neyyattinkara Municipality", 
    "Nedumangad Municipality", "Varkala Municipality", "Attingal Municipality",
    "Balaramapuram Panchayat", "Kanjiramkulam Panchayat", "Vellanad Panchayat", "Kattakada Panchayat"
  ],
  "Kollam": [
    "Kollam Corporation", "Punalur Municipality", "Paravur Municipality", 
    "Karunagappally Municipality", "Kottarakkara Municipality",
    "Chathannoor Panchayat", "Anchal Panchayat", "Pathanapuram Panchayat", "Kundara Panchayat"
  ],
  "Pathanamthitta": [
    "Tiruvalla Municipality", "Adoor Municipality", "Pathanamthitta Municipality",
    "Mallappally Panchayat", "Konni Panchayat", "Ranni Panchayat", "Pandalam Panchayat"
  ],
  "Alappuzha": [
    "Alappuzha Municipality", "Kayamkulam Municipality", "Cherthala Municipality", 
    "Harippad Municipality", "Mavelikkara Municipality", "Chengannur Municipality",
    "Ambalappuzha Panchayat", "Kuttanad Panchayat", "Mannar Panchayat", "Aroor Panchayat"
  ],
  "Kottayam": [
    "Kottayam Municipality", "Changanassery Municipality", "Pala Municipality", 
    "Vaikom Municipality", "Ettumanoor Municipality",
    "Kanjirappally Panchayat", "Kumarakom Panchayat", "Pampady Panchayat", "Athirampuzha Panchayat"
  ],
  "Idukki": [
    "Thodupuzha Municipality", "Kattappana Municipality",
    "Adimali Panchayat", "Munnar Panchayat", "Nedumkandam Panchayat", "Peerumedu Panchayat", "Kumily Panchayat"
  ],
  "Ernakulam": [
    "Kochi Corporation", "Aluva Municipality", "Kalamassery Municipality", 
    "Tripunithura Municipality", "Muvattupuzha Municipality", "Kothamangalam Municipality",
    "Angamaly Municipality", "Perumbavoor Municipality", "North Paravur Municipality",
    "Vytila LSG", "Edappally LSG", "Kakkanad LSG", "Mulanthuruthy Panchayat"
  ],
  "Thrissur": [
    "Thrissur Corporation", "Guruvayur Municipality", "Chalakudy Municipality", 
    "Kodungallur Municipality", "Kunnamkulam Municipality", "Irinjalakuda Municipality",
    "Wadakkanchery Municipality", "Chavakkad Municipality", "Ollur LSG", "Pudukkad Panchayat"
  ],
  "Palakkad": [
    "Palakkad Municipality", "Ottapalam Municipality", "Shoranur Municipality", 
    "Chittur-Tattamangalam Municipality", "Mannarkkad Municipality", "Cherpulassery Municipality",
    "Alathur Panchayat", "Pattambi Panchayat", "Vadakkencherry Panchayat"
  ],
  "Malappuram": [
    "Malappuram Municipality", "Manjeri Municipality", "Kottakkal Municipality", 
    "Ponnani Municipality", "Tirur Municipality", "Perinthalmanna Municipality",
    "Nilambur Municipality", "Kondotty Municipality", "Valanchery Municipality", "Tanur Municipality"
  ],
  "Kozhikode": [
    "Kozhikode Corporation", "Vadakara Municipality", "Koyilandy Municipality", 
    "Ramanattukara Municipality", "Feroke Municipality", "Payyoli Municipality",
    "Koduvally Municipality", "Mukkam Municipality", "Balussery Panchayat", "Kunnamangalam Panchayat"
  ],
  "Wayanad": [
    "Kalpetta Municipality", "Mananthavady Municipality", "Sulthan Bathery Municipality",
    "Vythiri Panchayat", "Meppadi Panchayat", "Ambalavayal Panchayat", "Mananthavady Panchayat"
  ],
  "Kannur": [
    "Kannur Corporation", "Thalassery Municipality", "Payyannur Municipality", 
    "Taliparamba Municipality", "Mattannur Municipality", "Koothuparamba Municipality",
    "Iritty Municipality", "Kalliasseri Panchayat", "Payyavoor Panchayat"
  ],
  "Kasaragod": [
    "Kasaragod Municipality", "Kanhangad Municipality", "Nileshwaram Municipality",
    "Manjeshwaram Panchayat", "Kumbla Panchayat", "Cheruvathur Panchayat", "Uppala Panchayat"
  ]
};

// Standard Categories
export const JOB_CATEGORIES = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Mason (Construction)",
  "AC/Appliance Technician",
  "House Cleaning / Maid",
  "Gardener",
  "Home Chef / Catering",
  "Delivery / Driver",
  "Photographer",
  "IT / Computer Support"
];

// Seed Data
const SEED_USERS = [
  {
    id: "user-1",
    phone: "9876543210",
    name: "Mohan Lal",
    district: "Ernakulam",
    lsg: "Kochi Corporation",
    role: "worker", // toggleable: 'worker' or 'seeker'
    bio: "Experienced electrician with 10+ years in house wiring, commercial maintenance, and appliance repairs. Quick responder.",
    skills: ["Electrician", "AC/Appliance Technician"],
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150",
    verified: true,
    rating: 4.8,
    reviewsCount: 24,
    portfolio: [
      { id: "p1", title: "Complete Villa Wiring", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400" },
      { id: "p2", title: "Smart DB Installation", image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400" }
    ],
    lat: 9.9816,
    lng: 76.2999
  },
  {
    id: "user-2",
    phone: "8765432109",
    name: "Anjali Kurian",
    district: "Ernakulam",
    lsg: "Kakkanad LSG",
    role: "seeker",
    bio: "Homeowner looking for reliable local workers for periodic maintenance and helper jobs.",
    skills: [],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    verified: false,
    rating: 4.5,
    reviewsCount: 3,
    portfolio: [],
    lat: 10.0159,
    lng: 76.3419
  },
  {
    id: "user-3",
    phone: "7654321098",
    name: "Sajeev Kumar",
    district: "Kozhikode",
    lsg: "Kozhikode Corporation",
    role: "worker",
    bio: "Professional plumber specializing in pipe fittings, leakage repairs, and bathroom renovations. Government licensed.",
    skills: ["Plumber"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    verified: true,
    rating: 4.9,
    reviewsCount: 31,
    portfolio: [
      { id: "p3", title: "Bathroom plumbing layout", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400" }
    ],
    lat: 11.2588,
    lng: 75.7804
  }
];

const SEED_JOBS = [
  {
    id: "job-101",
    seekerId: "user-2",
    seekerName: "Anjali Kurian",
    title: "Kitchen DB Tripping & Exhaust Wiring",
    category: "Electrician",
    description: "The main breaker trips whenever we turn on the oven. Also need to drill and wire a new exhaust fan in the kitchen. Urgent work.",
    budget: 800,
    urgency: "Urgent", // "Urgent" | "Standard" | "Flexible"
    district: "Ernakulam",
    lsg: "Kakkanad LSG",
    landmark: "Near Infopark Phase 1, Kakkanad",
    lat: 10.0125,
    lng: 76.3285,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    status: "Open" // "Open" | "Assigned" | "Completed"
  },
  {
    id: "job-102",
    seekerId: "user-3",
    seekerName: "Sajeev Kumar", // posted as seeker
    title: "Water Tank Leakage Repair",
    category: "Plumber",
    description: "Concrete overhead tank has a hairline crack and minor leakage. Need sealing with waterproof cement.",
    budget: 1500,
    urgency: "Standard",
    district: "Kozhikode",
    lsg: "Kozhikode Corporation",
    landmark: "Opposite Town Hall",
    lat: 11.2612,
    lng: 75.7845,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: "Open"
  }
];

const SEED_BIDS = [
  {
    id: "bid-201",
    jobId: "job-101",
    workerId: "user-1",
    workerName: "Mohan Lal",
    workerPhone: "9876543210",
    price: 750,
    message: "I can check the DB and resolve the short circuit. I am located in Kochi and can reach Kakkanad within an hour. I have all electrical testing tools.",
    expectedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: "Pending" // "Pending" | "Accepted" | "Rejected"
  }
];

// Helper to initialize localStorage
const initStorage = () => {
  if (!localStorage.getItem("kf_initialized")) {
    localStorage.setItem("kf_users", JSON.stringify(SEED_USERS));
    localStorage.setItem("kf_jobs", JSON.stringify(SEED_JOBS));
    localStorage.setItem("kf_bids", JSON.stringify(SEED_BIDS));
    localStorage.setItem("kf_current_user", JSON.stringify(SEED_USERS[1])); // default to Seeker (Anjali)
    localStorage.setItem("kf_initialized", "true");
  }
};

initStorage();

export const db = {
  getLocations: () => KERALA_LOCATIONS,
  
  // Auth & Session
  getLoggedInUser: () => {
    return JSON.parse(localStorage.getItem("kf_current_user"));
  },
  setLoggedInUser: (user) => {
    localStorage.setItem("kf_current_user", JSON.stringify(user));
    // sync back into users list
    const users = JSON.parse(localStorage.getItem("kf_users"));
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    localStorage.setItem("kf_users", JSON.stringify(updatedUsers));
  },
  logoutUser: () => {
    localStorage.removeItem("kf_current_user");
  },
  loginByPhone: (phone, name = "") => {
    const users = JSON.parse(localStorage.getItem("kf_users")) || [];
    let user = users.find(u => u.phone === phone);
    if (!user) {
      // Create new user
      user = {
        id: `user-${Date.now()}`,
        phone,
        name: name || `User ${phone.slice(-4)}`,
        district: "Ernakulam",
        lsg: "Kochi Corporation",
        role: "seeker",
        bio: "",
        skills: [],
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${phone}`,
        verified: false,
        rating: 5.0,
        reviewsCount: 0,
        portfolio: [],
        lat: 9.9816,
        lng: 76.2999
      };
      users.push(user);
      localStorage.setItem("kf_users", JSON.stringify(users));
    }
    localStorage.setItem("kf_current_user", JSON.stringify(user));
    return user;
  },

  // Users
  getUserById: (id) => {
    const users = JSON.parse(localStorage.getItem("kf_users")) || [];
    return users.find(u => u.id === id);
  },
  updateUserProfile: (id, updates) => {
    const users = JSON.parse(localStorage.getItem("kf_users")) || [];
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        const merged = { ...u, ...updates };
        // Sync logged-in session if it is the current user
        const curr = db.getLoggedInUser();
        if (curr && curr.id === id) {
          localStorage.setItem("kf_current_user", JSON.stringify(merged));
        }
        return merged;
      }
      return u;
    });
    localStorage.setItem("kf_users", JSON.stringify(updatedUsers));
  },

  // Jobs
  getJobs: () => {
    return JSON.parse(localStorage.getItem("kf_jobs")) || [];
  },
  getJobById: (id) => {
    const jobs = JSON.parse(localStorage.getItem("kf_jobs")) || [];
    return jobs.find(j => j.id === id);
  },
  createJob: (jobData) => {
    const jobs = JSON.parse(localStorage.getItem("kf_jobs")) || [];
    const currentUser = db.getLoggedInUser();
    const newJob = {
      id: `job-${Date.now()}`,
      seekerId: currentUser.id,
      seekerName: currentUser.name,
      status: "Open",
      createdAt: new Date().toISOString(),
      ...jobData
    };
    jobs.unshift(newJob);
    localStorage.setItem("kf_jobs", JSON.stringify(jobs));
    return newJob;
  },

  // Bids
  getBids: () => {
    return JSON.parse(localStorage.getItem("kf_bids")) || [];
  },
  getBidsForJob: (jobId) => {
    const bids = db.getBids();
    return bids.filter(b => b.jobId === jobId);
  },
  getBidsByWorker: (workerId) => {
    const bids = db.getBids();
    return bids.filter(b => b.workerId === workerId);
  },
  submitBid: (bidData) => {
    const bids = JSON.parse(localStorage.getItem("kf_bids")) || [];
    const currentUser = db.getLoggedInUser();
    
    // Check if worker already bid
    const existing = bids.find(b => b.jobId === bidData.jobId && b.workerId === currentUser.id);
    if (existing) {
      throw new Error("You have already submitted a bid/quotation for this job.");
    }

    const newBid = {
      id: `bid-${Date.now()}`,
      workerId: currentUser.id,
      workerName: currentUser.name,
      workerPhone: currentUser.phone,
      createdAt: new Date().toISOString(),
      status: "Pending",
      ...bidData
    };
    bids.unshift(newBid);
    localStorage.setItem("kf_bids", JSON.stringify(bids));
    return newBid;
  },
  acceptBid: (bidId) => {
    const bids = JSON.parse(localStorage.getItem("kf_bids")) || [];
    const jobs = JSON.parse(localStorage.getItem("kf_jobs")) || [];
    
    let targetBid = null;
    const updatedBids = bids.map(b => {
      if (b.id === bidId) {
        targetBid = b;
        return { ...b, status: "Accepted" };
      }
      return b;
    });

    if (!targetBid) return;

    // Update job status to 'Assigned'
    const updatedJobs = jobs.map(j => {
      if (j.id === targetBid.jobId) {
        return { ...j, status: "Assigned" };
      }
      return j;
    });

    // Auto reject other bids for this job
    const finalBids = updatedBids.map(b => {
      if (b.jobId === targetBid.jobId && b.id !== bidId) {
        return { ...b, status: "Rejected" };
      }
      return b;
    });

    localStorage.setItem("kf_bids", JSON.stringify(finalBids));
    localStorage.setItem("kf_jobs", JSON.stringify(updatedJobs));
  },

  // Distance calculations using Haversine formula
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }
};
