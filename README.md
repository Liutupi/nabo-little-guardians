# NABO 小小守护队

**医生家庭定制的网页物理弹射冒险 · v1.0.0**

[立即在线游玩](https://liutupi.github.io/nabo-little-guardians/) · [下载第一版](https://github.com/Liutupi/nabo-little-guardians/releases/tag/v1.0.0) · [反馈问题](https://github.com/Liutupi/nabo-little-guardians/issues)

<p>
  <img src="dist/assets/toys/penicillin-normal.webp" width="80" alt="青霉素补给">
  <img src="dist/assets/toys/virus-normal.webp" width="80" alt="小病毒">
  <img src="dist/assets/toys/mrsa-normal.webp" width="80" alt="MRSA 重甲菌">
  <img src="dist/assets/toys/cza-normal.webp" width="80" alt="双子补给">
  <img src="dist/assets/toys/kpc-normal.webp" width="80" alt="KPC 首领">
</p>

和果果、沐沐、NABO 一起，用弹弓守护微观世界。瞄准支撑点制造倒塌连锁，观察机关与升降门，再按模拟药敏切换补给。

## 第一版内容

- **三位全身潮玩 3D 队员**：果果、沐沐与 NABO，各有装弹、拉弓、松手、庆祝四组实际动作，共 96 帧；脚底按逐帧锚点对齐地面。
- **八个策略关卡**：支点连锁、玻璃桥、反弹板、多层堡垒、护盾开关、升降门及 KPC 混合终章。
- **十种病原体敌人**：链球菌、大肠埃希菌、MSSA 金葡菌、病毒、肺炎支原体、肺炎衣原体、铜绿假单胞菌、MRSA、ESBL 与 KPC 型 CRE。
- **十种补给**：九种抗菌补给与幻想免疫护盾，逐关解锁并积累熟练度；所有匹配命中造成相同的 2 点游戏伤害。
- **26 张 3D 敌人与补给素材**：重甲菌具有完整、裂甲、脱甲三种外观，图鉴、补给卡与战斗共用素材。
- **命中与破甲特效**：彩色尾迹、亮闪、挤压回弹、大块碎甲、双层冲击波与精准连击。
- 支持鼠标、触屏、键盘、暂停、全屏、音效开关、自由选关和本地进度保存。

## 怎么玩

1. 在弹射台或画面左半边向后拖动，松手发射；虚线预览弹道。
2. 飞行中点击画面、技能按钮或按 **E**，发动果果的冲刺、沐沐的震波或 NABO 的守护脉冲。
3. 点击 **药敏扫描** 查看本关模拟报告，在发射前装备匹配补给。结构倒塌也会造成游戏物理伤害。
4. 先击中橙色开关关闭全局护盾，再处理重甲敌人。观察升降门的窗口，利用高抛与反弹规划路线。

键盘：**方向键**调整瞄准 · **空格**发射 · **E**技能 · **R**重来 · **Esc**暂停。

星星、最高分、昵称和熟练度保存在当前浏览器。不同网址和设备的进度独立保存。

## 本地运行

游戏运行不需要构建。先克隆仓库：

```sh
git clone https://github.com/Liutupi/nabo-little-guardians.git
cd nabo-little-guardians
npm start
```

然后打开 <http://localhost:5173/>。`npm start` 使用 Python 3 的静态服务器；也可以直接打开 `dist/index.html`，或下载 Release 的 Web ZIP 后打开其中的 `index.html`。引擎和图片均随包提供，字体不可用时使用系统字体。

需要运行开发检查时，安装锁定的依赖：

```sh
npm ci
npm run check
npm test
```

建议 Node.js 22 或更新版本。素材重新打包工具另外需要 Python、Pillow 与 NumPy，日常游玩和部署无需运行这些工具。

## 关卡

| 关卡 | 主要对手 | 玩法变化 |
| --- | --- | --- |
| 01 诊所花园 | 敏感链球菌 | 木架支点与连锁倒塌 |
| 02 洗手台行动 | 大肠埃希菌、MSSA | 双塔玻璃桥与泡泡箱 |
| 03 呼吸道巡逻 | 病毒 | 高台、反弹板与高低两路 |
| 04 非典型迷宫 | 肺炎支原体、肺炎衣原体 | 双层双塔与脆弱连接桥 |
| 05 MRSA 耐药堡垒 | MRSA、MSSA | 关闭护盾后突破重甲 |
| 06 ICU 双线守护 | 铜绿假单胞菌、病毒 | 升降门与补给切换 |
| 07 ESBL 净化站 | ESBL、敏感大肠埃希菌 | 护盾、反弹、钢架与高台 |
| 08 全家 · 超级菌终章 | KPC、MRSA、ESBL、支原体、病毒 | 联合堡垒与多机制配合 |

## 项目结构

```text
dist/                  可直接部署的静态游戏
  game.js              固定步长物理与交互
  levels.js            关卡结构
  microbiology.js      病原体、补给与模拟药敏数据
  animation.js         三位角色的动作播放
  toy-art.js           3D 病原体与补给绘制
  effects.js           命中、破甲与技能特效
  assets/              引擎、角色动作和 3D 素材
tests/                 真实游戏逻辑与物理回归检查
tools/                 可选的素材裁切和压缩工具
.github/workflows/     自动检查与 GitHub Pages 部署
```

推送到 `main` 后，GitHub Actions 运行语法、素材、药敏规则与八关通关检查，通过后把 `dist/` 部署到 GitHub Pages。

## 医学与素材说明

本作是拟人化家庭游戏。威胁等级、补给权限、熟练度和免疫护盾属于游戏设定；模拟药敏对应虚构分离株，不提供真实患者的剂量、疗程或治疗建议。医学资料及模型边界见 [MEDICAL-NOTES.md](MEDICAL-NOTES.md)。

本仓库包含最终动漫游戏素材，原始人物照片与生成过程中的本地文件不随仓库分发。素材清单与生成方式见 [ASSETS.md](ASSETS.md)，提示词见 [ANIMATION-PROMPTS.json](ANIMATION-PROMPTS.json) 和 [TOY-ASSET-PROMPTS.json](TOY-ASSET-PROMPTS.json)。

第三方 Matter.js 的 MIT 许可随 [引擎许可文件](dist/assets/matter-LICENSE.txt) 保留。本项目未为其他代码、人物形象或美术素材另行授予开源许可。
