// 匯入 React 核心
import React from 'react';
// 匯入全域樣式
import './css/home.css';
// 匯入 ReactDOM（用來把 React 元件掛載到網頁）
import ReactDOM from 'react-dom/client';
// 匯入主組件 App（整個應用的進入點）
import App from './App';

// 匯入假資料（這些是假後端會用到的資料）
import jobList from './constants/jobList';
import educationList from './constants/educationList';
import salaryList from './constants/salaryList';

// 匯入 MirageJS，用來建立「假 API 伺服器」
import { Factory, Model, Server } from 'miragejs';

/* =====================================================
  🔹 filterFormat：用來根據查詢條件篩選資料的工具函式
===================================================== */
const filterFormat = (data, companyName, educationLevel, salaryLevel) => {
  let result = data;

  if (companyName) {
    result = result.filter((item) => item.companyName.includes(companyName));
  }

  if (educationLevel) {
    result = result.filter((item) => item.educationId === educationLevel);
  }

  if (salaryLevel) {
    result = result.filter((item) => item.salaryId === salaryLevel);
  }

  return result;
};

/* =====================================================
  🔹 建立 MirageJS 假伺服器
===================================================== */
new Server({
  models: {
    jobList: Model,
    educationList: Model,
    salaryList: Model,
  },

  factories: {
    jobList: Factory.extend({
      companyName: (i) => jobList[i].companyName,
      jobTitle: (i) => jobList[i].jobTitle,
      educationId: (i) => jobList[i].educationId,
      salaryId: (i) => jobList[i].salaryId,
      preview: (i) => jobList[i].preview,
      companyPhoto: (i) => jobList[i].companyPhoto,
      description: (i) => jobList[i].description,
    }),

    educationList: Factory.extend({
      id: (i) => educationList[i].id,
      label: (i) => educationList[i].label,
    }),

    salaryList: Factory.extend({
      id: (i) => salaryList[i].id,
      label: (i) => salaryList[i].label,
    }),
  },

  seeds: (server) => {
    server.createList('jobList', jobList.length);
    server.createList('educationList', educationList.length);
    server.createList('salaryList', salaryList.length);
  },

  routes() {
    this.namespace = 'api/v1';

    this.get('/jobs', (schema, request) => {
      const companyName = request.queryParams.company_name;
      const educationLevel = Number(request.queryParams.education_level);
      const salaryLevel = Number(request.queryParams.salary_level);

      const prePage = Number(request.queryParams.pre_page);
      const page = Number(request.queryParams.page);

      const data = schema.jobLists
        .all()
        .models.map(({ attrs: { companyPhoto, description, ...rest } }) => rest);

      if (!Number.isNaN(prePage) && !Number.isNaN(page)) {
        const startIndex = (page - 1) * prePage;
        const endIndex = startIndex + prePage;

        const filterData = filterFormat(data, companyName, educationLevel, salaryLevel);
        const resultData = filterData.slice(startIndex, endIndex);

        return {
          data: resultData,
          total: filterData.length,
        };
      }

      const result = filterFormat(data, companyName, educationLevel, salaryLevel);

      return {
        data: result,
        total: result.length,
      };
    });

    this.get('/educationLevelList', (schema) =>
      schema.educationLists.all().models.map((item) => item.attrs)
    );

    this.get('/salaryLevelList', (schema) =>
      schema.salaryLists.all().models.map((item) => item.attrs)
    );

    this.get('/jobs/:id', (schema, request) => {
      const { id } = request.params;

      const data = schema.jobLists.all().models.find((item) => item.id === id);

      if (data) {
        const { preview, educationId, salaryId, ...rest } = data.attrs;
        return rest;
      }

      return [];
    });
  },
});

/* =====================================================
  🔹 React App 啟動入口
===================================================== */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
