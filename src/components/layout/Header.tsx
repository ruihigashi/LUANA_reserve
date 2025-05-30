import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto py-3">
          <div className=" flex flex-col items-center text-center cursor-pointer">
            <p className="text-xs text-gray-500 tracking-widest font-great">Hair Salon</p>
            <h1 className="text-lg font-luana tracking-widest text-gray-700">
              LUANA • S • MIRUTO
            </h1>
          </div>
          </div>
    </header>
  );
};

export default Header;