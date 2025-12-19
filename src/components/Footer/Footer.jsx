import React from "react";
import style from "./index.module.css";

function Footer() {
  return (
    <footer className={style.footer}>
      Built by{" "}
      <a href="https://celo.org" target={"_blank"} rel="noreferrer">
        Vortex-hue
      </a>
    </footer>
  );
}

export default Footer;
