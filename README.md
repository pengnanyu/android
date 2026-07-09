# bms-android — Android WebView 容器

> 最后更新：2026-07-09

## 概述

bms-android 是 AIBMS 的 Android 原生容器，通过 WebView 加载 bms-ui 子应用（`https://ui.bms.pub`），并使用蓝牙 BLE 与 BMS 设备通讯。

容器职责（仅限以下功能）：
1. **BLE 扫描与连接** — 扫描前缀 `DCSF` 的 BLE 设备，解析广播数据（SOC/电压/电流/安全位）
2. **蓝牙设备列表 UI** — 原生 Compose 页面展示扫描到的设备
3. **数据透传** — BLE 收发的原始字节流透传给 UI
4. **基础信息同步** — 主题状态、语言状态、连接状态同步给 UI

容器**不做**：帧提取、CRC 校验、协议解析、参数读写等任何业务逻辑。

## 技术栈

- Kotlin + Jetpack Compose
- WebView + JavascriptInterface (`__NativeBridge__`)
- BluetoothLeGatt（BLE 通讯）
- Gradle 构建

## 目录结构

```
app/src/main/
├── java/com/dcsf/bms/
│   ├── MainActivity.kt          # 主 Activity（BLE 管理 + WebView + 设备列表 UI）
│   ├── BleConnection.kt         # BLE GATT 连接管理
│   ├── BleScanService.kt         # BLE 扫描前台服务
│   └── LogCollector.kt          # 日志收集
├── res/                         # Android 资源
│   ├── values/                  # 中文 strings
│   └── values-en/               # 英文 strings
└── AndroidManifest.xml
```

## BLE 透传机制

### 连接流程
1. 用户点击扫描 → BLE 扫描（名称前缀 `DCSF`）
2. 解析广播数据（制造商数据 0xFF0A → SOC/电压/电流/安全位）
3. 点击设备 → 连接 GATT → 发现 Service（0xFF00）→ 使能 Notify（0xFF01）
4. 连接成功 → WebView 推送 `bms:connection-status(connected)`

### 数据流向
```
BMS设备 → BLE Notify → BleConnection.idleBuffer
  → onDataReceived → pushToUi("bms:raw-data", {data: hex})
  → bms-ui FrameBuffer 帧提取

bms-ui → __NativeBridge__.postMessage({type:"bms:frame-send"})
  → BleConnection.write(0xFF02) → BMS设备
```

### Bridge 通信
- 容器 → UI：`pushToUi()` 调用 `window.__APP_BRIDGE__._handler()`
- UI → 容器：`window.__NativeBridge__.postMessage()` 由 `@JavascriptInterface` 接收

详见 [容器-UI 交互 API 文档](../Docs/CONTAINER_UI_API.md)

## 构建

```bash
./gradlew assembleDebug    # Debug APK
./gradlew assembleRelease  # Release APK
```

## Android 资源
- 应用图标：`mipmap-*/ic_launcher`
- 中文资源：`values/strings.xml`
- 英文资源：`values-en/strings.xml`
