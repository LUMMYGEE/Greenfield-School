// // Note: Link component would need to be imported from react-router-dom in your actual project
// import { useState, useEffect } from "react";
import ImageCarousel from "../components/common/ImageCarousel";
import { getActiveCarouselImages } from "../services/carouselService";

// const Home = () => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [scrollY, setScrollY] = useState(0);

//   useEffect(() => {
//     setIsVisible(true);

//     const handleScroll = () => {
//       setScrollY(window.scrollY);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   const features = [
//     {
//       icon: "📚",
//       title: "Academic Excellence",
//       description:
//         "A commitment to high academic standards across all grade levels.",
//       accentColor: "from-green-400 to-emerald-500",
//     },
//     {
//       icon: "🎓",
//       title: "Experienced Staff",
//       description:
//         "Dedicated teachers and staff fostering growth and curiosity.",
//       accentColor: "from-emerald-400 to-teal-500",
//     },
//     {
//       icon: "🏫",
//       title: "Modern Facilities",
//       description:
//         "State-of-the-art classrooms, labs, and learning environments.",
//       accentColor: "from-teal-400 to-green-500",
//     },
//     {
//       icon: "🌿",
//       title: "Green Campus",
//       description: "Eco-friendly and safe campus promoting sustainable habits.",
//       accentColor: "from-lime-400 to-green-500",
//     },
//   ];

//   return (
//     /*<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden relative"> */

//     <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden relative">
//       {
//         /* Hero Section */
//         <section
//           className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative"
//           style={{ minHeight: "calc(100vh - var(--header-height, 80px))" }}
//         >
//           <div
//             className={`transform transition-all duration-1200 ${
//               isVisible
//                 ? "translate-y-0 opacity-100"
//                 : "translate-y-12 opacity-0"
//             }`}
//             style={{ transform: `translateY(${scrollY * 0.1}px)` }}
//           >
//             <div className="mb-8">
//               <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-black-100 to-black-100 border-2 border-green-200 rounded-full text-green-800 text-sm font-bold backdrop-blur-sm shadow-lg">
//                 <span className="animate-pulse">🌱</span>
//                 Nurturing Growth Since 1998
//               </span>
//             </div>

//             <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
//               <span className="bg-gradient-to-r from-green-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent">
//                 Welcome to
//               </span>
//               <br />
//               <span className="bg-gradient-to-r from-green-500 via-emerald-400 to-lime-500 bg-clip-text text-transparent animate-pulse">
//                 Greenfield
//               </span>
//             </h1>

//             <p className="text-xl md:text-2xl text-black-700 max-w-4xl mx-auto mb-12 leading-relaxed font-medium">
//               Where nature meets nurture in education. A thriving ecosystem of
//               learning where every student{" "}
//               <span className=" font-bold">blossoms </span> 
//               into their fullest potential.
//             </p>

//             <div className="flex gap-6 flex-wrap justify-center">
//               <a
//                 href="/about"
//                 className="group px-10 py-5 border-3 border-green-500 text-green-700 font-bold rounded-2xl backdrop-blur-sm hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-200"
//               >
//                 <span className="relative z-10 flex items-center gap-2">
//                   <span>🌿</span>
//                   Explore Our Garden of Learning
//                 </span>
//                 <div className="absolute inset-0 "></div>
//               </a>

//               <button className="group px-10 py-5 border-3 border-green-500 text-green-700 font-bold rounded-2xl backdrop-blur-sm hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-200">
//                 <span className="flex items-center gap-2">
//                   <span>🎋</span>
//                   Take Virtual Campus Tour
//                   <span className="transform group-hover:translate-x-1 transition-transform duration-300">
//                     →
//                   </span>
//                 </span>
//               </button>
//             </div>
//           </div>
//         </section>
//       }
//       {/* Features Section */}
//       <section className="py-32 relative bg-gradient-to-b from-transparent to-green-50/50">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-20">
//             <div className="mb-6">
//               <span className="inline-block px-4 py-2 bg-green-100 border border-green-200 rounded-full text-green-700 text-sm font-bold">
//                 🌳 Our Strengths
//               </span>
//             </div>
//             <h2 className="text-5xl md:text-7xl font-black mb-6">
//               <span className="bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent">
//                 Why Choose
//               </span>
//               <br />
//               <span className="bg-gradient-to-r from-green-500 to-lime-500 bg-clip-text text-transparent">
//                 Greenfield?
//               </span>
//             </h2>
//             <p className="text-xl text-black-600 max-w-3xl mx-auto">
//               Like a well-tended garden, we provide the perfect environment for
//               growth, learning, and flourishing at every stage of development.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {features.map((feature, index) => (
//               <div
//                 key={index}
//                 className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-8 border-2 border-green-100 hover:border-green-300 transition-all duration-500 transform hover:scale-105 hover:-translate-y-3 shadow-lg hover:shadow-2xl hover:shadow-green-200/50"
//                 style={{
//                   animationDelay: `${index * 200}ms`,
//                 }}
//               >
//                 <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

