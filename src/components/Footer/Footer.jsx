import React from "react";
import style from "./index.module.css";

function Footer({ className, style: customStyle }) {
  return (
    <footer className={`${style.footer} ${className || ''}`} style={customStyle}>
      Built by{" "}
      <a href="https://celo.org" target={"_blank"} rel="noreferrer">
        Vortex-hue
      </a>
    </footer>
  );
}

export default Footer;
