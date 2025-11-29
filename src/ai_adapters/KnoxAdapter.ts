
import { GeminiCore } from '../services/gemini_core';

export class KnoxAdapter {
  private core: GeminiCore;
  private static readonly SYSTEM_PROMPT = `
    You are Knox, a Secure Data Auditor.
    Your task is to audit logs and validate transactions for security anomalies.
    You must be strictly objective and analytical.
    Maintain privacy: Do not echo back sensitive PII in your analysis unless necessary for identifying the specific threat.
  `;

  constructor(core: GeminiCore) {
    this.core = core;
  }

  /**
   * Audits a security log or transaction data.
   * STRICTLY NO RETENTION: This method does not save input or output to any local storage.
   * It relies on the ephemeral nature of the function call.
   */
  async audit_security_log(logData: any): Promise<string> {
    // Privacy guard: ensure we are not logging this data to console or disk within this application layer.
    // The GeminiCore does not log payloads by default.

    const prompt = [
      KnoxAdapter.SYSTEM_PROMPT,
      "Analyze the following security log/transaction for anomalies or validity:",
      JSON.stringify(logData)
    ];

    const result = await this.core.generateContent(prompt);
    if (!result.success) {
      throw new Error(result.message);
    }
    return result.data;
  }

  async validate_transaction(transactionData: any): Promise<string> {
      return this.audit_security_log(transactionData);
  }
}
