import React from "react";
import { Link } from "react-router-dom";
import style from "./index.module.css";

function ErrorPage({ errorText }) {
  const handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className={style.error}>
      <p>{errorText || "Something went wrong"}</p>
      <Link to={"/"} className={style.btn}>
        GO HOME
      </Link>
      <button onClick={handleReset} className={style.btn} style={{ backgroundColor: '#ff4444', marginTop: '10px' }}>
        FULL RESET
      </button>
    </div>
  );
}

export default ErrorPage;
