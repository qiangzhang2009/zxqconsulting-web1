/**
 * 客户信息采集表提交 API
 * POST /api/client-intake
 *
 * 保存客户信息采集表数据到 D1 数据库并发送邮件通知
 */

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
}

function getDB(env: Env): D1Database | null {
  return env.DB || env.zxqconsulting_comments || null;
}

function parseJsonField(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  let body: Record<string, any> = {};

  try {
    // 尝试解析 JSON
    const rawBody = await request.text();
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      // 如果不是 JSON，尝试作为表单数据解析
      const params = new URLSearchParams(rawBody);
      params.forEach((value, key) => {
        body[key] = value;
      });
    }

    // 获取客户端信息
    const cf = (request as any).cf || {};
    const ipAddress = cf.clientIp || '';
    const country = cf.country || '';

    // 提取所有表单字段，提供默认值
    const companyName = body.companyName || '';
    const companyNameEn = body.companyNameEn || '';
    const unifiedCode = body.unifiedCode || '';
    const companyType = body.companyType || '';
    const establishDate = body.establishDate || '';
    const registeredCapital = body.registeredCapital || '';
    const industry = body.industry || '';
    const productCategory = body.productCategory || '';
    const companyIntro = body.companyIntro || '';
    const contactName = body.contactName || '';
    const contactTitle = body.contactTitle || '';
    const contactPhone = body.contactPhone || '';
    const contactEmail = body.contactEmail || '';
    const contactWechat = body.contactWechat || '';
    const overseasStage = body.overseasStage || '';
    const hasBranch = body.hasBranch || '';
    const branchDetails = body.branchDetails || '';
    const hasRevenue = body.hasRevenue || '';
    const overseasRevenue = body.overseasRevenue || '';
    const revenueRatio = body.revenueRatio || '';
    const overseasExperience = body.overseasExperience || '';
    const targetMarkets = parseJsonField(body.targetMarkets);
    const priorityMarkets = body.priorityMarkets || '';
    const marketTimeline = body.marketTimeline || '';
    const marketFactors = parseJsonField(body.marketFactors);
    const businessModel = parseJsonField(body.businessModel);
    const productDetail = body.productDetail || '';
    const avgPrice = body.avgPrice || '';
    const supplyCapacity = body.supplyCapacity || '';
    const hasCert = body.hasCert || '';
    const certDetail = body.certDetail || '';
    const supplyChain = body.supplyChain || '';
    const services = parseJsonField(body.services);
    const serviceDetail = body.serviceDetail || '';
    const existingPartners = body.existingPartners || '';
    const budget = body.budget || '';
    const budgetFocus = parseJsonField(body.budgetFocus);
    const startDate = body.startDate || '';
    const endDate = body.endDate || '';
    const urgency = body.urgency || '';
    const annualRevenue = body.annualRevenue || '';
    const profitRate = body.profitRate || '';
    const availableFunds = body.availableFunds || '';
    const financeNeed = body.financeNeed || '';
    const financialNote = body.financialNote || '';
    const competitors = parseJsonField(body.competitors);
    const advantages = body.advantages || '';
    const keyFactors = parseJsonField(body.keyFactors);
    const challenges = parseJsonField(body.challenges);
    const pastProblems = body.pastProblems || '';
    const riskTolerance = body.riskTolerance || '';
    const docs = parseJsonField(body.docs);
    const additionalNote = body.additionalNote || '';

    // ================================================================
    // 保存到 D1 数据库
    // ================================================================
    const DB = getDB(env);
    if (DB) {
      // 确保表存在
      await DB.prepare(`
        CREATE TABLE IF NOT EXISTS client_intake (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company_name TEXT,
          company_name_en TEXT,
          unified_code TEXT,
          company_type TEXT,
          establish_date TEXT,
          registered_capital TEXT,
          industry TEXT,
          product_category TEXT,
          company_intro TEXT,
          contact_name TEXT,
          contact_title TEXT,
          contact_phone TEXT,
          contact_email TEXT,
          contact_wechat TEXT,
          overseas_stage TEXT,
          has_branch TEXT,
          branch_details TEXT,
          has_revenue TEXT,
          overseas_revenue TEXT,
          revenue_ratio TEXT,
          overseas_experience TEXT,
          target_markets TEXT,
          priority_markets TEXT,
          market_timeline TEXT,
          market_factors TEXT,
          business_model TEXT,
          product_detail TEXT,
          avg_price TEXT,
          supply_capacity TEXT,
          has_cert TEXT,
          cert_detail TEXT,
          supply_chain TEXT,
          services TEXT,
          service_detail TEXT,
          existing_partners TEXT,
          budget TEXT,
          budget_focus TEXT,
          start_date TEXT,
          end_date TEXT,
          urgency TEXT,
          annual_revenue TEXT,
          profit_rate TEXT,
          available_funds TEXT,
          finance_need TEXT,
          financial_note TEXT,
          competitors TEXT,
          advantages TEXT,
          key_factors TEXT,
          challenges TEXT,
          past_problems TEXT,
          risk_tolerance TEXT,
          docs TEXT,
          additional_note TEXT,
          ip_address TEXT,
          country TEXT,
          status TEXT DEFAULT 'new',
          notes TEXT,
          assigned_to TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // 执行插入 - 确保列数和值数匹配
      await DB.prepare(`
        INSERT INTO client_intake (
          company_name, company_name_en, unified_code, company_type, establish_date,
          registered_capital, industry, product_category, company_intro,
          contact_name, contact_title, contact_phone, contact_email, contact_wechat,
          overseas_stage, has_branch, branch_details, has_revenue, overseas_revenue,
          revenue_ratio, overseas_experience, target_markets, priority_markets,
          market_timeline, market_factors, business_model, product_detail,
          avg_price, supply_capacity, has_cert, cert_detail, supply_chain,
          services, service_detail, existing_partners, budget, budget_focus,
          start_date, end_date, urgency, annual_revenue, profit_rate,
          available_funds, finance_need, financial_note, competitors,
          advantages, key_factors, challenges, past_problems, risk_tolerance,
          docs, additional_note, ip_address, country
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
      `).bind(
        companyName, companyNameEn, unifiedCode, companyType, establishDate,
        registeredCapital, industry, productCategory, companyIntro,
        contactName, contactTitle, contactPhone, contactEmail, contactWechat,
        overseasStage, hasBranch, branchDetails, hasRevenue, overseasRevenue,
        revenueRatio, overseasExperience, targetMarkets, priorityMarkets,
        marketTimeline, marketFactors, businessModel, productDetail,
        avgPrice, supplyCapacity, hasCert, certDetail, supplyChain,
        services, serviceDetail, existingPartners, budget, budgetFocus,
        startDate, endDate, urgency, annualRevenue, profitRate,
        availableFunds, financeNeed, financialNote, competitors,
        advantages, keyFactors, challenges, pastProblems, riskTolerance,
        docs, additionalNote, ipAddress, country
      ).run();

      console.log('[ClientIntake] Saved to D1 database');
    }

    // ================================================================
    // 发送邮件通知
    // ================================================================
    const emailContent = `
【客户信息采集表提交通知】

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
一、企业基本信息
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
企业全称: ${companyName || '-'}
企业全称（英文）: ${companyNameEn || '-'}
统一社会信用代码: ${unifiedCode || '-'}
企业性质: ${companyType || '-'}
成立时间: ${establishDate || '-'}
注册资本: ${registeredCapital || '-'}
所属行业: ${industry || '-'}
具体产品品类: ${productCategory || '-'}
企业简介: ${companyIntro || '-'}
主要联系人: ${contactName || '-'}
职务/Title: ${contactTitle || '-'}
手机号码: ${contactPhone || '-'}
电子邮箱: ${contactEmail || '-'}
微信/WhatsApp: ${contactWechat || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
二、出海现状与经验
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
当前出海阶段: ${overseasStage || '-'}
是否有海外子公司: ${hasBranch || '-'}
海外机构详情: ${branchDetails || '-'}
是否有海外销售/营收: ${hasRevenue || '-'}
年海外营收规模: ${overseasRevenue || '-'}
占整体营收比例: ${revenueRatio || '-'}
过往出海经验: ${overseasExperience || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
三、目标市场选择
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
目标市场: ${targetMarkets || '-'}
首选目标市场: ${priorityMarkets || '-'}
市场进入时间规划: ${marketTimeline || '-'}
选择考量因素: ${marketFactors || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
四、商业模式与产品
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
商业模式: ${businessModel || '-'}
核心产品/服务: ${productDetail || '-'}
平均客单价: ${avgPrice || '-'}
年供货/服务能力: ${supplyCapacity || '-'}
产品认证需求: ${hasCert || '-'}
认证详情: ${certDetail || '-'}
自有供应链: ${supplyChain || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
五、服务需求意向
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
需要的服务类型: ${services || '-'}
服务需求详细: ${serviceDetail || '-'}
已有合作方: ${existingPartners || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
六、预算与时间预期
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
整体项目预算: ${budget || '-'}
预算分配倾向: ${budgetFocus || '-'}
期望启动时间: ${startDate || '-'}
期望完成时间: ${endDate || '-'}
时间紧迫程度: ${urgency || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
七、企业财务状况
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
企业年营收: ${annualRevenue || '-'}
近一年净利润率: ${profitRate || '-'}
可动用资金规模: ${availableFunds || '-'}
是否有融资需求: ${financeNeed || '-'}
财务补充说明: ${financialNote || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
八、竞争与差异化
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
核心竞争优势: ${advantages || '-'}
出海成功的关键因素: ${keyFactors || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
九、潜在风险与挑战
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
主要挑战: ${challenges || '-'}
过往问题: ${pastProblems || '-'}
风险容忍度: ${riskTolerance || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
十、补充资料
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
已准备资料: ${docs || '-'}
其他补充说明: ${additionalNote || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
提交信息
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IP地址: ${ipAddress}
国家/地区: ${country}
提交时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
`;

    // 使用 FormSubmit 发送邮件（无需 API key）
    // recipient 在 URL 中指定，formData 只包含表单字段
    const formData = new FormData();
    formData.append('subject', `【客户信息采集】${companyName || '新客户'} - ${contactName || ''} - ${new Date().toLocaleDateString('zh-CN')}`);
    formData.append('message', emailContent);

    // 发送到 customer@zxqconsulting.com
    try {
      const response = await fetch('https://formsubmit.co/ajax/customer@zxqconsulting.com', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const result = await response.json();
      console.log('[ClientIntake] Email sent:', result);
    } catch (e) {
      console.error('[ClientIntake] Email to customer@zxqconsulting.com failed:', e);
    }

    return new Response(JSON.stringify({
      success: true,
      message: '提交成功！我们将尽快审核并与您联系。',
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('[ClientIntake] Form submission error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message || '提交失败，请稍后重试',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// 处理 OPTIONS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