//                 <div className="relative z-10">
//                   <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
//                     {feature.icon}
//                   </div>
//                   <h3 className="text-2xl font-bold text-green-800 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
//                     {feature.title}
//                   </h3>
//                   <p className="text-green-600 leading-relaxed group-hover:text-green-700 transition-colors duration-300">
//                     {feature.description}
//                   </p>
//                 </div>

//                 <div
//                   className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.accentColor} rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
//                 ></div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Stats Section - Garden Theme */}
//       <section className="py-24 bg-gradient-to-r from-green-100 via-green-50 to-emerald-100 relative overflow-hidden">
//         {/* Soft Background Glow */}
//         <div className="absolute inset-0 bg-gradient-to-r from-green-300/20 to-emerald-300/20 pointer-events-none"></div>

//         {/* Content */}
//         <div className="max-w-6xl mx-auto px-6 relative z-10">
//           <div className="text-center mb-16">
//             <h3 className="text-4xl font-extrabold text-green-900 mb-4">
//               Our Growing Impact
//             </h3>
//             <p className="text-green-700 text-lg max-w-xl mx-auto">
//               Numbers that reflect our commitment to nurturing excellence
//             </p>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
//             {[
//               { number: "300+", label: "Flourishing Students", icon: "🌱" },
//               { number: "20+", label: "Expert Educators", icon: "👩‍🏫" },
//               { number: "15+", label: "Years of Growth", icon: "🌳" },
//               { number: "98%", label: "Exam Success Rate", icon: "🏆" },
//             ].map((stat, index) => (
//               <div
//                 key={index}
//                 className="group bg-white/70 backdrop-blur-lg shadow-lg rounded-xl p-6 hover:bg-white transition-all duration-300"
//               >
//                 <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
//                   {stat.icon}
//                 </div>
//                 <div className="text-3xl md:text-4xl font-black text-green-800 mb-1">
//                   {stat.number}
//                 </div>
//                 <div className="text-green-600 font-medium group-hover:text-green-800 transition-colors duration-300">
//                   {stat.label}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <footer className="bg-gray-900 text-gray-100 py-20 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gray-900/90"></div>
//         <div className="max-w-6xl mx-auto px-6 relative z-10">
//           <div className="text-center">
//             {/* Contact Info */}
//             <div className="space-y-3 text-gray-300 text-lg">
//               <p className="flex items-center justify-center gap-2">
//                 <span>🏫</span> 123 Learning Lane, Citytown, ST 12345
//               </p>
//               <p className="flex items-center justify-center gap-4 flex-wrap">
//                 <a
//                   href="mailto:info@greenfield.edu"
//                   className="hover:text-white transition duration-200 flex items-center gap-1"
//                 >
//                   <span>📧</span> info@greenfield.edu.ng
//                 </a>
//                 <span>|</span>
//                 <a
//                   href="tel:+11234567890"
//                   className="hover:text-white transition duration-200 flex items-center gap-1"
//                 >
//                   <span>📞</span> +234 08034543622
//                 </a>
//               </p>
//             </div>

//             {/* Footer Bottom */}
//             <div className="mt-5 pt-2 border-t border-gray-700">
//               <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
//                 © 2025 Greenfield School. All rights reserved. | Cultivated with
//                 💚 for education
//               </p>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Home;

