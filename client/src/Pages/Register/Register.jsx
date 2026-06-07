import React, { useEffect, useState } from "react";
import styles from "./Register.module.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdError } from "react-icons/md";
import Cookies from "js-cookie";

const backendURL = import.meta.env.VITE_BACKEND_URL;


function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const [errmessage, setErrMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    name: "",
    username: "",
    password: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    dietType: "",
    allergies: "",
    intolerances: "",
    preExistingConditions: "",
    currentMedications: "",
    medicalHistory: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMessage("");

    // Check required fields
    if (!user.name || !user.username || !user.password || !user.gender) {
      setErrMessage("Please fill out all required fields!");
      return;
    }

    // Convert numeric values correctly
    const userData = {
      ...user,
      age: user.age ? Number(user.age) : "",
      height: user.height ? Number(user.height) : "",
      weight: user.weight ? Number(user.weight) : "",
      dietType: user.dietType || "N/A",
      allergies: user.allergies || "N/A",
      intolerances: user.intolerances || "N/A",
      preExistingConditions: user.preExistingConditions || "N/A",
      currentMedications: user.currentMedications || "N/A",
      medicalHistory: user.medicalHistory || "N/A",
    };

    console.log("Sending user data:", userData);

    setLoading(true);
    setTimeout(async () => {
      try {
        const response = await axios.post(
          `${backendURL}/register`,
          userData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("Response from /register API:", response.data.message);
        if (response.data.message !== "verified") {
          setErrMessage(response.data.message);
        } else {
          setUser({
            name: "",
            username: "",
            password: "",
            gender: "",
            age: "",
            height: "",
            weight: "",
            profilePic: "",
            dietType: "",
            allergies: "",
            intolerances: "",
            preExistingConditions: "",
            currentMedications: "",
            medicalHistory: "",
          });

          navigate("/login");
        }
      } catch (error) {
        console.error("Error:", error);
        setErrMessage("There was an error creating your account.");
      } finally {
        setLoading(false);
      }
    }, 2000); // 3 seconds delay
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };


  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <h1>Create an Account</h1>
        <p>Join us and enjoy all features.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputdiv}>
            <input type="text" name="name" placeholder="Full Name *" value={user.name} onChange={handleChange} />
            <input type="text" name="username" placeholder="Username *" value={user.username} onChange={handleChange} />
            <input type="password" name="password" placeholder="Password *" value={user.password} onChange={handleChange} />
            <div className={styles.inputGroup}>
              <select name="gender" className={styles.gender} value={user.gender} onChange={handleChange}>
                <option  value="">Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input type="number" name="age" placeholder="Age" value={user.age} onChange={handleChange} />
              <input type="number" name="height" placeholder="Height (cm)" value={user.height} onChange={handleChange} />
              <input type="number" name="weight" placeholder="Weight (kg)" value={user.weight} onChange={handleChange} />
            </div>
            <input type="text" name="dietType" placeholder="Diet Type" value={user.dietType} onChange={handleChange} />
            <input type="text" name="allergies" placeholder="Allergies" value={user.allergies} onChange={handleChange} />
            <input type="text" name="intolerances" placeholder="Intolerances" value={user.intolerances} onChange={handleChange} />
            <input type="text" name="preExistingConditions" placeholder="Pre-existing Conditions" value={user.preExistingConditions} onChange={handleChange} />
            <input type="text" name="currentMedications" placeholder="Current Medications" value={user.currentMedications} onChange={handleChange} />
            <textarea name="medicalHistory" placeholder="Medical History" value={user.medicalHistory} onChange={handleChange} />
          </div>

          <div className={styles.errDiv}>
            {errmessage && (
              <p className={styles.errMessage}>
                <MdError/>
                {errmessage}
              </p>
            )}
          </div>

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Loading..." : "Create Account"}
          </button>
        </form>

        <div className={styles.alreadyAcc}>
          <p>Already have an account?</p>
          <Link className={styles.loginRedirect} to="/login">
            <p>Login</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
