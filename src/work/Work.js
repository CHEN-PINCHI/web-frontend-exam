import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import educationList from '../constants/educationList';
import salaryList from '../constants/salaryList';
import jobList from '../constants/jobList';

import InfoJobTitle from '../images/Info-JobTitle.png';
import InfoEducation from '../images/Info-Education.png';
import InfoSalary from '../images/Info-Salary.png';

const Work = () => {
  const [inputFilters, setInputFilters] = useState({
    companyName: '',
    education: '',
    salary: '',
  });

  const [filters, setFilters] = useState({
    companyName: '',
    education: '',
    salary: '',
  });

  const [fadeState, setFadeState] = useState('fade-in');
  const [pageFadeState, setPageFadeState] = useState('fade-in');
  const [modalJob, setModalJob] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDotClickable, setIsDotClickable] = useState(true);

  const sliderRef = useRef(null);
  const dotTimerRef = useRef(null);
  const workBoxRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 769 ? 4 : 6);
  const [isCompactPage, setIsCompactPage] = useState(window.innerWidth < 769);
  const [slidesToShow, setSlidesToShow] = useState(window.innerWidth < 769 ? 2 : 3);

  // =====================
  // Modal 控制
  // =====================
  useEffect(() => {
    if (modalJob) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    } else {
      document.body.style.overflow = 'auto';
      setCurrentSlide(0);
    }
  }, [modalJob]);

  useEffect(() => () => clearTimeout(dotTimerRef.current), []);

  // =====================
  // 視窗 resize
  // =====================
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 769 ? 4 : 6);
      setIsCompactPage(window.innerWidth < 769);
      setSlidesToShow(window.innerWidth < 769 ? 2 : 3);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // =====================
  // 篩選
  // =====================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setFadeState('fade-out');
    setPageFadeState('fade-out');

    setTimeout(() => {
      setFilters(inputFilters);
      setCurrentPage(1);
      setFadeState('fade-in');
      setPageFadeState('fade-in');
    }, 300);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const getEducationLabel = (id) => {
    const edu = educationList.find((item) => item.id === id);
    return edu ? edu.label : '未指定';
  };

  const getSalaryLabel = (id) => {
    const sal = salaryList.find((item) => item.id === id);
    return sal ? sal.label : '未指定';
  };

  // =====================
  // Slick 控制
  // =====================
  const handleDotClick = (index) => {
    if (!isDotClickable) return;

    setIsDotClickable(false);
    sliderRef.current.slickGoTo(index);
    setCurrentSlide(index);

    dotTimerRef.current = setTimeout(() => setIsDotClickable(true), 600);
  };

  const sliderSettings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 600,
    slidesToShow,
    slidesToScroll: 1,
    cssEase: 'ease-in-out',
    arrows: false,
    dots: false,
    beforeChange: (_, newIndex) => setCurrentSlide(newIndex),
  };

  // =====================
  // 過濾 & 分頁
  // =====================
  const filteredJobs = jobList.filter((job) => {
    const matchesCompany =
      !filters.companyName ||
      job.companyName.toLowerCase().includes(filters.companyName.toLowerCase());
    const matchesEducation =
      !filters.education || getEducationLabel(job.educationId) === filters.education;
    const matchesSalary =
      !filters.salary || getSalaryLabel(job.salaryId) === filters.salary;

    return matchesCompany && matchesEducation && matchesSalary;
  });

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setFadeState('fade-out');
    setTimeout(() => {
      setCurrentPage(page);
      setFadeState('fade-in');
      if (workBoxRef.current) {
        workBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  // =====================
  // 分頁按鈕
  // =====================
  const renderPageButtons = () => {
    if (!isCompactPage || totalPages <= 5) {
      return Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          type="button"
          className={`pageBtn ${currentPage === i + 1 ? 'active' : ''}`}
          onClick={() => handlePageChange(i + 1)}
        >
          {i + 1}
        </button>
      ));
    }

    const pages = [];
    const delta = 1;
    const range = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i += 1) {
      range.push(i);
    }

    pages.push(1);

    if (range[0] > 2) pages.push('...');
    pages.push(...range);
    if (range[range.length - 1] < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages.map((page, i) =>
      page === '...' ? (
        <span key={i} className="dots">...</span>
      ) : (
        <button
          key={i}
          type="button"
          className={`pageBtn ${currentPage === page ? 'active' : ''}`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      )
    );
  };

  // =====================
  // Render
  // =====================
  return (
    <div className="workArea">
      <div className="wrap">
        <div className="workBox" ref={workBoxRef}>
          <h1 className="title">適合前端工程師的好工作</h1>

          {/* 篩選區 */}
          <div className="filterBox">
            <div className="filterList">
              <div className="filterItem company">
                <label htmlFor="companyName">公司名稱</label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="請輸入公司名稱"
                  value={inputFilters.companyName}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                />
              </div>

              <div className="filterItem education">
                <label htmlFor="education">教育程度</label>
                <select
                  id="education"
                  name="education"
                  value={inputFilters.education}
                  onChange={handleInputChange}
                >
                  <option value="">不限</option>
                  {educationList.map((item) => (
                    <option key={item.id} value={item.label}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filterItem salary">
                <label htmlFor="salary">薪水範圍</label>
                <select
                  id="salary"
                  name="salary"
                  value={inputFilters.salary}
                  onChange={handleInputChange}
                >
                  <option value="">不限</option>
                  {salaryList.map((item) => (
                    <option key={item.id} value={item.label}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filterItem search">
                <button type="button" onClick={handleSearch}>
                  條件搜尋
                </button>
              </div>
            </div>
          </div>

          {/* 資料列表 */}
          {filteredJobs.length > 0 ? (
            <div className={`workList ${fadeState}`}>
              {currentJobs.map((job, index) => (
                <div className="workItem" key={index}>
                  <div className="item">
                    <div className="companyName">{job.companyName}</div>
                    <div className="infoList">
                      <div className="infoItem jobTitle">
                        <img src={InfoJobTitle} alt="Job Title" />
                        <div className="info">{job.jobTitle}</div>
                      </div>
                      <div className="infoItem education">
                        <img src={InfoEducation} alt="Education" />
                        <div className="info">{getEducationLabel(job.educationId)}</div>
                      </div>
                      <div className="infoItem salary">
                        <img src={InfoSalary} alt="Salary" />
                        <div className="info">{getSalaryLabel(job.salaryId)}</div>
                      </div>
                    </div>
                    <div className="preview">{job.preview}</div>
                    <button
                      type="button"
                      className="description"
                      onClick={() => setModalJob(job)}
                    >
                      查看細節
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`noData ${fadeState}`}>無資料</div>
          )}

          {/* 彈跳視窗 */}
          <div
            className={`modalArea ${modalJob ? 'current' : ''}`}
            onClick={() => setModalJob(null)}
          >
            <div className="modalWrap" onClick={(e) => e.stopPropagation()}>
              {modalJob && (
                <div className="modalContent">
                  <div className="detailsInfo">詳細資訊</div>
                  <div className="modalBox">
                    <div className="modalTitleBox">
                      <div className="modalTitle">{modalJob.companyName}</div>
                      <div className="modalSubTitle">{modalJob.jobTitle}</div>
                    </div>

                    <div className="photoBox">
                      <Slider {...sliderSettings} ref={sliderRef} className="photoList">
                        {modalJob.companyPhoto.map((url, i) => (
                          <div className="photoItem" key={i}>
                            <div className="Img">
                              <img
                                src={url}
                                alt={`${modalJob.companyName} 圖片 ${i + 1}`}
                              />
                            </div>
                          </div>
                        ))}
                      </Slider>

                      <div className="dotsBox">
                        {modalJob.companyPhoto.map((_, i) => (
                          <span
                            key={i}
                            className={`dot ${i === currentSlide ? 'active' : ''}`}
                            onClick={() => handleDotClick(i)}
                            role="button"
                            tabIndex={0}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="descriptionBox">
                      <div className="descriptionTitle">工作內容</div>
                      <div
                        className="description"
                        dangerouslySetInnerHTML={{ __html: modalJob.description }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="closeBtn"
                    onClick={() => setModalJob(null)}
                  >
                    關閉
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 頁碼 */}
          {totalPages > 1 && (
            <div className={`pageBox ${pageFadeState}`}>
              <button
                type="button"
                className="pageBtn arrow arrowPrev"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              />
              {renderPageButtons()}
              <button
                type="button"
                className="pageBtn arrow arrowNext"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Work;
