import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import educationList from "../constants/educationList";
import salaryList from "../constants/salaryList";
import jobList from "../constants/jobList";

import InfoJobTitle from "../images/Info-JobTitle.png";
import InfoEducation from "../images/Info-Education.png";
import InfoSalary from "../images/Info-Salary.png";

const Work = () => {
  // ======================
  // 篩選 state
  // ======================
  const [inputFilters, setInputFilters] = useState({
    companyName: "",
    education: "",
    salary: "",
  });
  const [filters, setFilters] = useState({
    companyName: "",
    education: "",
    salary: "",
  });

  const [fadeState, setFadeState] = useState("fade-in"); // ✅ 控制工作列表動畫
  const [pageFadeState, setPageFadeState] = useState("fade-in"); // ✅ 控制頁碼動畫
  const [modalJob, setModalJob] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDotClickable, setIsDotClickable] = useState(true);
  const sliderRef = useRef(null);
  const dotTimerRef = useRef(null);

  // ✅ 分頁相關
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const workBoxRef = useRef(null);

  // ======================
  // Modal 處理
  // ======================
  useEffect(() => {
    if (modalJob) {
      document.body.style.overflow = "hidden";
      setTimeout(() => window.dispatchEvent(new Event("resize")), 300);
    } else {
      document.body.style.overflow = "auto";
      setCurrentSlide(0);
    }
  }, [modalJob]);

  useEffect(() => {
    return () => clearTimeout(dotTimerRef.current);
  }, []);

  // ======================
  // 篩選處理函式
  // ======================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setFadeState("fade-out");
    setPageFadeState("fade-out"); // ✅ 頁碼也一起淡出（僅限搜尋）

    setTimeout(() => {
      setFilters(inputFilters);
      setCurrentPage(1); // 搜尋重設頁碼
      setFadeState("fade-in");
      setPageFadeState("fade-in"); // ✅ 頁碼一起淡入
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const getEducationLabel = (id) => {
    const item = educationList.find((edu) => edu.id === id);
    return item ? item.label : "未指定";
  };

  const getSalaryLabel = (id) => {
    const item = salaryList.find((sal) => sal.id === id);
    return item ? item.label : "未指定";
  };

  // ======================
  // Slick 圖片輪播
  // ======================
  const handleDotClick = (index) => {
    if (!isDotClickable) return;
    setIsDotClickable(false);
    sliderRef.current.slickGoTo(index);
    setCurrentSlide(index);

    dotTimerRef.current = setTimeout(() => {
      setIsDotClickable(true);
    }, 600);
  };

  const sliderSettings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    cssEase: "ease-in-out",
    arrows: false,
    dots: false,
    beforeChange: (_, newIndex) => setCurrentSlide(newIndex),
  };

  // ======================
  // 過濾工作列表
  // ======================
  const filteredJobs = jobList.filter((job) => {
    const matchesCompany =
      !filters.companyName ||
      job.companyName.toLowerCase().includes(filters.companyName.toLowerCase());
    const matchesEducation =
      !filters.education ||
      getEducationLabel(job.educationId) === filters.education;
    const matchesSalary =
      !filters.salary || getSalaryLabel(job.salaryId) === filters.salary;

    return matchesCompany && matchesEducation && matchesSalary;
  });

  // ✅ 分頁邏輯
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  // ✅ 換頁時動畫 + 自動捲回頂部（頁碼不動畫）
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setFadeState("fade-out");
    setTimeout(() => {
      setCurrentPage(page);
      setFadeState("fade-in");
      if (workBoxRef.current) {
        workBoxRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 300);
  };

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
                  type="text"
                  id="companyName"
                  name="companyName"
                  placeholder="請輸入公司名稱"
                  value={inputFilters.companyName}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="filterItem education">
                <label htmlFor="education">教育程度</label>
                <select
                  name="education"
                  id="education"
                  value={inputFilters.education}
                  onChange={handleChange}
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
                  name="salary"
                  id="salary"
                  value={inputFilters.salary}
                  onChange={handleChange}
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
                <button onClick={handleSearch}>條件搜尋</button>
              </div>
            </div>
          </div>

          {/* 工作列表 */}
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
                        <div className="info">
                          {getEducationLabel(job.educationId)}
                        </div>
                      </div>
                      <div className="infoItem salary">
                        <img src={InfoSalary} alt="Salary" />
                        <div className="info">
                          {getSalaryLabel(job.salaryId)}
                        </div>
                      </div>
                    </div>
                    <div className="preview">{job.preview}</div>
                    <button
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

          {/* Modal */}
          <div
            className={`modalArea ${modalJob ? "current" : ""}`}
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

                    {/* Slick 圖片輪播 */}
                    <div className="photoBox">
                      <Slider
                        {...sliderSettings}
                        ref={sliderRef}
                        className="photoList"
                      >
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
                            className={`dot ${
                              i === currentSlide ? "active" : ""
                            }`}
                            onClick={() => handleDotClick(i)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="descriptionBox">
                      <div className="descriptionTitle">工作內容</div>
                      <div
                        className="description"
                        dangerouslySetInnerHTML={{
                          __html: modalJob.description,
                        }}
                      />
                    </div>
                  </div>

                  <button className="closeBtn" onClick={() => setModalJob(null)}>
                    關閉
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ✅ 分頁區域（不跟 fadeState 連動） */}
          {totalPages > 1 && (
            <div className={`pageBox ${pageFadeState}`}>
              <button
                className="pageBtn arrow arrowPrev"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              ></button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`pageBtn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="pageBtn arrow arrowNext"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              ></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Work;
