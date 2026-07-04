import os

base = r'E:\APP\android'

# Fix 1: MainActivity.kt - add missing isSystemInDarkTheme import
p = os.path.join(base, 'app/src/main/java/com/dcsf/bms/MainActivity.kt')
c = open(p, 'r', encoding='utf-8').read()

if 'import androidx.compose.foundation.isSystemInDarkTheme' not in c:
    c = c.replace(
        'import androidx.compose.foundation.layout.*',
        'import androidx.compose.foundation.isSystemInDarkTheme\nimport androidx.compose.foundation.layout.*'
    )
    print('Fix 1a: Added isSystemInDarkTheme import')

# Fix 1b: AppColors.Light/Dark type mismatch - make them share a common type
# The issue is AppColors.Light and AppColors.Dark are different types (different objects)
# We need to make them the same type. Simplest: use a data class or make them the same object type
# Actually the simplest fix: use a single class with color parameters, or use 'Any' and cast
# Better approach: create a common interface or just use a data class

# Replace the AppColors objects with a single data class
old_colors = '''object AppColors {
    object Light {
        val bg = Color(0xFFF5F7FA)
        val surface = Color.White
        val surfaceConn = Color(0xFFECFDF5)
        val surfaceConnBorder = Color(0xFFA7F3D0)
        val fg = Color(0xFF1A1A2E)
        val fg2 = Color(0xFF6B7280)
        val fg3 = Color(0xFF9CA3AF)
        val border = Color(0xFFE5E7EB)
        val primary = Color(0xFF3B82F6)
        val primaryFg = Color.White
        val track = Color(0xFFE5E7EB)
        val navBg = Color.White
        val danger = Color(0xFFEF4444)
        val swipeBg = Color(0xFFEF4444)
    }

    object Dark {
        val bg = Color(0xFF1A1B2E)
        val surface = Color(0xFF252640)
        val surfaceConn = Color(0xFF0D2818)
        val surfaceConnBorder = Color(0xFF166534)
        val fg = Color(0xFFE5E5E5)
        val fg2 = Color(0xFF9CA3AF)
        val fg3 = Color(0xFF6B7280)
        val border = Color(0xFF333450)
        val primary = Color(0xFF60A5FA)
        val primaryFg = Color.White
        val track = Color(0xFF333450)
        val navBg = Color(0xFF1E1F36)
        val danger = Color(0xFFF87171)
        val swipeBg = Color(0xFFDC2626)
    }
}'''

new_colors = '''data class AppColors(
    val bg: Color,
    val surface: Color,
    val surfaceConn: Color,
    val surfaceConnBorder: Color,
    val fg: Color,
    val fg2: Color,
    val fg3: Color,
    val border: Color,
    val primary: Color,
    val primaryFg: Color,
    val track: Color,
    val navBg: Color,
    val danger: Color,
    val swipeBg: Color,
) {
    companion object {
        val Light = AppColors(
            bg = Color(0xFFF5F7FA),
            surface = Color.White,
            surfaceConn = Color(0xFFECFDF5),
            surfaceConnBorder = Color(0xFFA7F3D0),
            fg = Color(0xFF1A1A2E),
            fg2 = Color(0xFF6B7280),
            fg3 = Color(0xFF9CA3AF),
            border = Color(0xFFE5E7EB),
            primary = Color(0xFF3B82F6),
            primaryFg = Color.White,
            track = Color(0xFFE5E7EB),
            navBg = Color.White,
            danger = Color(0xFFEF4444),
            swipeBg = Color(0xFFEF4444),
        )
        val Dark = AppColors(
            bg = Color(0xFF1A1B2E),
            surface = Color(0xFF252640),
            surfaceConn = Color(0xFF0D2818),
            surfaceConnBorder = Color(0xFF166534),
            fg = Color(0xFFE5E5E5),
            fg2 = Color(0xFF9CA3AF),
            fg3 = Color(0xFF6B7280),
            border = Color(0xFF333450),
            primary = Color(0xFF60A5FA),
            primaryFg = Color.White,
            track = Color(0xFF333450),
            navBg = Color(0xFF1E1F36),
            danger = Color(0xFFF87171),
            swipeBg = Color(0xFFDC2626),
        )
    }
}'''

c = c.replace(old_colors, new_colors)
print('Fix 1b: Replaced AppColors with data class')

# Fix 1c: Update function signatures from AppColors.Light to AppColors
c = c.replace('colors: AppColors.Light', 'colors: AppColors')
print('Fix 1c: Updated function signatures')

open(p, 'w', encoding='utf-8').write(c)

# Fix 2: BleConnection.kt - writeCharacteristic returns Int on API 33+, not Boolean
p2 = os.path.join(base, 'app/src/main/java/com/dcsf/bms/BleConnection.kt')
c2 = open(p2, 'r', encoding='utf-8').read()

old_write = '''        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            return g.writeCharacteristic(char, data, BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE)
        } else {'''

new_write = '''        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            val result = g.writeCharacteristic(char, data, BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE)
            return result == android.bluetooth.BluetoothGatt.GATT_SUCCESS
        } else {'''

c2 = c2.replace(old_write, new_write)
print('Fix 2: writeCharacteristic Int->Boolean')

open(p2, 'w', encoding='utf-8').write(c2)

print('\nAll fixes applied!')
