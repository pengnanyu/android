# bms-android — Android WebView 容器

> 最后更新：2026-07-05

## 概述

bms-android 是 AIBMS 的 Android 原生容器，通过 WebView 加载 bms-ui 子应用，并使用蓝牙 BLE 与 BMS 设备通讯。容器是纯透传管道，只负责 BLE 连接管理和字节流收发。

## 技术栈

- Kotlin + Android SDK
- WebView + JavascriptInterface
- BluetoothLeGatt（BLE 通讯）
- Gradle 构建

## 目录结构

```
app/src/main/
├── java/com/dcsf/bms/
│   ├── MainActivity.kt          # 主 Activity（WebView + BLE 管理）
│   └── BleConnection.kt         # BLE 连接管理
├── res/                         # Android 资源
│   ├── values/                  # 中文 strings
│   └── values-en/               # 英文 strings
└── AndroidManifest.xml
```

## UI 代码同步

`android/src/` 目录包含与 `ui/src/` 相同的 UI 源码。修改 UI 代码后需要同步到 android 项目。

同步方式：
```powershell
# 单文件同步
Copy-Item "e:\APP\ui\src\<path>" "e:\APP\android\src\<path>" -Force
```

## BLE 透传机制

### 连接流程
1. 用户点击连接 → 扫描 BLE 设备（名称前缀 `DCSF+`）
2. 连接 GATT → 发现 Service（0xFF00）→ 使能 Notify（0xFF01）
3. 连接成功 → WebView 推送 `bms:connection-status(connected)`

### 数据流向
```
BMS设备 → BLE Notify → MainActivity.onCharacteristicChanged
  → WebView.evaluateJavascript("window.bmsBridge.onRawData([...])")
  → bms-ui FrameBuffer 帧提取

bms-ui → bms:frame-send → MainActivity.handleFrameSend
  → BLE Write(0xFF02) → BMS设备
```

### 关键修复记录
- **Hex 格式支持**：`bms:frame-send` 同时支持 `number[]` 和 Hex 字符串
- **有符号字节转换**：Kotlin Byte 是有符号的，需 `it.toInt() and 0xFF` 转无符号再传给 JS
- **UA 检测增强**：WebView UA 不含 "Android"，通过自定义 UA 标记检测平台
- **Bridge 注入重试**：UI 启动时 Bridge 可能尚未注入，增加 10 次重试机制

## 构建

```bash
./gradlew assembleDebug    # Debug APK
./gradlew assembleRelease  # Release APK
```

## Android 资源
- 应用图标：`mipmap-*/ic_launcher`
- 中文资源：`values/strings.xml`
- 英文资源：`values-en/strings.xml`
