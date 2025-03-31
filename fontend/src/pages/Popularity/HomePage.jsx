import React, { useState } from 'react';
import BasicExample from '../../layouts/Popularity/NavBar';
import Footer from '../../layouts/Popularity/Footer';
import Carousel from '../../layouts/Popularity/Carousel';
import Explore from '../../layouts/Popularity/Explore';
import CaseBox from '../../layouts/Popularity/CaseBox';

const HomePage = () => {
  const [themeCode, setThemeCode] = useState("all");

  return (
    <div className='popularity_homepage'>
      <BasicExample />
      <div className='header'>
        <Carousel />
      </div>
      <div className='content'>
        <Explore onThemeChange={setThemeCode} />
        <CaseBox themeCode={themeCode} />
      </div>
      <Footer/>
    </div>
  );
};

export default HomePage;
