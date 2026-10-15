# 医学设定边界与资料来源

本作是家庭物理弹射游戏。十种敌人和十种补给的规则来自 `dist/microbiology.js`，战斗判定、图鉴与模拟药敏表共用该数据。没有剂量、疗程或针对真实患者的推荐。

- **威胁 Lv.1–5**：关卡难度、美术重甲与生命值的游戏指标。革兰阳性、革兰阴性、非典型细菌和病毒不构成临床上的线性强弱阶梯。
- **补给权限 1–6**：出场和解锁顺序；不是抗生素临床分级，也不是 WHO AWaRe 分组。所有匹配补给均造成 2 点游戏伤害。
- **熟练 Lv.1–3**：每 6 次匹配命中提升一级，至三级封顶，只改变装饰与奖励，不扩展抗菌谱。
- **药敏 S/R**：均为虚构分离株的设定。S 为本游戏匹配，R 为该模拟株耐药，— 为机制不适用，? 为未建模。未建模不能当成耐药或敏感。真实治疗还受感染部位、检验结果、耐药机制和患者情况影响。
- **结构冲击**：倒塌、坠落等为游戏物理伤害，与抗菌药效分开计算。
- **免疫护盾**：病毒专属幻想装备，不是抗病毒药物或真实治疗方法。
- **CRRT**：仅提供视觉场景灵感，泡泡箱、弹弓和净化站机关没有临床含义。

## 核对来源（2026-10-15）

1. [CDC：抗生素基础](https://www.cdc.gov/antibiotic-use/about/)：抗生素不能治疗病毒感染。
2. [CDC：肺炎支原体临床照护](https://www.cdc.gov/mycoplasma/hcp/clinical-care/index.html)：支原体没有细胞壁，β-内酰胺类缺少作用靶点；也存在大环内酯耐药，故游戏注明模拟敏感株。
3. [CDC：肺炎衣原体临床概述](https://www.cdc.gov/cpneumoniae/hcp/clinical-overview/)：本作特指呼吸道的 C. pneumoniae，使用大环内酯与四环素类作为模拟匹配，不混用其他衣原体的治疗背景。
4. [IDSA：耐药革兰阴性菌指导](https://www.idsociety.org/practice-guideline/amr-guidance/)：ESBL、CRE、KPC 和 NDM 等机制需要区分。终章限定为 CZA 敏感的虚构 KPC 型 CRE；不能泛化为所有“超级菌”，尤其不能将 CZA 单药规则套用于 NDM。
5. [CDC：MRSA](https://arpsp.cdc.gov/psp/listing/antimicrobial-resistance/profile/methicillin-resistant-staphylococcus-aureus)：MSSA 与 MRSA 分开出场，重甲仅为游戏表达。
6. [WHO：AWaRe 抗生素书](https://www.who.int/publications/i/item/9789240062382)：Access / Watch / Reserve 用于抗菌药物管理；游戏未将其作为威力阶梯。

## 关卡遭遇

1. 敏感链球菌；2. 大肠埃希菌与 MSSA；3. 病毒；4. 肺炎支原体与肺炎衣原体；5. MRSA 与 MSSA；6. 铜绿假单胞菌与病毒；7. ESBL 肺炎克雷伯菌与敏感大肠埃希菌；8. KPC 型 CRE、MRSA、ESBL、支原体与病毒。
