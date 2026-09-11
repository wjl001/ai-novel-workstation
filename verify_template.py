#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""验证优化后的四视图模板输出字数"""

# 按照优化后的模板格式，用沈青黛案例生成测试提示词
positive_prompt = """8K超高清，真实电影级古风人物摄影，极致写实，明暗过渡细腻，皮肤肌理真实，毛发丝缕质感，面料纹路清晰，纯白色干净背景，四视图设定表格式，从左到右依次为面部特写、正面全身、侧面全身、背面全身，四角人物特征完全一致，人物气质清冷灵动兼具侠气与清丽。

古代东亚女性沈青黛，身姿利落英挺；五官清纯靓丽，眉目清俊舒展，眼眸澄澈明亮，鼻梁精致秀气，唇色温润自然，面容清丽脱俗，带着少女清透感与江湖侠女清冷英气。

高马尾造型，乌黑亮泽长发束成高颅顶高马尾，额前鬓角散落自然碎发，头顶佩戴简约银质雕花发冠，发丝根根分明，四角一致。

侠客服饰，整体清青色系；交领右衽长款劲装上衣暗绣云纹，面料挺括哑光；腰间双层黑色皮质腰带配绳结流苏；小臂黑色皮质护腕；内搭修身长裤外罩青纱摆裙垂顺飘逸；脚穿黑色皮质平底长靴，四角一致。

①面部特写：肩部以上，正面朝向，双眼视线自然聚焦瞳孔对称，五官比例协调，重点展示面部细节高马尾发冠交领领口。②正面全身：标准站立双臂下垂双脚并拢，全身完整无截断，面部与特写一致。③侧面全身：左侧面，轮廓清晰鼻梁挺直，高矮体型与正面一致。④背面全身：背面站立不回头，后脑和服饰背面完整，高矮与正面一致。"""

negative_prompt = """人脸崩坏，五官扭曲，脸型变形，斗鸡眼斜视，瞳孔偏移，双眼不一致，多脸残脸，浓妆假面，锥子脸，过度磨皮，假白肤色，肤色不均色块。彩色怪异发色，发型发色不一致，塑料面料，粗糙布料，纹饰杂乱艳俗，服饰颜色款式不一致，现代服饰暴露服装。背景杂乱，多余人物道具，四角排列错误，缺少某视角，人物截断，比例失调，肢体畸形。卡通动漫，CG感过重，二次元，手绘感，模糊失真，低质量像素化，锯齿，色彩异常。"""

params = "步数30，相关性7.5，分辨率2048×1024，采样器DPM++ 2M Karras，批次1。"

optimization_note = "已注入古风武侠剧情上下文，强化眼部特征锁定预防斗鸡眼，统一四角人物特征确保一致性，针对性排除人脸崩坏和色彩异常问题。"

# 计算字数（含标点）
def count_chars(text):
    return len(text.replace('\n', '').replace(' ', ''))

pos_count = count_chars(positive_prompt)
neg_count = count_chars(negative_prompt)
param_count = count_chars(params)
note_count = count_chars(optimization_note)
total = pos_count + neg_count + param_count + note_count

print("=" * 60)
print("字数验证报告（优化后模板 v2.0）")
print("=" * 60)
print(f"正面提示词：{pos_count} 字（目标≤600）{'✅' if pos_count <= 600 else '❌'}")
print(f"负面提示词：{neg_count} 字（目标≤250）{'✅' if neg_count <= 250 else '❌'}")
print(f"推荐参数：{param_count} 字（目标≤50）{'✅' if param_count <= 50 else '❌'}")
print(f"优化说明：{note_count} 字（目标≤100）{'✅' if note_count <= 100 else '❌'}")
print("-" * 60)
print(f"总计：{total} 字（目标≤1000）{'✅ 通过' if total <= 1000 else '❌ 超限'}")
print("=" * 60)

# 质量校验
print("\n质量校验：")
checks = [
    ("四角特征一致", "四角人物特征完全一致" in positive_prompt),
    ("四视图设定表格式", "四视图设定表格式" in positive_prompt),
    ("排列顺序正确", "面部特写、正面全身、侧面全身、背面全身" in positive_prompt),
    ("眼部锁定", "双眼视线自然聚焦瞳孔对称" in positive_prompt),
    ("负面含斗鸡眼", "斗鸡眼" in negative_prompt),
    ("面部稳定", "五官比例协调" in positive_prompt),
    ("负面含人脸崩坏", "人脸崩坏" in negative_prompt),
    ("皮肤质感", "皮肤肌理真实" in positive_prompt),
    ("负面含假白肤色", "假白肤色" in negative_prompt),
    ("纯白背景", "纯白色干净背景" in positive_prompt),
    ("背面不回头", "背面站立不回头" in positive_prompt),
    ("8K超高清", "8K超高清" in positive_prompt),
    ("总字数≤1000", total <= 1000),
]

passed = 0
for name, result in checks:
    status = "✅" if result else "❌"
    if result: passed += 1
    print(f"  {status} {name}")

print(f"\n校验结果：{passed}/{len(checks)} 项通过")
if passed == len(checks):
    print("🎉 全部通过，模板优化成功！")
else:
    print("⚠️ 部分项未通过，需进一步调整")
