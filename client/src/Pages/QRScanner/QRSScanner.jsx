import React, { useEffect, useState, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./QRScanner.module.css";
import { CiLocationArrow1 } from "react-icons/ci";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoChevronBackOutline, IoHomeOutline } from "react-icons/io5";
import { MdError } from "react-icons/md";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const QRScanner = () => {
  const [barcode, setBarcode] = useState("");
  const [productDetails, setProductDetails] = useState(null);
  const [isProductNotFound, setIsProductNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [errmessage, setErrMessage] = useState("");
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const codeReaderRef = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    if (!scanning || !videoRef.current) return;

    const codeReader = codeReaderRef.current;

    const videoConstraints = {
      facingMode: "environment",
      width: { ideal: 1280 }, // Higher resolution
      height: { ideal: 720 },
      focusMode: "continuous",
    };

    codeReader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current,
        async (result, err, controls) => {
          if (result) {
            setBarcode(result.text);
            setScanning(false);
            controlsRef.current = controls;

            try {
              const dbResponse = await axios.get(
                `${backendURL}/products/${result.text}`
              );
              if (dbResponse.data.message !== "Product not found") {
                setProductDetails(dbResponse.data.product_name);
              } else {
                fetchProductDetails(result.text);
              }
            } catch (error) {
              console.error("Error fetching product data:", error);
              setIsProductNotFound(true);
            }

            if (controls) controls.stop();
          }
          if (err) {
            setError("Scanning...");
          }
        },
        videoConstraints
      )
      .catch((err) => setError(err.message));

    return () => {
      codeReader.reset();
    };
  }, [scanning]);

  const fetchProductDetails = async (barcode) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const fooddata = await response.json();

      if (
        fooddata.product &&
        fooddata.product.product_name &&
        fooddata.product.brands
      ) {
        const productInfo = fooddata.product.brands
          ? `${fooddata.product.product_name}, ${fooddata.product.brands}`
          : fooddata.product.product_name;
        setProductDetails(productInfo);
      } else {
        setIsProductNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setIsProductNotFound(true);
    }
  };

  const retryScan = () => {
    setErrMessage("");
    setBarcode("");
    setProductDetails(null);
    setIsProductNotFound(false);
    setError(null);
    setScanning(true);
  };

  const proceed = () => {
    if (productDetails) {
      navigate(`/product/${barcode}?name=${productDetails}`);
    } else {
      setErrMessage("Please enter the product name to proceed.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonDivWrap}>
        <div className={styles.buttonDiv}>
          <button className={styles.backButton} onClick={() => navigate("/")}>
            <IoChevronBackOutline size={24} color="green" />
          </button>
          <p>HS</p>
          <button className={styles.backButton} onClick={() => navigate("/")}>
            <IoHomeOutline size={24} color="green" />
          </button>
        </div>
      </div>

      <h1 className={styles.title}>Barcode Scanner</h1>
      <p className={styles.desc}>Scan the Barcode to get product details.</p>
      <div className={styles.getResult}>
        {" "}
        {barcode ? (
          <p>{"Scanned Barcode : " + barcode}</p>
        ) : (
          <p>{"Looking for Barcode.. "}</p>
        )}
      </div>

      <div className={styles.scannerWrapper}>
        {scanning ? (
          <video ref={videoRef} className={styles.video} />
        ) : (
          <p style={{ color: "white" }}>Processing...</p>
        )}
      </div>

      {barcode && productDetails && (
        <div className={styles.yesProduct}>
          <div className={styles.yesProductWrap}>
            <div className={styles.wrap}>
              <p>
                <strong>Barcode:</strong>
                {barcode}
              </p>
              <div className={styles.productHandle}>
                <p>
                  <strong>Product:</strong>
                </p>
                <p>{productDetails}</p>
              </div>
            </div>

            <button
              className={styles.proceed}
              onClick={() => navigate(`/product/${barcode}`)}
            >
              <CiLocationArrow1 size={20} color="white" />
            </button>
          </div>

          <button onClick={retryScan} className={styles.retry}>
            Re-Scan
          </button>
        </div>
      )}

      {isProductNotFound && (
        <div className={styles.noProduct}>
          <div className={styles.cover}>
            <div className={styles.yesProductWrapNot}>
              <p style={{ color: "red", fontSize: "15px" }}>
                Oops! No Product found for barcode : <br/> <strong>{barcode}</strong>
              </p>
            </div>
            <div className={styles.inputDivMan}>
              <input
                type="text"
                className={styles.productInput}
                onChange={(e) => setProductDetails(e.target.value)}
                placeholder="Ex: 'Kurkure Masala Munch' or 'Lay's Classic Salted'"
              />
              <button className={styles.continue} onClick={proceed}>
                <FaArrowRightLong size={17} color="white" />
              </button>
            </div>
            <div className={styles.errDiv}>
              {errmessage && (
                <p className={styles.errMessage}>
                  <MdError />
                  {errmessage}
                </p>
              )}
            </div>
          </div>

          <button onClick={retryScan} className={styles.retry}>
            Re-Scan
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
