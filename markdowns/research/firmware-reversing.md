---
title: "Firmware Reversing for Pentesters"
date: 2026-04-10
author: "BlackVectr Research Team"
tags: iot, firmware, reverse-engineering
excerpt: "A practical guide to extracting, analyzing, and exploiting vulnerabilities in embedded device firmware."
---

Embedded devices are everywhere — from smart thermostats to industrial controllers. Yet their security posture often lags far behind traditional software. This guide covers the practical aspects of firmware reversing for penetration testers.

## Firmware Extraction

Before analysis can begin, the firmware must be obtained. Common extraction methods:

### Direct Extraction

- **JTAG/SWD** — Debug interface access for direct flash reading
- **UART boot logs** — Bootloader output that reveals memory layouts
- **SPI flash dumping** — Using a flash programmer to read the storage chip
- **eMMC/SD card** — Direct block-level reads of storage media

### Indirect Extraction

- **Vendor update servers** — Unauthenticated firmware download endpoints
- **Mobile companion apps** — Firmware bundles embedded in APK/IPA files
- **Over-the-air capture** — Intercepting and decrypting OTA update traffic

## Static Analysis

Once extracted, the firmware image requires analysis:

### Identification

```bash
# Identify the file type
file firmware.bin
binwalk firmware.bin

# Extract filesystems
binwalk -Me firmware.bin
```

> [!NOTE]
> Always work on a copy of the firmware image. Extraction tools like `binwalk -Me` will happily overwrite and recurse into your working directory.

Common filesystems encountered: SquashFS, JFFS2, YAFFS2, CramFS

### Configuration Extraction

Configuration files often reveal hardcoded credentials:

```bash
# Search for credentials
strings firmware.bin | grep -i "password\|secret\|key\|token"
grep -ra "admin" _extracted/
```

### Binary Analysis

For custom binaries within the firmware:

- **Ghidra** — Full decompilation and analysis
- **radare2** — Lightweight command-line reversing
- **Firmadyne** — Full system emulation for dynamic analysis

## Dynamic Analysis

Static analysis only reveals so much. Emulation or physical testing is essential:

### Emulation

```bash
# Emulate a firmware filesystem with QEMU
qemu-system-arm -M versatilepb -kernel vmlinuz \
  -drive file=rootfs.ext2,format=raw \
  -append "root=/dev/sda console=ttyAMA0"
```

### Hardware Debugging

- UART shell access (often unprotected in production firmware)
- Debug console commands that expose sensitive functionality
- Manufacturer test modes enabled in release builds

## Common Vulnerabilities

Through firmware analysis, we consistently find:

1. **Hardcoded credentials** — Backdoor accounts in production firmware
2. **Unencrypted storage** — Sensitive data in plain text on flash
3. **Unverified updates** — No signature verification on firmware updates
4. **Debug interfaces** — JTAG/UART enabled in production
5. **Command injection** — Web interfaces passing unsanitized input to shell

## Real-World Example

During an engagement with a smart building controller, we extracted the firmware via UART boot logs. Analysis revealed:

- A hidden administrative API listening on port 8443
- Default credentials: `admin:admin` (hardcoded in the binary)
- The firmware update mechanism didn't verify signatures
- All device-to-cloud traffic used a static API key

These findings transformed a seemingly low-risk IoT device into a critical entry point for the entire building network.

> [!WARNING]
> Hardcoded credentials and static API keys are not "low severity" in embedded contexts — a single extracted key often unlocks an entire fleet of deployed devices. Treat firmware secrets as production credentials.

## Conclusion

Firmware reversing is an essential skill for modern pentesters. The ubiquity of embedded devices, combined with their often-poor security practices, makes them a rich source of vulnerabilities. With the right tools and methodology, what appears to be a black box can be thoroughly understood and tested.
