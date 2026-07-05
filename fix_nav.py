f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'r', encoding='utf-8')
content = f.read()
f.close()

# Fix NavigationBarItem colors - disable Material3 default tinting
# Replace all NavigationBarItem( with NavigationBarItem(colors = ...
# Actually, easier: set NavigationBar colors to transparent

# The issue is Material3 NavigationBarItem applies its own colors
# We need to set the item colors to use our custom colors

# Replace NavigationBar containerColor and add item colors
old = """                        NavigationBar(
                            containerColor = colors.navBg,
                            tonalElevation = 2.dp,
                        ) {"""

new = """                        NavigationBar(
                            containerColor = colors.navBg,
                            tonalElevation = 2.dp,
                        ) {
                            val navItemColors = NavigationBarItemDefaults.colors(
                                selectedIconColor = colors.primary,
                                selectedTextColor = colors.primary,
                                unselectedIconColor = colors.fg2,
                                unselectedTextColor = colors.fg2,
                                indicatorColor = colors.primary.copy(alpha = 0.12f),
                            )"""

content = content.replace(old, new)

# Now add colors = navItemColors to each NavigationBarItem
# Replace "NavigationBarItem(" with "NavigationBarItem(colors = navItemColors,"
content = content.replace(
    '                            NavigationBarItem(\n                                selected = selectedTab == 0,',
    '                            NavigationBarItem(\n                                colors = navItemColors,\n                                selected = selectedTab == 0,'
)
content = content.replace(
    '                            NavigationBarItem(\n                                selected = false,',
    '                            NavigationBarItem(\n                                colors = navItemColors,\n                                selected = false,'
)
content = content.replace(
    '                            NavigationBarItem(\n                                selected = selectedTab == 1,',
    '                            NavigationBarItem(\n                                colors = navItemColors,\n                                selected = selectedTab == 1,'
)

f = open(r'E:\APP\android\app\src\main\java\com\dcsf\bms\MainActivity.kt', 'w', encoding='utf-8')
f.write(content)
f.close()
print('DONE')
