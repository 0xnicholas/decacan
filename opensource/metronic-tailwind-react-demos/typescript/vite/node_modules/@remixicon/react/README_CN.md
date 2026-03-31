[![logo](https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/.github/files/logo-github.svg)](https://remixicon.com)

[![remixicon](https://img.shields.io/npm/v/remixicon.svg?labelColor=4A4A4A&color=006AFF&style=flat-square&label=remixicon)](https://www.npmjs.com/package/remixicon)
[![npm](https://img.shields.io/npm/v/@remixicon/react.svg?labelColor=4A4A4A&color=006AFF&style=flat-square)](https://www.npmjs.com/package/@remixicon/react)
[![downloads](https://img.shields.io/npm/dt/@remixicon/react.svg?labelColor=4A4A4A&color=23AF5F&style=flat-square)](https://www.npmjs.com/package/@remixicon/react)
[![](https://data.jsdelivr.com/v1/package/npm/@remixicon/react/badge)](https://www.jsdelivr.com/package/npm/@remixicon/react)
[![donate](https://img.shields.io/badge/-赞助-DA6429.svg?style=flat-square)](https://remixicon.com/support-us)

[English](./README.md) | 简体中文

Remix Icon For React

Remix Icon 是一套面向设计师和开发者的开源图标库。我们在设计之初将图标风格定义为中性风格，以便适用于各种用户群的项目。与拼凑混搭的图标库不同，Remix Icon 的每一枚图标都是由设计师按照统一规范精心绘制的，并确保每一枚图标在拥有完美像素对齐的基础上风格一致且简洁易读。图标以 24x24 网格为基准，分为“线性图标”和“面型图标”两种风格。所有的图标均可免费用于个人项目和商业项目，Enjoy it~

[![icon demo](https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/.github/files/preview.svg)](https://remixicon.com)
前往官网查看整套图标库 [remixicon.com](https://remixicon.com).

## 安装

```bash
npm install @remixicon/react
# or
yarn add @remixicon/react
# or
pnpm install @remixicon/react
```

## 使用

```jsx
import { RiHeartFill } from '@remixicon/react'

const MyComponent = () => {
    return (
        <RiHeartFill
            size={36} // 设置大小
            color="red" // 设置颜色
            className="my-icon" // 添加自定义样式名
        />
    )
}
```
