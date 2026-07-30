// 动作库数据
import { ref, computed } from 'vue'
import type { ActionClip, ActionCategory } from '../types'

const actions: ActionClip[] = [
  // Walk
  { id: 'act_walk_001', name: '慢步行走', category: 'walk', description: '缓慢步行的走路动作', duration: 2.5, fps: 24, frameCount: 60, tags: ['走路', '慢'], isLoop: true },
  { id: 'act_walk_002', name: '正常行走', category: 'walk', description: '标准步速走路', duration: 2.0, fps: 24, frameCount: 48, tags: ['走路', '标准'], isLoop: true },
  { id: 'act_walk_003', name: '快走', category: 'walk', description: '快速行走的动作', duration: 1.5, fps: 24, frameCount: 36, tags: ['走路', '快速'], isLoop: true },
  { id: 'act_walk_004', name: '踉跄走路', category: 'walk', description: '摇摇晃晃的走路', duration: 3.0, fps: 24, frameCount: 72, tags: ['走路', '踉跄'], isLoop: true },
  { id: 'act_walk_005', name: '倒退行走', category: 'walk', description: '向后走路的动作', duration: 2.0, fps: 24, frameCount: 48, tags: ['走路', '后退'], isLoop: true },
  { id: 'act_walk_006', name: '侧面行走', category: 'walk', description: '侧向移动走路', duration: 2.0, fps: 24, frameCount: 48, tags: ['走路', '侧面'], isLoop: true },
  { id: 'act_walk_007', name: '蹑手蹑脚', category: 'walk', description: '悄悄走路的动作', duration: 3.0, fps: 24, frameCount: 72, tags: ['走路', '潜行'], isLoop: true },
  { id: 'act_walk_008', name: '跳舞步', category: 'walk', description: '轻松舞步式的走法', duration: 2.0, fps: 24, frameCount: 48, tags: ['走路', '舞步'], isLoop: true },
  // Run
  { id: 'act_run_001', name: '慢跑', category: 'run', description: '轻松慢跑动作', duration: 1.0, fps: 24, frameCount: 24, tags: ['跑步', '慢跑'], isLoop: true },
  { id: 'act_run_002', name: '正常跑步', category: 'run', description: '标准跑步动作', duration: 0.8, fps: 24, frameCount: 20, tags: ['跑步', '标准'], isLoop: true },
  { id: 'act_run_003', name: '冲刺', category: 'run', description: '全力冲刺动作', duration: 0.6, fps: 24, frameCount: 16, tags: ['跑步', '冲刺'], isLoop: true },
  { id: 'act_run_004', name: '侧跑', category: 'run', description: '侧面快速移动', duration: 0.8, fps: 24, frameCount: 20, tags: ['跑步', '侧面'], isLoop: true },
  { id: 'act_run_005', name: '后撤跑', category: 'run', description: '后退跑步', duration: 1.0, fps: 24, frameCount: 24, tags: ['跑步', '后退'], isLoop: true },
  { id: 'act_run_006', name: '跑步转向', category: 'run', description: '跑步中转向的动作', duration: 1.5, fps: 24, frameCount: 36, tags: ['跑步', '转向'], isLoop: false },
  { id: 'act_run_007', name: '跑步停止', category: 'run', description: '从跑步到停止的过渡', duration: 1.0, fps: 24, frameCount: 24, tags: ['跑步', '停止'], isLoop: false },
  // Jump
  { id: 'act_jump_001', name: '原地跳跃', category: 'jump', description: '垂直原地跳跃', duration: 1.0, fps: 24, frameCount: 24, tags: ['跳跃', '原地'], isLoop: false },
  { id: 'act_jump_002', name: '向前跳跃', category: 'jump', description: '向前跳跃动作', duration: 1.2, fps: 24, frameCount: 28, tags: ['跳跃', '向前'], isLoop: false },
  { id: 'act_jump_003', name: '侧向跳跃', category: 'jump', description: '侧向跳跃动作', duration: 1.2, fps: 24, frameCount: 28, tags: ['跳跃', '侧向'], isLoop: false },
  { id: 'act_jump_004', name: '跳跃转身', category: 'jump', description: '跳跃同时转身', duration: 1.5, fps: 24, frameCount: 36, tags: ['跳跃', '转身'], isLoop: false },
  { id: 'act_jump_005', name: '跳远落地', category: 'jump', description: '跳远落地缓冲动作', duration: 1.0, fps: 24, frameCount: 24, tags: ['跳跃', '落地'], isLoop: false },
  { id: 'act_jump_006', name: '跳跃攻击', category: 'jump', description: '跳跃中的攻击动作', duration: 1.5, fps: 24, frameCount: 36, tags: ['跳跃', '攻击'], isLoop: false },
  // Sit
  { id: 'act_sit_001', name: '坐下动作', category: 'sit', description: '从站立到坐下的过渡', duration: 1.5, fps: 24, frameCount: 36, tags: ['坐', '过渡'], isLoop: false },
  { id: 'act_sit_002', name: '坐着-放松', category: 'sit', description: '放松坐姿（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['坐', '放松'], isLoop: true },
  { id: 'act_sit_003', name: '站着-端正', category: 'sit', description: '端正坐姿（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['坐', '端正'], isLoop: true },
  { id: 'act_sit_004', name: '站起动作', category: 'sit', description: '从坐到站起的过渡', duration: 1.2, fps: 24, frameCount: 28, tags: ['坐', '过渡'], isLoop: false },
  { id: 'act_sit_005', name: '盘腿坐', category: 'sit', description: '盘腿坐姿（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['坐', '盘腿'], isLoop: true },
  { id: 'act_sit_006', name: '跪坐', category: 'sit', description: '跪坐姿势（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['坐', '跪坐'], isLoop: true },
  { id: 'act_sit_007', name: '坐下-疲惫', category: 'sit', description: '疲惫地坐下', duration: 2.0, fps: 24, frameCount: 48, tags: ['坐', '疲惫'], isLoop: false },
  { id: 'act_sit_008', name: '站起来-缓慢', category: 'sit', description: '缓慢站起', duration: 2.0, fps: 24, frameCount: 48, tags: ['坐', '缓慢'], isLoop: false },
  // Stand
  { id: 'act_stand_001', name: '站立-中性', category: 'stand', description: '中性站立姿势（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['站', '中性'], isLoop: true },
  { id: 'act_stand_002', name: '站立-放松', category: 'stand', description: '放松站立（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['站', '放松'], isLoop: true },
  { id: 'act_stand_003', name: '站立-警觉', category: 'stand', description: '警觉站立姿势', duration: 5.0, fps: 24, frameCount: 120, tags: ['站', '警觉'], isLoop: true },
  { id: 'act_stand_004', name: '站立-双手叉腰', category: 'stand', description: '双手叉腰站立', duration: 5.0, fps: 24, frameCount: 120, tags: ['站', '叉腰'], isLoop: true },
  { id: 'act_stand_005', name: '站立-手插兜', category: 'stand', description: '手插口袋站立', duration: 5.0, fps: 24, frameCount: 120, tags: ['站', '插兜'], isLoop: true },
  { id: 'act_stand_006', name: '站立-靠墙', category: 'stand', description: '靠墙站立', duration: 5.0, fps: 24, frameCount: 120, tags: ['站', '靠墙'], isLoop: true },
  { id: 'act_stand_007', name: '转身-90度', category: 'stand', description: '90度转身', duration: 1.0, fps: 24, frameCount: 24, tags: ['站', '转身'], isLoop: false },
  { id: 'act_stand_008', name: '转身-180度', category: 'stand', description: '180度转身', duration: 1.5, fps: 24, frameCount: 36, tags: ['站', '转身'], isLoop: false },
  { id: 'act_stand_009', name: '举手', category: 'stand', description: '举手动作', duration: 1.0, fps: 24, frameCount: 24, tags: ['站', '举手'], isLoop: false },
  { id: 'act_stand_010', name: '弯腰', category: 'stand', description: '弯腰动作', duration: 1.0, fps: 24, frameCount: 24, tags: ['站', '弯腰'], isLoop: false },
  // Fight
  { id: 'act_fight_001', name: '出拳-右手', category: 'fight', description: '右手直拳', duration: 0.5, fps: 24, frameCount: 12, tags: ['战斗', '出拳'], isLoop: false },
  { id: 'act_fight_002', name: '出拳-左手', category: 'fight', description: '左手直拳', duration: 0.5, fps: 24, frameCount: 12, tags: ['战斗', '出拳'], isLoop: false },
  { id: 'act_fight_003', name: '钩拳', category: 'fight', description: '钩拳动作', duration: 0.6, fps: 24, frameCount: 14, tags: ['战斗', '钩拳'], isLoop: false },
  { id: 'act_fight_004', name: '上勾拳', category: 'fight', description: '上勾拳动作', duration: 0.6, fps: 24, frameCount: 14, tags: ['战斗', '上勾'], isLoop: false },
  { id: 'act_fight_005', name: '防守姿势', category: 'fight', description: '拳击防守姿势（循环）', duration: 3.0, fps: 24, frameCount: 72, tags: ['战斗', '防守'], isLoop: true },
  { id: 'act_fight_006', name: '踢腿-前踢', category: 'fight', description: '正踢腿动作', duration: 0.8, fps: 24, frameCount: 19, tags: ['战斗', '踢腿'], isLoop: false },
  { id: 'act_fight_007', name: '踢腿-侧踢', category: 'fight', description: '侧踢动作', duration: 0.8, fps: 24, frameCount: 19, tags: ['战斗', '侧踢'], isLoop: false },
  { id: 'act_fight_008', name: '踢腿-回旋踢', category: 'fight', description: '回旋踢动作', duration: 1.0, fps: 24, frameCount: 24, tags: ['战斗', '回旋踢'], isLoop: false },
  { id: 'act_fight_009', name: '挨打反应', category: 'fight', description: '被打到的反应', duration: 1.0, fps: 24, frameCount: 24, tags: ['战斗', '挨打'], isLoop: false },
  { id: 'act_fight_010', name: '挥剑-劈砍', category: 'fight', description: '挥剑劈砍', duration: 1.0, fps: 24, frameCount: 24, tags: ['战斗', '挥剑'], isLoop: false },
  { id: 'act_fight_011', name: '挥剑-横扫', category: 'fight', description: '挥剑横扫', duration: 1.0, fps: 24, frameCount: 24, tags: ['战斗', '挥剑'], isLoop: false },
  { id: 'act_fight_012', name: '持剑-站立', category: 'fight', description: '持剑站立（循环）', duration: 3.0, fps: 24, frameCount: 72, tags: ['战斗', '持剑'], isLoop: true },
  { id: 'act_fight_013', name: '持枪-瞄准', category: 'fight', description: '持枪瞄准（循环）', duration: 3.0, fps: 24, frameCount: 72, tags: ['战斗', '持枪'], isLoop: true },
  { id: 'act_fight_014', name: '射击-单发', category: 'fight', description: '单发射击', duration: 0.5, fps: 24, frameCount: 12, tags: ['战斗', '射击'], isLoop: false },
  { id: 'act_fight_015', name: '射击-连发', category: 'fight', description: '连续射击', duration: 1.5, fps: 24, frameCount: 36, tags: ['战斗', '射击'], isLoop: true },
  { id: 'act_fight_016', name: '格斗-连击', category: 'fight', description: '连续攻击组合', duration: 2.5, fps: 24, frameCount: 60, tags: ['战斗', '连击'], isLoop: true },
  { id: 'act_fight_017', name: '格斗-防御', category: 'fight', description: '防御反击', duration: 1.5, fps: 24, frameCount: 36, tags: ['战斗', '防御'], isLoop: false },
  { id: 'act_fight_018', name: '摔倒', category: 'fight', description: '摔倒动作', duration: 1.0, fps: 24, frameCount: 24, tags: ['战斗', '摔倒'], isLoop: false },
  { id: 'act_fight_019', name: '爬起来', category: 'fight', description: '从地上爬起来', duration: 2.0, fps: 24, frameCount: 48, tags: ['战斗', '爬起'], isLoop: false },
  { id: 'act_fight_020', name: '推人', category: 'fight', description: '推人动作', duration: 0.8, fps: 24, frameCount: 19, tags: ['战斗', '推'], isLoop: false },
  // Dance
  { id: 'act_dance_001', name: '街舞-基础', category: 'dance', description: '街舞基础动作', duration: 4.0, fps: 24, frameCount: 96, tags: ['舞蹈', '街舞'], isLoop: true },
  { id: 'act_dance_002', name: '广场舞-基本', category: 'dance', description: '广场舞基础动作', duration: 4.0, fps: 24, frameCount: 96, tags: ['舞蹈', '广场舞'], isLoop: true },
  { id: 'act_dance_003', name: '芭蕾舞-旋转', category: 'dance', description: '芭蕾舞旋转', duration: 3.0, fps: 24, frameCount: 72, tags: ['舞蹈', '芭蕾'], isLoop: true },
  { id: 'act_dance_004', name: '跳舞-摇摆', category: 'dance', description: '身体摇摆', duration: 3.0, fps: 24, frameCount: 72, tags: ['舞蹈', '摇摆'], isLoop: true },
  { id: 'act_dance_005', name: '跳舞-转圈', category: 'dance', description: '原地转圈', duration: 2.0, fps: 24, frameCount: 48, tags: ['舞蹈', '转圈'], isLoop: true },
  { id: 'act_dance_006', name: '跳舞-跳跃', category: 'dance', description: '跳跃式舞蹈', duration: 3.0, fps: 24, frameCount: 72, tags: ['舞蹈', '跳跃'], isLoop: true },
  // Gesture
  { id: 'act_gest_001', name: '挥手-打招呼', category: 'gesture', description: '挥手打招呼', duration: 1.5, fps: 24, frameCount: 36, tags: ['手势', '挥手'], isLoop: false },
  { id: 'act_gest_002', name: '挥手-再见', category: 'gesture', description: '挥手再见', duration: 1.5, fps: 24, frameCount: 36, tags: ['手势', '挥手'], isLoop: false },
  { id: 'act_gest_003', name: '点头-是', category: 'gesture', description: '点头表示肯定', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '点头'], isLoop: false },
  { id: 'act_gest_004', name: '摇头-否', category: 'gesture', description: '摇头表示否定', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '摇头'], isLoop: false },
  { id: 'act_gest_005', name: '指向-前方', category: 'gesture', description: '指向对方', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '指'], isLoop: false },
  { id: 'act_gest_006', name: '指向-侧面', category: 'gesture', description: '指向侧面', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '指'], isLoop: false },
  { id: 'act_gest_007', name: '拇指-点赞', category: 'gesture', description: '竖起大拇指', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '点赞'], isLoop: false },
  { id: 'act_gest_008', name: '握拳', category: 'gesture', description: '握拳动作', duration: 0.8, fps: 24, frameCount: 19, tags: ['手势', '握拳'], isLoop: false },
  { id: 'act_gest_009', name: '鼓掌', category: 'gesture', description: '鼓掌动作', duration: 1.5, fps: 24, frameCount: 36, tags: ['手势', '鼓掌'], isLoop: false },
  { id: 'act_gest_010', name: '握手', category: 'gesture', description: '握手动作', duration: 1.5, fps: 24, frameCount: 36, tags: ['手势', '握手'], isLoop: false },
  { id: 'act_gest_011', name: '鞠躬', category: 'gesture', description: '鞠躬动作', duration: 1.5, fps: 24, frameCount: 36, tags: ['手势', '鞠躬'], isLoop: false },
  { id: 'act_gest_012', name: '敬礼', category: 'gesture', description: '敬礼动作', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '敬礼'], isLoop: false },
  { id: 'act_gest_013', name: '比心', category: 'gesture', description: '比心手势', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '比心'], isLoop: false },
  { id: 'act_gest_014', name: 'OK手势', category: 'gesture', description: 'OK手势', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', 'OK'], isLoop: false },
  { id: 'act_gest_015', name: '竖起食指', category: 'gesture', description: '竖起食指表示想法', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '思考'], isLoop: false },
  { id: 'act_gest_016', name: '摊手', category: 'gesture', description: '摊手表示无奈', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '摊手'], isLoop: false },
  { id: 'act_gest_017', name: '摸头', category: 'gesture', description: '摸头动作', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '摸头'], isLoop: false },
  { id: 'act_gest_018', name: '指自己', category: 'gesture', description: '指向自己', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '指'], isLoop: false },
  { id: 'act_gest_019', name: '指远处', category: 'gesture', description: '指向远处', duration: 1.5, fps: 24, frameCount: 36, tags: ['手势', '指'], isLoop: false },
  { id: 'act_gest_020', name: '挥手-停止', category: 'gesture', description: '挥手停止手势', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '停止'], isLoop: false },
  { id: 'act_gest_021', name: '招手-过来', category: 'gesture', description: '招手让对方过来', duration: 1.5, fps: 24, frameCount: 36, tags: ['手势', '招手'], isLoop: false },
  { id: 'act_gest_022', name: '双手抱胸', category: 'gesture', description: '双手抱胸姿势（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['手势', '抱胸'], isLoop: true },
  { id: 'act_gest_023', name: '双手插腰', category: 'gesture', description: '双手叉腰（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['手势', '叉腰'], isLoop: true },
  { id: 'act_gest_024', name: '双手插兜', category: 'gesture', description: '双手插口袋（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['手势', '插兜'], isLoop: true },
  { id: 'act_gest_025', name: '双手合十', category: 'gesture', description: '双手合十', duration: 1.5, fps: 24, frameCount: 36, tags: ['手势', '合十'], isLoop: false },
  { id: 'act_gest_026', name: '举手-投降', category: 'gesture', description: '举手投降', duration: 1.0, fps: 24, frameCount: 24, tags: ['手势', '投降'], isLoop: false },
  { id: 'act_gest_027', name: '双手摊开', category: 'gesture', description: '双手摊开表示解释', duration: 1.5, fps: 24, frameCount: 36, tags: ['手势', '解释'], isLoop: false },
  // Emote
  { id: 'act_emote_001', name: '高兴-跳跃', category: 'emote', description: '高兴时跳跃', duration: 1.5, fps: 24, frameCount: 36, tags: ['表情', '高兴'], isLoop: false },
  { id: 'act_emote_002', name: '伤心-低头', category: 'emote', description: '伤心低头的动作', duration: 2.0, fps: 24, frameCount: 48, tags: ['表情', '伤心'], isLoop: false },
  { id: 'act_emote_003', name: '愤怒-握拳', category: 'emote', description: '愤怒握拳', duration: 1.0, fps: 24, frameCount: 24, tags: ['表情', '愤怒'], isLoop: false },
  { id: 'act_emote_004', name: '惊讶-张嘴', category: 'emote', description: '惊讶张嘴', duration: 0.8, fps: 24, frameCount: 19, tags: ['表情', '惊讶'], isLoop: false },
  { id: 'act_emote_005', name: '思考-托腮', category: 'emote', description: '托腮思考（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['表情', '思考'], isLoop: true },
  { id: 'act_emote_006', name: '无聊-打哈欠', category: 'emote', description: '打哈欠', duration: 2.0, fps: 24, frameCount: 48, tags: ['表情', '无聊'], isLoop: false },
  { id: 'act_emote_007', name: '疲惫-趴下', category: 'emote', description: '疲惫趴在桌上', duration: 2.0, fps: 24, frameCount: 48, tags: ['表情', '疲惫'], isLoop: false },
  { id: 'act_emote_008', name: '兴奋-挥手', category: 'emote', description: '兴奋挥手', duration: 1.5, fps: 24, frameCount: 36, tags: ['表情', '兴奋'], isLoop: false },
  { id: 'act_emote_009', name: '紧张-搓手', category: 'emote', description: '紧张搓手（循环）', duration: 3.0, fps: 24, frameCount: 72, tags: ['表情', '紧张'], isLoop: true },
  { id: 'act_emote_010', name: '沮丧-拍桌子', category: 'emote', description: '沮丧拍桌子', duration: 1.5, fps: 24, frameCount: 36, tags: ['表情', '沮丧'], isLoop: false },
  { id: 'act_emote_011', name: '自豪-挺胸', category: 'emote', description: '挺胸抬头（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['表情', '自豪'], isLoop: true },
  { id: 'act_emote_012', name: '害羞-挠头', category: 'emote', description: '害羞挠头', duration: 1.0, fps: 24, frameCount: 24, tags: ['表情', '害羞'], isLoop: false },
  { id: 'act_emote_013', name: '生气-跺脚', category: 'emote', description: '生气跺脚', duration: 1.0, fps: 24, frameCount: 24, tags: ['表情', '生气'], isLoop: false },
  { id: 'act_emote_014', name: '庆祝-跳起来', category: 'emote', description: '庆祝跳起来', duration: 2.0, fps: 24, frameCount: 48, tags: ['表情', '庆祝'], isLoop: false },
  { id: 'act_emote_015', name: '哭-擦眼泪', category: 'emote', description: '擦眼泪动作', duration: 2.0, fps: 24, frameCount: 48, tags: ['表情', '哭'], isLoop: false },
  // Interact
  { id: 'act_interact_001', name: '开门', category: 'interact', description: '开门动作', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '开门'], isLoop: false },
  { id: 'act_interact_002', name: '关门', category: 'interact', description: '关门动作', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '关门'], isLoop: false },
  { id: 'act_interact_003', name: '推门', category: 'interact', description: '推门动作', duration: 1.5, fps: 24, frameCount: 36, tags: ['交互', '推门'], isLoop: false },
  { id: 'act_interact_004', name: '拿东西', category: 'interact', description: '从桌上拿起物品', duration: 1.5, fps: 24, frameCount: 36, tags: ['交互', '拿取'], isLoop: false },
  { id: 'act_interact_005', name: '放东西', category: 'interact', description: '放下物品', duration: 1.5, fps: 24, frameCount: 36, tags: ['交互', '放置'], isLoop: false },
  { id: 'act_interact_006', name: '喝东西', category: 'interact', description: '喝水/饮料动作', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '喝'], isLoop: false },
  { id: 'act_interact_007', name: '吃饭', category: 'interact', description: '吃饭动作（循环）', duration: 3.0, fps: 24, frameCount: 72, tags: ['交互', '吃'], isLoop: true },
  { id: 'act_interact_008', name: '打电话', category: 'interact', description: '打电话动作（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['交互', '电话'], isLoop: true },
  { id: 'act_interact_009', name: '看书', category: 'interact', description: '看书动作（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['交互', '阅读'], isLoop: true },
  { id: 'act_interact_010', name: '打字', category: 'interact', description: '打字动作（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['交互', '打字'], isLoop: true },
  { id: 'act_interact_011', name: '写字', category: 'interact', description: '写字/写字动作（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['交互', '写字'], isLoop: true },
  { id: 'act_interact_012', name: '指屏幕', category: 'interact', description: '指向屏幕动作', duration: 1.5, fps: 24, frameCount: 36, tags: ['交互', '指'], isLoop: false },
  { id: 'act_interact_013', name: '拍照', category: 'interact', description: '拍照动作', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '拍照'], isLoop: false },
  { id: 'act_interact_014', name: '录像', category: 'interact', description: '录像动作（循环）', duration: 5.0, fps: 24, frameCount: 120, tags: ['交互', '录像'], isLoop: true },
  { id: 'act_interact_015', name: '翻包', category: 'interact', description: '翻找包内物品', duration: 3.0, fps: 24, frameCount: 72, tags: ['交互', '翻找'], isLoop: false },
  { id: 'act_interact_016', name: '穿衣', category: 'interact', description: '穿衣服动作', duration: 3.0, fps: 24, frameCount: 72, tags: ['交互', '穿'], isLoop: false },
  { id: 'act_interact_017', name: '脱衣', category: 'interact', description: '脱衣服动作', duration: 3.0, fps: 24, frameCount: 72, tags: ['交互', '脱'], isLoop: false },
  { id: 'act_interact_018', name: '系鞋带', category: 'interact', description: '系鞋带动作', duration: 3.0, fps: 24, frameCount: 72, tags: ['交互', '系带'], isLoop: false },
  { id: 'act_interact_019', name: '擦桌子', category: 'interact', description: '擦桌子动作（循环）', duration: 3.0, fps: 24, frameCount: 72, tags: ['交互', '擦'], isLoop: true },
  { id: 'act_interact_020', name: '倒水', category: 'interact', description: '倒水动作', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '倒水'], isLoop: false },
  { id: 'act_interact_021', name: '开门-推开', category: 'interact', description: '用力推开门', duration: 2.5, fps: 24, frameCount: 60, tags: ['交互', '推开'], isLoop: false },
  { id: 'act_interact_022', name: '开门-拉', category: 'interact', description: '拉门开门', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '拉门'], isLoop: false },
  { id: 'act_interact_023', name: '开门-推开', category: 'interact', description: '用力推开门', duration: 2.5, fps: 24, frameCount: 60, tags: ['交互', '推开'], isLoop: false },
  { id: 'act_interact_024', name: '开门-拉', category: 'interact', description: '拉门开门', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '拉门'], isLoop: false },
  { id: 'act_interact_025', name: '开抽屉', category: 'interact', description: '拉开抽屉', duration: 1.5, fps: 24, frameCount: 36, tags: ['交互', '抽屉'], isLoop: false },
  { id: 'act_interact_026', name: '关抽屉', category: 'interact', description: '关上抽屉', duration: 1.5, fps: 24, frameCount: 36, tags: ['交互', '抽屉'], isLoop: false },
  { id: 'act_interact_027', name: '翻书', category: 'interact', description: '翻书动作', duration: 1.0, fps: 24, frameCount: 24, tags: ['交互', '翻书'], isLoop: false },
  { id: 'act_interact_028', name: '合书', category: 'interact', description: '合上书', duration: 1.0, fps: 24, frameCount: 24, tags: ['交互', '合书'], isLoop: false },
  { id: 'act_interact_029', name: '投掷', category: 'interact', description: '投掷物品', duration: 1.5, fps: 24, frameCount: 36, tags: ['交互', '投掷'], isLoop: false },
  { id: 'act_interact_030', name: '接物', category: 'interact', description: '接住物品', duration: 1.0, fps: 24, frameCount: 24, tags: ['交互', '接'], isLoop: false },
  { id: 'act_interact_031', name: '敲门', category: 'interact', description: '敲门动作', duration: 1.5, fps: 24, frameCount: 36, tags: ['交互', '敲门'], isLoop: false },
  { id: 'act_interact_032', name: '鞠躬行礼', category: 'interact', description: '鞠躬行礼', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '鞠躬'], isLoop: false },
  { id: 'act_interact_033', name: '握手-对方', category: 'interact', description: '与对方握手', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '握手'], isLoop: false },
  { id: 'act_interact_034', name: '交换物品', category: 'interact', description: '与对方交换物品', duration: 2.5, fps: 24, frameCount: 60, tags: ['交互', '交换'], isLoop: false },
  { id: 'act_interact_035', name: '递东西', category: 'interact', description: '递东西给对方', duration: 1.5, fps: 24, frameCount: 36, tags: ['交互', '递'], isLoop: false },
  { id: 'act_interact_036', name: '打开盒子', category: 'interact', description: '打开盒子动作', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '开盒'], isLoop: false },
  { id: 'act_interact_037', name: '写字-签字', category: 'interact', description: '签字动作', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '签字'], isLoop: false },
  { id: 'act_interact_038', name: '打开伞', category: 'interact', description: '打开雨伞', duration: 1.5, fps: 24, frameCount: 36, tags: ['交互', '开伞'], isLoop: false },
  { id: 'act_interact_039', name: '收起伞', category: 'interact', description: '收起雨伞', duration: 1.5, fps: 24, frameCount: 36, tags: ['交互', '收伞'], isLoop: false },
  { id: 'act_interact_040', name: '开车-启动', category: 'interact', description: '开车启动动作', duration: 2.0, fps: 24, frameCount: 48, tags: ['交互', '开车'], isLoop: false },
]

