# Devil's Advocate · 反方辩友

![Hero Banner](./public/og-brand.svg)

[![License: MIT](https://img.shields.io/badge/License-MIT-B8860B.svg)](./LICENSE)
![Stars](https://img.shields.io/github/stars/your-name/devils-advocate?color=8B0000)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-0A0A0B)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Your worst critic, for your best decisions.**

反方辩友不是一个温柔的聊天框。  
它更像一间灯光压低的审讯室：你把决定放上桌，AI 负责把它从热情、恐惧、虚荣、责任、代价和后果的角度一层层拆开。  
如果一个决定经得起最坏的提问，它才配得上真正发生。

## Features

| Feature | What it does |
| --- | --- |
| Single Blade | 一对一反方辩论，快速进入最核心的逻辑交锋 |
| Five Furies | 五个不同人格轮番质询，形成陪审团合议 |
| The Courtroom | 法官、控方、辩方与用户四方同场的正式审判 |
| Verdict Engine | 骨架预制 + 本地金句库 + LLM 填空，兼顾速度与质感 |
| Shareable Verdict | 生成可下载的竖版 / 方版 / 横版长图 |
| History Archive | IndexedDB 本地卷宗库，支持搜索、筛选、导出和删除 |
| Settings & Data Control | 模型配置、音效、导入导出、清空历史 |

## Modes

### 1. Single Blade
![Single Blade Placeholder](./public/verdict-card-placeholder.svg)

最纯粹的一对一辩论。  
你只面对一个冷静且不讨好的“魔鬼代言人”。

### 2. Five Furies
![Five Furies Placeholder](./public/share-image-placeholder.svg)

五种人格围成一圈，同时从责任、未来、感情、幻想与恶意出手。  
最后生成一份“陪审团合议报告”。

### 3. The Courtroom
![Courtroom Placeholder](./public/hero-screenshot-placeholder.svg)

最正式、最戏剧化的一种模式。  
法官主持、控方进攻、辩方辩护、用户答辩，最后当庭宣判。

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- IndexedDB (`idb`)
- html2canvas
- Vercel

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

### Vercel

1. Import the repo into Vercel.
2. Keep framework preset as `Next.js`.
3. Add optional variables from `.env.example`.
4. Deploy.

### Domain Suggestion

- `devilsadvocate.app`
- `devils-advocate.app`
- `fanfangbianyou.com`

## Prompt Engineering Notes

这个项目的核心不是“让模型多说”，而是“让模型只说用户真正会在意的那一部分”。

我们在设计里做了三层控制：

1. **角色化约束**
   - 每个模式都有稳定人设，而不是泛用助手口吻。
   - 不同人格只从自己的立场发言，避免多角色最后都说成同一个人。

2. **判决减载**
   - 判决页不再要求模型一次吐完整大 JSON。
   - 先由前端预制版式和套话，再用本地金句候选 + LLM 微调。
   - 这牺牲了一部分生成自由度，换来可感知的速度和稳定性。

3. **本地预处理**
   - 对话历史先在前端压缩。
   - 分类器、本地金句库、模板库都先行工作，尽量让模型做“判断”和“修辞最后一击”，而不是做所有脏活。

## How To Use It Well

- 不要只写结论，要写条件、代价和你现在手上的筹码。
- 如果你想被真正说服，就别把最关键的事实藏起来。
- 单刀适合快速拷问；围攻适合多维拆解；法庭适合把整个决定搬上正式程序。

## Roadmap

- [ ] 多语言支持
- [ ] 服务端代理与团队账号系统
- [ ] 更精细的角色记忆
- [ ] 真实分享链接与二维码落地页
- [ ] 生成式视觉资源替换 SVG 占位

## Contributing

欢迎 PR、Issue、Prompt 改进建议和视觉提案。

建议贡献方式：

1. Fork 仓库
2. 创建功能分支
3. 提交清晰的 commit message
4. 发起 PR，并说明模式、交互或 prompt 的改动理由

## Inspiration & Thanks

- 法庭戏剧、古典修辞学、哲学辩难传统
- 所有曾经在做决定前，认真问过自己“如果我错了怎么办”的人

## License

MIT
