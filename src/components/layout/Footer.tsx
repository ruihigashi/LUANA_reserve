import React from 'react';
import { Instagram, Facebook, Twitter, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-purple-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">ビューティーサロン</h3>
            <p className="mb-4 text-purple-200">
              最高級の技術と癒しの空間で、お客様の美しさを引き出します。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-pink-300 transition-colors duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-pink-300 transition-colors duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-pink-300 transition-colors duration-300">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">お問い合わせ</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Phone size={16} />
                <span>03-1234-5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} />
                <span>info@beautysalon.jp</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>〒100-0001 東京都千代田区1-1-1</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">営業時間</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>平日</span>
                <span>10:00 - 20:00</span>
              </li>
              <li className="flex justify-between">
                <span>土曜日</span>
                <span>10:00 - 19:00</span>
              </li>
              <li className="flex justify-between">
                <span>日曜・祝日</span>
                <span>10:00 - 18:00</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-purple-800 mt-8 pt-6 text-center text-purple-300">
          <p>&copy; {new Date().getFullYear()} ビューティーサロン. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;