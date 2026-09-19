import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };


  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-gradient-to-b from-gray-900 to-gray-800 text-white pt-12 pb-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 text-indigo-300">LearnHub</h3>
            <p className="text-gray-400 mb-4">
              Empowering students and educators with the best learning platform.
            </p>
            <div className="flex space-x-4">
              <motion.a 
                whileHover={{ y: -3 }}
                href="#" 
                className="text-gray-400 hover:text-indigo-300 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a 
                whileHover={{ y: -3 }}
                href="#" 
                className="text-gray-400 hover:text-indigo-300 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a 
                whileHover={{ y: -3 }}
                href="#" 
                className="text-gray-400 hover:text-indigo-300 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 text-indigo-300">Quick Links</h3>
            <ul className="space-y-2">
              <motion.li whileHover={{ x: 5 }}>
                <a href="/courses" className="text-gray-400 hover:text-white transition-colors">
                  Browse Courses
                </a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <a href="/instructors" className="text-gray-400 hover:text-white transition-colors">
                  Our Instructors
                </a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <a href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <a href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </a>
              </motion.li>
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 text-indigo-300">Support</h3>
            <ul className="space-y-2">
              <motion.li whileHover={{ x: 5 }}>
                <a href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <a href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </a>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <a href="/feedback" className="text-gray-400 hover:text-white transition-colors">
                  Feedback
                </a>
              </motion.li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4 text-indigo-300">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to get updates on new courses and features.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 w-full rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-r-lg transition-colors text-black"
              >
                <Mail className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.p 
              variants={itemVariants}
              className="text-sm text-gray-400 mb-4 md:mb-0"
            >
              &copy; {currentYear} LearnHub. All rights reserved.
            </motion.p>

            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
              <motion.a
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                href="/privacy"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Privacy Policy
              </motion.a>
              <motion.span 
                variants={itemVariants}
                className="text-gray-500 hidden sm:inline"
              >
                |
              </motion.span>
              <motion.a
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                href="/terms"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Terms of Service
              </motion.a>
              <motion.span 
                variants={itemVariants}
                className="text-gray-500 hidden sm:inline"
              >
                |
              </motion.span>
              <motion.a
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                href="/contact"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contact Us
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;