const categoryLabels: Record<ActionCategory, string> = {
  walk: '行走',
  run: '跑步',
  jump: '跳跃',
  sit: '坐卧',
  stand: '站立',
  fight: '战斗',
  dance: '舞蹈',
  gesture: '手势',
  emote: '表情',
  interact: '交互'
}

const categoryIcons: Record<ActionCategory, string> = {
  walk: 'M13 4v6l4 3v4h-10v-4l4-3V4zm4 12a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v2h10v-2z',
  run: 'M13 4v6l4 3v4h-10v-4l4-3V4zm-1 18a4 4 0 0 0 4-4v-2H8v2a4 4 0 0 0 4 4z',
  jump: 'M12 2v3M12 7c2 0 3 1 4 3l2 3-3 2-3-1-3 1-3-2 2-3c1-2 2-3 4-3zM9 17h6M10 20h4M6 14l-2 3M18 14l2 3',
  sit: 'M5 12h14v8H5zM7 12V8a5 5 0 0 1 10 0v4M7 4v2M17 4v2',
  stand: 'M5 20h14M9 20v-3M15 20v-3M12 17V9M9 9h6M12 9V5M9 5h6',
  fight: 'M13 4v6l4 3v4h-10v-4l4-3V4zm3 14v-2H6v2',
  dance: 'M12 2c2 0 4 2 4 4v2c0 1-1 2-2 2s-2-1-2-2V6c0-2 0-4 0-4zM12 12v4c-2 0-4 1-4 3s2 3 4 3 4-1 4-3-2-3-4-3zM8 18l-2 2M16 18l2 2',
  gesture: 'M9 11l3 3 7-7M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7',
  emote: 'M8 14c1 0 2-1 2-2M16 14c-1 0-2-1-2-2M12 18c2 0 4-1 4-3M12 18c-2 0-4-1-4-3M8 8h8M8 10h8',
  interact: 'M7 11l5-5 5 5M5 21h14M5 21V8m14 13V8M3 8h18'
}

export function useActionLibrary() {
  const allActions = ref<ActionClip[]>(actions)

  const categoryList = computed(() => {
    return Object.entries(categoryLabels).map(([key, label]) => ({
      key: key as ActionCategory,
      label,
      icon: categoryIcons[key as ActionCategory]
    }))
  })

  function searchActions(query: string, category?: ActionCategory): ActionClip[] {
    const q = query.toLowerCase()
    return allActions.value.filter(a => {
      const matchCategory = !category || a.category === category
      const matchQuery = !q || a.name.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)) || (a.description && a.description.includes(q))
      return matchCategory && matchQuery
    })
  }

  function getActionsByCategory(category: ActionCategory): ActionClip[] {
    return allActions.value.filter(a => a.category === category)
  }

  return {
    allActions,
    categoryList,
    searchActions,
    getActionsByCategory
  }
}
