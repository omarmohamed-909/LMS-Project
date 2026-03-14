import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'

const ScrollToTopOnRouteChange = () => {
  const { pathname, search } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
};

const MainLayout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
        <ScrollToTopOnRouteChange />
        <Navbar/>
        <div className='flex-1 mt-16'>
            <Outlet />
        </div>
      <Footer />
    </div>
  )
}

export default MainLayout