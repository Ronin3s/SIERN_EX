# Process Monitor Guide | دليل مراقبة العمليات ونبض النظام

This document explains the **Process Monitor** feature and provides a real-world demo scenario.
يشرح هذا المستند ميزة **مراقبة العمليات** ويوفر سيناريو تجريبي واقعي.

---

## 💓 What is the Process Monitor? | ما هو مراقب العمليات؟

The **Process Monitor** is the "Heartbeat" of the SOC. It provides a real-time view of every program currently running on the system. It's not just a list; it's a **Security Analysis Tool** that calculates a **Risk Score** for every process based on its name, command line, and resource usage.

**مراقب العمليات** هو "نبض" مركز العمليات الأمنية (SOC). يوفر رؤية مباشرة لكل برنامج يعمل حالياً على النظام. إنه ليس مجرد قائمة؛ بل هو **أداة تحليل أمني** تحسب "درجة الخطورة" لكل عملية بناءً على اسمها، وسلسلة الأوامر، واستهلاك الموارد.

### Risk Scoring Engine | محرك تقييم المخاطر:
- **High-Risk Names**: Detects hacking tools like `nc` (netcat), `msfvenom`, and administrative scripts.
- **Suspicious Paths**: Flags any process running from `/tmp`, `/var/tmp`, or `Downloads`.
- **Resource Anomaly**: Detects processes consuming excessive CPU (potential cryptominer).

- **الأسماء عالية الخطورة**: اكتشاف أدوات الاختراق مثل `nc` و `msfvenom` والنصوص البرمجية الإدارية.
- **المسارات المشبوهة**: تمييز أي عملية تعمل من مجلدات مؤقتة مثل `/tmp` أو مجلد التحميلات.
- **شذوذ الموارد**: اكتشاف العمليات التي تستهلك المعالج (CPU) بشكل مفرط (احتمالية وجود معدن عملات رقمية).

---

## 🚀 How to Run a Demo | كيفية إجراء عرض تجريبي

Follow this scenario to show how the SOC can instantly "Kill" a malicious process.
اتبع هذا السيناريو لتوضيح كيف يمكن لـ SOC "إنهاء" عملية خبيثة بشكل فوري.

### Scenario: "The Fake System Service"
**السيناريو: خدمة النظام المزيفة**

We will create a process that looks like a legitimate system service but is actually running from a suspicious location.
سنقوم بإنشاء عملية تبدو كخدمة نظام شرعية ولكنها تعمل في الواقع من موقع مشبوه.

#### Step 1: Start the "Malicious" Process (Terminal)
Run these commands to create a "sleep" process with a fake name in `/tmp`:
```bash
cp /bin/sleep /tmp/svchost-fake
/tmp/svchost-fake 9999 &
```

#### الخطوة 1: تشغيل العملية "الخبيثة" (من خلال الطرفية)
قم بتشغيل هذه الأوامر لإنشاء عملية "انتظار" باسم مزيف في مجلد `/tmp`:
```bash
cp /bin/sleep /tmp/svchost-fake
/tmp/svchost-fake 9999 &
```

#### Step 2: Show the Threat (Dashboard)
1. Navigate to the **Process Monitor** page.
2. Search for `svchost-fake`.
3. **Observation**: 
    *   The process will have a **High Risk Score** because it's running from `/tmp`.
    *   The **SOC Dashboard** will show an increase in "High Risk Processes".

#### الخطوة 2: عرض التهديد (من لوحة التحكم)
1. انتقل إلى صفحة **Process Monitor**.
2. ابحث عن `svchost-fake`.
3. **الملاحظة**: 
    *   ستحصل العملية على **"درجة خطورة عالية"** لأنها تعمل من مجلد `/tmp`.
    *   ستظهر **لوحة تحكم SOC** زيادة في "العمليات عالية الخطورة".

#### Step 3: Active Response
1. In the **Process Monitor**, find your `svchost-fake` entry.
2. Click the **"Kill"** button.
3. **Result**: The process is immediately terminated, showing the SOC analyst's power to stop threats live.

#### الخطوة 3: الاستجابة النشطة
1. في صفحة **Process Monitor**، ابحث عن عملية `svchost-fake`.
2. انقر على زر **"Kill" (إنهاء)**.
3. **النتيجة**: سيتم إنهاء العملية فوراً، مما يوضح قدرة محلل SOC على إيقاف التهديدات بشكل مباشر.

---

## 🛠️ Performance Metrics | مقاييس الأداء

In addition to security, the monitor tracks:
- **CPU Load**: High load can indicate a "Fork Bomb" or Denial of Service (DoS) attack.
- **Memory Consumption**: Monitoring for "Memory Leaks" or malicious data exfiltration tools.

بالإضافة إلى الأمن، يراقب النظام:
- **حمل المعالج (CPU)**: يمكن أن يشير الحمل العالي إلى هجمات "حرمان الخدمة" (DoS).
- **استهلاك الذاكرة**: مراقبة "تسريب الذاكرة" أو أدوات استخراج البيانات الخبيثة.
