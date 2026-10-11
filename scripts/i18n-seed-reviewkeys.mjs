#!/usr/bin/env node
// 写入 ReviewComments 新增的 key 到所有 locale。
// 这些是「站内自有的 UI 文案」(角色徽章/回复数/点赞), 不属于用户生成内容, 必须本地化。
import fs from 'node:fs';

const T = {
  zh: { 'reviews2.agentConsultant': '商务顾问', 'reviews2.agentLegal': '法律顾问', 'reviews2.agentFinance': '财税顾问', 'reviews2.agentLogistics': '物流顾问', 'reviews2.replyCount': '{{count}} 条回复', 'reviews2.like': '赞' },
  en: { 'reviews2.agentConsultant': 'Business Consultant', 'reviews2.agentLegal': 'Legal Advisor', 'reviews2.agentFinance': 'Finance Advisor', 'reviews2.agentLogistics': 'Logistics Advisor', 'reviews2.replyCount': '{{count}} replies', 'reviews2.like': 'Like' },
  ja: { 'reviews2.agentConsultant': 'ビジネスコンサルタント', 'reviews2.agentLegal': '法務アドバイザー', 'reviews2.agentFinance': '財務アドバイザー', 'reviews2.agentLogistics': '物流アドバイザー', 'reviews2.replyCount': '返信 {{count}} 件', 'reviews2.like': 'いいね' },
  ko: { 'reviews2.agentConsultant': '비즈니스 컨설턴트', 'reviews2.agentLegal': '법률 어드바이저', 'reviews2.agentFinance': '재무 어드바이저', 'reviews2.agentLogistics': '물류 어드바이저', 'reviews2.replyCount': '답글 {{count}}개', 'reviews2.like': '추천' },
  de: { 'reviews2.agentConsultant': 'Unternehmensberater', 'reviews2.agentLegal': 'Rechtsberater', 'reviews2.agentFinance': 'Finanzberater', 'reviews2.agentLogistics': 'Logistikberater', 'reviews2.replyCount': '{{count}} Antworten', 'reviews2.like': 'Gefällt mir' },
  fr: { 'reviews2.agentConsultant': 'Consultant en développement', 'reviews2.agentLegal': 'Conseiller juridique', 'reviews2.agentFinance': 'Conseiller financier', 'reviews2.agentLogistics': 'Conseiller logistique', 'reviews2.replyCount': '{{count}} réponses', 'reviews2.like': "J'aime" },
  es: { 'reviews2.agentConsultant': 'Consultor comercial', 'reviews2.agentLegal': 'Asesor legal', 'reviews2.agentFinance': 'Asesor financiero', 'reviews2.agentLogistics': 'Asesor logístico', 'reviews2.replyCount': '{{count}} respuestas', 'reviews2.like': 'Me gusta' },
  pt: { 'reviews2.agentConsultant': 'Consultor comercial', 'reviews2.agentLegal': 'Assessor jurídico', 'reviews2.agentFinance': 'Assessor financeiro', 'reviews2.agentLogistics': 'Assessor logístico', 'reviews2.replyCount': '{{count}} respostas', 'reviews2.like': 'Gosto' },
  it: { 'reviews2.agentConsultant': 'Consulente commerciale', 'reviews2.agentLegal': 'Consulente legale', 'reviews2.agentFinance': 'Consulente finanziario', 'reviews2.agentLogistics': 'Consulente logistica', 'reviews2.replyCount': '{{count}} risposte', 'reviews2.like': 'Mi piace' },
  id: { 'reviews2.agentConsultant': 'Konsultan Bisnis', 'reviews2.agentLegal': 'Penasihat Hukum', 'reviews2.agentFinance': 'Penasihat Keuangan', 'reviews2.agentLogistics': 'Penasihat Logistik', 'reviews2.replyCount': '{{count}} balasan', 'reviews2.like': 'Suka' },
  ms: { 'reviews2.agentConsultant': 'Konsultan Perniagaan', 'reviews2.agentLegal': 'Peguam', 'reviews2.agentFinance': 'Penasihat Kewangan', 'reviews2.agentLogistics': 'Penasihat Logistik', 'reviews2.replyCount': '{{count}} balasan', 'reviews2.like': 'Suka' },
  vi: { 'reviews2.agentConsultant': 'Tư vấn kinh doanh', 'reviews2.agentLegal': 'Tư vấn pháp lý', 'reviews2.agentFinance': 'Tư vấn tài chính', 'reviews2.agentLogistics': 'Tư vấn hậu cần', 'reviews2.replyCount': '{{count}} trả lời', 'reviews2.like': 'Thích' },
  ru: { 'reviews2.agentConsultant': 'Бизнес-консультант', 'reviews2.agentLegal': 'Юридический консультант', 'reviews2.agentFinance': 'Финансовый консультант', 'reviews2.agentLogistics': 'Логистический консультант', 'reviews2.replyCount': 'Ответов: {{count}}', 'reviews2.like': 'Нравится' },
  th: { 'reviews2.agentConsultant': 'ที่ปรึกษาธุรกิจ', 'reviews2.agentLegal': 'ที่ปรึกษากฎหมาย', 'reviews2.agentFinance': 'ที่ปรึกษาการเงิน', 'reviews2.agentLogistics': 'ที่ปรึกษาโลจิสติกส์', 'reviews2.replyCount': '{{count}} ความคิดเห็นตอบกลับ', 'reviews2.like': 'ถูกใจ' },
  ar: { 'reviews2.agentConsultant': 'مستشار أعمال', 'reviews2.agentLegal': 'مستشار قانوني', 'reviews2.agentFinance': 'مستشار مالي', 'reviews2.agentLogistics': 'مستشار لوجستي', 'reviews2.replyCount': '{{count}} ردود', 'reviews2.like': 'إعجاب' },
};

function setPath(obj, p, value) {
  const parts = p.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] == null) cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const [lang, entries] of Object.entries(T)) {
  const f = `src/locales/${lang}.json`;
  const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const [k, v] of Object.entries(entries)) setPath(doc, k, v);
  fs.writeFileSync(f, JSON.stringify(doc, null, 2) + '\n');
  console.log(`${lang}: +${Object.keys(entries).length}`);
}