import React from "react";
import style from "./index.module.css";

function Footer() {
  return (
    <footer className={style.footer}>
      Built by{" "}
      <a href="https://github.com/shalomemmy/honeycomb.git" target={"_blank"}>
        Vortex-hue
      </a>
    </footer>
  );
}

export default Footer;
