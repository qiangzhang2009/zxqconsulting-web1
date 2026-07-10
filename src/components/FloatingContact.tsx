import { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, X, Send } from 'lucide-react';
import { tracking } from '../lib/tracking';

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 滚动超过 300px 后显示
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const contactOptions = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: '立即拨打',
      value: '86+13764872538',
      href: 'tel:+8613764872538',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
        </svg>
      ),
      label: '微信咨询',
      value: '3740977',
      color: 'bg-[#07C160] hover:bg-[#06AE56]',
      copyable: true,
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: '发送邮件',
      value: 'customer@zxqconsulting.com',
      href: 'mailto:customer@zxqconsulting.com',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: '在线留言',
      value: '联系我们',
      href: '/expert',
      color: 'bg-emerald-600 hover:bg-emerald-700',
    },
  ];

  const handleOptionClick = (option: typeof contactOptions[0], index: number) => {
    tracking.click(`floating_contact_${index}`, 'contact');
    setIsOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    tracking.click('copy_wechat', 'contact');
    alert('已复制微信号: ' + text);
  };

  return (
    <>
      {/* 浮动按钮 - 只在滚动后显示 */}
      <div
        className={`fixed right-4 sm:right-6 bottom-6 sm:bottom-8 z-[60] transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        {/* 展开的联系方式面板 */}
        <div
          className={`absolute bottom-16 right-0 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible'
          }`}
          style={{ zIndex: 70 }}
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">联系我们</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 联系选项 */}
          <div className="p-3 space-y-2">
            {contactOptions.map((option, index) => (
              <a
                key={index}
                href={option.href}
                onClick={() => handleOptionClick(option, index)}
                className={`flex items-center gap-3 p-3 rounded-xl text-white ${option.color} transition-transform hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div className="flex-shrink-0">{option.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs opacity-90 truncate">{option.value}</div>
                </div>
                {option.copyable && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      copyToClipboard(option.value);
                    }}
                    className="flex-shrink-0 p-1 bg-white/20 rounded hover:bg-white/30"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                )}
              </a>
            ))}
          </div>

          {/* 工作时间 */}
          <div className="px-4 pb-3">
            <div className="text-xs text-gray-500 text-center">
              工作时间: 周一至周五 9:00-18:00
            </div>
          </div>
        </div>

        {/* 主按钮 */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            tracking.click('floating_button_toggle', 'contact');
          }}
          className="group relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-[61]"
          aria-label="联系我们"
        >
          {/* 消息提示 */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            !
          </span>
          
          {/* 图标切换 */}
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white transition-transform duration-300" 
            style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} 
          />
          
          {/* 悬停效果 */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
        </button>
      </div>

      {/* 移动端底部安全区域 */}
      <div className="fixed bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none sm:hidden" />
    </>
  );
};

export default FloatingContact;
