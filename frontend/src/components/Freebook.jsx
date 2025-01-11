import React, { useEffect, useState } from 'react';
import Slider from "react-slick";

import axios from "axios"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Cards from './Cards';
const url = "https://book-nest-backend-7lyo.onrender.com";
function NextArrow(props) {
    const { className, style, onClick } = props;
    
    return (
        <div
            className={className}
            style={{
                ...style,
                display: "block",
                background: "purple",
                borderRadius: "50%",
              
                right: 10,
                zIndex: 2,
            }}
            onClick={onClick}
        />
    );
}

function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{
                ...style,
                display: "block",
                background: "purple",
                borderRadius: "50%",
                
                left: 10,
                zIndex: 2,
            }}
            onClick={onClick}
        />
    );
}

function Freebook() {
    const [book,setBook]=useState([])
  useEffect(()=>{
    const getBook=async()=>{
      try {
      const res =  await axios.get(`${url}/book`);
      console.log(res.data.filter((data) => data.available === "Free"));
      setBook(res.data.filter((data) => data.available === "Free"));
      } catch (error) {
        console.log("Error:" + error);
      }
    }
    getBook();
  },[])
  
    var settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        initialSlide: 0,
        arrows: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    initialSlide: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    return (
        <>
            <div className='max-w-screen2xl container mx-auto md:px-20 px-4'>
                <div>
                    <h1 className='font-bold text-xl pb-2'>Freely Available Books</h1>
                    <p>You can enjoy reading these books for free!</p>
                </div>
                <div>
                    <Slider {...settings}>
                        {book.map((item) => (
                            <Cards item={item} key={item._id}></Cards>
                        ))}
                    </Slider>
                </div>
            </div>
        </>
    );
}

export default Freebook;
