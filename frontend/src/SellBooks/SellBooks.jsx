import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import SellBook from "../components/SellBook";

function SellBooks({authUser}) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen  dark:bg-slate-900 dark:text-white mt-24">
        <SellBook authUser={authUser}/>
      </div>
      <Footer />
    </>
  );
}

export default SellBooks;
