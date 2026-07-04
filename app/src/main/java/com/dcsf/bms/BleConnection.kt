package com.dcsf.bms

import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattService
import android.bluetooth.BluetoothProfile
import android.bluetooth.BluetoothGattDescriptor
import android.content.Context
import android.os.Handler
import android.os.Looper
import java.util.UUID

class BleConnection(
    private val device: BluetoothDevice,
    private val serviceUuid: String,
    private val notifyUuid: String,
    private val writeUuid: String,
) {
    var onDataReceived: ((ByteArray) -> Unit)? = null
    private var gatt: BluetoothGatt? = null
    private var notifyChar: BluetoothGattCharacteristic? = null
    private var writeChar: BluetoothGattCharacteristic? = null
    private val handler = Handler(Looper.getMainLooper())
    private var commandSent = false

    private val idleBuffer = mutableListOf<Byte>()
    private var idleTimer: Runnable? = null
    private var idleMs = 20L

    fun connect(context: Context, onResult: (Boolean) -> Unit) {
        gatt = device.connectGatt(context, false, object : BluetoothGattCallback() {
            override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    gatt.requestMtu(256)
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    handler.post { onResult(false) }
                }
            }

            override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
                gatt.discoverServices()
            }

            override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
                if (status != BluetoothGatt.GATT_SUCCESS) {
                    handler.post { onResult(false) }
                    return
                }

                val service = gatt.getService(UUID.fromString(serviceUuid))
                if (service == null) {
                    handler.post { onResult(false) }
                    return
                }

                notifyChar = service.getCharacteristic(UUID.fromString(notifyUuid))
                writeChar = service.getCharacteristic(UUID.fromString(writeUuid))

                if (notifyChar == null || writeChar == null) {
                    handler.post { onResult(false) }
                    return
                }

                if (notifyChar != null) {
                    gatt.setCharacteristicNotification(notifyChar, true)
                    val desc = notifyChar!!.descriptors.firstOrNull()
                    if (desc != null) {
                        desc.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                        gatt.writeDescriptor(desc)
                    }
                }

                handler.post { onResult(true) }
            }

            private fun handleCharacteristicChange(value: ByteArray) {
                if (!commandSent) return
                synchronized(idleBuffer) {
                    for (b in value) idleBuffer.add(b)
                }
                scheduleIdleFlush()
            }

            override fun onCharacteristicChanged(
                gatt: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic,
                value: ByteArray,
            ) {
                handleCharacteristicChange(value)
            }

            @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
            override fun onCharacteristicChanged(
                gatt: BluetoothGatt,
                characteristic: BluetoothGattCharacteristic,
            ) {
                handleCharacteristicChange(characteristic.value ?: return)
            }
        })
    }

    private fun scheduleIdleFlush() {
        idleTimer?.let { handler.removeCallbacks(it) }
        val runnable = Runnable {
            val chunk: ByteArray
            synchronized(idleBuffer) {
                if (idleBuffer.isEmpty()) return@Runnable
                chunk = idleBuffer.toByteArray()
                idleBuffer.clear()
            }
            onDataReceived?.invoke(chunk)
        }
        idleTimer = runnable
        handler.postDelayed(runnable, idleMs)
    }

    fun write(data: ByteArray): Boolean {
        val char = writeChar ?: return false
        val g = gatt ?: return false
        if (!commandSent) {
            commandSent = true
            synchronized(idleBuffer) { idleBuffer.clear() }
        }
        char.value = data
        char.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
        return g.writeCharacteristic(char)
    }

    fun disconnect() {
        idleTimer?.let { handler.removeCallbacks(it) }
        idleTimer = null
        synchronized(idleBuffer) { idleBuffer.clear() }
        commandSent = false
        gatt?.close()
        gatt = null
    }
}