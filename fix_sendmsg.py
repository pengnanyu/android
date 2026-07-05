f = open(r'E:\APP\ui\src\hooks\useBridgeMessage.ts', 'r', encoding='utf-8')
content = f.read()
f.close()

old = """    if (isApp()) {
      const bridge = (window as unknown as Record<string, unknown>).__APP_BRIDGE__;
      if (bridge && typeof (bridge as Record<string, unknown>).postMessage === 'function') {
        try { ((bridge as Record<string, unknown>).postMessage as (m: BridgeMessage) => void)(message); } catch (_e) { /* ignore */ }
      }
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }"""

new = """    if (isApp()) {
      const bridge = (window as unknown as Record<string, unknown>).__APP_BRIDGE__;
      if (bridge && typeof (bridge as Record<string, unknown>).postMessage === 'function') {
        try { ((bridge as Record<string, unknown>).postMessage as (m: BridgeMessage) => void)(message); } catch (_e) { /* ignore */ }
        return;
      }
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }"""

if old in content:
    content = content.replace(old, new)
    f = open(r'E:\APP\ui\src\hooks\useBridgeMessage.ts', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('FIXED sendMessage')
else:
    print('NOT FOUND')
