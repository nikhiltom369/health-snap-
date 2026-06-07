import React from "react";
import { Link } from "react-router-dom";
import style from "./Navbar.module.css";
import { BsUpcScan } from "react-icons/bs";
import { IoSettingsSharp } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { IoHome } from "react-icons/io5";
import { MdHistory } from "react-icons/md";
import { RiShoppingCartLine } from "react-icons/ri";
import { BsUiChecks } from "react-icons/bs";

function Navbar() {
  return (
    <div className={style.mainDiv}>
      <Link to="/" className={style.navItem}>
       <IoHome className={style.reactIcons}/>
      </Link>
      <Link to="/history" className={style.navItem}>
        <MdHistory className={style.reactIcons}/>
      </Link>
      <Link to="/scan" className={style.navItem}>
        <BsUpcScan color="white" className={style.reactIcons} />
      </Link>
      <Link to="/compare" className={style.navItem}>
        <BsUiChecks className={style.reactIcons}/>
      </Link>
      <Link to="/profile" className={style.navItem}>
        <CgProfile className={style.reactIcons}/>
      </Link>
      
    </div>
  );
}

export default Navbar;
