import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Clock, Stethoscope, ArrowRight, Activity, Calendar, Users, HeartPulse } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-teal-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-sky-200">
                <HeartPulse size={24} />
              </div>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Health<span className="text-sky-500">Flow</span></span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#how-it-works" className="text-slate-600 hover:text-sky-500 font-medium transition-colors">How it works</a>
              <a href="#features" className="text-slate-600 hover:text-sky-500 font-medium transition-colors">Features</a>
              <a href="#testimonials" className="text-slate-600 hover:text-sky-500 font-medium transition-colors">Testimonials</a>
            </div>
            <div className="flex space-x-4">
              <Link to="/login" className="px-5 py-2.5 text-slate-600 font-medium hover:text-slate-900 transition-colors">Log in</Link>
              <Link to="/login" className="px-5 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-xl">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-200/50 blur-[100px]" />
          <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-200/40 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Content */}
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 font-semibold text-sm mb-6 border border-sky-200 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-sky-500"></span>
                <span>The Future of Healthcare</span>
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
                Modern care,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-teal-400">reimagined.</span>
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                Experience seamless healthcare management. Connect with top doctors, manage appointments, and access your medical records from anywhere, at any time.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/login" className="px-8 py-4 bg-sky-500 text-white rounded-full font-bold text-lg hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/30 flex items-center justify-center group">
                  Book an Appointment
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
                <a href="#how-it-works" className="px-8 py-4 bg-white text-slate-700 rounded-full font-bold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-center shadow-sm">
                  How it works
                </a>
              </motion.div>

              <motion.div variants={fadeIn} className="mt-12 flex items-center space-x-6 text-slate-500 text-sm font-medium">
                <div className="flex items-center"><Activity className="w-5 h-5 mr-2 text-teal-500" /> 24/7 Support</div>
                <div className="flex items-center"><Shield className="w-5 h-5 mr-2 text-sky-500" /> Secure Data</div>
              </motion.div>
            </motion.div>

            {/* Hero Visuals */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block h-[600px]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-100 to-teal-50 rounded-[3rem] transform rotate-3 shadow-2xl border border-white" />
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Doctor consulting patient" 
                className="absolute inset-0 w-full h-full object-cover rounded-[3rem] transform -rotate-3 shadow-xl transition-transform duration-500 hover:rotate-0"
              />
              
              {/* Floating Stat Card 1 */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-10 -left-12 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/50 flex items-center space-x-4"
              >
                <div className="bg-sky-100 p-3 rounded-xl text-sky-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Active Doctors</p>
                  <p className="text-2xl font-bold text-slate-900">500+</p>
                </div>
              </motion.div>

              {/* Floating Stat Card 2 */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 -right-8 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/50 flex items-center space-x-4"
              >
                <div className="bg-teal-100 p-3 rounded-xl text-teal-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Appointments Today</p>
                  <p className="text-2xl font-bold text-slate-900">1,240</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sky-500 font-semibold tracking-wide uppercase text-sm mb-3">Simple Process</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">How HealthFlow works</h3>
            <p className="text-xl text-slate-600">Get the care you need in three simple steps. We've optimized the entire process to save you time and stress.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 relative"
          >
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-sky-200 via-teal-200 to-sky-200 -z-10" />

            {/* Step 1 */}
            <motion.div variants={fadeIn} className="relative bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-sky-500 mb-6 border border-slate-100">
                <span className="text-2xl font-bold">01</span>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">Create Account</h4>
              <p className="text-slate-600 leading-relaxed">Sign up in seconds. Enter your basic details to create a secure personal health profile on our platform.</p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeIn} className="relative bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-teal-500 mb-6 border border-slate-100">
                <span className="text-2xl font-bold">02</span>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">Book Appointment</h4>
              <p className="text-slate-600 leading-relaxed">Browse top specialists, view their availability in real-time, and book a slot that works best for you.</p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeIn} className="relative bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-sky-500 mb-6 border border-slate-100">
                <span className="text-2xl font-bold">03</span>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">Get Care</h4>
              <p className="text-slate-600 leading-relaxed">Attend your consultation, access your digital prescriptions, and track your health progress seamlessly.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e18690c5e53b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to transform your health journey?</h2>
          <p className="text-xl text-slate-300 mb-10">Join thousands of patients who are already experiencing the future of healthcare.</p>
          <Link to="/login" className="inline-flex items-center px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-sky-50 transition-colors shadow-xl">
            Get Started Now
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200 text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <HeartPulse size={24} className="text-sky-500" />
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Health<span className="text-sky-500">Flow</span></span>
        </div>
        <p className="text-slate-500">© 2026 HealthFlow Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
