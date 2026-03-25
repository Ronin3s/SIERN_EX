# Response Center Guide | دليل مركز الاستجابة والتحكم

This document explains the **Response Center** feature and provides a real-world demo scenario.
يشرح هذا المستند ميزة **مركز الاستجابة** ويوفر سيناريو تجريبي واقعي.

---

## 🛡️ What is the Response Center? | ما هو مركز الاستجابة؟

The **Response Center** is the "Control Room" of the SOC. Once a threat is detected by the other engines (Integrity, IOC, or Behavioral), the analyst uses the Response Center to **contain** the threat and maintain a permanent **Audit Trail**.

**مركز الاستجابة** هو "غرفة التحكم" في SOC. بمجرد اكتشاف تهديد بواسطة المحركات الأخرى (السلامة، أو المؤشرات، أو السلوك)، يستخدم المحلل مركز الاستجابة **لاحتواء** التهديد والحفاظ على **سجل تدقيق** دائم.

### Key Capabilities | القدرات الرئيسية:
- **Containment**: Instantly "Killing" malicious processes or isolating infected hosts.
- **Audit Trail**: Recording exactly WHO took WHAT action, against WHICH target, and WHEN. This is critical for legal evidence.
- **Action Reversal**: The ability to "Undo" or resolve actions if a mistake was made.

- **الاحتواء**: "إنهاء" العمليات الخبيثة فوراً أو عزل الأجهزة المصابة.
- **سجل التدقيق**: تسجيل من قام بأي إجراء، ضد أي هدف، وفي أي وقت. هذا أمر بالغ الأهمية للأدلة القانونية.
- **عكس الإجراءات**: القدرة على "التراجع" أو حل الإجراءات في حال حدوث خطأ.

---

## 🚀 How to Benefit from it | كيف تستفيد منه (سيناريو العرض)

Follow this scenario to show the full lifecycle of an incident.
اتبع هذا السيناريو لتوضيح دورة حياة الحادث الأمنني بالكامل.

### Scenario: "The Rapid Remediation"
**السيناريو: المعالجة السريعة**

We will detect a threat using the **Behavioral Engine** and then manage the response through the **Response Center**.
سنقوم باكتشاف تهديد باستخدام **محرك السلوك** ثم ندير الاستجابة من خلال **مركز الاستجابة**.

#### Step 1: Detect a Threat
1. Run the **Encoded Command** demo (from the Behavioral Analysis guide).
2. The SOC flags the process with a Critical Alert.

#### الخطوة 1: اكتشاف التهديد
1. قم بتشغيل عرض **الأمر المشفر** (من دليل تحليل السلوك).
2. سيقوم SOC بتمييز العملية بتنبيه خطير جداً.

#### Step 2: Manage the Response (Dashboard)
1. Navigate to the **Response Center**.
2. Go to the **Action History** tab.
3. **Observation**: You will see a permanent record of the "Kill" action taken against the malicious PID.
4. **Benefit**: Even if the hacker deletes their own logs, the SOC has a secure, unchangeable record of exactly what happened.

#### الخطوة 2: إدارة الاستجابة (من لوحة التحكم)
1. انتقل إلى **Response Center**.
2. اذهب إلى تبويب **Action History** (سجل الإجراءات).
3. **الملاحظة**: سترى سجلاً دائماً لإجراء "الإنهاء" (Kill) الذي تم ضد المعرف (PID) الخبيث.
4. **الفائدة**: حتى لو قام المخترق بحذف سجلاته الخاصة، فإن SOC لديه سجل آمن وغير قابل للتغيير لما حدث بالضبط.

---

## 🛠️ Audit Trail & Compliance | سجل التدقيق والامتثال

The Response Center helps you meet security standards like **PCI-DSS** and **ISO 27001** by proving that every security incident was handled correctly by authorized staff.

يساعدك مركز الاستجابة في تلبية المعايير الأمنية مثل **PCI-DSS** و **ISO 27001** من خلال إثبات أن كل حادث أمني تم التعامل معه بشكل صحيح من قبل طاقم مخول.
