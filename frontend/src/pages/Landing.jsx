import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  // Optional: scroll animation for sections
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
            MovieRec
          </div>
          <div className="space-x-4">
            <Link
              to="/login"
              className="px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition shadow-lg"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/30 via-gray-900 to-gray-900"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-red-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Discover Your Next Favorite Movie
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Stop endless scrolling. Get smart recommendations, build a watchlist, and rate movies – all tailored to your taste.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 font-semibold transition transform hover:scale-105 shadow-xl"
              >
                Start Watching for Free
              </Link>
              <Link
                to="#how-it-works"
                className="px-8 py-3 rounded-full border border-gray-600 hover:bg-gray-800 font-semibold transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </section>

      {/* Features Grid (scroll animation) */}
      <section
        ref={(el) => (sectionsRef.current[0] = el)}
        className="py-20 bg-gray-800/40 opacity-0 translate-y-8 transition-all duration-700"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need in one place</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powerful features to help you find, rate, and organize movies effortlessly.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature
              icon="🎯"
              title="Personalized AI Recommendations"
              description="Rate movies 7★ or higher and our smart engine suggests similar films. 'Because you liked Interstellar' – always relevant."
            />
            <Feature
              icon="📝"
              title="Watchlist & History"
              description="Save movies for later, mark as watched, and keep a complete log of everything you've seen."
            />
            <Feature
              icon="🔍"
              title="Advanced Search & Filters"
              description="Search by title, year, rating, language. Find exactly what you're in the mood for."
            />
            <Feature
              icon="🔥"
              title="Trending & Latest Releases"
              description="Stay up‑to‑date with today's trending movies and the newest arrivals in one click."
            />
            <Feature
              icon="⭐"
              title="Rate & Review"
              description="Give movies a star rating (1‑10) and mark them watched. Your taste shapes your recommendations."
            />
            <Feature
              icon="🎬"
              title="Powered by TMDB"
              description="Access a vast library of movies, posters, and metadata – from classics to the latest blockbusters."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        ref={(el) => (sectionsRef.current[1] = el)}
        className="py-20 opacity-0 translate-y-8 transition-all duration-700 delay-100"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get started in three simple steps</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From sign‑up to personalized picks – it takes only minutes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <Step number={1} title="Create your account">
              Sign up for free using your email and a password. No credit card required.
            </Step>
            <Step number={2} title="Rate movies you love">
              Go to any movie page and give a high rating (7★+). That’s how we learn your taste.
            </Step>
            <Step number={3} title="Get personalized picks">
              Instantly see your tailored recommendations, discover hidden gems, and build your watchlist.
            </Step>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-purple-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to stop guessing what to watch?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of movie lovers who find their next favorite film with us.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-xl"
          >
            Get Started – It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold text-red-500">MovieRec</div>
            <div className="text-gray-400 text-sm">
              © 2025 MovieRec. All rights reserved.
            </div>
            <div className="text-sm text-gray-500">
              Data provided by{" "}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:underline"
              >
                TMDB
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Reusable Feature Card Component
const Feature = ({ icon, title, description }) => (
  <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1 shadow-xl">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

// Reusable Step Component
const Step = ({ number, title, children }) => (
  <div className="text-center group">
    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
      {number}
    </div>
    <h3 className="text-2xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-400 max-w-xs mx-auto">{children}</p>
  </div>
);

export default Landing;