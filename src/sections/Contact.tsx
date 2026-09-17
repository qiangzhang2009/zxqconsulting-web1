/**
 * Contact Section — 联系版块 (简化版)
 * 
 * 简洁展示联系方式:
 * - 简洁的联系表单
 * - 联系方式
 * - 期待您的联系
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Bot,
  Building,
  CalendarRange,
  ClipboardList,
  Globe2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { tracking } from '@/lib/tracking';
import { useMarket } from '@/sections/aiTools/context';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectStage: '',
    targetMarkets: '',
    timeline: '',
    challenge: '',
    message: '',
  });
  const { selectedMarket, diagnosisReport, qualificationDecision } = useMarket();

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      targetMarkets: selectedMarket?.name || current.targetMarkets,
      challenge: diagnosisReport?.primaryBlocker || current.challenge,
      message: qualificationDecision
        ? `${diagnosisReport?.recommendation || ''}\n${qualificationDecision.escalationReason}`.trim()
        : current.message,
    }));
  }, [diagnosisReport?.primaryBlocker, diagnosisReport?.recommendation, qualificationDecision, selectedMarket?.name]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
      gsap.fromTo(
        formRef.current?.children || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      company: fd.get('company') as string,
      projectStage: fd.get('projectStage') as string,
      targetMarkets: fd.get('targetMarkets') as string,
      timeline: fd.get('timeline') as string,
      challenge: fd.get('challenge') as string,
      message: fd.get('message') as string,
      source_page: window.location.pathname,
    };

    try {
      const outboundForm = new FormData();
      outboundForm.append('name', data.name);
      outboundForm.append('email', data.email);
      outboundForm.append('phone', data.phone);
      outboundForm.append('company', data.company);
      outboundForm.append('message', [
        `${t('expertReview.projectStage')}: ${data.projectStage}`,
        `${t('expertReview.targetMarkets')}: ${data.targetMarkets}`,
        `${t('expertReview.mostImportantProblem')}: ${data.challenge}`,
        `${t('expertReview.additionalNotes')}: ${data.message}`,
      ].join('\n'));

      const [primary, backup, api] = await Promise.all([
        fetch('https://formsubmit.co/ajax/customer@zxqconsulting.com', { method: 'POST', headers: { Accept: 'application/json' }, body: outboundForm }),
        fetch('https://formsubmit.co/ajax/3740977@qq.com', { method: 'POST', headers: { Accept: 'application/json' }, body: outboundForm }),
        fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
      ]);
      if (!primary.ok && !backup.ok && !api.ok) throw new Error('All contact submission channels failed.');
      tracking.formSubmit('contact_form', true, data);
      setShowDialog(true);
      form.reset();
      setFormData({ name: '', email: '', phone: '', company: '', projectStage: '', targetMarkets: '', timeline: '', challenge: '', message: '' });
    } catch (error) {
      console.error(t('expertReview.submitError'), error);
      tracking.formSubmit('contact_form', false, data);
      alert(t('expertReview.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" ref={sectionRef} className="bg-[#0a1612] py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C2473B]/30 bg-[#C2473B]/10 px-4 py-2 text-sm text-[#C2473B]">
            <Sparkles className="h-4 w-4" />
            算法即世界 · 我们陪你走到
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-white md:text-5xl">
            算法给你方向，我们陪你落地
          </h2>
          <p className="mt-5 text-lg leading-8 text-amber-50/70">
            用算法发现机会,用顾问陪跑落地。无论您处于出海的哪个阶段,我们都愿意倾听并提供帮助。
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* 左侧:联系方式 */}
          <div>
            <div ref={imageRef} className="relative mb-6 overflow-hidden rounded-[2rem] border border-[#C2473B]/25 shadow-xl">
              <img src="/contact-bg.jpg" alt="Contact" className="h-[280px] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1612] via-[#0a1612]/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="text-sm uppercase tracking-[0.2em] text-[#C2473B]/85">岐黄四海</div>
                <h3 className="mt-2 text-2xl font-semibold">中医出海 一站式服务</h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* 顾问团队 */}
              <div className="rounded-3xl border border-[#C2473B]/20 bg-[#0d1f1a] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C2473B]/15 text-[#C2473B]">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-semibold text-white">顾问团队</div>
                    <div className="mt-1 text-sm text-amber-50/70">资深顾问全程陪跑您的出海之路</div>
                    <div className="mt-2 space-y-2 text-sm">
                      <a href="mailto:customer@zxqconsulting.com" className="flex items-center gap-2 text-amber-50/80 transition-colors hover:text-white">
                        <Mail className="h-4 w-4 text-[#C2473B]" /> customer@zxqconsulting.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 承诺 */}
              <div className="rounded-3xl border border-[#C2473B]/20 bg-[#0d1f1a] p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-[#C2473B]" />
                  <div className="space-y-2 text-sm text-amber-50/70">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-[#C2473B]" />
                      <span>专属订制算法精准匹配</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-[#C2473B]" />
                      <span>24小时内回复</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-3.5 w-3.5 text-[#C2473B]" />
                      <span>35国法规框架支持</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧:简洁表单 */}
          <form ref={formRef} onSubmit={handleSubmit} className="rounded-[2rem] border border-[#C2473B]/20 bg-[#0d1f1a] p-6 shadow-xl backdrop-blur-sm md:p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white mb-2">
                留下您的信息
              </h3>
              <p className="text-sm leading-7 text-slate-400">
                我们会尽快与您联系,了解您的需求并提供初步建议。
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <User className="h-4 w-4 text-emerald-300" />
                    姓名 <span className="text-red-400">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="mac-input focus-ring" placeholder="您的姓名" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Building className="h-4 w-4 text-emerald-300" />
                    公司/品牌
                  </label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange}
                    className="mac-input focus-ring" placeholder="您的公司或品牌名称" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Mail className="h-4 w-4 text-emerald-300" /> Email <span className="text-red-400">*</span>
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="mac-input focus-ring" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Phone className="h-4 w-4 text-emerald-300" />
                    电话
                  </label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="mac-input focus-ring" placeholder="+86 xxx xxxx xxxx" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <ClipboardList className="h-4 w-4 text-emerald-300" />
                    出海阶段
                  </label>
                  <select name="projectStage" value={formData.projectStage} onChange={handleChange}
                    className="mac-input focus-ring">
                    <option value="">请选择</option>
                    <option value="idea">初步想法</option>
                    <option value="pilot">小规模试水</option>
                    <option value="launch">正式进入</option>
                    <option value="scale">规模化扩展</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Globe2 className="h-4 w-4 text-emerald-300" />
                    目标市场
                  </label>
                  <input type="text" name="targetMarkets" value={formData.targetMarkets} onChange={handleChange}
                    className="mac-input focus-ring" placeholder="如:日本、欧盟、东南亚" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <MessageSquare className="h-4 w-4 text-emerald-300" />
                  您的需求或问题
                </label>
                <textarea name="challenge" value={formData.challenge} onChange={handleChange} rows={3}
                  className="mac-input focus-ring resize-none"
                  placeholder="请简要描述您的出海需求或面临的问题..." />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <CalendarRange className="h-4 w-4 text-emerald-300" />
                  时间线
                </label>
                <input type="text" name="timeline" value={formData.timeline} onChange={handleChange}
                  className="mac-input focus-ring" placeholder="如:6个月内、1年内、无明确时间" />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <MessageSquare className="h-4 w-4 text-emerald-300" />
                  补充说明
                </label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={3}
                  className="mac-input focus-ring resize-none"
                  placeholder="任何其他您想让我们了解的信息..." />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-emerald-50 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? '提交中...' : '提交咨询'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="border-white/10 bg-[#0b1620] text-white">
          <DialogHeader>
            <DialogTitle>提交成功!</DialogTitle>
            <DialogDescription className="text-slate-400">
              感谢您的咨询。我们的顾问团队会在24小时内与您联系,请留意您的邮箱。
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Contact;
