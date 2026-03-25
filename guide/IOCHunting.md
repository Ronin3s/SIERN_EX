# IOC Hunting Engine Guide | دليل محرك البحث عن مؤشرات الاختراق

This document explains the **Indicators of Compromise (IOC)** Hunting feature and provides a real-world demo scenario.
يشرح هذا المستند ميزة البحث عن **مؤشرات الاختراق (IOC)** ويوفر سيناريو تجريبي واقعي.

---

## 🔍 What is an IOC Hunting Engine? | ما هو محرك البحث عن مؤشرات الاختراق؟

An **Indicator of Compromise (IOC)** is a piece of digital evidence that suggests a system has been breached. Think of it as a "Digital Fingerprint" left by a hacker.

**مؤشر الاختراق (IOC)** هو دليل رقمي يشير إلى احتمال اختراق النظام. يمكن اعتباره "بصمة رقمية" يتركها المخترق خلفه.

### Supported IOC Types | أنواع المؤشرات المدعومة:
- **File Hashes** (MD5, SHA1, SHA256): Identifying specific malicious programs.
- **IP Addresses**: Detect connections to known Command & Control (C2) servers.
- **Domains/URLs**: Block malicious phishing or malware delivery sites.

- **بصمات الملفات (Hashes)**: التعرف على برامج خبيثة محددة.
- **عناوين IP**: اكتشاف الاتصالات بخوادم التحكم والاختراق (C2).
- **النطاقات والروابط (Domains/URLs)**: حظر مواقع التصيد أو توزيع البرامج الضارة.

---

## 🚀 How to Run a Demo | كيفية إجراء عرض تجريبي

Follow this scenario to demonstrate proactive threat hunting.
اتبع هذا السيناريو لعرض عملية "البحث الاستباقي" عن التهديدات.

### Scenario: "The Known Malware" Hunt
**السيناريو: البحث عن برنامج خبيث معروف**

We will simulate finding a malicious tool by its unique cryptographic hash.
سنقوم بمحاكاة العثور على أداة خبيثة من خلال بصمتها الرقمية الفريدة.

#### Step 1: Create a "Malicious" File (Terminal)
Run these commands to create a file and find its hash:
```bash
echo "malicious payload" > /tmp/malware.exe
sha256sum /tmp/malware.exe
```
*Take note of the long SHA256 string (e.g., `5e4c...`).*

#### الخطوة 1: إنشاء ملف "خبيث" (من خلال الطرفية)
قم بتشغيل هذه الأوامر لإنشاء ملف واستخراج بصمته:
```bash
echo "malicious payload" > /tmp/malware.exe
sha256sum /tmp/malware.exe
```
*قم بنسخ سلسلة SHA256 الطويلة (مثلاً: `5e4c...`).*

#### Step 2: Start the Hunt (Dashboard)
1. Open the **IOC Hunting** page.
2. In the **Indicators** list, paste the SHA256 hash you copied.
3. Set **Search Path** to: `/tmp`.
4. Click **"Start Hunting"**.

#### الخطوة 2: بدء عملية البحث (من لوحة التحكم)
1. افتح صفحة **IOC Hunting**.
2. في قائمة **المؤشرات (Indicators)**، الصق بصمة SHA256 التي نسختها.
3. اضبط **مسار البحث (Search Path)** على: `/tmp`.
4. انقر على **"Start Hunting"**.

#### Step 3: Result & Alert
- The engine will scan `/tmp`, hash every file, and find the match.
- A **CRITICAL IOC Match Alert** will trigger on the main dashboard.
- You can now see the "Malicious File Location" (File: `/tmp/malware.exe`).

#### الخطوة 3: النتيجة والتنبيه
- سيقوم المحرك بفحص مجلد `/tmp` واستخراج بصمة كل ملف حتى يجد المطابقة.
- سيتم تفعيل **تنبيه خطير جداً (CRITICAL)** في لوحة التحكم الرئيسية.
- يمكنك الآن رؤية "موقع الملف الخبيث" (الملف: `/tmp/malware.exe`).

---

## 🛠️ Remediation | المعالجة والإصلاح

When an IOC is found, you should:
1. **Isolate**: Disconnect the host or quarantine the file.
2. **Investigate**: Use the **Process Monitor** to see if the file is running.
3. **Eradicate**: Delete the malicious file and block the associated IOCs (IP/Domain) at the firewall level.

عند العثور على مؤشر اختراق، يجب عليك:
1. **العزل**: فصل الجهاز المصاب أو وضع الملف في الحجر الصحي.
2. **التحقيق**: استخدم **Process Monitor** لمعرفة ما إذا كان الملف قيد التشغيل.
3. **الاستئصال**: حذف الملف الخبيث وحظر المؤشرات المرتبطة به (IP/Domain) على مستوى جدار الحماية.
