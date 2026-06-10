import React, { useState } from "react";
import styles from "./OCR.module.css";
import {
  IoChevronBackOutline,
  IoHomeOutline,
  IoCloudUploadSharp,
  IoCamera,
} from "react-icons/io5";
import { GoAlert } from "react-icons/go";
import { BsFileEarmarkArrowUpFill } from "react-icons/bs";
import { GoPaperclip } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import Loading from "../../components/Loading/Loading";

const backendURL = import.meta.env.VITE_BACKEND_URL;

function OCR() {
  const navigate = useNavigate();
  const [uploadedNutriImage, setUploadedNutriImage] = useState({
    image: null,
    obj: null,
    name: null,
  });
  const [uploadedIngredImage, setUploadedIngredImage] = useState({
    image: null,
    obj: null,
    name: null,
  });
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const barcodeId = searchParams.get("barcode");
  const [loading, setLoading] = useState(false);

  const handleUploadIngreChange = (e) => {
    setError("");
    const file = e.target.files[0];
    const fileType = file.type;
    console.log(fileType);

    if (fileType === "image/png" || fileType === "image/jpeg") {
      setUploadedIngredImage({
        image: URL.createObjectURL(file),
        obj: file,
        name: file.name,
      });
    } else {
      setError("Invalid file type. Please upload a .jpg or .png file.");
    }
  };

  const handleUploadNutriChange = (e) => {
    setError("");
    const file = e.target.files[0];
    const fileType = file.type;

    if (fileType === "image/png" || fileType === "image/jpeg") {
      setUploadedNutriImage({
        image: URL.createObjectURL(file),
        obj: file,
        name: file.name,
      });
    } else {
      setError("Invalid file type. Please upload a .jpg or .png file.");
    }
  };

  const handleNutriDelete = (e) => {
    setUploadedNutriImage({ image: null, obj: null, name: null });
    const fileInputs = document.querySelectorAll(".nutriInput");
    fileInputs.forEach((input) => {
      input.value = ""; // Reset all file inputs
    });
  };
  const handleIngreDelete = (e) => {
    setUploadedIngredImage({ image: null, obj: null, name: null });
    const fileInputs = document.querySelectorAll(".ingridInput");
    fileInputs.forEach((input) => {
      input.value = ""; // Reset all file inputs
    });
  };

  const handleOCRSubmit = async () => {
    console.log("Submitting files for OCR...");
    setLoading(true);
    if (!uploadedNutriImage.image || !uploadedIngredImage.image) {
      console.log("Please upload both of the images.");
      setError("Please upload both of the images.");
      setLoading(false);
      return;
    }

    // Create a FormData object to send files
    const formData = new FormData();
    formData.append("nutriImage", uploadedNutriImage.obj);
    formData.append("ingredImage", uploadedIngredImage.obj);
    formData.append("barcode", barcodeId);

    try {
      // Send POST request to backend
      console.log("Sending POST request to backend...");
      const response = await axios.post(
        `${backendURL}/detect`,

        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status !== 200) {
        setError("An unexpected error occurred. Please Try again later.");
        return;
      } else {
        console.log("Response from /detect", response.data);
        const finalBarcode = response.data.product.barcode || barcodeId;
        
        if (finalBarcode) {
          sessionStorage.removeItem(`product-${finalBarcode}`);
          sessionStorage.removeItem(`aiRec-${finalBarcode}`);
          sessionStorage.removeItem(`fullData-${finalBarcode}`);
          navigate(`/product/${finalBarcode}`, {
            state: { ocr: response.data.product },
            replace: true,
          });
        }
        window.history.go(-1);
      }
    } catch (error) {
      // Handle error if API request fails
      console.error(error);
      const errorMessage = error.response?.data?.error || "An unexpected error occurred. Please Try again later.";
      setError(errorMessage);
      setLoading(false);
    } 
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loading height={80} width={80} loop={true} autoplay={true} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.floatDiv}>
        <div className={styles.buttonDiv}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <IoChevronBackOutline size={24} color={"green"} />
          </button>
          <p>HS</p>
          <div className={styles.arrangeocr}>
            <button className={styles.backButton} onClick={() => navigate("/")}>
              <IoHomeOutline size={24} color={"green"} />
            </button>
          </div>
        </div>
      </div>
      <div className={styles.title}>
        <h1>
          <BsFileEarmarkArrowUpFill /> Upload Files
        </h1>
        <p>Please upload product nutri-info and Ingredients.</p>
      </div>
      <div className={styles.imageUploadDiv}>
        <div
          className={styles.imageUpload}
          style={{
            backgroundImage: `url(${uploadedIngredImage.image || "none"})`,
          }}
        >
          {uploadedIngredImage.image ? null : (
            <>
              <p>Upload Ingredients</p>
              <div>
                <IoCloudUploadSharp size={50} color={"white"} />
              </div>
            </>
          )}
          <div className={styles.buttons}>
            <label className={styles.firstBtn}>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadIngreChange}
                style={{ display: "none" }}
                className="ingridInput"
              />
              <GoPaperclip size={18} />
            </label>
            <label className={styles.secondBtn}>
              <input
                type="file"
                accept="image/*"
                capture="camera"
                onChange={handleUploadIngreChange}
                style={{ display: "none" }}
                className="ingridInput"
              />
              <p>Capture</p>
              <IoCamera size={18} style={{ marginTop: "2px" }} />
            </label>
          </div>
        </div>
        <div
          className={styles.imageUpload}
          style={{
            backgroundImage: `url(${uploadedNutriImage.image || "none"})`,
          }}
        >
          {uploadedNutriImage.image ? null : (
            <>
              <p>Upload Nutri-Label</p>
              <div>
                <IoCloudUploadSharp size={50} color={"white"} />
              </div>
            </>
          )}
          <div className={styles.buttons}>
            <label className={styles.firstBtn}>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadNutriChange}
                style={{ display: "none" }}
                className="nutriInput"
              />
              <GoPaperclip size={18} />
            </label>
            <label className={styles.secondBtn}>
              <input
                type="file"
                accept="image/*"
                capture="camera"
                onChange={handleUploadNutriChange}
                style={{ display: "none" }}
                className="nutriInput"
              />
              <p>Capture</p>
              <IoCamera size={18} style={{ marginTop: "2px" }} />
            </label>
          </div>
        </div>
      </div>
      <div className={error ? styles.error : styles.note}>
        {error ? (
          <div className={styles.alert}>
            <p className={styles.alertM}>
              <GoAlert size={13} />
            </p>{" "}
            <p className={styles.alertM}>{error}</p>
          </div>
        ) : (
          "Only .jpg and .png files. 1MB max file size"
        )}
      </div>
      <div className={styles.bothfiles}>
        <h2>Uploaded Files</h2>
        <p>Make sure to upload a high-quality image.</p>
        <div className={styles.uploadedFiles}>
          <p>Ingredients</p>
          <div className={styles.file}>
            {uploadedIngredImage.name && (
              <>
                <p className={styles.name}>{uploadedIngredImage.name}</p>
                <div>
                  <MdDeleteOutline
                    onClick={handleIngreDelete}
                    size={18}
                    color={"rgb(247, 49, 49)"}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className={styles.uploadedFiles}>
          <p>Nutri-Label</p>
          <div className={styles.file}>
            {uploadedNutriImage.name && (
              <>
                <p className={styles.name}>{uploadedNutriImage.name}</p>
                <div>
                  <MdDeleteOutline
                    onClick={handleNutriDelete}
                    size={18}
                    color={"rgb(247, 49, 49)"}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <button style={{color: "white"}} className={styles.proceed}  onClick={handleOCRSubmit}>
        Proceed
      </button>
    </div>
  );
}

export default OCR;
