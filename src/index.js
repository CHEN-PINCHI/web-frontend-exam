// 匯入 React 核心
import React from "react";
// 匯入全域樣式
import "./css/home.css";
// 匯入 ReactDOM（用來把 React 元件掛載到網頁）
import ReactDOM from "react-dom/client";
// 匯入主組件 App（整個應用的進入點）
import App from "./App";

// 匯入假資料（這些是假後端會用到的資料）
import jobList from "./constants/jobList";
import educationList from "./constants/educationList";
import salaryList from "./constants/salaryList";

// 匯入 MirageJS，用來建立「假 API 伺服器」
import { Factory, Model, Server } from "miragejs";

/* =====================================================
  🔹 filterFormat：用來根據查詢條件篩選資料的工具函式
  - 參數：
      data：完整的職缺資料
      companyName：公司名稱
      educationLevel：學歷等級 ID
      salaryLevel：薪資等級 ID
  - 回傳：符合條件的篩選後資料陣列
===================================================== */
const filterFormat = (data, companyName, educationLevel, salaryLevel) => {
  let result = data;

  // 篩選公司名稱（包含關鍵字）
  if (companyName) {
    result = result.filter((item) => item.companyName.includes(companyName));
  }

  // 篩選學歷條件
  if (educationLevel) {
    result = result.filter((item) => item.educationId === educationLevel);
  }

  // 篩選薪資條件
  if (salaryLevel) {
    result = result.filter((item) => item.salaryId === salaryLevel);
  }

  return result;
};

/* =====================================================
  🔹 建立 MirageJS 假伺服器
  - 這個 Server 會攔截你的 fetch / axios 請求，
    模擬一個假的 API 後端（不需要真實伺服器）
===================================================== */
new Server({
  /* -------------------------------------------------
    🔸 models：定義每一種資料的「資料模型」
    這讓 MirageJS 知道你會有哪些資料集合
  ------------------------------------------------- */
  models: {
    jobList: Model, // 職缺資料
    educationList: Model, // 學歷資料
    salaryList: Model, // 薪資資料
  },

  /* -------------------------------------------------
    🔸 factories：定義「假資料模板」
    每建立一筆資料時，這裡定義它怎麼生成
  ------------------------------------------------- */
  factories: {
    // 職缺資料假資料模板
    jobList: Factory.extend({
      companyName(i) {
        return jobList[i].companyName;
      },
      jobTitle(i) {
        return jobList[i].jobTitle;
      },
      educationId(i) {
        return jobList[i].educationId;
      },
      salaryId(i) {
        return jobList[i].salaryId;
      },
      preview(i) {
        return jobList[i].preview;
      },
      companyPhoto(i) {
        return jobList[i].companyPhoto;
      },
      description(i) {
        return jobList[i].description;
      },
    }),

    // 學歷資料假資料模板
    educationList: Factory.extend({
      id(i) {
        return educationList[i].id;
      },
      label(i) {
        return educationList[i].label;
      },
    }),

    // 薪資資料假資料模板
    salaryList: Factory.extend({
      id(i) {
        return salaryList[i].id;
      },
      label(i) {
        return salaryList[i].label;
      },
    }),
  },

  /* -------------------------------------------------
    🔸 seeds：初始化假資料
    當伺服器啟動時，會依照 factories 生成資料
  ------------------------------------------------- */
  seeds(server) {
    server.createList("jobList", jobList.length); // 建立職缺清單
    server.createList("educationList", educationList.length); // 建立學歷清單
    server.createList("salaryList", salaryList.length); // 建立薪資清單
  },

  /* -------------------------------------------------
    🔸 routes：定義假 API 路由
    這裡就是模擬「後端 API」的地方
  ------------------------------------------------- */
  routes() {
    // 設定 API 路徑前綴，例如 /api/v1/jobs
    this.namespace = "api/v1";

    /* ---------------------------------------------
      🧩 GET /jobs：取得職缺清單
      - 支援查詢條件（公司名、學歷、薪資）
      - 支援分頁（page、pre_page）
    --------------------------------------------- */
    this.get("/jobs", (schema, request) => {
      // 從 query string 拿參數
      const companyName = request.queryParams.company_name;
      const educationLevel = Number(request.queryParams.education_level);
      const salaryLevel = Number(request.queryParams.salary_level);

      // 分頁參數
      const prePage = Number(request.queryParams.pre_page);
      const page = Number(request.queryParams.page);

      // 從資料庫取出所有 jobList，並去掉不必要欄位
      let data = schema.jobLists
        .all()
        .models.map(
          ({ attrs: { companyPhoto, description, ...rest } }) => rest
        );

      // 如果有分頁條件 → 做分頁 + 篩選
      if (!isNaN(prePage) && !isNaN(page)) {
        const startIndex = (page - 1) * prePage;
        const endIndex = startIndex + prePage;

        // 篩選符合條件的資料
        const filterData = filterFormat(
          data,
          companyName,
          educationLevel,
          salaryLevel
        );

        // 取出該頁資料
        const resultData = filterData.slice(startIndex, endIndex);

        // 回傳結果（當頁資料 + 總筆數）
        return {
          data: resultData,
          total: filterData.length,
        };
      } else {
        // 沒有分頁參數 → 回傳完整資料
        const result = filterFormat(
          data,
          companyName,
          educationLevel,
          salaryLevel
        );
        return {
          data: result,
          total: result.length,
        };
      }
    });

    /* ---------------------------------------------
      🧩 GET /educationLevelList：取得學歷列表
    --------------------------------------------- */
    this.get("/educationLevelList", (schema) => {
      return schema.educationLists.all().models.map((item) => item.attrs);
    });

    /* ---------------------------------------------
      🧩 GET /salaryLevelList：取得薪資列表
    --------------------------------------------- */
    this.get("/salaryLevelList", (schema) => {
      return schema.salaryLists.all().models.map((item) => item.attrs);
    });

    /* ---------------------------------------------
      🧩 GET /jobs/:id：取得單一職缺詳細資料
      - 根據 ID 找出職缺內容
      - 移除不必要欄位（例如 preview）
    --------------------------------------------- */
    this.get("/jobs/:id", (schema, request) => {
      const id = request.params.id;

      // 找出該職缺
      const data = schema.jobLists.all().models.find((item) => item.id === id);

      // 若有找到資料 → 回傳細節
      if (data) {
        const { preview, educationId, salaryId, ...rest } = data.attrs;
        return rest;
      } else {
        // 若沒找到 → 回傳空陣列
        return [];
      }
    });
  },
});

/* =====================================================
  🔹 React App 啟動入口
  - 找到 HTML 中的 #root 元素
  - 將 <App /> 掛載到畫面上
===================================================== */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
