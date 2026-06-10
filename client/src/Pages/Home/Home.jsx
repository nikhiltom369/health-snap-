import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { GoGitCompare } from "react-icons/go";
import { IoScan } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { GoHistory } from "react-icons/go";
import { MdOutlineDocumentScanner } from "react-icons/md";
import Loading from "../../components/Loading/Loading";
import Cookies from "js-cookie";

function Home() {
  const [userData, setUserData] = useState({});
  const [Loading, setLoading] = useState(true);
  const [showScanModal, setShowScanModal] = useState(false);
  const navigate = useNavigate(); // Add navigation

  useEffect(() => {
    const cachedUser = sessionStorage.getItem("userData");
    if (cachedUser && cachedUser !== "undefined") {
      setLoading(false);
      console.log("Using cached user data...");
      setUserData(JSON.parse(cachedUser)); // Use cached data instantly
    } else {
      const fetchUserData = async () => {
        try {
          console.log("Fetching user data...");
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/me`,
            {
              withCredentials: true,
            }
          );
          if (res.data.me) {
            setUserData(res.data.me);
            sessionStorage.setItem("userData", JSON.stringify(res.data.me));
            console.log("User data fetched:", res.data.me);
          } else {
            console.error("User not found, redirecting to login");
            sessionStorage.removeItem("userData");
            Cookies.remove("token"); // Add this to break the loop!
            navigate("/login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          Cookies.remove("token"); // Add this to break the loop!
          navigate("/login");
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [navigate]);

  return (
    <div className={styles.homeDiv}>
      <div className={styles.productTitle}>
        <div className={styles.logo}></div>
      </div>
      <div className={styles.homeContent}>
        <div className={styles.name}>
          <p>Hii, {Loading ? "User" : userData.name}</p>
          <p>Want to scan a new Product ?</p>
        </div>
        <div className={styles.tipBox}>
          <div className={styles.slide} style={{display:"flex",minWidth:"100%"}}>
            <div className={styles.tagline}>
              <p>Health starts with a Scan!</p>
              <p>
                Quickly check food quality, allergens, and health impact before
                you buy.
              </p>
              <p onClick={() => navigate("/scan")}>Scan Now</p>
            </div>
            <div className={styles.img}></div>
          </div>

          <div className={styles.slide} style={{display:"flex",minWidth:"100%"}}>
            <div className={styles.tagline}>
              <p>Make informed choices
              </p>
              <p>
              Compare products side by side and pick the healthiest option for you.
              </p>
              <p onClick={() => navigate("/compare")}>Compare Now</p>
            </div>
            <div className={styles.img1}></div>
          </div>
          <div className={styles.slide} style={{display:"flex",minWidth:"100%"}}>
            <div className={styles.tagline}>
              <p>Health starts with a Scan!</p>
              <p>
                Quickly check food quality, allergens, and health impact before
                you buy.
              </p>
              <p onClick={() => navigate("/scan")}>Scan Now</p>
            </div>
            <div className={styles.img}></div>
          </div>

          <div className={styles.slide} style={{display:"flex",minWidth:"100%"}}>
            <div className={styles.tagline}>
              <p>Make informed choices
              </p>
              <p>
              Compare products side by side and pick the healthiest option for you.
              </p>
              <p onClick={() => navigate("/compare")}>Compare Now</p>
            </div>
            <div className={styles.img1}></div>
          </div>
          <div className={styles.slide} style={{display:"flex",minWidth:"100%"}}>
            <div className={styles.tagline}>
              <p>Health starts with a Scan!</p>
              <p>
                Quickly check food quality, allergens, and health impact before
                you buy.
              </p>
              <p onClick={() => navigate("/scan")}>Scan Now</p>
            </div>
            <div className={styles.img}></div>
          </div>

          <div className={styles.slide} style={{display:"flex",minWidth:"100%"}}>
            <div className={styles.tagline}>
              <p>Make informed choices
              </p>
              <p>
              Compare products side by side and pick the healthiest option for you.
              </p>
              <p onClick={() => navigate("/compare")}>Compare Now</p>
            </div>
            <div className={styles.img1}></div>
          </div>
        </div>
        
        <div className={styles.navBox}>
          <div className={styles.eachBox} onClick={() => setShowScanModal(true)}>
            <div className={styles.iconBox}>
              <div className={styles.icon}>
                <IoScan size={17} color="white" />
              </div>
            </div>
            <div className={styles.content}>
              <p>Scan</p>
              <p> Instantly scan barcodes for product details.</p>
            </div>
          </div>
          <div className={styles.eachBox} onClick={() => navigate("/profile")}>
            <div className={styles.iconBox}>
              <div className={styles.icon}>
                <CgProfile size={17} color="white" />
              </div>
            </div>
            <div className={styles.content}>
              <p>Profile</p>
              <p>View and manage your health preferences.</p>
            </div>
          </div>
          <div className={styles.eachBox} onClick={() => navigate("/history")}>
            <div className={styles.iconBox}>
              <div className={styles.icon}>
                <GoHistory size={17} color="white" />
              </div>
            </div>
            <div className={styles.content}>
              <p>History</p>
              <p>Track previously scanned food items.</p>
            </div>
          </div>
          <div className={styles.eachBox} onClick={() => navigate("/compare")}>
            <div className={styles.iconBox}>
              <div className={styles.icon}>
                <GoGitCompare size={17} color="white" />
              </div>
            </div>
            <div className={styles.content}>
              <p>Compare</p>
              <p>Compare products for better choices.</p>
            </div>
          </div>
        </div>
      </div>

      {showScanModal && (
        <div className={styles.modalOverlay} onClick={() => setShowScanModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Select Scan Method</h3>
            <div className={styles.modalButtons}>
              <button onClick={() => navigate("/scan")} className={styles.scanBtn}>
                <IoScan size={24} color="green" /> Barcode Scan
              </button>
              <button onClick={() => navigate("/ocr")} className={styles.scanBtn}>
                <MdOutlineDocumentScanner size={24} color="green" /> OCR Scan (Text)
              </button>
            </div>
            <button className={styles.closeBtn} onClick={() => setShowScanModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
