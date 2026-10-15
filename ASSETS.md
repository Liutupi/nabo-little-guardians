# 最终角色动作素材

使用内置 imagegen，直接以果果、沐沐的原始照片保留各自面部特点，以原始 NABO 形象固定医生帽、圆眼镜、棕色头发、白大褂和深蓝服装。三位均为全身潮玩 3D 角色。

最终部署素材为 dist/assets/{blue,orange,nabo}-{load,pull,release,celebrate}.webp，共 12 张四列两行图集，每张 8 帧，每位 32 帧。WebP 仅作网页编码压缩，原始生成 PNG 完整保存在本地 artifacts/animation-masters/。

最终完整提示词见 ANIMATION-PROMPTS.json。dist/atlas-meta.js 为逐帧鞋底定位数据；tools/pack-animations.py 仅负责编码与测量，角色动作通过 imagegen 绘制。

原始儿童照片不在站点内。最初的泛化头像与六姿势版本已移至本地 artifacts，不再用于最终界面。

Matter.js 为 MIT 许可，许可证在 dist/assets/matter-LICENSE.txt。

## 病原体、补给与破甲（2026-10-15）

使用内置 imagegen，以 `artifacts/nabo-original-reference.png` 作为风格参考，重新绘制 10 种病原体和 10 种补给。独立素材保存在 `dist/assets/toys/{id}-normal.webp`；MRSA、ESBL 与 KPC 另有 `{id}-damaged.webp` 和 `{id}-bare.webp`。共 26 张透明 WebP，约 1.1 MB。

病原体 ID：strepto、ecoli、staph、virus、myco、chlamydia、pseudomonas、mrsa、esbl、kpc。补给 ID：penicillin、cefazolin、ceftriaxone、immune、azithro、doxy、vancomycin、cefepime、meropenem、cza。

原始 PNG 三张图集保存在 `artifacts/toy-masters/{pathogens,supplies,damage}-v1.png`。完整生成提示词和参考角色约束见 [TOY-ASSET-PROMPTS.json](TOY-ASSET-PROMPTS.json)。游戏使用 `dist/toy-meta.js` 中的尺寸元数据；打包工具只裁切／编码，不改画。图片采用生成时的真实透明通道。

素材同时用于场景、补给队列、卡片、图鉴和模拟药敏表。护甲状态只改变视觉表现，沿用已有药敏、生命值和碰撞规则。
