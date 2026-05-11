import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Shield, Star, Camera, CheckCircle2, ChevronLeft, ChevronRight, Phone, Stethoscope, Heart, Asterisk, Play, ArrowRight, Plus, ClipboardList, Clock, HeartHandshake, Calendar, Building2, Briefcase, MessageCircle, X } from 'lucide-react';

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(0);

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

  const faqData = [
    {
      question: "Do you accept insurance?",
      answer: "We accept most major insurance plans to ensure your medical care remains affordable and accessible."
    },
    {
      question: "How do I book or reschedule an appointment?",
      answer: "You can easily book, cancel, or reschedule your visits directly through our secure patient dashboard anytime."
    },
    {
      question: "Can I consult a doctor online?",
      answer: "Yes, our platform offers secure video consultations with certified specialists from the comfort of home"
    },
    {
      question: "Do your doctors issue prescriptions?",
      answer: "Yes, our doctors can issue and send prescriptions directly to your preferred local pharmacy after a consultation."
    },
    {
      question: "Is my medical information kept private?",
      answer: "Absolutely. Our platform is fully HIPAA-compliant and uses advanced encryption to protect your sensitive health data."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      
      {/* Hero Section with Nav */}
      <section className="relative w-full min-h-screen bg-gradient-to-br from-[#1db1d7] via-[#107c9f] to-[#073c52] text-white">
        
        {/* Navigation */}
        <div className="absolute top-6 w-full z-50 flex justify-center px-4">
          <nav className="w-full max-w-[1100px] bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-3 flex justify-between items-center shadow-lg">
            <div className="flex items-center space-x-3 ml-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1db1d7]">
                <Plus strokeWidth={4} size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">MediCareX</span>
            </div>
            
            <div className="hidden md:flex space-x-8 text-sm font-semibold text-white">
              <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="hover:text-white/80 transition-colors">Services</a>
              <a href="#doctors" onClick={(e) => scrollToSection(e, 'doctors')} className="hover:text-white/80 transition-colors">Doctors</a>
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-white/80 transition-colors">About us</a>
              <a href="#process" onClick={(e) => scrollToSection(e, 'process')} className="hover:text-white/80 transition-colors">Process</a>
            </div>

            <div className="mr-1">
              <Link to="/login" className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm">
                Contact us
              </Link>
            </div>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="max-w-[1400px] mx-auto px-8 pt-40 pb-20 grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          
          {/* Left Text */}
          <div className="pr-12">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <span className="flex items-center justify-center bg-white text-[#107c9f] w-5 h-5 rounded-full text-xs mr-1"><Play fill="currentColor" size={10} /></span>
              <span className="text-sm font-medium">True 24/7</span>
              <span className="text-white/60 text-sm">|</span>
              <span className="text-sm">Care when it counts</span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
              Real doctors, <br />real care always.
            </h1>
            
            <p className="text-lg text-white/80 mb-10 max-w-lg leading-relaxed font-light">
              Discover experienced doctors, compare specialties, and book trusted appointments easily online.
            </p>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="bg-white text-slate-900 px-8 py-3.5 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                See Doctors
              </Link>
              <Link to="/login" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3.5 rounded-full font-semibold transition-colors">
                Book a call
              </Link>
            </div>
          </div>

          {/* Right Visual Carousel */}
          <div className="relative h-[600px] flex items-center justify-center">
            
            {/* Left Card (Faded) */}
            <div className="absolute left-0 transform -translate-x-12 scale-90 opacity-40 rounded-[2rem] overflow-hidden w-[300px] h-[400px]">
               <img src="https://images.unsplash.com/photo-1594824436951-7f12678cecea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Doctor" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Right Card (Faded) */}
            <div className="absolute right-0 transform translate-x-12 scale-90 opacity-40 rounded-[2rem] overflow-hidden w-[300px] h-[400px]">
               <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Doctor" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Center Main Card */}
            <div className="relative z-10 w-[380px] h-[480px] bg-slate-200 rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white/10">
              <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Dr. James Carter" className="w-full h-full object-cover" />
              
              {/* Top Right Badge */}
              <div className="absolute top-4 right-4 bg-[#0a3d52] text-white px-3 py-1.5 rounded-full flex items-center text-sm font-semibold shadow-md">
                <Star fill="currentColor" size={14} className="mr-1" /> 4.9/5
              </div>

              {/* Bottom Pill */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] bg-white rounded-full p-2 flex items-center shadow-xl">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="Avatar" />
                <div className="ml-3 flex-1">
                  <h4 className="text-slate-900 font-bold text-sm leading-tight">Dr. James Carter</h4>
                  <p className="text-slate-500 text-xs">Cardiologist</p>
                </div>
                <button onClick={() => toast.success("View Doctor Profile")} className="w-10 h-10 rounded-full bg-[#1db1d7] flex items-center justify-center text-white hover:bg-[#1598b9] transition-colors">
                  <Camera size={18} />
                </button>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="absolute -bottom-6 flex space-x-4 z-20">
              <button onClick={() => toast.success("Showing previous doctors")} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/10">
                <ChevronLeft size={24} />
              </button>
              <button onClick={() => toast.success("Showing more doctors")} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/10">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Logos Section */}
      <section className="py-16 border-b border-gray-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 flex justify-center items-center space-x-16 opacity-40 grayscale">
           {/* Mock Logos */}
           <div className="text-2xl font-bold flex items-center space-x-2"><Asterisk /><span>logoipsum</span></div>
           <div className="text-2xl font-bold flex items-center space-x-2"><Asterisk /><span>logoipsum</span></div>
           <div className="text-2xl font-bold flex items-center space-x-2"><Asterisk /><span>LOGO</span></div>
           <div className="text-2xl font-bold flex items-center space-x-2"><Asterisk /><span>logoipsum</span></div>
           <div className="text-2xl font-bold flex items-center space-x-2"><Asterisk /><span>logoipsum</span></div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#FAFBFC]">
        <div className="max-w-[1200px] mx-auto px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
              <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                <Shield size={12} fill="currentColor" />
              </div>
              About MediCareX
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
              We are a modern healthcare team focused on connecting you with trusted doctors and making quality care easy, clear, and accessible anytime.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 h-[400px]">
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
              <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Doctor smiling" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-5xl font-bold text-slate-900 mb-2">120+</h3>
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
      <section id="services" className="py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
              <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                <Shield size={12} fill="currentColor" />
              </div>
              Our Services
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              All your healthcare <br />needs, one place.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Service 1 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <span className="text-slate-500 font-medium">/001</span>
                <div className="w-10 h-10 rounded-full bg-[#107c9f] text-white flex items-center justify-center">
                  <Stethoscope size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Primary Care</h3>
              <p className="text-slate-500 mb-6 flex-1">Your first stop for everyday health and preventive needs.</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-full text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={12} className="text-[#107c9f] mr-1" /> Check-ups
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-full text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={12} className="text-[#107c9f] mr-1" /> Prevention
                </span>
              </div>

              <div className="h-48 rounded-2xl overflow-hidden mt-auto">
                <img src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Primary Care" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <span className="text-slate-500 font-medium">/002</span>
                <div className="w-10 h-10 rounded-full bg-[#0a3d52] text-white flex items-center justify-center">
                  <Heart size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Cardiology</h3>
              <p className="text-slate-500 mb-6 flex-1">Expert heart care from prevention to advanced cardiac treatment plans.</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-full text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={12} className="text-[#0a3d52] mr-1" /> Heart Care
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-full text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={12} className="text-[#0a3d52] mr-1" /> Diagnosis
                </span>
              </div>

              <div className="h-48 rounded-2xl overflow-hidden mt-auto">
                <img src="https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Cardiology" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <span className="text-slate-500 font-medium">/003</span>
                <div className="w-10 h-10 rounded-full bg-[#1db1d7] text-white flex items-center justify-center">
                  <Asterisk size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Dermatology</h3>
              <p className="text-slate-500 mb-6 flex-1">Advanced skin care for conditions and cosmetic solutions.</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-full text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={12} className="text-[#1db1d7] mr-1" /> Skin Care
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-full text-xs font-semibold text-slate-700">
                  <CheckCircle2 size={12} className="text-[#1db1d7] mr-1" /> Cosmetic
                </span>
              </div>

              <div className="h-48 rounded-2xl overflow-hidden mt-auto">
                <img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Dermatology" className="w-full h-full object-cover" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="process" className="py-32 bg-gradient-to-b from-[#073c52] to-[#104764] text-white">
        <div className="max-w-[1200px] mx-auto px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="flex items-center justify-center bg-white/20 text-white w-5 h-5 rounded-full text-xs mr-1"><Plus size={10} strokeWidth={3} /></span>
            <span className="text-sm font-medium">How it works</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-24">
            Your health journey<br />in three simple steps.
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
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
      <section id="doctors" className="py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
            <div>
              <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
                <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                  <Shield size={12} fill="currentColor" />
                </div>
                Specialized Doctors
              </div>
              <h2 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                Dedicated doctors,<br />committed to your care
              </h2>
            </div>
            <div className="flex space-x-4 mt-8 md:mt-0 pb-4">
              <button onClick={() => toast.success("Showing previous doctors")} className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-900 hover:bg-gray-50 shadow-sm">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => toast.success("Showing more doctors")} className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-900 hover:bg-gray-50 shadow-sm">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-0 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-6">
            {/* Left Image Side */}
            <div className="relative h-[500px] rounded-[1.5rem] overflow-hidden bg-slate-200">
              <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover object-top" alt="Dr. James" />
              {/* Pill */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] bg-white rounded-full p-2 flex items-center shadow-xl">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="Avatar" />
                <div className="ml-3 flex-1">
                  <h4 className="text-slate-900 font-bold text-sm leading-tight">Dr. James Carter</h4>
                  <p className="text-slate-500 text-xs">Cardiologist</p>
                </div>
                <button onClick={() => toast.success("View Doctor Profile")} className="w-10 h-10 rounded-full bg-[#1db1d7] flex items-center justify-center text-white hover:bg-[#1598b9] transition-colors">
                  <Camera size={18} />
                </button>
              </div>
            </div>

            {/* Right Details Side */}
            <div className="p-8 lg:p-12 flex flex-col">
              <h3 className="text-3xl font-bold text-slate-900 mb-4">About Dr. James:</h3>
              <p className="text-slate-500 text-lg mb-12 max-w-xl">Experienced in treating complex heart conditions with a compassionate, patient-first care approach.</p>
              
              <div className="grid grid-cols-2 gap-8 mb-auto">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Specialty</p>
                    <p className="text-slate-900 font-bold">Cardiologist</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Experience</p>
                    <p className="text-slate-900 font-bold">12+ Years</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Hospital</p>
                    <p className="text-slate-900 font-bold">City Heart Clinic</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-900">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Availability</p>
                    <p className="text-slate-900 font-bold">Mon - Fri</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-start lg:justify-end">
                <Link to="/login" className="bg-[#0a3d52] text-white px-10 py-4 rounded-full font-bold hover:bg-[#104764] transition-colors w-full md:w-auto text-center">
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
              <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                <Shield size={12} fill="currentColor" />
              </div>
              Why MediCareX?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Why Choose MediCareX<br />for Better Healthcare
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-[500px]">
              <div className="h-[55%] bg-gradient-to-br from-[#073c52] to-[#107c9f] p-8 relative overflow-hidden flex flex-col justify-center space-y-3">
                 {/* Stacked Pills mock */}
                 <div className="bg-white/10 backdrop-blur-md rounded-full p-2 pr-4 flex items-center shadow-lg border border-white/10 w-[90%] transform -translate-x-4">
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-8 h-8 rounded-full" alt="avatar"/>
                    <div className="ml-3 flex-1 text-white">
                      <p className="text-xs font-bold">Dr. James Carter</p>
                      <p className="text-[10px] text-white/70">Cardiologist</p>
                    </div>
                    <button onClick={() => toast.success("View Profile")} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#107c9f] hover:bg-gray-100 transition-colors"><Camera size={12} /></button>
                 </div>
                 <div className="bg-white/20 backdrop-blur-md rounded-full p-2 pr-4 flex items-center shadow-lg border border-white/20 w-full transform translate-x-2 relative z-10">
                    <img src="https://images.unsplash.com/photo-1594824436951-7f12678cecea?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-8 h-8 rounded-full" alt="avatar"/>
                    <div className="ml-3 flex-1 text-white">
                      <p className="text-xs font-bold">Dr. Sarah Mitchell</p>
                      <p className="text-[10px] text-white/70">Dermatologist</p>
                    </div>
                    <button onClick={() => toast.success("View Profile")} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#107c9f] hover:bg-gray-100 transition-colors"><Camera size={12} /></button>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md rounded-full p-2 pr-4 flex items-center shadow-lg border border-white/10 w-[90%] transform -translate-x-2">
                    <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-8 h-8 rounded-full" alt="avatar"/>
                    <div className="ml-3 flex-1 text-white">
                      <p className="text-xs font-bold">Dr. Robert Elisson</p>
                      <p className="text-[10px] text-white/70">General Physician</p>
                    </div>
                    <button onClick={() => toast.success("View Profile")} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#107c9f] hover:bg-gray-100 transition-colors"><Camera size={12} /></button>
                 </div>
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
      <section id="testimonials" className="py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
              <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                <Shield size={12} fill="currentColor" />
              </div>
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Trusted by thousands<br />of happy patients.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-between h-[450px]">
              <div>
                <div className="flex text-amber-500 mb-6">
                  <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
                </div>
                <p className="text-slate-600 text-lg leading-relaxed">Booking my appointment was completely effortless. The platform made it simple to find the right doctor and get care quickly.</p>
              </div>
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-12 h-12 rounded-full object-cover mr-4" alt="Sarah" />
                  <div>
                    <h4 className="font-bold text-slate-900">Sarah Jenkins</h4>
                    <p className="text-sm text-slate-500">Graphic Designer</p>
                  </div>
                </div>
                <button onClick={() => toast.success("View Testimonial Details")} className="w-10 h-10 rounded-full bg-[#0a3d52] flex items-center justify-center text-white hover:bg-[#104764] transition-colors">
                  <Camera size={16} />
                </button>
              </div>
            </div>

            {/* Review 2 (Dark Featured) */}
            <div className="rounded-[2rem] p-10 shadow-xl border border-gray-100 flex flex-col justify-end h-[450px] relative overflow-hidden text-white transform md:-translate-y-4">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover" alt="Michael" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="relative z-10">
                <div className="flex text-white mb-6">
                  <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
                </div>
                <p className="text-lg leading-relaxed font-medium mb-8">I found a specialist within minutes. The whole process was smooth, clear, and stress-free from start to finish.</p>
                <div className="flex items-center">
                    <h4 className="font-bold">Michael Brown</h4>
                    <span className="mx-2 text-white/50">—</span>
                    <p className="text-sm text-white/80">Software Engineer</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-between h-[450px]">
              <div>
                <div className="flex text-amber-500 mb-6">
                  <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
                </div>
                <p className="text-slate-600 text-lg leading-relaxed">MediCareX connected me with an amazing cardiologist. I felt heard, cared for, and supported throughout my entire visit.</p>
              </div>
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-12 h-12 rounded-full object-cover mr-4" alt="Emily" />
                  <div>
                    <h4 className="font-bold text-slate-900">Emily Davis</h4>
                    <p className="text-sm text-slate-500">School Teacher</p>
                  </div>
                </div>
                <button onClick={() => toast.success("View Testimonial Details")} className="w-10 h-10 rounded-full bg-[#0a3d52] flex items-center justify-center text-white hover:bg-[#104764] transition-colors">
                  <Camera size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[#FAFBFC]">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 mb-24">
            
            {/* Left FAQ Intro */}
            <div>
              <div className="inline-flex items-center text-[#107c9f] font-semibold text-sm mb-6">
                <div className="w-5 h-5 rounded-full bg-[#107c9f] text-white flex items-center justify-center mr-2">
                  <Shield size={12} fill="currentColor" />
                </div>
                FAQ
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
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
              {faqData.map((faq, index) => (
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
              ))}
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
                 <p className="text-white/80 max-w-md text-sm md:text-base">Book a call with our friendly team to learn how MedicareX simplifies your healthcare journey.</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer / Get Started Section */}
      <section className="relative pt-32 pb-8 bg-gradient-to-br from-[#1db1d7] via-[#107c9f] to-[#073c52] text-white overflow-hidden">
        
        {/* Floating Avatars */}
        <img src="https://images.unsplash.com/photo-1594824436951-7f12678cecea?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="absolute top-20 left-[20%] w-20 h-20 rounded-full border-4 border-white/20 object-cover shadow-lg" alt="Doctor" />
        <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="absolute top-20 right-[25%] w-16 h-16 rounded-full border-4 border-white/20 object-cover shadow-lg" alt="Doctor" />
        <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="absolute bottom-[40%] left-[25%] w-16 h-16 rounded-full border-4 border-white/20 object-cover shadow-lg" alt="Doctor" />
        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" className="absolute bottom-[45%] right-[20%] w-20 h-20 rounded-full border-4 border-white/20 object-cover shadow-lg" alt="Doctor" />

        <div className="max-w-[1000px] mx-auto px-8 text-center relative z-10 mb-32">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="flex items-center justify-center bg-white/20 text-white w-5 h-5 rounded-full text-xs mr-1"><Plus size={10} strokeWidth={3} /></span>
            <span className="text-sm font-medium">Get started</span>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold tracking-tight mb-8">
            Your better health<br />journey starts here.
          </h2>
          
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
            Discover experienced healthcare professionals and manage all your medical visits in one convenient, secure place.
          </p>

          <div className="flex items-center justify-center space-x-4">
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
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-12 flex flex-col justify-between">
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
              {/* Brand & Newsletter */}
              <div className="max-w-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1db1d7]">
                    <Plus strokeWidth={4} size={20} />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">MediCareX</span>
                </div>
                <p className="text-white/70 mb-8 text-sm leading-relaxed">A premium clinic template built for modern medical professionals.</p>
                
                {/* Newsletter Input */}
                <form onSubmit={handleNewsletterSubmit} className="flex items-center bg-white/10 border border-white/20 rounded-full p-1.5 w-full max-w-sm">
                  <input type="email" placeholder="Enter your e-mail" className="bg-transparent border-none outline-none text-white px-4 py-2 text-sm w-full placeholder:text-white/50" />
                  <button type="submit" className="bg-white text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors shrink-0">
                    Submit
                  </button>
                </form>
              </div>

              {/* Links */}
              <div className="flex space-x-20 lg:space-x-32">
                <div>
                  <h4 className="text-lg font-bold mb-6">Navigation</h4>
                  <ul className="space-y-4 text-white/80 font-medium text-sm">
                    <li><a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'})}} className="hover:text-white transition-colors">Home</a></li>
                    <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-white transition-colors">About us</a></li>
                    <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-white transition-colors">Why Choose us</a></li>
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
              <p>Copyright@2026 &nbsp;&bull;&nbsp; Made in framer</p>
              <div className="flex items-center mt-4 md:mt-0">
                <span className="mr-3">Template by</span>
                <div className="flex items-center text-white font-medium">
                  <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=80" alt="Nasir Nawaz" className="w-6 h-6 rounded-full mr-2 object-cover border border-white/20" />
                  Nasir Nawaz
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
