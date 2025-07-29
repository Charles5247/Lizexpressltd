import React from 'react';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import ProductCategories from '../components/ProductCategories';
import Testimonials from '../components/Testimonials';
import CallToAction from '../components/CallToAction';

const LandingPage: React.FC = () => {
  return (
    <>
      <Hero />
      <SearchBar />
      <ProductCategories />
      <Testimonials />
      <CallToAction />
    </>
  );
};

export default LandingPage;