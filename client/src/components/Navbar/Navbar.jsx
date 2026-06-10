import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import style from "./Navbar.module.css";
import { BsUpcScan } from "react-icons/bs";
import { IoSettingsSharp } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { IoHome } from "react-icons/io5";
import { MdHistory } from "react-icons/md";
import { RiShoppingCartLine } from "react-icons/ri";
import { BsUiChecks } from "react-icons/bs";
import { MdOutlineDocumentScanner } from "react-icons/md";

function Navbar() {
  const [showScanModal, setShowScanModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
    <div className={style.mainDiv}>
      <Link to="/" className={style.navItem}>
       <IoHome className={style.reactIcons}/>
      </Link>
      <Link to="/history" className={style.navItem}>
        <MdHistory className={style.reactIcons}/>
      </Link>
      <div className={style.navItem} onClick={() => setShowScanModal(true)} style={{ cursor: 'pointer' }}>
        <BsUpcScan color="white" className={style.reactIcons} />
      </div>
      <Link to="/compare" className={style.navItem}>
        <BsUiChecks className={style.reactIcons}/>
      </Link>
      <Link to="/profile" className={style.navItem}>
        <CgProfile className={style.reactIcons}/>
      </Link>
      
    </div>
      
      {showScanModal && (
        <div className={style.modalOverlay} onClick={() => setShowScanModal(false)}>
          <div className={style.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Select Scan Method</h3>
            <div className={style.modalButtons}>
              <button onClick={() => { setShowScanModal(false); navigate("/scan"); }} className={style.scanBtn}>
                <BsUpcScan size={24} color="green" /> Barcode Scan
              </button>
              <button onClick={() => { setShowScanModal(false); navigate("/ocr"); }} className={style.scanBtn}>
                <MdOutlineDocumentScanner size={24} color="green" /> OCR Scan (Text)
              </button>
            </div>
            <button className={style.closeBtn} onClick={() => setShowScanModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
