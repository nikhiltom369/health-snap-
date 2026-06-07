import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./UserUpdate.module.css";
import { CgProfile } from "react-icons/cg";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const UserUpdate = () => {
    const [editedUser, setEditedUser] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const cachedUser = sessionStorage.getItem("userData");
        if (cachedUser) {
            setEditedUser(JSON.parse(cachedUser)); // Use cached data instantly
        }

        const fetchUserData = async () => {
            try {
                const res = await axios.get(`${backendURL}/me`, { withCredentials: true });
                setEditedUser(res.data.me);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    };

    const onClose = () => {
        navigate("/profile") // Navigate back to profile after closing
    };

    const handleSave = async () => {
        setLoading(true);
        setTimeout(async ()=>{
            try {
                await axios.put(`${backendURL}/update-user`, editedUser, { withCredentials: true });
                sessionStorage.setItem("userData", JSON.stringify(editedUser)); // Update sessionStorage after save
                Object.keys(sessionStorage).forEach((key) => {
                    if (key.startsWith("aiRec-") || key.startsWith("fullData-")) {
                      sessionStorage.removeItem(key);
                    }
                  });
                onClose(); // Close and refresh profile page
            } catch (error) {
                console.error("Error updating user:", error.response?.data || error);
            } finally {
                setLoading(false);
            }
        },2000);
        
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <CgProfile size={30} color="green" />
                    <p>Edit Profile</p>
                    <IoClose size={24} color="rgb(191, 191, 191)" onClick={onClose} />
                </div>
                <div className={styles.ahw}>
                    <div className={styles.formGroup}>
                        <label>Age</label>
                        <input type="number" name="age" value={editedUser?.age || ""} onChange={handleChange} placeholder="Enter Age" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Height (cm)</label>
                        <input type="number" name="height" value={editedUser?.height || ""} onChange={handleChange} placeholder="Enter height" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Weight (kg)</label>
                        <input type="number" name="weight" value={editedUser?.weight || ""} onChange={handleChange} placeholder="Enter weight" />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Diet Type</label>
                    <input type="text" name="dietType" value={editedUser?.dietType || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label>Allergies</label>
                    <input type="text" name="allergies" value={editedUser?.allergies || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label>Intolerances</label>
                    <input type="text" name="intolerances" value={editedUser?.intolerances || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label>Pre-existing Conditions</label>
                    <input type="text" name="preExistingConditions" value={editedUser?.preExistingConditions || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label>Current Medications</label>
                    <input type="text" name="currentMedications" value={editedUser?.currentMedications || ""} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label>Medical History</label>
                    <input type="text" name="medicalHistory" value={editedUser?.medicalHistory || ""} onChange={handleChange} />
                </div>

                <div className={styles.buttonGroup}>
                    <button onClick={handleSave} className={styles.saveButton}>
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserUpdate;
