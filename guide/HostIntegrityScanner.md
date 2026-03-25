# Host Integrity Scanner Guide | دليل فاحص سلامة النظام

This document explains the Host Integrity Scanner (FIM) feature and provides a real-world demo scenario.
يشرح هذا المستند ميزة "فاحص سلامة النظام" ويوفر سيناريو تجريبي واقعي.

---

## 🛡️ What is Host Integrity Scanner? | ما هو فاحص سلامة النظام؟

The **Host Integrity Scanner** (also known as File Integrity Monitoring or FIM) is a security tool that ensures your critical system files have not been tampered with. It works by creating a "Baseline" (a cryptographic fingerprint) of your files and alerting you if they change.

**فاحص سلامة النظام** (المعروف أيضاً باسم مراقبة سلامة الملفات) هو أداة أمنية تضمن عدم العبث بملفات النظام الحيوية. يعمل عن طريق إنشاء "حالة مرجعية" (بصمة رقمية مشفرة) لملفاتك وتنبيهك في حال تغيرها.

### Why is it important? | لماذا هو مهم؟
- **Backdoor Detection**: Attackers often modify system files to maintain access.
- **Compliance**: Many security standards (PCI-DSS, HIPAA) require FIM.
- **Accidental Changes**: Detects errors made during manual system updates.

- **اكتشاف الأبواب الخلفية**: غالباً ما يقوم المهاجمون بتعديل ملفات النظام للحفاظ على وصولهم.
- **الامتثال والمعايير**: تتطلب العديد من المعايير الأمنية مراقبة سلامة الملفات.
- **التغييرات العرضية**: اكتشاف الأخطاء التي تحدث أثناء تحديثات النظام اليدوية.

---

## 🚀 How to Run a Demo | كيفية إجراء عرض تجريبي

To demonstrate this feature to your audience, follow this "Real-World Hack" scenario.
لعرض هذه الميزة للجمهور، اتبع هذا السيناريو الخاص بـ "اختراق واقعي".

### Scenario: The "Shadow Admin" Backdoor
**السيناريو: الباب الخلفي للمشرف الخفي**

An attacker has gained temporary access and is trying to create a permanent root-level user.
تمكن مهاجم من الحصول على وصول مؤقت ويحاول إنشاء مستخدم دائم بصلاحيات الجذر (Root).

#### Step 1: Establish a "Clean" Baseline
1. Open the **Integrity Scanner** page.
2. Enter Path: `/etc/passwd`.
3. Click **"Create Baseline"**.

#### الخطوة 1: إنشاء الحالة المرجعية "النظيفة"
1. افتح صفحة **Host Integrity Scanner**.
2. أدخل المسار: `/etc/passwd`.
3. انقر على **"Create Baseline"**.

#### Step 2: Simulate the Attack (Terminal)
Run this command to append a malicious root user:
```bash
echo "backdoor:x:0:0:root:/root:/bin/bash" | sudo tee -a /etc/passwd
```

#### الخطوة 2: محاكاة الهجوم (من خلال الطرفية)
قم بتشغيل هذا الأمر لإضافة مستخدم خبيث بصلاحيات الجذر:
```bash
echo "backdoor:x:0:0:root:/root:/bin/bash" | sudo tee -a /etc/passwd
```

#### Step 3: Detection & Alerting
1. Go back to the **Integrity Scanner** page.
2. Select `/etc/passwd` and click **"Run Scan"**.
3. **Observation**: A CRITICAL finding will appear. The SOC Dashboard will trigger an alert, and the "Threat Severity" chart will update to show a new "Critical" threat.

#### الخطوة 3: الاكتشاف والتنبيه
1. عد إلى صفحة **Host Integrity Scanner**.
2. اختر `/etc/passwd` وانقر على **"Run Scan"**.
3. **الملاحظة**: ستظهر نتيجة "خطيرة جداً" (CRITICAL). ستقوم لوحة تحكم SOC بتفعيل تنبيه، وسيتم تحديث مخطط "خطورة التهديد" لإظهار تهديد جديد.

---

## 🛠️ Remediation | المعالجة والإصلاح

Once detected, you should investigate why the file was modified. If it's malicious (like our `backdoor` user), remove it immediately:
عند الاكتشاف، يجب عليك التحقيق في سبب تعديل الملف. إذا كان خبيثاً (مثل مستخدم `backdoor`) فقمه بإزالته فوراً:

```bash
# Remove the last line to restore integrity
sudo sed -i '$d' /etc/passwd
```

---

> [!IMPORTANT]
> Always run the scan on system-critical files like `/etc/passwd`, `/etc/shadow`, and `/etc/sudoers` to maintain zero-trust integrity.
> احرص دائماً على تشغيل الفحص على الملفات الحيوية للنظام مثل `/etc/passwd` و `/etc/shadow` و `/etc/sudoers` للحفاظ على سلامة النظام بمبدأ "انعدام الثقة" (Zero Trust).