import { useState, useEffect } from "react";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [carouselImages, setCarouselImages] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Load carousel images
  useEffect(() => {
    const loadCarouselImages = async () => {
      try {
        setCarouselLoading(true);
        const images = await getActiveCarouselImages();
        
        // If no images in database, use fallback images
        if (images.length === 0) {
          setCarouselImages([
            {
              src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
              alt: "Modern School Building",
              title: "Our Beautiful Campus",
              caption: "State-of-the-art facilities designed for optimal learning"
            },
            {
              src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
              alt: "Students in Classroom",
              title: "Interactive Learning",
              caption: "Engaging classroom environments that foster creativity and critical thinking"
            },
            {
              src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
              alt: "Science Laboratory",
              title: "Advanced Laboratories",
              caption: "Fully equipped science labs for hands-on experimentation and discovery"
            }
          ]);
        } else {
          setCarouselImages(images);
        }
      } catch (error) {
        console.error('Error loading carousel images:', error);
        // Use fallback images on error
        setCarouselImages([
          {
            src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
            alt: "Modern School Building",
            title: "Our Beautiful Campus",
            caption: "State-of-the-art facilities designed for optimal learning"
          }
        ]);
      } finally {
        setCarouselLoading(false);
      }
    };

    loadCarouselImages();
  }, []);

  const features = [
    {
      icon: "📚",
      title: "Academic Excellence",
      description:
        "A commitment to high academic standards across all grade levels.",
      accentColor: "from-green-400 to-emerald-500",
    },
    {
      icon: "🎓",
      title: "Experienced Staff",
      description:
        "Dedicated teachers and staff fostering growth and curiosity.",
      accentColor: "from-emerald-400 to-teal-500",
    },
    {
      icon: "🏫",
      title: "Modern Facilities",
      description:
        "State-of-the-art classrooms, labs, and learning environments.",
      accentColor: "from-teal-400 to-green-500",
    },
    {
      icon: "🌿",
      title: "Green Campus",
      description: "Eco-friendly and safe campus promoting sustainable habits.",
      accentColor: "from-lime-400 to-green-500",
    },
  ];

  
  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-green-50 overflow-hidden relative">
      {/* Hero Section */}
      <section
        className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative"
        style={{ minHeight: "calc(100vh - var(--header-height, 80px))" }}
      >
        <div
          className={`transform transition-all duration-1200 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-12 opacity-0"
          }`}
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 border border-green-200 rounded-full text-gray-700 text-sm font-semibold backdrop-blur-sm shadow-lg">
              <span className="animate-pulse">🌱</span>
              Nurturing Growth Since 1998
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-800 via-slate-700 to-gray-700 bg-clip-text text-transparent">
              Welcome to
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Greenfield
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed font-medium">
            Where nature meets nurture in education. A thriving ecosystem of
            learning where every student{" "}
            <span className="text-gray-800 font-bold">blossoms</span> 
            into their fullest potential.
          </p>

          <div className="flex gap-6 flex-wrap justify-center">
            <a
              href="/about"
              className="group px-10 py-5 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-200"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>🌿</span>
                Explore Our Garden of Learning
              </span>
            </a>

            <button className="group px-10 py-5 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <span className="flex items-center gap-2">
                <span>🎋</span>
                Take Virtual Campus Tour
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Campus Gallery Carousel Section */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50/20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-green-100 border border-green-200 rounded-full text-green-700 text-sm font-semibold">
                📸 Campus Gallery
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent">
                Explore Our
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Learning Environment
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Take a visual journey through our state-of-the-art facilities, vibrant classrooms, 
              and the spaces where learning comes alive every day.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {carouselLoading ? (
              <div className="w-full h-96 md:h-[500px] lg:h-[600px] bg-gray-200 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading gallery...</p>
                </div>
              </div>
            ) : carouselImages.length > 0 ? (
              <ImageCarousel 
                images={carouselImages}
                autoPlay={true}
                interval={4000}
                showDots={true}
                showArrows={true}
              />
            ) : (
              <div className="w-full h-96 md:h-[500px] lg:h-[600px] bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 text-6xl mb-4">📸</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Images Available</h3>
                  <p className="text-gray-500">Gallery images will appear here once uploaded by administrators.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative bg-gradient-to-b from-transparent to-green-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-green-100 border border-green-200 rounded-full text-green-700 text-sm font-semibold">
                🌳 Our Strengths
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent">
                Why Choose
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Greenfield?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Like a well-tended garden, we provide the perfect environment for
              growth, learning, and flourishing at every stage of development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-gray-200 hover:border-green-300 transition-all duration-500 transform hover:scale-105 hover:-translate-y-3 shadow-lg hover:shadow-2xl hover:shadow-green-200/50"
                style={{
                  animationDelay: `${index * 200}ms`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-green-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.accentColor} rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-white via-green-50/30 to-emerald-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-300/10 to-emerald-300/10 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-extrabold text-gray-800 mb-4">
              Our Growing Impact
            </h3>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Numbers that reflect our commitment to nurturing excellence
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "300+", label: "Flourishing Students", icon: "🌱" },
              { number: "20+", label: "Expert Educators", icon: "👩‍🏫" },
              { number: "15+", label: "Years of Growth", icon: "🌳" },
              { number: "98%", label: "Exam Success Rate", icon: "🏆" },
            ].map((stat, index) => (
              <div
                key={index}
                className="group bg-white/90 backdrop-blur-lg shadow-lg rounded-xl p-6 hover:bg-white transition-all duration-300 border border-gray-100"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-black text-gray-800 mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-100 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-900/90"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <div className="space-y-3 text-gray-300 text-lg">
              <p className="flex items-center justify-center gap-2">
                <span>🏫</span> 123 Learning Lane, Citytown, ST 12345
              </p>
              <p className="flex items-center justify-center gap-4 flex-wrap">
                <a
                  href="mailto:info@greenfield.edu"
                  className="hover:text-white transition duration-200 flex items-center gap-1"
                >
                  <span>📧</span> info@greenfield.edu.ng
                </a>
                <span>|</span>
                <a
                  href="tel:+11234567890"
                  className="hover:text-white transition duration-200 flex items-center gap-1"
                >
                  <span>📞</span> +234 08034543622
                </a>
              </p>
            </div>

            <div className="mt-5 pt-2 border-t border-gray-700">
              <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
                © 2025 Greenfield School. All rights reserved. | Cultivated with
                💚 for education
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
