import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./UserProfile.module.css";
import { FaUserEdit } from "react-icons/fa";
import Loading from "../../components/Loading/Loading";
import { CgProfile } from "react-icons/cg";
import { IoLogOutOutline } from "react-icons/io5";
import Cookies from "js-cookie";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const cachedUser = sessionStorage.getItem("userData");
    if (cachedUser) {
      setTimeout(() => {
        setLoading(false);
      }, 500);

      console.log("Using cached user data...");
      setUser(JSON.parse(cachedUser)); // Use cached data instantly
    } else {
      const fetchUserData = async () => {
        try {
          console.log("Fetching user data...");
          const res = await axios.get(`${backendURL}/me`, {
            withCredentials: true,
          });
          setUser(res.data.me);
          sessionStorage.setItem("userData", JSON.stringify(res.data.me));
          console.log("User data fetched:", res.data.me);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };

      setLoading(true);
      setTimeout(() => {
        fetchUserData();
      }, 500);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${backendURL}/logout`, {}, { withCredentials: true }); // Call backend logout
      Cookies.remove("token"); // Remove token from frontend cookies
      sessionStorage.clear(); // Clear all session storage
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.title}>
        <p>My Profile</p>
        <CgProfile color="green" />
      </div>
      {loading ? (
        <div className={styles.loading}>
          <Loading height={80} width={80} loop={true} autoplay={true} />
        </div>
      ) : (
        <>
          <div className={styles.toptopWrapper}>
            <div className={styles.topWrapper}>
              <div className={styles.profileHeader}>
                <div>
                  <h2 className={styles.profileName}>{user.name || "N/A"}</h2>
                  <p className={styles.profileEmail}>
                    {user.username || "N/A"}{" "}
                    <small>{user.gender === "Male" ? "(M)" : "(F)"}</small>{" "}
                  </p>
                </div>
                <div className={styles.logedit}>
                  <div
                    className={styles.profileEdit}
                    onClick={() => navigate("/userupdate")}
                  >
                    <FaUserEdit size={15} color="green" />
                    <p>Edit</p>
                  </div>
                  <IoLogOutOutline onClick={handleLogout} size={30} color="white" />
                </div>
              </div>
              <div className={styles.userDetailsWrapper}>
                <div className={styles.smallUserDetails}>
                  <div>
                    <strong>Age:</strong> {user.age || "N/A"}
                  </div>
                  <div>
                    <strong>Weight:</strong> {user.weight || "N/A "}kg
                  </div>
                  <div>
                    <strong>Height:</strong> {user.height || "N/A "}cm
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.subWrapper}>
            <div className={styles.profileSection}>
              <label>Diet Type</label>
              <p className={styles.profInfo}>{user.dietType || "N/A"}</p>
            </div>
            <div className={styles.profileSection}>
              <label>Allergies</label>
              <p className={styles.profInfo}>{user.allergies || "N/A"}</p>
            </div>
            <div className={styles.profileSection}>
              <label>Intolerances</label>
              <p className={styles.profInfo}>{user.intolerances || "N/A"}</p>
            </div>
            <div className={styles.profileSection}>
              <label>Pre-existing Conditions</label>
              <p className={styles.profInfo}>
                {user.preExistingConditions || "N/A"}
              </p>
            </div>
            <div className={styles.profileSection}>
              <label>Current Medications</label>
              <p className={styles.profInfo}>
                {user.currentMedications || "N/A"}
              </p>
            </div>
            <div className={styles.profileSection}>
              <label>Medical History</label>
              <p className={styles.profInfo}>{user.medicalHistory || "N/A"}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
