// Copyright (c) 2024 深圳市德诚四方科技有限公司. All rights reserved.
package com.dcsf.bms

import android.util.Log

/**
 * Lightweight log collector - forwards to Android Logcat.
 * Used by BleConnection for BLE communication logging.
 */
object LogCollector {
    private const val MAX_TAG = 23

    fun log(tag: String, message: String) {
        val safeTag = if (tag.length > MAX_TAG) tag.substring(0, MAX_TAG) else tag
        Log.d(safeTag, message)
    }

    fun error(tag: String, message: String, throwable: Throwable? = null) {
        val safeTag = if (tag.length > MAX_TAG) tag.substring(0, MAX_TAG) else tag
        if (throwable != null) {
            Log.e(safeTag, message, throwable)
        } else {
            Log.e(safeTag, message)
        }
    }
}
