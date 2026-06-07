import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./Pages/Home/Home.jsx";
import QRScanner from "./Pages/QRScanner/QRSScanner.jsx";
import FoodDetails from "./components/FoodDetails/FoodDetails.jsx";
import ProductDetails from "./Pages/ProductDetails/ProductDetails.jsx";
import Navbar from "./components/Navbar/Navbar";
import NutriExplain from "./Pages/NutriExplain/NutriExplain.jsx";
import OCR from "./Pages/OCR/OCR.jsx";
import UserProfile from "./Pages/UserProfile/UserProfile.jsx";
import Register from "./Pages/Register/Register.jsx";
import styles from './App.module.css';
import Login from "./Pages/Login/Login.jsx";
import ProtectedRoute from "./utils/ProtectedRoutes.jsx";
import NotFound from "./Pages/NotFound/NotFound.jsx";
import UserUpdate from "./Pages/UserUpdate/UserUpdate.jsx";
import History from "./Pages/History/History.jsx";
import Suggestion from "./Pages/Suggestion/Suggestion.jsx";
import Compare from "./Pages/Compare/Compare.jsx";
import CmpResult from "./Pages/CmpResult/CmpResult.jsx";



const pageVariants = {
  initial: { opacity: 0},
  animate: { opacity: 1},
  exit: { opacity: 0 },
};
// const pageVariants = {
//   initial: { opacity: 0, y: 10 },
//   animate: { opacity: 1, y: 0 },
//   exit: { opacity: 0, y: -10 },
// };

const transitionSettings = {
  duration: 0.15,
  ease: "easeInOut",
};

// ✅ Move useLocation INSIDE the Router
const AnimatedRoutes = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/register", "/login", "*","/product","/food","/nutriscore","/ocr","/userupdate","/suggestion","/cmpproducts"]; // Hide navbar on these routes

  // Ensure the `path` is accurately checked for exact matches (including `*` fallback)
  const shouldHideNavbar = hideNavbarRoutes.some(route => location.pathname.includes(route));

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={transitionSettings}
          style={{ flex: 1 }}
        >
          <Routes location={location}>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/food/:id" element={<FoodDetails />} />
              <Route path="/scan" element={<QRScanner />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/nutriscore/:id" element={<NutriExplain />} />
              <Route path="/ocr" element={<OCR />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/cmpproducts" element={<CmpResult/>} />
              <Route path="/userupdate" element={<UserUpdate />} />
              <Route path="/history" element={<History />} />
              <Route path="/suggestion" element={<Suggestion/>}/>
              <Route path="/compare" element={<Compare />} />
            </Route>
           
            
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} /> {/* Fallback route */}
          </Routes>
        </motion.div>
      </AnimatePresence>

      {/* Conditionally show Navbar */}
      {!shouldHideNavbar && <Navbar />}
    </>
  );
};


// ✅ Ensure Router wraps everything
const App = () => {
  return (
    <Router>
      <div className={styles.appwrapper} style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <AnimatedRoutes />
      </div>
    </Router>
  );
};

export default App;
