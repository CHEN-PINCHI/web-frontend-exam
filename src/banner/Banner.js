import { useEffect, useState } from 'react';

// ===== 圖片引入 =====
import BannerBg from '../images/Banner-Background-01.png';
import BannerCharWhite from '../images/Banner-Character-01-White.png';
import BannerChar from '../images/Banner-Character-01.png';
import LeftEye from '../images/Banner-LeftEye-Container.png';
import RightEye from '../images/Banner-RightEye-Container.png';
import LogoImg from '../images/Banner-Logo-01.png';

export default function Banner() {
  // ==========================
  // 1️⃣ 狀態設定：眼睛座標
  // ==========================
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 }); // 眼睛實際位置
  const eyeMultiplier = { left: 1, right: 0.8 }; // 左右眼偏移比例
  const damping = 0.1; // 阻尼值，用來平滑跟隨

  // ==========================
  // 2️⃣ effect: 處理滑鼠 & 手機傾斜事件
  // ==========================
  useEffect(() => {
    let target = { x: 0, y: 0 }; // 眼睛目標座標
    let animationId; // requestAnimationFrame ID，用於清理

    // --------------------------
    // 2.1 計算阻力值，依視窗大小調整
    // --------------------------
    const getResistance = () => {
      const { innerWidth: w } = window;
      if (w < 500) return 180;
      if (w < 1024) return 150;
      return 130;
    };

    // --------------------------
    // 2.2 滑鼠移動事件
    // --------------------------
    const handleMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const left = getResistance();
      target.x = -((e.clientX - centerX) / left);
      target.y = -((e.clientY - centerY) / left);
    };

    // --------------------------
    // 2.3 手機傾斜事件
    // --------------------------
    const handleOrientation = ({ beta, gamma }) => {
      if (beta === null || gamma === null) return;
      target.x = gamma * 0;
      target.y = beta * 0;
    };

    // --------------------------
    // 2.4 註冊事件
    // --------------------------
    document.addEventListener('mousemove', handleMouseMove);
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    // ==========================
    // 3️⃣ 阻尼動畫：每幀更新眼睛位置
    // ==========================
    const animateEyes = () => {
      setEyePos((prev) => ({
        x: prev.x + (target.x - prev.x) * damping,
        y: prev.y + (target.y - prev.y) * damping,
      }));
      animationId = requestAnimationFrame(animateEyes);
    };

    animateEyes();

    // ==========================
    // 4️⃣ Cleanup：移除事件與動畫
    // ==========================
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // ==========================
  // 5️⃣ JSX 渲染
  // ==========================
  return (
    <div className='bannerArea'>
      <div className='wrap'>
        <div className='bannerBox'>
          {/* 背景 */}
          <div className='bgBox'>
            <div className='Img'>
              <img src={BannerBg} alt='Banner Background' />
            </div>
          </div>

          {/* 角色與 logo */}
          <div className='ImgBox'>
            {/* logo */}
            <div className='logo'>
              <div className='Img'>
                <img src={LogoImg} alt='Logo' />
              </div>
            </div>

            {/* 角色 */}
            <div className='man'>
              {/* 白色角色圖層 */}
              <div className='Img head'>
                <img src={BannerCharWhite} alt='Character White' />
              </div>

              {/* 眼睛 */}
              <div className='eyes'>
                <div
                  className='Img leftEye'
                  style={{
                    transform: `translate(${eyePos.x * eyeMultiplier.left}px, ${eyePos.y * eyeMultiplier.left}px)`,
                  }}
                >
                  <img src={LeftEye} alt='Left Eye' />
                </div>
                <div
                  className='Img rightEye'
                  style={{
                    transform: `translate(${eyePos.x * eyeMultiplier.right}px, ${eyePos.y * eyeMultiplier.right}px)`,
                  }}
                >
                  <img src={RightEye} alt='Right Eye' />
                </div>
              </div>

              {/* 原始角色圖層 */}
              <div className='Img head'>
                <img src={BannerChar} alt='Character' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
