# Password Generator Recipes

Practical command-line recipes for common password generation use cases. Each recipe includes exact command, expected output format, and security considerations.

## Table of Contents

- [Web Application Passwords](#web-application-passwords)
- [Database & System Passwords](#database--system-passwords)
- [Network & Infrastructure](#network--infrastructure)
- [API Keys & Tokens](#api-keys--tokens)
- [Development & Testing](#development--testing)
- [Enterprise & Compliance](#enterprise--compliance)
- [Personal Use](#personal-use)
- [Quantum-Resistant Passwords](#quantum-resistant-passwords)
- [Quick Presets](#quick-presets)

---

## Web Application Passwords

### Standard Web Account Password
**Use Case:** Online banking, email accounts, social media
**Security Level:** High entropy with readable separators

```bash
npx @aspect/jspassgen -t strong -l 12 -i 3 -s '-' -c
```
**Output:** `aB3dEf+/gH1i-Kl2MnOpQr3s-tU4vWxYz5A6`
**Entropy:** ~237 bits | **Strength:** Very Strong

### Standard Web Password (No Clipboard)
**Use Case:** Restricted clipboard access or shared terminals

```bash
npx @aspect/jspassgen -t strong -l 12 -i 3 -s '-'
```
**Output:** `aB3dEf+/gH1i-Kl2MnOpQr3s-tU4vWxYz5A6`

### Maximum Security Web Account
**Use Case:** High-value accounts (financial, business critical)

```bash
npx @aspect/jspassgen -t strong -l 16 -i 4 -s '' -c
```
**Output:** `aB3dEf+/gH1iKl2MnOpQr3stU4vWxYz5A6bC7dEf+/gH1i`
**Entropy:** ~380 bits | **Strength:** Maximum

---

## Database & System Passwords

### Database Connection Password
**Use Case:** MySQL, PostgreSQL, Oracle database users

```bash
npx @aspect/jspassgen -t strong -l 14 -i 3 -s '_'
```
**Output:** `aB3dEf+/gH1iKl_2MnOpQr3stU4v_WxYz5A6bC7dEf`

### System Administrator Password
**Use Case:** Root accounts, service accounts, system automation

```bash
npx @aspect/jspassgen -t strong -l 18 -i 2 -s '' -a
```
**Output:** `aB3dEf+/gH1iKl2MnOpQr3stU4vWxYz5A6bC7dEf+/gH1iKl2M`
**Note:** `-a` flag displays security audit with entropy calculation

### Docker Container Secret
**Use Case:** Container environment variables, secrets management

```bash
npx @aspect/jspassgen -t base64 -l 24 -i 2 -s '.'
```
**Output:** `YWJjZGVmZ2hpamtsbW5vcA==.cXJzdHV2d3h5ejEyMzQ1Ng==`

---

## Network & Infrastructure

### WiFi WPA2/WPA3 Key
**Use Case:** Enterprise wireless networks, guest networks

```bash
npx @aspect/jspassgen -t strong -l 16 -i 4 -s '-'
```
**Output:** `aB3dEf+/gH1iKl2M-nOpQr3stU4vWxYz-5A6bC7dEf+/gH1i-Kl2MnOpQr3stU4v`

### Network Equipment Password
**Use Case:** Router admin, switch management, firewall console

```bash
npx @aspect/jspassgen -t strong -l 14 -i 2 -s '@'
```
**Output:** `aB3dEf+/gH1iKl@2MnOpQr3stU4vWx`

### VPN Pre-Shared Key
**Use Case:** Site-to-site VPN, IPSec tunnels

```bash
npx @aspect/jspassgen -t strong -l 20 -i 3 -s ''
```
**Output:** `aB3dEf+/gH1iKl2MnOpQ2MnOpQr3stU4vWxYz5A6bC7dEf+/gH1iKl2MnOpQr3stU4v`

---

## API Keys & Tokens

### OAuth Bearer Token
**Use Case:** API authentication, service-to-service communication

```bash
npx @aspect/jspassgen -t base64 -l 32 -i 1 -s ''
```
**Output:** `YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkwYWJjZGVm`

### Multi-Part API Key
**Use Case:** Structured API keys with sections

```bash
npx @aspect/jspassgen -t base64 -l 16 -i 3 -s '.'
```
**Output:** `YWJjZGVmZ2hpamts.bW5vcHFyc3R1dnd4.eXoxMjM0NTY3ODkw`

### GitHub Personal Access Token
**Use Case:** Git automation, CI/CD pipelines

```bash
npx @aspect/jspassgen -t base64 -l 28 -i 1 -s ''
```
**Output:** `Z2hwX1lXSmpaR1ZtWjJocWFXdHNiVzV2Y0hGeSw==`

### API Secret Key
**Use Case:** Application secrets, webhook signatures

```bash
npx @aspect/jspassgen -t strong -l 24 -i 2 -s '_'
```
**Output:** `aB3dEf+/gH1iKl2MnOpQr3st_U4vWxYz5A6bC7dEf+/gH1iK`

---

## Development & Testing

### Test Database Password
**Use Case:** Development environments, staging databases

```bash
npx @aspect/jspassgen -t memorable -i 4 -s '-'
```
**Output:** `Apple-Bridge-Castle-Dragon`
**Note:** Memorable type enables easier development team sharing

### Local Development Secret
**Use Case:** `.env` files, development configuration

```bash
npx @aspect/jspassgen -t strong -l 16 -i 2 -s ''
```
**Output:** `aB3dEf+/gH1iKl2MnOpQr3stU4vWxYz5A6b`

### JWT Secret
**Use Case:** JSON Web Token signing, session management

```bash
npx @aspect/jspassgen -t base64 -l 32 -i 2 -s ''
```
**Output:** `YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkwYWJjZGVmZ2hpamtsbW5vcA==`

---

## Enterprise & Compliance

### PCI-DSS Compliant Password
**Use Case:** Payment processing systems, financial applications
**Requirement:** Minimum 24 characters, high entropy

```bash
npx @aspect/jspassgen -t strong -l 12 -i 2 -s '' -a
```
**Output:** `aB3dEf+/gH1iKl2MnOpQr3stU4vWxYz5A6b`
**Compliance:** Meets PCI-DSS password requirements

### HIPAA-Compliant Password
**Use Case:** Healthcare systems, patient data access
**Requirement:** Strong security, staff-readable

```bash
npx @aspect/jspassgen -t strong -l 12 -i 3 -s '-' -a
```
**Output:** `aB3dEf+/gH1i-Kl2MnOpQr3s-tU4vWxYz5A6`
**Compliance:** Readable format for healthcare staff, high security

### SOX-Compliant Password
**Use Case:** Financial reporting systems, audit-sensitive applications

```bash
npx @aspect/jspassgen -t strong -l 16 -i 3 -s '' -a
```
**Output:** `aB3dEf+/gH1iKl2MnOpQr3stU4vWxYz5A6bC7dEf+/gH1iKl2MnOp`
**Compliance:** High entropy for financial audit requirements

### Government Security (FISMA)
**Use Case:** Federal systems, government contractors

```bash
npx @aspect/jspassgen -t quantum-resistant -l 32 -i 4 -s ''
```
**Output:** `QR$v9K#mF2@x7L&nE8!pX3@T5w$nM9&bE8!tZ7%L4@nF6#mR2$wM8&vE2#rT9$yH6!mK3@bN7$vL4&tE8#`
**Compliance:** Quantum-resistant for government security standards

---

## Personal Use

### Memorable Personal Password
**Use Case:** Personal email, social accounts you access frequently

```bash
npx @aspect/jspassgen -t memorable -i 4 -s '-' -c
```
**Output:** `Apple-Bridge-Castle-Dragon`
**Note:** Easy recall, suitable for frequently typed passwords

### High-Security Personal Password
**Use Case:** Password managers, financial accounts

```bash
npx @aspect/jspassgen -t strong -l 14 -i 3 -s '-' -c
```
**Output:** `aB3dEf+/gH1iKl-2MnOpQr3stU4v-WxYz5A6bC7dEf`

### Family Shared Password
**Use Case:** Streaming services, family accounts

```bash
npx @aspect/jspassgen -t memorable -i 3 -s '.'
```
**Output:** `Apple.Bridge.Castle`

---

## Quantum-Resistant Passwords

### Standard Quantum-Resistant
**Use Case:** Future-proofing against quantum computing threats

```bash
npx @aspect/jspassgen -t quantum-resistant
```
**Output:** `QR$v9K#mF2@x7L&nE8!pX3@T5w$nM9&bE8!tZ7%L4@nF6#mR2$w`
**Entropy:** 256+ bits | **Post-Quantum:** Yes

### High-Security Quantum-Resistant
**Use Case:** Long-term secret storage, critical infrastructure

```bash
npx @aspect/jspassgen -t quantum-resistant -l 48 -i 6 -s ''
```
**Output:** 288-bit entropy password suitable for maximum post-quantum security

### Enterprise Quantum-Resistant with Custom KDF
**Use Case:** Enterprise systems requiring post-quantum security

```bash
npx @aspect/jspassgen -t quantum-resistant -l 32 -i 4 --kdf-memory 131072 --kdf-time 5 --kdf-parallelism 8
```
**Output:** Quantum-resistant password with enhanced KDF parameters
**KDF:** Argon2id (128MB memory, 5 iterations, 8 threads)

---

## Quick Presets

### Quick Preset (Ready-to-Use)
**Use Case:** General purpose, good balance of security and usability

```bash
npx @aspect/jspassgen --preset quick
```
**Output:** `aB3dEf+/gH1iKl-2MnOpQr3stU4v-WxYz5A6bC7dEf-Kl2MnOpQr3stU`
**Config:** strong type, 14 length, 4 iterations, '-' separator

### Secure Preset (Maximum Security)
**Use Case:** High-security accounts requiring maximum entropy

```bash
npx @aspect/jspassgen --preset secure
```
**Output:** `aB3dEf+/gH1iKl2MnOpQr3stU4vWxYz5A6bC7dEf+/gH1iKl2MnOp`
**Config:** strong type, 16 length, 4 iterations, no separator

### Memorable Preset (Easy to Remember)
**Use Case:** Passwords you need to remember and type frequently

```bash
npx @aspect/jspassgen --preset memorable
```
**Output:** `Apple-Bridge-Castle-Dragon`
**Config:** memorable type, 4 words, '-' separator

### Quantum Preset (Future-Proof)
**Use Case:** Long-term security, quantum-computing resistant

```bash
npx @aspect/jspassgen --preset quantum
```
**Output:** `QR$v9K#mF2@x7L&nE8!pX3@T5w$nM9&bE8!tZ7%L4@nF6#mR2$w`
**Config:** quantum-resistant type, 43 length, 1 iteration

---

## Security Considerations

### Entropy Levels

| Use Case | Minimum Entropy | Recommended Command |
|----------|-----------------|---------------------|
| **Personal accounts** | 128 bits | `-t strong -l 12 -i 3` |
| **Enterprise systems** | 196 bits | `-t strong -l 16 -i 3` |
| **High-security applications** | 256 bits | `-t strong -l 16 -i 4` |
| **Quantum-resistant** | 256+ bits | `-t quantum-resistant` |

### Password Storage

**Critical:** Store passwords securely:

- **Recommended KDF:** Argon2id with NIST SP 800-132 parameters
- **Minimum memory:** 64MB (65536 KB)
- **Minimum iterations:** 3
- **Salt:** Always use random salts (128+ bits)

### Compliance Mapping

| Compliance Standard | Minimum Requirements | Recipe Command |
|--------------------|--------------------|----------------|
| **PCI-DSS** | 24+ chars, complex | `-t strong -l 12 -i 2 -s ''` |
| **HIPAA** | Strong + readable | `-t strong -l 12 -i 3 -s '-'` |
| **SOX** | High entropy | `-t strong -l 16 -i 3 -s ''` |
| **FISMA** | Quantum-resistant | `-t quantum-resistant` |

---

## Command Reference

### Essential Flags

| Flag | Description | Example |
|------|-------------|---------|
| `-t, --type` | Password type (strong, base64, memorable, quantum-resistant) | `-t strong` |
| `-l, --length` | Length of each chunk | `-l 16` |
| `-i, --iteration` | Number of chunks/words | `-i 3` |
| `-s, --separator` | Separator between chunks | `-s '-'` |
| `-c, --clipboard` | Copy to clipboard | `-c` |
| `-a, --audit` | Show security audit | `-a` |
| `--preset` | Use preset configuration | `--preset secure` |

### Advanced Flags (Quantum-Resistant)

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--kdf-memory` | Argon2id memory (KB) | 65536 | `--kdf-memory 131072` |
| `--kdf-time` | Argon2id iterations | 3 | `--kdf-time 5` |
| `--kdf-parallelism` | Argon2id threads | 4 | `--kdf-parallelism 8` |

---

**Designed by Sebastien Rousseau — Engineered with Euxis**