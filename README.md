# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# UI 展示
https://www.bilibili.com/video/BV16GSKBGEQw/?vd_source=93f24b9713114b836bd7e784f9e8dc58

本blog UI 展示视频


## 使用
### 1.后端
1. 添加文件Server/db_config.json，格式如下

    {
    "host": "127.0.0.1",
    "user": "",
    "password": "",
    "database": ""
    }

2. 下载requirements.txt的包
3. 在Server目录下 python mainServer.py即可

### 2.前端
和常规react项目相同
