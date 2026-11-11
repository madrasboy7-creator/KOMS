package com.koms.app.core.design

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DojoDarkBg = Color(0xFF090B12)
val DojoCardBg = Color(0xFF101625)
val DojoSurface = Color(0xFF172033)
val DojoRed = Color(0xFFEF4444)
val DojoGold = Color(0xFFF5A000)
val DojoGreen = Color(0xFF10B981)
val DojoText = Color(0xFFF1F5F9)
val DojoSubtext = Color(0xFF94A3B8)
val DojoBorder = Color(0xFF1E293B)

private val DarkColors = darkColorScheme(
    primary = DojoRed,
    onPrimary = Color.White,
    secondary = DojoGold,
    onSecondary = Color.Black,
    tertiary = DojoGreen,
    background = DojoDarkBg,
    onBackground = DojoText,
    surface = DojoCardBg,
    onSurface = DojoText
)

@Composable
fun KomsTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColors,
        content = content
    )
}
