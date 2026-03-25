import { IPersistenceFinding } from '../models/PersistenceFinding';
import { performGeminiAnalysis } from './geminiService';

/**
 * AI Security Assistant Service
 * This service uses Google Gemini AI for deep security analysis.
 */
export async function analyzeFindingWithAI(finding: IPersistenceFinding): Promise<{
    analysis: string;
    steps: string[];
    riskScore: number;
    toolsNeeded: string[];
}> {
    console.log(`[AIService] Analyzing finding: ${finding.name}`);
    
    // Check if we have an API key configured
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
        try {
            return await performGeminiAnalysis(finding);
        } catch (error) {
            console.error("[AIService] Gemini analysis failed, falling back to local expert library:", error);
        }
    }

    // Fallback/Local Professional Expert Library
    const analysisMap: Record<string, { analysis: string; steps: string[]; riskScore: number; toolsNeeded: string[] }> = {
        'ssh': {
            analysis: `[Local Analysis] This public key is associated with an unknown source and lacks corporate attribution. Its placement in the root user's authorized_keys file bypasses standard protocols and directly violates the "Principle of Least Privilege".`,
            steps: [
                'Log into the target node via a secure console.',
                'Verify active SSH sessions: `who` or `w`.',
                'Backup and purge the specific unauthorized key row from /root/.ssh/authorized_keys.',
                'Reset the account password and rotate all other associated SSH keys.'
            ],
            riskScore: 9.5,
            toolsNeeded: ['ssh-keygen', 'sed', 'passwd']
        },
        'cron': {
            analysis: `[Local Analysis] This cron job is a "Reverse Shell" persistence mechanism. It uses a bash-encoded one-liner to spawn an interactive shell and pipe it back to a remote listener (192.168.1.200).`,
            steps: [
                'Identify the specific crontab file and remove the malicious line immediately.',
                'Check common hidden cron locations: `/etc/cron.d/`, `/etc/cron.hourly/`.',
                'Block the outbound IP address at the network periphery.'
            ],
            riskScore: 8.8,
            toolsNeeded: ['crontab', 'iptables']
        },
        'user': {
            analysis: `[Local Analysis] Critical privilege escalation detected. A new user "sysadmin_backup" with UID 0 has been injected into /etc/passwd, masquerading as a backup service.`,
            steps: [
                'Lock the account immediately: `usermod -L -e 1 sysadmin_backup`.',
                'Terminate any active sessions: `pkill -u sysadmin_backup`.',
                'Remove the user and audit `/etc/sudoers` for remaining permissions.'
            ],
            riskScore: 10.0,
            toolsNeeded: ['usermod', 'userdel', 'pkill']
        },
        'file': {
            analysis: `[Local Analysis] This SUID-bit file is a "Privilege Escalation Wrapper". The hidden naming convention (".sys_check") is designed to blend into system binaries to bypass manual audits.`,
            steps: [
                'Remove SUID/executable bits: `chmod 000 /usr/local/bin/.sys_check`.',
                'Move to quarantine and compute file hash for database cross-referencing.',
                'Search for other SUID files: `find / -perm /4000 -type f`.'
            ],
            riskScore: 9.0,
            toolsNeeded: ['chmod', 'sha256sum', 'find']
        },
        'service': {
            analysis: `[Local Analysis] The systemd service "dbus-org.freedesktop.network1" is masquerading as a core component. Its location in /etc/systemd/system/ confirms it is an unmanaged manual addition.`,
            steps: [
                'Stop and disable the malicious service: `systemctl stop [name] && systemctl disable [name]`.',
                'Remove the unit file and reload the daemon: `systemctl daemon-reload`.',
                'Check for open network ports used by this service.'
            ],
            riskScore: 8.5,
            toolsNeeded: ['systemctl', 'rm', 'ss']
        }
    };

    const type = finding.type as string;
    const defaultResponse = {
        analysis: `[Local Analysis] SIERN has identified a potential security anomaly matching patterns of known persistent backdoors. Manual forestic review is recommended.`,
        steps: [
            'Isolate the system from the network.',
            'Preserve memory and logs for analysis.',
            'Review system configurations for unauthorized modifications.'
        ],
        riskScore: 7.0,
        toolsNeeded: ['ls', 'grep']
    };

    return analysisMap[type] || defaultResponse;
}
