# Behavioral Anomaly Detection Guide | دليل اكتشاف السلوك المشبوه

This document explains the **Behavioral Anomaly Detection** feature and provides a real-world demo scenario.
يشرح هذا المستند ميزة **اكتشاف السلوك المشبوه** ويوفر سيناريو تجريبي واقعي.

---

## 🧠 What is Behavioral Anomaly Detection? | ما هو اكتشاف السلوك المشبوه؟

While other tools look for *files* or *hashes*, **Behavioral Anomaly Detection** looks at what programs are **DOING** while they run. It identifies suspicious patterns of activity that suggest a hack is in progress, even if the malware is brand new.

بينما تبحث الأدوات الأخرى عن *الملفات* أو *البصمات*، ينظر **اكتشاف السلوك المشبوه** إلى ما **تفعله** البرامج أثناء تشغيلها. فإنه يحدد أنماط النشاط المريبة التي تشير إلى وجود اختراق قيد التنفيذ، حتى لو كان البرنامج الخبيث جديداً تماماً.

### Core Detection Rules | قواعد الاكتشاف الرئيسية:
1. **Encoded Command Execution**: Detecting hackers hiding their commands using Base64 encoding.
2. **Child Processes in Temp Dirs**: Detecting malware that runs from temporary folders like `/tmp`.
3. **Process Injection**: Identifying processes that try to "impersonate" critical system services.

1. **تنفيذ الأوامر المشفرة**: اكتشاف المخترقين الذين يخفون أوامرهم باستخدام ترميز Base64.
2. **العمليات الفرعية في المجلدات المؤقتة**: اكتشاف البرامج الضارة التي تعمل من مجلدات مؤقتة مثل `/tmp`.
3. **حقن العمليات (Process Injection)**: تحديد العمليات التي تحاول "انتحال شخصية" خدمات النظام الحيوية.

---

## 🚀 How to Run a Demo | كيفية إجراء عرض تجريبي

Follow this scenario to show how the SOC catches a hacker trying to hide their tracks.
اتبع هذا السيناريو لتوضيح كيف يقوم SOC بضبط مخترق يحاول إخفاء آثاره.

### Scenario: "The Encoded Backdoor"
**السيناريو: الباب الخلفي المشفر**

We will simulate a hacker running a Base64 encoded command to bypass simple security filters.
سنقوم بمحاكاة مخترق يقوم بتشغيل أمر مشفر بـ Base64 لتجاوز مرشحات الأمان البسيطة.

#### Step 1: Execute the Attack (Terminal)
Run this command to simulate a script executing a hidden payload:
```bash
sh -c "echo Y2F0IC9ldGMvc2hhZG93Cg== | base64 -d"
```

#### الخطوة 1: تنفيذ الهجوم (من خلال الطرفية)
قم بتشغيل هذا الأمر لمحاكاة نص برمج ي ينفذ حمولة مخفية:
```bash
sh -c "echo Y2F0IC9ldGMvc2hhZG93Cg== | base64 -d"
```

#### Step 2: Detection (Dashboard)
1. Open the **Behavioral Detection** page.
2. Click **"Run Detection Scan"**.
3. **Observation**: The engine will flag the process for **"Encoded Command Execution (BR-001)"**.
4. A **CRITICAL** alert will appear on the main dashboard and in the "Threat Severity" chart.

#### الخطوة 2: الاكتشاف (من لوحة التحكم)
1. افتح صفحة **Behavioral Detection**.
2. انقر على **"Run Detection Scan"**.
3. **الملاحظة**: سيقوم المحرك بتمييز العملية على أنها **"Encoded Command Execution (BR-001)"**.
4. سيظهر تنبيه **خطير جداً (CRITICAL)** في لوحة التحكم الرئيسية وفي مخطط "خطورة التهديد".

---

## 🛠️ Remediation | المعالجة والإصلاح

When a behavioral anomaly is detected:
1. **Kill Process**: Immediately terminate the suspicious PID via the **Process Monitor**.
2. **Block Source**: Identify if the process was triggered by a specific user or network connection and block it.
3. **Analyze**: Use the **SOC Assistant** to analyze the command-line arguments to understand what the hacker was trying to do.

عند اكتشاف سلوك مشبوه:
1. **إنهاء العملية**: قم بإنهاء معرف العملية (PID) المشبوه فوراً من خلال **Process Monitor**.
2. **حظر المصدر**: حدد ما إذا كان قد تم تفعيل العملية بواسطة مستخدم معين أو اتصال شبكة وقم بحظره.
3. **التحليل**: استخدم **مساعد SOC** لتحليل وسيطات سطر الأوامر لفهم ما كان يحاول المخترق فعله.
