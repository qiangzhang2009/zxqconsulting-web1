#!/usr/bin/env node
// FloatingContact 组件此前整块硬编码中文, 现已接入 i18n —— 补齐各语言词条。
import fs from 'node:fs';

const T = {
  zh: { callNow: '立即拨打', wechat: '微信咨询', sendEmail: '发送邮件', message: '在线留言', contactUs: '联系我们', hours: '工作时间: 周一至周五 9:00-18:00', wechatCopied: '已复制微信号: {{id}}' },
  en: { callNow: 'Call Now', wechat: 'WeChat', sendEmail: 'Send Email', message: 'Leave a Message', contactUs: 'Contact Us', hours: 'Hours: Mon–Fri 9:00–18:00', wechatCopied: 'WeChat ID copied: {{id}}' },
  ja: { callNow: '今すぐ電話', wechat: 'WeChat', sendEmail: 'メールを送る', message: 'メッセージを送る', contactUs: 'お問い合わせ', hours: '営業時間: 月〜金 9:00-18:00', wechatCopied: 'WeChat ID をコピーしました: {{id}}' },
  ko: { callNow: '지금 전화하기', wechat: 'WeChat', sendEmail: '이메일 보내기', message: '문의 남기기', contactUs: '문의하기', hours: '운영 시간: 월~금 9:00-18:00', wechatCopied: 'WeChat ID 복사됨: {{id}}' },
  de: { callNow: 'Jetzt anrufen', wechat: 'WeChat', sendEmail: 'E-Mail senden', message: 'Nachricht hinterlassen', contactUs: 'Kontakt', hours: 'Bürozeiten: Mo–Fr 9:00–18:00', wechatCopied: 'WeChat-ID kopiert: {{id}}' },
  fr: { callNow: 'Appeler', wechat: 'WeChat', sendEmail: 'Envoyer un e-mail', message: 'Laisser un message', contactUs: 'Nous contacter', hours: 'Horaires : lun.–ven. 9h00–18h00', wechatCopied: 'Identifiant WeChat copié : {{id}}' },
  es: { callNow: 'Llamar ahora', wechat: 'WeChat', sendEmail: 'Enviar correo', message: 'Dejar mensaje', contactUs: 'Contáctanos', hours: 'Horario: lun.–vie. 9:00–18:00', wechatCopied: 'ID de WeChat copiado: {{id}}' },
  pt: { callNow: 'Ligar agora', wechat: 'WeChat', sendEmail: 'Enviar e-mail', message: 'Deixar mensagem', contactUs: 'Fale conosco', hours: 'Horário: seg.–sex. 9:00–18:00', wechatCopied: 'ID do WeChat copiado: {{id}}' },
  it: { callNow: 'Chiama ora', wechat: 'WeChat', sendEmail: 'Invia e-mail', message: 'Lascia un messaggio', contactUs: 'Contattaci', hours: 'Orari: lun.–ven. 9:00–18:00', wechatCopied: 'ID WeChat copiato: {{id}}' },
  id: { callNow: 'Telepon sekarang', wechat: 'WeChat', sendEmail: 'Kirim email', message: 'Tinggalkan pesan', contactUs: 'Hubungi kami', hours: 'Jam: Sen–Jum 9:00–18:00', wechatCopied: 'ID WeChat disalin: {{id}}' },
  ms: { callNow: 'Hubungi sekarang', wechat: 'WeChat', sendEmail: 'Hantar e-mel', message: 'Tinggalkan mesej', contactUs: 'Hubungi kami', hours: 'Waktu operasi: Isn–Jum 9:00–18:00', wechatCopied: 'ID WeChat disalin: {{id}}' },
  vi: { callNow: 'Gọi ngay', wechat: 'WeChat', sendEmail: 'Gửi email', message: 'Để lại lời nhắn', contactUs: 'Liên hệ với chúng tôi', hours: 'Giờ làm việc: T2–T6 9:00–18:00', wechatCopied: 'Đã sao chép ID WeChat: {{id}}' },
  ru: { callNow: 'Позвонить', wechat: 'WeChat', sendEmail: 'Отправить письмо', message: 'Оставить сообщение', contactUs: 'Свяжитесь с нами', hours: 'Часы работы: пн–пт 9:00–18:00', wechatCopied: 'ID WeChat скопирован: {{id}}' },
  th: { callNow: 'โทรติดต่อ', wechat: 'WeChat', sendEmail: 'ส่งอีเมล', message: 'ฝากข้อความ', contactUs: 'ติดต่อเรา', hours: 'เวลาทำการ: จันทร์–ศุกร์ 9:00–18:00 น.', wechatCopied: 'คัดลอก ID WeChat แล้ว: {{id}}' },
  ar: { callNow: 'اتصل الآن', wechat: 'WeChat', sendEmail: 'إرسال بريد', message: 'اترك رسالة', contactUs: 'تواصل معنا', hours: 'ساعات العمل: الاثنين–الجمعة 9:00–18:00', wechatCopied: 'تم نسخ معرّف WeChat: {{id}}' },
};

for (const [lang, entries] of Object.entries(T)) {
  const f = `src/locales/${lang}.json`;
  const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  doc.floatingContact = { ...(doc.floatingContact || {}), ...entries };
  fs.writeFileSync(f, JSON.stringify(doc, null, 2) + '\n');
  console.log(`${lang}: +${Object.keys(entries).length}`);
}