import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom"; // ✅ 引入 Link
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { FreeMode, Pagination, Navigation, Autoplay } from "swiper/modules";
import KeyVisual from "../../assets/最後一版1128CMYK_工作區域 1 複本.jpg";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Carousel = () => {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/open/random`)
      .then((res) => res.json())
      .then((data) => setSlides(data))
      .catch((err) => console.error("載入輪播資料失敗", err));
  }, []);

  return (
    <div className="Carousel">
      <Swiper
        slidesPerView={"auto"}
        centeredSlides={true}
        spaceBetween={30}
        freeMode={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[FreeMode, Navigation, Autoplay]}
        className="mySwiper"
      >
      <SwiperSlide>
          <SwiperSlide>
              <div className="case">
                <div className="poster">
                  <img
                    src={KeyVisual}
                  />
                </div>
                <div className="case-content">
                  <h3>2025技優成果競賽</h3>
                  <h4>線上人氣獎票選</h4>
                  <hr />
                  <p>活動期間：2025/05/12(一) 12:00 至 2025/05/28(三)</p>
                  <p>活動對象：凡持有高科大Email帳號，每支帳號皆可投2票</p>
                </div>
              </div>
          </SwiperSlide>
      </SwiperSlide>
        {slides.map((slide) => (
          <SwiperSlide key={slide.team_id}>
            {/* ✅ 點擊導向該 team 的專題頁面 */}
            <Link to={`/2025skill/Popularity/CasePage/${slide.team_id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="case">
                <div className="poster">
                  <img src={`${BASE_URL}/2025skill/api/${slide.poster_img}`} alt={slide.project_title} />
                </div>
                <div className="case-content">
                  <h3>{slide.project_title}</h3>
                  <h4>{slide.team_name}</h4>
                  <hr />
                  <p>{slide.project_abstract}</p>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
