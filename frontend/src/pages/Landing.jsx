import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import api from '../services/api';

const { Shield, Star, Camera, CheckCircle2, ChevronLeft, ChevronRight, Phone, Stethoscope, Heart, Asterisk, Play, ArrowRight, Plus, ClipboardList, Clock, HeartHandshake, Calendar, Building2, Briefcase, MessageCircle, X, Menu } = Icons;

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const cleanBase = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
  return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [specDocIndex, setSpecDocIndex] = useState(0);
  const [heroDoctors, setHeroDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [publicReviews, setPublicReviews] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, servicesRes, reviewsRes, faqsRes] = await Promise.all([
          api.get('/public/doctors'),
          api.get('/services'),
          api.get('/reviews/public'),
          api.get('/faqs')
        ]);
        
        if (doctorsRes.data.data && doctorsRes.data.data.length > 0) {
          const formattedDocs = doctorsRes.data.data.map(doc => ({
            id: doc._id,
            name: `Dr. ${doc.firstName} ${doc.lastName}`,
            firstName: doc.firstName,
            spec: doc.specialization,
            rating: (doc.averageRating && doc.averageRating > 0) ? doc.averageRating.toFixed(1) : 'New',
            img: resolveMediaUrl(doc.avatar) || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            bio: doc.bio || 'Experienced and compassionate doctor committed to patient care.',
            experience: doc.experienceYears ? `${doc.experienceYears}+ Years` : '10+ Years',
            hospital: doc.department || 'City Heart Clinic',
            availability: (doc.availableDays && doc.availableDays.length > 0) ? doc.availableDays.join(', ') : 'Mon - Fri'
          }));
          setHeroDoctors(formattedDocs);
        }

        if (servicesRes.data.data) {
          setServices(servicesRes.data.data);
        }

        if (reviewsRes.data.data) {
          setPublicReviews(reviewsRes.data.data);
        }

        if (faqsRes.data.data) {
          setFaqs(faqsRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const getPrevIndex = () => (currentDocIndex - 1 + heroDoctors.length) % heroDoctors.length;
  const getNextIndex = () => (currentDocIndex + 1) % heroDoctors.length;

  // Close mobile menu on scroll or outside click
  useEffect(() => {
    const handleScroll = () => setMobileMenuOpen(false);
    const handleClickOutside = (e) => {
      if (!e.target.closest('#mobile-nav')) setMobileMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector('input');
    if (emailInput.value) {
      toast.success("Thanks for subscribing to our newsletter!");
      emailInput.value = '';
    } else {
      toast.error("Please enter your email address.");
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index);
  };


  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      
      {/* Hero Section with Nav */}
      <section className="relative w-full min-h-screen bg-gradient-to-br from-[#1cb1d6] via-[#1691b3] to-[#117694] text-white">
        
        {/* Navbar */}
        <div id="mobile-nav" className="absolute top-6 left-0 w-full z-50 px-4">
          <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1db1d7] shadow-sm">
                <Plus strokeWidth={4} size={20} />
              </div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">hospitalflow</span>
            </div>

            <div className="hidden md:flex items-center space-x-8 font-medium text-sm text-white/90">
              <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="hover:text-white transition-colors">Services</a>
              <a href="#doctors" onClick={(e) => scrollToSection(e, 'doctors')} className="hover:text-white transition-colors">Doctors</a>
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-white transition-colors">About us</a>
              <a href="#process" onClick={(e) => scrollToSection(e, 'process')} className="hover:text-white transition-colors">Process</a>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/login" className="hidden md:block text-sm font-bold text-white hover:text-white/80 transition-colors">
                Log In
              </Link>
              <Link to="/login" className="hidden md:block bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm">
                Contact us
              </Link>
              {/* Hamburger - mobile only */}
              <button
                className="md:hidden w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/20"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden max-w-[1200px] mx-auto mt-2 bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col space-y-4">
                <a href="#services" onClick={(e) => { scrollToSection(e, 'services'); setMobileMenuOpen(false); }} className="text-white font-semibold text-base py-2 border-b border-white/10">Services</a>
                <a href="#doctors" onClick={(e) => { scrollToSection(e, 'doctors'); setMobileMenuOpen(false); }} className="text-white font-semibold text-base py-2 border-b border-white/10">Doctors</a>
                <a href="#about" onClick={(e) => { scrollToSection(e, 'about'); setMobileMenuOpen(false); }} className="text-white font-semibold text-base py-2 border-b border-white/10">About Us</a>
                <a href="#process" onClick={(e) => { scrollToSection(e, 'process'); setMobileMenuOpen(false); }} className="text-white font-semibold text-base py-2 border-b border-white/10">Process</a>
                <a href="#testimonials" onClick={(e) => { scrollToSection(e, 'testimonials'); setMobileMenuOpen(false); }} className="text-white font-semibold text-base py-2 border-b border-white/10">Testimonials</a>
                <div className="flex gap-3 pt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center bg-white text-slate-900 px-4 py-3 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors">
                    Log In
                  </Link>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center bg-white/20 border border-white/20 text-white px-4 py-3 rounded-full font-bold text-sm hover:bg-white/30 transition-colors">
                    Contact us
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-32 sm:pt-40 pb-20 grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          
          {/* Left Text */}
          <div className="pr-0 lg:pr-12 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 text-white font-medium mb-6 uppercase tracking-wider text-sm opacity-90">
              <span>TRUE 24/7</span>
              <span className="text-white/40">|</span>
              <span>CARE WHEN IT COUNTS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[5rem] font-bold leading-[1.05] tracking-tight mb-8 font-display">
              Real doctors, <br />real care always.
            </h1>
            
            <p className="text-base sm:text-lg text-white/80 mb-10 max-w-lg leading-relaxed font-light mx-auto lg:mx-0">
              Discover experienced doctors, compare specialties, and book trusted appointments easily online.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link to="/login" className="bg-white text-slate-900 px-8 py-3.5 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                See Doctors
              </Link>
              <Link to="/login" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3.5 rounded-full font-semibold transition-colors">
                Book a call
              </Link>
            </div>
          </div>

          {/* Right Visual Carousel */}
          <div className="relative h-[500px] sm:h-[600px] flex items-center justify-center mt-8 lg:mt-0">
            
            {heroDoctors.length > 0 ? (
              <>
                {/* Left Card (Faded) */}
                {heroDoctors.length > 1 && (
                  <div className="absolute left-0 transform -translate-x-12 scale-90 opacity-40 rounded-[2rem] overflow-hidden w-[300px] h-[400px] hidden md:block">
                     <img src={heroDoctors[getPrevIndex()].img} className="w-full h-full object-cover" alt={heroDoctors[getPrevIndex()].name} />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}

                {/* Right Card (Faded) */}
                {heroDoctors.length > 1 && (
                  <div className="absolute right-0 transform translate-x-12 scale-90 opacity-40 rounded-[2rem] overflow-hidden w-[300px] h-[400px] hidden md:block">
                     <img src={heroDoctors[getNextIndex()].img} className="w-full h-full object-cover" alt={heroDoctors[getNextIndex()].name} />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}

                {/* Center Main Card */}
                <div className="relative z-10 w-[300px] sm:w-[380px] h-[420px] sm:h-[500px] bg-white rounded-[2.5rem] p-3 shadow-2xl overflow-hidden group">
                  <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center z-20">
                    <Star fill="currentColor" size={12} className="mr-1 text-yellow-400" />
                    {heroDoctors[currentDocIndex].rating}
                  </div>
                  
                  <img 
                    src={heroDoctors[currentDocIndex].img} 
                    alt={heroDoctors[currentDocIndex].name}
                    className="w-full h-[85%] object-cover rounded-[2rem] object-top"
                  />

                  {/* Bottom Pill */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] bg-white rounded-full p-2 flex items-center shadow-xl">
                    <img src={heroDoctors[currentDocIndex].img} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="Avatar" />
                    <div className="ml-3 flex-1">
                      <h4 className="text-slate-900 font-bold text-sm leading-tight">{heroDoctors[currentDocIndex].name}</h4>
                      <p className="text-slate-500 text-xs truncate max-w-[150px]">{heroDoctors[currentDocIndex].spec}</p>
                    </div>
                    <Link to={`/doctor-profile/${heroDoctors[currentDocIndex].id}`} className="w-10 h-10 rounded-full bg-[#1db1d7] flex items-center justify-center text-white hover:bg-[#1598b9] transition-colors shrink-0 shadow-md">
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>

                {/* Carousel Controls */}
                {heroDoctors.length > 1 && (
                  <div className="absolute -bottom-6 flex space-x-4 z-20">
                    <button onClick={() => setCurrentDocIndex(getPrevIndex())} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/10 shadow-lg">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={() => setCurrentDocIndex(getNextIndex())} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/10 shadow-lg">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="relative z-10 w-[380px] h-[500px] bg-white/20 animate-pulse rounded-[2.5rem] shadow-2xl flex items-center justify-center border-4 border-white/10">
                <div className="text-white font-medium text-lg flex items-center">
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Loading Data...
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Services Marquee */}
      <section className="py-12 border-b border-gray-100 bg-white overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex w-[200%] animate-marquee">
          <div className="flex w-1/2 justify-around items-center space-x-12 px-6">
            {services.length > 0 ? services.map((s, i) => {
              const IconComp = Icons[s.iconName] || Icons.Asterisk;
              return (
                <div key={`s1-${i}`} className="text-xl font-bold flex items-center space-x-3 text-slate-800 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#107c9f]/10 text-[#107c9f] flex items-center justify-center">
                    <IconComp size={16} />
                  </div>
                  <span>{s.title}</span>
                </div>
              );
            }) : (
              // Fallback if no services
              [1,2,3,4,5].map(i => <div key={i} className="text-xl font-bold flex items-center space-x-2 text-slate-400 shrink-0"><Asterisk size={16}/><span>Loading Services...</span></div>)
            )}
          </div>
          <div className="flex w-1/2 justify-around items-center space-x-12 px-6">
            {services.length > 0 ? services.map((s, i) => {
              const IconComp = Icons[s.iconName] || Icons.Asterisk;
              return (
                <div key={`s2-${i}`} className="text-xl font-bold flex items-center space-x-3 text-slate-800 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#107c9f]/10 text-[#107c9f] flex items-center justify-center">
                    <IconComp size={16} />
                  </div>
                  <span>{s.title}</span>
                </div>
              );
            }) : (
              [1,2,3,4,5].map(i => <div key={i} className="text-xl font-bold flex items-center space-x-2 text-slate-400 shrink-0"><Asterisk size={16}/><span>Loading Services...</span></div>)
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#FAFBFC]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
              <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                <Shield size={12} fill="currentColor" />
              </div>
              About hospitalflow
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
              We are a modern healthcare team focused on connecting you with trusted doctors and making quality care easy, clear, and accessible anytime.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:h-[400px]">
            {/* Card 1 */}
            <div className="bg-gradient-to-b from-[#1db1d7] to-[#073c52] rounded-[2rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl relative z-10">
                <Shield className="text-[#107c9f]" size={40} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-8 relative z-10">Excellence in Care</h3>
              <Link to="/login" className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-white font-medium transition-colors border border-white/10 relative z-10">
                Book a call
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-200 rounded-[2rem] overflow-hidden shadow-lg relative group">
              <img 
                src={heroDoctors.length > 0 ? heroDoctors[0].img : "https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                alt="Trusted Doctor" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-5xl font-bold text-slate-900 mb-2">{heroDoctors.length > 0 ? heroDoctors.length : '0'}+</h3>
                <p className="text-xl text-slate-700 font-medium">Trusted Doctors</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold text-slate-900 mb-2">
                    <span>Rated</span>
                    <span>90%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0a3d52] w-[90%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-semibold text-slate-900 mb-2">
                    <span>Cured</span>
                    <span>85%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#107c9f] w-[85%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-semibold text-slate-900 mb-2">
                    <span>Active</span>
                    <span>75%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1db1d7] w-[75%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
              <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                <Shield size={12} fill="currentColor" />
              </div>
              Our Services
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              All your healthcare <br />needs, one place.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            {services.length > 0 ? (
              services.map((service, idx) => {
                const IconComponent = Icons[service.iconName] || Icons.Asterisk;
                const colors = [
                  { bg: 'bg-[#107c9f]', text: 'text-[#107c9f]' },
                  { bg: 'bg-[#0a3d52]', text: 'text-[#0a3d52]' },
                  { bg: 'bg-[#1db1d7]', text: 'text-[#1db1d7]' }
                ];
                const colorTheme = colors[idx % colors.length];

                return (
                  <div key={service._id || idx} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                      <span className="text-slate-500 font-medium">/{String(idx + 1).padStart(3, '0')}</span>
                      <div className={`w-10 h-10 rounded-full ${colorTheme.bg} text-white flex items-center justify-center`}>
                        <IconComponent size={20} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.title}</h3>
                    <p className="text-slate-500 mb-6 flex-1">{service.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      {service.tags && service.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-full text-xs font-semibold text-slate-700">
                          <CheckCircle2 size={12} className={`${colorTheme.text} mr-1`} /> {tag}
                        </span>
                      ))}
                    </div>

                    <div className="h-48 rounded-2xl overflow-hidden mt-auto relative bg-slate-100">
                      {service.image ? (
                        <img src={resolveMediaUrl(service.image)} alt={service.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                           <IconComponent size={48} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center text-slate-500 py-12">
                Loading services...
              </div>
            )}

          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="process" className="py-20 sm:py-32 bg-[#0e4356] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="flex items-center justify-center bg-white/20 text-white w-5 h-5 rounded-full text-xs mr-1"><Plus size={10} strokeWidth={3} /></span>
            <span className="text-sm font-medium">How it works</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-16 sm:mb-24">
            Your health journey<br />in three simple steps.
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 font-bold px-4 py-1 rounded-full text-xs shadow-md z-10 whitespace-nowrap">Step 01</div>
                <div className="w-48 h-48 rounded-full bg-white/5 flex items-center justify-center">
                   <ClipboardList size={64} className="text-white" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Tell us what you need</h3>
              <p className="text-white/70 max-w-xs leading-relaxed">Share your health concerns and we connect you with the right specialist.</p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 font-bold px-4 py-1 rounded-full text-xs shadow-md z-10 whitespace-nowrap">Step 02</div>
                <div className="w-48 h-48 rounded-full bg-white/5 flex items-center justify-center">
                   <Clock size={64} className="text-white" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Pick your perfect time</h3>
              <p className="text-white/70 max-w-xs leading-relaxed">Browse doctor availability and schedule your visit in-person or virtually.</p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 font-bold px-4 py-1 rounded-full text-xs shadow-md z-10 whitespace-nowrap">Step 03</div>
                <div className="w-48 h-48 rounded-full bg-white/5 flex items-center justify-center">
                   <HeartHandshake size={64} className="text-white" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Get Care, Stress-Free</h3>
              <p className="text-white/70 max-w-xs leading-relaxed">Join your visit online or walk in-clinic securely and completely hassle-free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specialized Doctors Section */}
      <section id="doctors" className="py-16 sm:py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16">
            <div>
              <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
                <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                  <Shield size={12} fill="currentColor" />
                </div>
                Specialized Doctors
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                Dedicated doctors,<br />committed to your care
              </h2>
            </div>
            <div className="flex space-x-4 mt-8 md:mt-0 pb-4">
              <button 
                onClick={() => setSpecDocIndex((prev) => (prev - 1 + heroDoctors.length) % heroDoctors.length)} 
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-900 hover:bg-gray-50 shadow-sm transition-colors"
                disabled={heroDoctors.length === 0}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setSpecDocIndex((prev) => (prev + 1) % heroDoctors.length)} 
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-900 hover:bg-gray-50 shadow-sm transition-colors"
                disabled={heroDoctors.length === 0}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {heroDoctors.length > 0 && (
            <div className="mb-12">
              <p className="text-slate-500 mb-6 font-medium">{heroDoctors.length} active specialists on hospitalflow</p>
              <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
                {heroDoctors.map((doc, idx) => (
                  <div 
                    key={doc.id}
                    onClick={() => setSpecDocIndex(idx)}
                    className={`shrink-0 w-64 bg-white rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 border border-gray-100 mx-2 my-4 ${idx === specDocIndex ? 'ring-[3px] ring-[#1cb1d6] ring-offset-4 ring-offset-[#FAFBFC] shadow-2xl scale-[1.02]' : 'shadow-sm opacity-60 hover:opacity-100 grayscale-[50%] hover:grayscale-0'}`}
                  >
                    <div className="h-64 overflow-hidden bg-slate-50 relative">
                      <img src={doc.img} alt={doc.name} className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a2332]/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="p-6 bg-white relative z-10 flex flex-col items-center text-center">
                      <h4 className="font-bold text-slate-900 text-[17px] mb-1 truncate w-full">{doc.name}</h4>
                      <p className="text-xs font-extrabold text-[#1cb1d6] truncate uppercase tracking-widest w-full">{doc.spec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {heroDoctors.length > 0 ? (
            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-0 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-4 sm:p-6">
              {/* Left Image Side */}
              <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-[1.5rem] overflow-hidden bg-slate-200">
                <img src={heroDoctors[specDocIndex].img} className="w-full h-full object-cover object-top" alt={heroDoctors[specDocIndex].name} />
                {/* Pill */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] bg-white rounded-full p-2 flex items-center shadow-xl">
                  <img src={heroDoctors[specDocIndex].img} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="Avatar" />
                  <div className="ml-3 flex-1">
                    <h4 className="text-slate-900 font-bold text-sm leading-tight">{heroDoctors[specDocIndex].name}</h4>
                    <p className="text-slate-500 text-xs truncate max-w-[120px]">{heroDoctors[specDocIndex].spec}</p>
                  </div>
                  <Link to={`/doctor-profile/${heroDoctors[specDocIndex].id}`} className="w-10 h-10 rounded-full bg-[#1db1d7] flex items-center justify-center text-white hover:bg-[#1598b9] transition-colors shrink-0 shadow-md">
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </div>

              {/* Right Details Side */}
              <div className="p-8 lg:p-12 flex flex-col">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">About {heroDoctors[specDocIndex].name}:</h3>
                <p className="text-slate-500 text-lg mb-12 max-w-xl line-clamp-3">{heroDoctors[specDocIndex].bio}</p>
                
                <div className="grid grid-cols-2 gap-8 mb-auto">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 shrink-0">
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Specialty</p>
                      <p className="text-slate-900 font-bold truncate max-w-[140px]">{heroDoctors[specDocIndex].spec}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 shrink-0">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Experience</p>
                      <p className="text-slate-900 font-bold truncate max-w-[140px]">{heroDoctors[specDocIndex].experience}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 shrink-0">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Hospital/Dept</p>
                      <p className="text-slate-900 font-bold truncate max-w-[140px]">{heroDoctors[specDocIndex].hospital}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 shrink-0">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Availability</p>
                      <p className="text-slate-900 font-bold">{heroDoctors[specDocIndex].availability}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-start lg:justify-end">
                  <Link to={`/doctor-profile/${heroDoctors[specDocIndex].id}`} className="bg-[#0a3d52] text-white px-10 py-4 rounded-full font-bold hover:bg-[#104764] transition-colors w-full md:w-auto text-center shadow-lg hover:shadow-xl">
                    Book Appointment
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-12 text-center text-slate-500">
              Loading doctors...
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 sm:py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
              <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                <Shield size={12} fill="currentColor" />
              </div>
              Why hospitalflow?
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Why Choose hospitalflow<br />for Better Healthcare
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:col-span-2 md:col-span-1 h-auto md:h-[500px]">
              <div className="h-64 md:h-[55%] bg-gradient-to-br from-[#073c52] to-[#107c9f] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-center space-y-3">
                 {heroDoctors.length > 0 ? (
                   [...heroDoctors].sort(() => 0.5 - Math.random()).slice(0, 3).map((doc, idx) => {
                     const styles = [
                       "bg-white/10 backdrop-blur-md rounded-full p-2 pr-4 flex items-center shadow-lg border border-white/10 w-[90%] transform -translate-x-4",
                       "bg-white/20 backdrop-blur-md rounded-full p-2 pr-4 flex items-center shadow-lg border border-white/20 w-full transform translate-x-2 relative z-10",
                       "bg-white/10 backdrop-blur-md rounded-full p-2 pr-4 flex items-center shadow-lg border border-white/10 w-[90%] transform -translate-x-2"
                     ];
                     return (
                       <div key={doc.id || idx} className={styles[idx % 3]}>
                          <img src={doc.img} className="w-8 h-8 rounded-full object-cover shrink-0" alt="avatar"/>
                          <div className="ml-3 flex-1 text-white overflow-hidden">
                            <p className="text-xs font-bold truncate w-full">{doc.name}</p>
                            <p className="text-[10px] text-white/70 truncate w-full">{doc.spec}</p>
                          </div>
                          <Link to={`/doctor-profile/${doc.id}`} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#107c9f] hover:bg-gray-100 transition-colors shrink-0">
                            <ChevronRight size={12} />
                          </Link>
                       </div>
                     );
                   })
                 ) : (
                   <div className="text-white/50 text-sm text-center py-8 font-medium">Loading experts...</div>
                 )}
              </div>
              <div className="p-8 flex-1 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Expert Doctors</h3>
                <p className="text-slate-500">Certified doctors delivering trusted, personalized care for all patients.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-[500px]">
              <div className="h-[55%] bg-gradient-to-br from-[#073c52] to-[#107c9f] p-8 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-4 w-full max-w-[240px] shadow-2xl">
                  <div className="flex items-center mb-4 pb-2 border-b border-gray-100">
                     <div className="w-6 h-6 bg-slate-200 rounded-full mr-2 overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Support" />
                     </div>
                     <span className="text-[10px] font-semibold text-slate-700">Support Agent • <span className="text-[#1db1d7]">Online</span></span>
                  </div>
                  <div className="bg-slate-100 rounded-xl rounded-tl-sm p-3 mb-3 text-[10px] text-slate-700 font-medium">
                    Hello, I need help booking an appointment
                  </div>
                  <div className="bg-[#1db1d7] text-white rounded-xl rounded-tr-sm p-3 mb-3 text-[10px] ml-6 font-medium">
                    Sure! A doctor is available now.
                  </div>
                  <div className="bg-slate-100 rounded-xl rounded-tl-sm p-3 text-[10px] text-slate-700 mr-6 font-medium">
                    Would you like to schedule a call?
                  </div>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">24/7 Support</h3>
                <p className="text-slate-500">Instant help booking appointments and managing your health anytime.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-[500px]">
              <div className="h-[55%] bg-gradient-to-br from-[#073c52] to-[#107c9f] p-8 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-6 w-full max-w-[240px] shadow-2xl relative">
                  <div className="flex items-center space-x-2 mb-6">
                    <img src="https://images.unsplash.com/photo-1594824436951-7f12678cecea?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-6 h-6 rounded-full" alt="patient"/>
                    <span className="text-[9px] font-semibold text-[#107c9f]">Patient Portal • You're at the center</span>
                  </div>
                  <div className="flex justify-center mb-6">
                    <Heart className="text-[#1db1d7]" size={48} fill="currentColor" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-[9px] text-slate-600 font-medium"><CheckCircle2 size={12} className="text-[#1db1d7] mr-2" /> Personalized treatment plans</div>
                    <div className="flex items-center text-[9px] text-slate-600 font-medium"><CheckCircle2 size={12} className="text-[#1db1d7] mr-2" /> Empathetic specialist matching</div>
                    <div className="flex items-center text-[9px] text-slate-600 font-medium"><CheckCircle2 size={12} className="text-[#1db1d7] mr-2" /> Continuous monitoring & support</div>
                  </div>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Patients Centric Care</h3>
                <p className="text-slate-500">Your health journey guided by empathy and continuous support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
              <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                <Shield size={12} fill="currentColor" />
              </div>
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Trusted by thousands<br />of happy patients.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {publicReviews.length > 0 ? publicReviews.slice(0, 3).map((review, idx) => (
              <div key={review._id || idx} className="rounded-[3rem] p-8 shadow-2xl border border-white/10 flex flex-col justify-end h-[420px] sm:h-[520px] relative overflow-hidden group transform hover:-translate-y-2 transition-all duration-500">
                <img 
                  src={resolveMediaUrl(review.patientId?.avatar) || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={review.patientId?.firstName || "Patient"} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2332] via-[#0a2332]/60 to-transparent" />
                <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/20 shadow-xl">
                  <div className="flex text-amber-400 mb-4 drop-shadow-lg">
                    {[...Array(review.rating || 5)].map((_, i) => <Star key={i} fill="currentColor" size={20} />)}
                  </div>
                  <p className="text-white text-lg leading-relaxed font-medium mb-6 drop-shadow-md line-clamp-4">"{review.comment}"</p>
                  <div className="flex items-center pt-4 border-t border-white/20">
                      <div className="flex flex-col">
                        <h4 className="font-bold text-white text-lg">{review.patientId?.firstName} {review.patientId?.lastName}</h4>
                        <p className="text-xs text-[#1cb1d6] font-semibold tracking-wide uppercase mt-1">Treated by Dr. {review.doctorId?.firstName} {review.doctorId?.lastName}</p>
                      </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center text-slate-500 py-12">No reviews yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-16 mb-16 sm:mb-24">
            
            {/* Left FAQ Intro */}
            <div>
              <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
                <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                  <Shield size={12} fill="currentColor" />
                </div>
                FAQ
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                Everything you<br />need to know today
              </h2>
              <p className="text-slate-500 text-lg mb-10 max-w-md">Browse through these common inquiries to better understand our patient-focused medical platform.</p>
              <div className="flex space-x-4">
                <Link to="/login" className="bg-[#0a3d52] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#104764] transition-colors shadow-lg">
                  See Doctors
                </Link>
                <Link to="/login" className="bg-white border border-gray-200 text-slate-900 px-8 py-3.5 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-sm">
                  Contact us
                </Link>
              </div>
            </div>

            {/* Right Accordion List */}
            <div className="space-y-6">
              {faqs.length > 0 ? faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-6">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFaq(index)}
                  >
                    <h3 className="text-xl font-bold text-slate-900">{faq.question}</h3>
                    {openFaq === index ? (
                      <div className="w-8 h-8 rounded-full bg-[#107c9f] text-white flex items-center justify-center shrink-0 ml-4 transition-transform">
                        <X size={16} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 ml-4 transition-transform">
                        <Plus size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  {openFaq === index && (
                    <motion.p 
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                      className="text-slate-500 leading-relaxed overflow-hidden"
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </div>
              )) : (
                <div className="text-slate-400 text-center py-8">No FAQs available yet.</div>
              )}
            </div>
          </div>

          {/* Contact Banner */}
          <div className="bg-gradient-to-r from-[#073c52] to-[#1db1d7] rounded-[2rem] p-12 flex flex-col md:flex-row items-center justify-between text-white shadow-xl">
             <div className="flex items-center">
               <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-6 shrink-0">
                 <Phone size={28} />
               </div>
               <div>
                 <h3 className="text-3xl font-bold mb-2">Still have more questions?</h3>
                 <p className="text-white/80 max-w-md text-sm md:text-base">Book a call with our friendly team to learn how hospitalflow simplifies your healthcare journey.</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer / Get Started Section */}
      <section className="relative pt-32 pb-8 bg-gradient-to-br from-[#1db1d7] via-[#107c9f] to-[#073c52] text-white overflow-hidden">
        
        {/* Floating Avatars */}
        {heroDoctors.length > 0 && (() => {
          const shuffled = [...heroDoctors].sort(() => 0.5 - Math.random()).slice(0, 4);
          const positions = [
            "absolute top-20 left-[20%] w-20 h-20 rounded-full border-4 border-white/20 object-cover shadow-lg hidden md:block hover:scale-110 transition-transform cursor-pointer",
            "absolute top-20 right-[25%] w-16 h-16 rounded-full border-4 border-white/20 object-cover shadow-lg hidden md:block hover:scale-110 transition-transform cursor-pointer",
            "absolute bottom-[40%] left-[25%] w-16 h-16 rounded-full border-4 border-white/20 object-cover shadow-lg hidden md:block hover:scale-110 transition-transform cursor-pointer",
            "absolute bottom-[45%] right-[20%] w-20 h-20 rounded-full border-4 border-white/20 object-cover shadow-lg hidden md:block hover:scale-110 transition-transform cursor-pointer"
          ];
          return shuffled.map((doc, idx) => (
            <Link key={doc.id || idx} to={`/doctor-profile/${doc.id}`}>
              <img src={doc.img} className={positions[idx]} alt="Doctor" />
            </Link>
          ));
        })()}

        <div className="max-w-[1000px] mx-auto px-4 sm:px-8 text-center relative z-10 mb-16 sm:mb-32">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="flex items-center justify-center bg-white/20 text-white w-5 h-5 rounded-full text-xs mr-1"><Plus size={10} strokeWidth={3} /></span>
            <span className="text-sm font-medium">Get started</span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8">
            Your better health<br />journey starts here.
          </h2>
          
          <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
            Discover experienced healthcare professionals and manage all your medical visits in one convenient, secure place.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/login" className="bg-white text-slate-900 px-8 py-3.5 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg">
              Explore services
            </Link>
            <Link to="/login" className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3.5 rounded-full font-bold hover:bg-white/30 transition-colors">
              Book a call
            </Link>
          </div>
        </div>

        {/* Footer Container */}
        <div className="max-w-[1400px] mx-auto px-4 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 sm:gap-12 mb-10 sm:mb-16">
              {/* Brand & Newsletter */}
              <div className="w-full max-w-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1db1d7]">
                    <Plus strokeWidth={4} size={20} />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">hospitalflow</span>
                </div>
                <p className="text-white/70 mb-8 text-sm leading-relaxed">A comprehensive hospital management platform providing seamless healthcare experiences.</p>
                
                {/* Newsletter Input */}
                <form onSubmit={handleNewsletterSubmit} className="flex items-center bg-white/10 border border-white/20 rounded-full p-1.5 w-full max-w-sm">
                  <input type="email" placeholder="Enter your e-mail" className="bg-transparent border-none outline-none text-white px-4 py-2 text-sm w-full placeholder:text-white/50" />
                  <button type="submit" className="bg-white text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors shrink-0">
                    Submit
                  </button>
                </form>
              </div>

              {/* Links */}
              <div className="flex gap-10 sm:gap-16 lg:gap-32 flex-wrap">
                <div>
                  <h4 className="text-lg font-bold mb-6">Navigation</h4>
                  <ul className="space-y-4 text-white/80 font-medium text-sm">
                    <li><a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'})}} className="hover:text-white transition-colors">Home</a></li>
                    <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-white transition-colors">About us</a></li>
                    <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-white transition-colors whitespace-nowrap">Why Choose us</a></li>
                    <li><a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="hover:text-white transition-colors">Services</a></li>
                    <li><a href="#doctors" onClick={(e) => scrollToSection(e, 'doctors')} className="hover:text-white transition-colors">Doctors</a></li>
                    <li><a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="hover:text-white transition-colors">Testimonials</a></li>
                    <li><a href="#process" onClick={(e) => scrollToSection(e, 'process')} className="hover:text-white transition-colors">Process</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold mb-6">Socials</h4>
                  <ul className="space-y-4 text-white/80 font-medium text-sm">
                    <li><a href="#" className="flex items-center hover:text-white transition-colors">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mr-3"><svg className="w-[12px] h-[12px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></div> Instagram
                    </a></li>
                    <li><a href="#" className="flex items-center hover:text-white transition-colors">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mr-3"><svg className="w-[12px] h-[12px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></div> Facebook
                    </a></li>
                    <li><a href="#" className="flex items-center hover:text-white transition-colors">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mr-3"><Play size={12} fill="currentColor" className="ml-0.5" /></div> Youtube
                    </a></li>
                    <li><a href="#" className="flex items-center hover:text-white transition-colors">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mr-3"><Asterisk size={12} /></div> Dribbble
                    </a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-white/70">
              <p>Copyright@2026 &nbsp;&bull;&nbsp; Built with MERN Stack</p>
              <div className="flex items-center mt-4 md:mt-0">
                <span className="mr-3">Developed by</span>
                <div className="flex items-center text-white font-medium">
                  Rishu Singh
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
