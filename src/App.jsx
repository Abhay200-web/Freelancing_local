import React, { useState, useEffect } from 'react';
import { db, JOB_CATEGORIES } from './db';
import { JobMap } from './components/JobMap';
import confetti from 'canvas-confetti';
import {
  MapPin, User, Briefcase, Phone, ShieldCheck, Star, LogOut, Clock,
  Plus, Search, Image, Send, CheckCircle, Check, ExternalLink, Lock,
  Compass, ChevronRight, MessageSquare, X, Info, Shield, List, AlertTriangle
} from 'lucide-react';

export default function App() {
  // Application State
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'profile' | 'my-bids'
  const [currentRole, setCurrentRole] = useState('seeker'); // 'seeker' | 'worker'
  
  // Login State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupDistrict, setSignupDistrict] = useState('Ernakulam');
  const [signupLsg, setSignupLsg] = useState('Kochi Corporation');
  const [isFirstSignup, setIsFirstSignup] = useState(false);

  // Job Listing & Search States
  const [jobs, setJobs] = useState([]);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchLsg, setSearchLsg] = useState('');
  const [localRadiusFilter, setLocalRadiusFilter] = useState(false);

  // Job Detail / Modal Views
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [activeBidDetail, setActiveBidDetail] = useState(null);

  // Job Posting Form States
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('Electrician');
  const [postDescription, setPostDescription] = useState('');
  const [postBudget, setPostBudget] = useState('');
  const [postUrgency, setPostUrgency] = useState('Standard');
  const [postDistrict, setPostDistrict] = useState('Ernakulam');
  const [postLsg, setPostLsg] = useState('Kochi Corporation');
  const [postLandmark, setPostLandmark] = useState('');
  const [postCoords, setPostCoords] = useState({ lat: 9.9816, lng: 76.2999 });

  // Bid Submission Form States
  const [bidPrice, setBidPrice] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [bidDate, setBidDate] = useState('');

  // Profile Edit / Portfolio Form States
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBioText, setEditBioText] = useState('');
  const [selectedProfileSkills, setSelectedProfileSkills] = useState([]);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioImage, setPortfolioImage] = useState('');
  const [showPortfolioAdd, setShowPortfolioAdd] = useState(false);
  const [isVerifyingId, setIsVerifyingId] = useState(false);

  // Global Notification Banner
  const [notification, setNotification] = useState(null);

  // Load user session and local data on mount
  useEffect(() => {
    const user = db.getLoggedInUser();
    if (user) {
      setCurrentUser(user);
      setCurrentRole(user.role || 'seeker');
      setEditBioText(user.bio || '');
      setSelectedProfileSkills(user.skills || []);
    }
    setJobs(db.getJobs());
  }, []);

  // Update jobs feed periodically or after modifications
  const refreshJobs = () => {
    setJobs(db.getJobs());
  };

  const triggerToast = (message, type = 'success') => {
    setNotification({ text: message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // OTP Login sequence
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length !== 10 || isNaN(phone)) {
      triggerToast("Please enter a valid 10-digit phone number.", "warning");
      return;
    }
    setOtpSent(true);
    triggerToast("OTP code sent. Use '1234' for testing.", "warning");
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // auto focus next block
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode !== '1234') {
      triggerToast("Incorrect OTP code. Try '1234'.", "warning");
      return;
    }

    const users = JSON.parse(localStorage.getItem("kf_users")) || [];
    const existingUser = users.find(u => u.phone === phone);

    if (!existingUser) {
      // Prompt for first-time profile details
      setIsFirstSignup(true);
    } else {
      // Set session
      db.loginByPhone(phone);
      const user = db.getLoggedInUser();
      setCurrentUser(user);
      setCurrentRole(user.role || 'seeker');
      setEditBioText(user.bio || '');
      setSelectedProfileSkills(user.skills || []);
      triggerToast(`Welcome back, ${user.name}!`);
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const handleSignupComplete = (e) => {
    e.preventDefault();
    if (!signupName.trim()) {
      triggerToast("Please enter your name.", "warning");
      return;
    }

    const newUser = db.loginByPhone(phone, signupName);
    db.updateUserProfile(newUser.id, {
      district: signupDistrict,
      lsg: signupLsg
    });
    
    const finalizedUser = db.getLoggedInUser();
    setCurrentUser(finalizedUser);
    setCurrentRole(finalizedUser.role);
    setEditBioText(finalizedUser.bio || '');
    setSelectedProfileSkills(finalizedUser.skills || []);
    setIsFirstSignup(false);
    triggerToast(`Welcome to KeralaGig, ${finalizedUser.name}!`);
    confetti({ particleCount: 100, spread: 80 });
  };

  const handleLogout = () => {
    db.logoutUser();
    setCurrentUser(null);
    setActiveTab('jobs');
    triggerToast("Logged out successfully.");
  };

  // Role switching action
  const handleRoleToggle = (newRole) => {
    setCurrentRole(newRole);
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      db.updateUserProfile(currentUser.id, { role: newRole });
      setCurrentUser(updated);
      triggerToast(`Switched dashboard to ${newRole === 'seeker' ? 'Hire a Worker' : 'Find Jobs'} mode.`);
    }
  };

  // Location selector change helpers
  const handlePostDistrictChange = (dist) => {
    setPostDistrict(dist);
    const options = db.getLocations()[dist];
    if (options && options.length > 0) {
      setPostLsg(options[0]);
    }
  };

  // Job Posting Action
  const handlePostJobSubmit = (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDescription.trim() || !postBudget) {
      triggerToast("Please fill in all mandatory fields.", "warning");
      return;
    }

    db.createJob({
      title: postTitle,
      category: postCategory,
      description: postDescription,
      budget: Number(postBudget),
      urgency: postUrgency,
      district: postDistrict,
      lsg: postLsg,
      landmark: postLandmark,
      lat: postCoords.lat,
      lng: postCoords.lng
    });

    // Reset forms & close
    setPostTitle('');
    setPostDescription('');
    setPostBudget('');
    setPostLandmark('');
    setShowPostModal(false);
    refreshJobs();
    triggerToast("Job quotation posted successfully!");
    
    // Confetti interaction
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Bid submission sequence
  const handleOpenBidModal = (job) => {
    setSelectedJob(job);
    setBidPrice(job.budget);
    setBidMessage('');
    setBidDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Default tomorrow
    setShowBidModal(true);
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (!bidPrice || !bidMessage.trim()) {
      triggerToast("Please specify price and offer summary.", "warning");
      return;
    }

    try {
      db.submitBid({
        jobId: selectedJob.id,
        price: Number(bidPrice),
        message: bidMessage,
        expectedDate: bidDate
      });
      setShowBidModal(false);
      triggerToast("Quotation submitted successfully!");
      confetti({ particleCount: 70, spread: 50 });
      refreshJobs();
      if (selectedJob) {
        setSelectedJob(db.getJobById(selectedJob.id));
      }
    } catch (err) {
      triggerToast(err.message, "danger");
    }
  };

  const handleAcceptBid = (bidId) => {
    db.acceptBid(bidId);
    triggerToast("Bid accepted! Contact details & map routing unlocked.", "success");
    confetti({
      particleCount: 200,
      spread: 100,
      colors: ['#0284c7', '#10b981', '#ffffff']
    });
    
    // Refresh selections
    if (selectedJob) {
      setSelectedJob(db.getJobById(selectedJob.id));
    }
    setActiveBidDetail(null);
    refreshJobs();
  };

  // Profile actions
  const handleUpdateBio = () => {
    db.updateUserProfile(currentUser.id, { bio: editBioText });
    setCurrentUser(db.getLoggedInUser());
    setIsEditingBio(false);
    triggerToast("Profile summary updated.");
  };

  const handleToggleSkill = (skill) => {
    let updated;
    if (selectedProfileSkills.includes(skill)) {
      updated = selectedProfileSkills.filter(s => s !== skill);
    } else {
      updated = [...selectedProfileSkills, skill];
    }
    setSelectedProfileSkills(updated);
    db.updateUserProfile(currentUser.id, { skills: updated });
    setCurrentUser(db.getLoggedInUser());
  };

  const handleAddPortfolio = (e) => {
    e.preventDefault();
    if (!portfolioTitle.trim() || !portfolioImage.trim()) {
      triggerToast("Fill in both title and image URL.", "warning");
      return;
    }

    const currentPortfolio = currentUser.portfolio || [];
    const updated = [
      ...currentPortfolio,
      { id: `p-${Date.now()}`, title: portfolioTitle, image: portfolioImage }
    ];

    db.updateUserProfile(currentUser.id, { portfolio: updated });
    setCurrentUser(db.getLoggedInUser());
    setPortfolioTitle('');
    setPortfolioImage('');
    setShowPortfolioAdd(false);
    triggerToast("Portfolio work added.");
    confetti({ particleCount: 50 });
  };

  const handleVerifyAadhar = () => {
    setIsVerifyingId(true);
    setTimeout(() => {
      db.updateUserProfile(currentUser.id, { verified: true });
      setCurrentUser(db.getLoggedInUser());
      setIsVerifyingId(false);
      triggerToast("Identity verification successful! Verified badge awarded.", "success");
      confetti({ particleCount: 100, colors: ['#10b981', '#34d399'] });
    }, 2000);
  };

  // Distance calculating filter
  const getFilteredJobs = () => {
    let list = [...jobs];

    // Role filtering: Seekers only see their own posts. Workers see others' open posts.
    if (currentRole === 'seeker') {
      list = list.filter(j => j.seekerId === currentUser?.id);
    } else {
      // show only open jobs for other seekers
      list = list.filter(j => j.seekerId !== currentUser?.id);
    }

    // Category filter
    if (searchCategory) {
      list = list.filter(j => j.category === searchCategory);
    }

    // District filter
    if (searchDistrict) {
      list = list.filter(j => j.district === searchDistrict);
    }

    // LSG filter
    if (searchLsg) {
      list = list.filter(j => j.lsg === searchLsg);
    }

    // Radius distance filtering (5km match from current user's coords)
    if (localRadiusFilter && currentUser && currentRole === 'worker') {
      list = list.filter(j => {
        const distance = db.calculateDistance(
          currentUser.lat,
          currentUser.lng,
          j.lat,
          j.lng
        );
        return distance !== null && distance <= 5.0; // 5km limit
      });
    }

    return list;
  };

  const filteredJobsList = getFilteredJobs();
  const locationCatalog = db.getLocations();

  // Directions redirection links
  const getDirectionsUrl = (lat, lng) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  // Render Login view if session doesn't exist
  if (!currentUser) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Kerala<span className="brand-accent">Gig</span> 🌴
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            Local-First Freelancer & Micro-Job Marketplace
          </p>
        </div>

        {notification && (
          <div className={`banner banner-${notification.type}`}>
            <Info size={16} />
            <span>{notification.text}</span>
          </div>
        )}

        {!otpSent ? (
          <form className="card" onSubmit={handleSendOtp}>
            <h2 style={{ marginBottom: '16px' }}>Sign In / Register</h2>
            <div className="form-group">
              <label className="form-label">Active Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}>+91</span>
                <input
                  type="tel"
                  placeholder="Enter 10 digit number"
                  className="form-control"
                  style={{ paddingLeft: '54px' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g,'').slice(0, 10))}
                  required
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Quick verification with OTP. Works for any Kerala local circle.
              </span>
            </div>
            <button type="submit" className="btn btn-primary">
              <Send size={16} /> Send OTP Verification
            </button>
          </form>
        ) : !isFirstSignup ? (
          <form className="card" onSubmit={handleVerifyOtp}>
            <h2>Verify Code</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
              We sent a 4-digit code to +91 {phone}
            </p>
            
            <div className="otp-container">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  className="otp-box"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                      document.getElementById(`otp-${idx - 1}`).focus();
                    }
                  }}
                  required
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                Confirm Verification
              </button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setOtpSent(false)}>
                Back
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--warning)', marginTop: '16px' }}>
              ⚡ Testing hint: Enter code <strong>1234</strong>
            </p>
          </form>
        ) : (
          <form className="card" onSubmit={handleSignupComplete}>
            <h2>Complete Profile Setup</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Create your account to start taking or posting local services.
            </p>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="e.g., Sunil Varghese"
                className="form-control"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Home District</label>
              <select
                className="form-control"
                value={signupDistrict}
                onChange={(e) => {
                  setSignupDistrict(e.target.value);
                  const bodies = locationCatalog[e.target.value];
                  setSignupLsg(bodies[0]);
                }}
              >
                {Object.keys(locationCatalog).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Panchayat / Local Municipality</label>
              <select
                className="form-control"
                value={signupLsg}
                onChange={(e) => setSignupLsg(e.target.value)}
              >
                {locationCatalog[signupDistrict]?.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              <CheckCircle size={16} /> Finish Registration
            </button>
          </form>
        )}
      </div>
    );
  }

  // Active User session views
  return (
    <div className="app-container">
      {/* Sticky Header */}
      <header className="app-header">
        <div className="brand-title" onClick={() => { setActiveTab('jobs'); setSelectedJob(null); }}>
          Kerala<span className="brand-accent">Gig</span> 🌴
          <span style={{
            fontSize: '0.65rem',
            background: 'var(--bg-tertiary)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: 'var(--text-secondary)'
          }}>{currentRole === 'seeker' ? 'Hiring Mode' : 'Working Mode'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="avatar"
            style={{ width: '36px', height: '36px', cursor: 'pointer', border: currentUser.verified ? '2px solid var(--success)' : '2px solid var(--bg-tertiary)' }}
            onClick={() => setActiveTab('profile')}
          />
        </div>
      </header>

      {/* Role Toggle Bar */}
      <div style={{ padding: '16px 20px 0 20px' }}>
        <div className="role-toggle-container">
          <button
            className={`role-toggle-btn ${currentRole === 'seeker' ? 'active' : ''}`}
            onClick={() => { handleRoleToggle('seeker'); setSelectedJob(null); }}
          >
            I Need a Worker
          </button>
          <button
            className={`role-toggle-btn ${currentRole === 'worker' ? 'active' : ''}`}
            onClick={() => { handleRoleToggle('worker'); setSelectedJob(null); }}
          >
            I Want to Work
          </button>
        </div>
      </div>

      {/* Main Toast / Notification */}
      {notification && (
        <div style={{ padding: '0 20px' }}>
          <div className={`banner banner-${notification.type}`} style={{ margin: 0 }}>
            {notification.type === 'success' ? <CheckCircle size={16} /> : <Info size={16} />}
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      {/* Central Screen Body */}
      <main className="main-content">
        
        {/* TAB 1: Profile View */}
        {activeTab === 'profile' && (
          <div>
            <div className="card" style={{ textAlign: 'center', position: 'relative' }}>
              <button
                className="btn btn-secondary"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: 'auto',
                  padding: '6px 12px',
                  fontSize: '0.8rem'
                }}
                onClick={handleLogout}
              >
                <LogOut size={14} /> Log Out
              </button>

              <div style={{ display: 'inline-block', position: 'relative', marginTop: '12px' }}>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="avatar avatar-large"
                  style={{ borderColor: currentUser.verified ? 'var(--success)' : 'var(--bg-tertiary)' }}
                />
                {currentUser.verified && (
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    background: 'var(--bg-primary)',
                    borderRadius: '50%',
                    padding: '2px'
                  }}>
                    <ShieldCheck size={20} fill="var(--success)" stroke="var(--bg-primary)" />
                  </div>
                )}
              </div>
              
              <h2 style={{ marginTop: '12px', marginBottom: '4px' }}>{currentUser.name}</h2>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <MapPin size={14} />
                <span>{currentUser.lsg}, {currentUser.district}</span>
              </div>

              {/* Verified Status Banner */}
              <div style={{ marginTop: '16px' }}>
                {currentUser.verified ? (
                  <div className="badge badge-verified" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    <ShieldCheck size={14} style={{ marginRight: '6px' }} /> Verified Local Provider
                  </div>
                ) : (
                  <div className="card" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.15)', margin: '12px 0 0 0', padding: '12px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--warning)', marginBottom: '8px' }}>
                      Get a verification badge by verifying your identity (mock Aadhaar/ID check).
                    </p>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      onClick={handleVerifyAadhar}
                      disabled={isVerifyingId}
                    >
                      {isVerifyingId ? "Verifying..." : "Verify Identity Now"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Bio / Summary */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3>About Me</h3>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => setIsEditingBio(!isEditingBio)}
                >
                  {isEditingBio ? "Cancel" : "Edit"}
                </button>
              </div>
              
              {isEditingBio ? (
                <div>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editBioText}
                    onChange={(e) => setEditBioText(e.target.value)}
                    placeholder="Describe your skills, tools, and background..."
                  />
                  <button className="btn btn-primary" style={{ marginTop: '8px', fontSize: '0.85rem' }} onClick={handleUpdateBio}>
                    Save About Me
                  </button>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                  {currentUser.bio || "No summary provided. Describe your experience to attract clients!"}
                </p>
              )}
            </div>

            {/* Categories and Skill Selections */}
            <div className="card">
              <h3>Service Categories Offered</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Toggle standard categories to filter relevant jobs or let clients find you.
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {JOB_CATEGORIES.map(category => {
                  const hasSkill = selectedProfileSkills.includes(category);
                  return (
                    <button
                      key={category}
                      className={`btn ${hasSkill ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px' }}
                      onClick={() => handleToggleSkill(category)}
                    >
                      {hasSkill && <Check size={12} style={{ marginRight: '4px' }} />}
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Portfolio Galleries */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3>My Work Portfolio</h3>
                <button
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => setShowPortfolioAdd(!showPortfolioAdd)}
                >
                  {showPortfolioAdd ? "Cancel" : "Add Work"}
                </button>
              </div>

              {showPortfolioAdd && (
                <form className="card" style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', marginBottom: '16px' }} onSubmit={handleAddPortfolio}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Project Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bathroom pipe renewal"
                      value={portfolioTitle}
                      onChange={(e) => setPortfolioTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Work Photo URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="Paste image link"
                      value={portfolioImage}
                      onChange={(e) => setPortfolioImage(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px', fontSize: '0.8rem' }}>
                    Save Work Item
                  </button>
                </form>
              )}

              {currentUser.portfolio && currentUser.portfolio.length > 0 ? (
                <div className="portfolio-grid">
                  {currentUser.portfolio.map(p => (
                    <div key={p.id} className="portfolio-item">
                      <img src={p.image} alt={p.title} />
                      <div className="portfolio-item-title">{p.title}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>
                  No photos uploaded. Show off your work to make your profile attractive!
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Custom Jobs Dashboard / Feed */}
        {activeTab === 'jobs' && !selectedJob && (
          <div>
            {currentRole === 'seeker' ? (
              // Seeker Job postings view
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2>My Posted Jobs ({filteredJobsList.length})</h2>
                  <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowPostModal(true)}>
                    <Plus size={16} /> Post a Job
                  </button>
                </div>

                {filteredJobsList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                    <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <h3>No active jobs posted</h3>
                    <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                      Need an electrician, painter, or plumber? Post a quotation to receive local bids.
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredJobsList.map(j => {
                      const bidsCount = db.getBidsForJob(j.id).length;
                      return (
                        <div
                          key={j.id}
                          className={`card job-feed-item ${j.urgency.toLowerCase() === 'urgent' ? 'urgent' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedJob(j)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{j.title}</h3>
                            <span className={`badge badge-${j.urgency.toLowerCase()}`}>{j.urgency}</span>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', lineBreak: 'anywhere' }}>
                            {j.description.slice(0, 100)}{j.description.length > 100 ? '...' : ''}
                          </p>

                          <div className="job-meta-row">
                            <div className="job-meta-item">
                              <MapPin size={12} />
                              <span>{j.lsg}</span>
                            </div>
                            <div className="job-meta-item">
                              <Clock size={12} />
                              <span>{new Date(j.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="job-meta-item" style={{ color: 'var(--success)', fontWeight: 600 }}>
                              ₹{j.budget}
                            </div>
                            <div className="job-meta-item" style={{
                              marginLeft: 'auto',
                              background: bidsCount > 0 ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                              color: bidsCount > 0 ? 'var(--success)' : 'var(--text-secondary)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}>
                              {bidsCount} {bidsCount === 1 ? 'Bid' : 'Bids'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Worker Job Search feed view
              <div>
                <h2>Find Local Work</h2>
                
                {/* Search Filters Card */}
                <div className="card" style={{ padding: '14px', background: 'rgba(30, 41, 59, 0.4)' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <select
                        className="form-control"
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                      >
                        <option value="">All Job Categories</option>
                        {JOB_CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <select
                        className="form-control"
                        value={searchDistrict}
                        onChange={(e) => {
                          setSearchDistrict(e.target.value);
                          setSearchLsg('');
                        }}
                        style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                      >
                        <option value="">All Kerala Districts</option>
                        {Object.keys(locationCatalog).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <select
                        className="form-control"
                        value={searchLsg}
                        onChange={(e) => setSearchLsg(e.target.value)}
                        disabled={!searchDistrict}
                        style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                      >
                        <option value="">All Local Panchayats</option>
                        {searchDistrict && locationCatalog[searchDistrict]?.map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      className={`btn ${localRadiusFilter ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        width: 'auto',
                        padding: '8px 12px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={() => setLocalRadiusFilter(!localRadiusFilter)}
                    >
                      <Compass size={12} />
                      {localRadiusFilter ? "Radius: <5km" : "Radius Filter"}
                    </button>
                  </div>
                </div>

                {filteredJobsList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                    <AlertTriangle size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <h3>No matching jobs found</h3>
                    <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                      Try adjusting the district/category filter or expand your radius settings.
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredJobsList.map(j => {
                      const userDistance = db.calculateDistance(
                        currentUser.lat,
                        currentUser.lng,
                        j.lat,
                        j.lng
                      );
                      const myBid = db.getBidsForJob(j.id).find(b => b.workerId === currentUser.id);

                      return (
                        <div
                          key={j.id}
                          className={`card job-feed-item ${j.urgency.toLowerCase() === 'urgent' ? 'urgent' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedJob(j)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>{j.category}</span>
                              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px' }}>{j.title}</h3>
                            </div>
                            <span className={`badge badge-${j.urgency.toLowerCase()}`}>{j.urgency}</span>
                          </div>
                          
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                            {j.description.slice(0, 100)}{j.description.length > 100 ? '...' : ''}
                          </p>

                          <div className="job-meta-row">
                            <div className="job-meta-item">
                              <MapPin size={12} />
                              <span>{j.lsg}</span>
                            </div>
                            {userDistance !== null && (
                              <div className="job-meta-item">
                                <Compass size={12} />
                                <span>{userDistance.toFixed(1)} km away</span>
                              </div>
                            )}
                            <div className="job-meta-item" style={{ color: 'var(--success)', fontWeight: 600 }}>
                              Budget: ₹{j.budget}
                            </div>
                            {myBid && (
                              <div className="job-meta-item" style={{
                                marginLeft: 'auto',
                                background: myBid.status === 'Accepted' ? 'var(--success-bg)' : 'rgba(255,255,255,0.06)',
                                color: myBid.status === 'Accepted' ? 'var(--success)' : 'var(--text-secondary)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}>
                                Quoted: ₹{myBid.price} ({myBid.status})
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: My bids view (Only visible for Workers) */}
        {activeTab === 'my-bids' && (
          <div>
            <h2>My Bids & Quotations</h2>
            {db.getBidsByWorker(currentUser.id).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <MessageSquare size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <h3>No bids submitted yet</h3>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                  Switch to search, select a job, and send your pricing quote to start earning.
                </p>
              </div>
            ) : (
              <div>
                {db.getBidsByWorker(currentUser.id).map(b => {
                  const job = db.getJobById(b.jobId);
                  if (!job) return null;
                  
                  return (
                    <div
                      key={b.id}
                      className="card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedJob(job)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>{job.category}</span>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{job.title}</h3>
                        </div>
                        <span className={`badge ${b.status === 'Accepted' ? 'badge-verified' : 'badge-standard'}`} style={{ textTransform: 'capitalize' }}>
                          {b.status}
                        </span>
                      </div>

                      <div style={{
                        marginTop: '10px',
                        background: 'rgba(0,0,0,0.15)',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <span>My Quotation:</span>
                          <span>₹{b.price}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px' }}>
                          "{b.message}"
                        </p>
                      </div>

                      <div className="job-meta-row" style={{ marginTop: '10px' }}>
                        <div className="job-meta-item">
                          <MapPin size={12} />
                          <span>{job.lsg}, {job.district}</span>
                        </div>
                        <div className="job-meta-item">
                          <Clock size={12} />
                          <span>Posted: {new Date(b.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SCREEN 3: Job Detail View (Interactive panel overlay) */}
        {selectedJob && (
          <div className="card" style={{ borderColor: 'var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <button
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setSelectedJob(null)}
              >
                ← Back
              </button>
              <span className={`badge badge-${selectedJob.urgency.toLowerCase()}`}>{selectedJob.urgency} Urgency</span>
            </div>

            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{selectedJob.category}</span>
            <h1 style={{ fontSize: '1.4rem', marginTop: '2px', marginBottom: '8px' }}>{selectedJob.title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Client: <strong>{selectedJob.seekerName}</strong></span>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <MapPin size={12} />
                <span>{selectedJob.lsg}, {selectedJob.district}</span>
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Job Description</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-line', lineBreak: 'anywhere' }}>
                {selectedJob.description}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Budget:</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>₹{selectedJob.budget}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Job Status:</span>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: selectedJob.status === 'Open' ? 'var(--primary)' : 'var(--success)'
                }}>{selectedJob.status}</div>
              </div>
            </div>

            {/* Landmark descriptions */}
            {selectedJob.landmark && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Directions & Landmarks</label>
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--bg-tertiary)'
                }}>
                  {selectedJob.status === 'Assigned' ? (
                    <span>{selectedJob.landmark}</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Lock size={12} />
                      <span>Landmarks revealed upon accepting quotation.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Leaflet Map integration */}
            <div className="form-group">
              <label className="form-label">Job Geolocation Map</label>
              <JobMap
                position={{ lat: selectedJob.lat, lng: selectedJob.lng }}
                isReadOnly={true}
              />
            </div>

            {/* Seeker / Creator Flow: Viewing received bids */}
            {currentRole === 'seeker' && selectedJob.seekerId === currentUser.id && (
              <div style={{ marginTop: '20px' }}>
                <h3>Quotations Received</h3>
                {db.getBidsForJob(selectedJob.id).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '14px 0', textAlign: 'center' }}>
                    Waiting for local workers to bid on this job...
                  </p>
                ) : (
                  <div>
                    {db.getBidsForJob(selectedJob.id).map(bid => {
                      const worker = db.getUserById(bid.workerId);
                      return (
                        <div key={bid.id} className="bid-item">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={worker?.avatar} alt={bid.workerName} className="avatar" style={{ width: '32px', height: '32px' }} />
                              <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {bid.workerName}
                                  {worker?.verified && <ShieldCheck size={14} fill="var(--success)" stroke="var(--bg-secondary)" />}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  ⭐ {worker?.rating.toFixed(1)} ({worker?.reviewsCount} jobs completed)
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlignment: 'right' }}>
                              <div style={{ fontWeight: 800, color: 'var(--success)' }}>₹{bid.price}</div>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Status: {bid.status}</span>
                            </div>
                          </div>

                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', paddingLeft: '42px', lineBreak: 'anywhere' }}>
                            "{bid.message}"
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingLeft: '42px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Can do on: {new Date(bid.expectedDate).toLocaleDateString()}
                            </span>
                            
                            {bid.status === 'Pending' && (
                              <button
                                className="btn btn-primary"
                                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.75rem' }}
                                onClick={() => setActiveBidDetail(bid)}
                              >
                                View Proposal
                              </button>
                            )}
                          </div>

                          {/* Reveal contact phone details if accepted */}
                          {bid.status === 'Accepted' && (
                            <div style={{
                              background: 'var(--success-bg)',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              padding: '12px',
                              borderRadius: '8px',
                              marginTop: '12px',
                              marginLeft: '42px'
                            }}>
                              <h4 style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                <Check size={14} /> Bid Accepted - Contact Unlocked
                              </h4>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.85rem' }}>
                                <Phone size={14} />
                                <a href={`tel:${bid.workerPhone}`} style={{ color: '#ffffff', fontWeight: 600 }}>
                                  +91 {bid.workerPhone}
                                </a>
                                <span style={{ color: 'var(--text-secondary)' }}>(Tap to call worker)</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Worker Flow: Bidding Actions */}
            {currentRole === 'worker' && selectedJob.seekerId !== currentUser.id && (
              <div style={{ marginTop: '20px' }}>
                {(() => {
                  const myBid = db.getBidsForJob(selectedJob.id).find(b => b.workerId === currentUser.id);
                  if (myBid) {
                    return (
                      <div className="card" style={{ background: 'rgba(0,0,0,0.1)', borderColor: 'var(--bg-tertiary)' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '6px' }}>Your Quotation Details ({myBid.status})</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>
                          <span>My Price Offer:</span>
                          <span style={{ color: 'var(--success)' }}>₹{myBid.price}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>"{myBid.message}"</p>
                        
                        {/* If accepted, worker gets client details */}
                        {myBid.status === 'Accepted' ? (
                          <div style={{
                            background: 'var(--success-bg)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            padding: '12px',
                            borderRadius: '8px',
                            marginTop: '14px'
                          }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                              <Check size={14} /> Seeker Accepted Bid! Contact & Route Unlocked
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Phone size={14} />
                                <span>Phone: </span>
                                <a href={`tel:${selectedJob.seekerPhone || '9876543210'}`} style={{ color: '#ffffff', fontWeight: 600 }}>
                                  +91 {selectedJob.seekerPhone || '9876543210'}
                                </a>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={14} />
                                <span>Landmark: {selectedJob.landmark}</span>
                              </div>
                              <a
                                href={getDirectionsUrl(selectedJob.lat, selectedJob.lng)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-primary"
                                style={{ padding: '8px', fontSize: '0.8rem', marginTop: '6px' }}
                              >
                                <ExternalLink size={14} /> Open GPS Navigation Route
                              </a>
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Lock size={12} /> Contact & directions will unlock if seeker accepts your quote.
                          </p>
                        )}
                      </div>
                    );
                  }

                  return selectedJob.status === 'Open' ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleOpenBidModal(selectedJob)}
                    >
                      <MessageSquare size={16} /> Submit Quotation Offer
                    </button>
                  ) : (
                    <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.15)', textAlign: 'center' }}>
                      <p style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.9rem' }}>
                        This job has been assigned to another provider.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sticky Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => { setActiveTab('jobs'); setSelectedJob(null); }}
        >
          <Briefcase size={20} />
          <span>{currentRole === 'seeker' ? 'My Posts' : 'Find Jobs'}</span>
        </button>
        {currentRole === 'worker' && (
          <button
            className={`nav-item ${activeTab === 'my-bids' ? 'active' : ''}`}
            onClick={() => { setActiveTab('my-bids'); setSelectedJob(null); }}
          >
            <MessageSquare size={20} />
            <span>My Bids</span>
          </button>
        )}
        <button
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => { setActiveTab('profile'); setSelectedJob(null); }}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>

      {/* MODAL 1: Post Job (Seeker Form Panel) */}
      {showPostModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2>Post Job Quotation</h2>
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '4px' }} onClick={() => setShowPostModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePostJobSubmit}>
              <div className="form-group">
                <label className="form-label">Job Category</label>
                <select className="form-control" value={postCategory} onChange={(e) => setPostCategory(e.target.value)}>
                  {JOB_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Electrician needed for 1-day home wiring repair"
                  className="form-control"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Work Requirements</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Explain exactly what tasks need doing, e.g. number of plug points, types of tools required..."
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="Budget in INR"
                    className="form-control"
                    value={postBudget}
                    onChange={(e) => setPostBudget(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Urgency Level</label>
                  <select className="form-control" value={postUrgency} onChange={(e) => setPostUrgency(e.target.value)}>
                    <option value="Urgent">Urgent (ASAP)</option>
                    <option value="Standard">Standard</option>
                    <option value="Flexible">Flexible / Planned</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">District (Keralam)</label>
                  <select className="form-control" value={postDistrict} onChange={(e) => handlePostDistrictChange(e.target.value)}>
                    {Object.keys(locationCatalog).map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Panchayat / Local Body</label>
                  <select className="form-control" value={postLsg} onChange={(e) => setPostLsg(e.target.value)}>
                    {locationCatalog[postDistrict]?.map(lsg => (
                      <option key={lsg} value={lsg}>{lsg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Exact Landmark Directions (Hidden until bid accepted)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Junction, opposite Temple, House Name"
                  className="form-control"
                  value={postLandmark}
                  onChange={(e) => setPostLandmark(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pin Location Coordinates</label>
                <JobMap
                  position={postCoords}
                  onChange={setPostCoords}
                  isReadOnly={false}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                <Plus size={16} /> Post Job Quotation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Submit Bid (Worker Quotation Form Panel) */}
      {showBidModal && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2>Submit Quotation Bid</h2>
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '4px' }} onClick={() => setShowBidModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBidSubmit}>
              <div style={{ background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <strong>Client Budget:</strong> ₹{selectedJob.budget}
              </div>

              <div className="form-group">
                <label className="form-label">My Price Quote (₹)</label>
                <input
                  type="number"
                  placeholder="Enter bidding price"
                  className="form-control"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Available Date of Work</label>
                <input
                  type="date"
                  className="form-control"
                  value={bidDate}
                  onChange={(e) => setBidDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brief Proposal Summary / Experience Statement</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Tell the client why you're suited for the job, tools you bring, and details of work warranty..."
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                <Send size={16} /> Submit Quotation Offer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Bid Detail & Acceptance Form (Seeker viewing specific bid) */}
      {activeBidDetail && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2>Review Bidding Quotation</h2>
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '4px' }} onClick={() => setActiveBidDetail(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img
                src={db.getUserById(activeBidDetail.workerId)?.avatar}
                alt={activeBidDetail.workerName}
                className="avatar"
                style={{ width: '50px', height: '50px' }}
              />
              <div>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {activeBidDetail.workerName}
                  {db.getUserById(activeBidDetail.workerId)?.verified && (
                    <ShieldCheck size={16} fill="var(--success)" stroke="var(--bg-secondary)" />
                  )}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ★ {db.getUserById(activeBidDetail.workerId)?.rating.toFixed(1)} ({db.getUserById(activeBidDetail.workerId)?.reviewsCount} ratings)
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'rgba(0,0,0,0.15)', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Quoted Cost:</span>
                <span style={{ color: 'var(--success)', fontSize: '1.25rem', fontWeight: 800 }}>₹{activeBidDetail.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Arrival Date:</span>
                <span>{new Date(activeBidDetail.expectedDate).toLocaleDateString()}</span>
              </div>
              
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Proposal Pitch:</h4>
              <p style={{ fontSize: '0.85rem', color: '#ffffff', whiteSpace: 'pre-line', lineBreak: 'anywhere' }}>
                "{activeBidDetail.message}"
              </p>
            </div>

            {/* Worker Skills List */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Worker Verified Categories:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {db.getUserById(activeBidDetail.workerId)?.skills.map(s => (
                  <span key={s} className="badge badge-standard" style={{ fontSize: '0.7rem' }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => handleAcceptBid(activeBidDetail.id)}
              >
                <CheckCircle size={16} /> Accept Quotation & Hire
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setActiveBidDetail(null)}
              >
                Close Review
              </button>
            </div>
            
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
              ⚠️ Accepting the bid locks in the contract and reveals both contact numbers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
