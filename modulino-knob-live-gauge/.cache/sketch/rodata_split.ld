/* Auto-generated linker script fragment for LLEXT
 * Separates .rodata sections based on relocation status
 */

SECTIONS
{
    /* Read-only data WITH relocations - will be copied to RAM by LLEXT */
    .rodata : {
        *(.rodata._ZN6zephyr7arduinoL11pinctrl_mapE)
        *(.rodata._ZN6zephyr7arduinoL12arduino_pinsE)
        *(.rodata._ZN6zephyr7arduinoL35__pinctrl_states__device_dts_ord_17E)
        *(.rodata._ZN6zephyr7arduinoL35__pinctrl_states__device_dts_ord_25E)
        *(.rodata._ZN6zephyr7arduinoL35__pinctrl_states__device_dts_ord_29E)
        *(.rodata._ZN6zephyr7arduinoL35__pinctrl_states__device_dts_ord_35E)
        *(.rodata._ZN6zephyr7arduinoL35__pinctrl_states__device_dts_ord_55E)
        *(.rodata._ZN6zephyr7arduinoL35__pinctrl_states__device_dts_ord_64E)
        *(.rodata._ZN6zephyr7arduinoL35__pinctrl_states__device_dts_ord_67E)
        *(.rodata._ZN6zephyr7arduinoL35__pinctrl_states__device_dts_ord_72E)
        *(.rodata._ZN6zephyr7arduinoL35__pinctrl_states__device_dts_ord_80E)
        *(.rodata._ZN6zephyr7arduinoL35__pinctrl_states__device_dts_ord_85E)
        *(.rodata._ZN6zephyr7arduinoL35__pinctrl_states__device_dts_ord_97E)
        *(.rodata._ZN6zephyr7arduinoL36__pinctrl_states__device_dts_ord_102E)
        *(.rodata._ZN6zephyr7arduinoL36__pinctrl_states__device_dts_ord_106E)
        *(.rodata._ZN6zephyr7arduinoL36__pinctrl_states__device_dts_ord_111E)
        *(.rodata._ZN6zephyr7arduinoL36__pinctrl_states__device_dts_ord_117E)
        *(.rodata._ZN6zephyr7arduinoL36__pinctrl_states__device_dts_ord_120E)
        *(.rodata._ZN6zephyr7arduinoL39__pinctrl_dev_config__device_dts_ord_17E)
        *(.rodata._ZN6zephyr7arduinoL39__pinctrl_dev_config__device_dts_ord_25E)
        *(.rodata._ZN6zephyr7arduinoL39__pinctrl_dev_config__device_dts_ord_29E)
        *(.rodata._ZN6zephyr7arduinoL39__pinctrl_dev_config__device_dts_ord_35E)
        *(.rodata._ZN6zephyr7arduinoL39__pinctrl_dev_config__device_dts_ord_55E)
        *(.rodata._ZN6zephyr7arduinoL39__pinctrl_dev_config__device_dts_ord_64E)
        *(.rodata._ZN6zephyr7arduinoL39__pinctrl_dev_config__device_dts_ord_67E)
        *(.rodata._ZN6zephyr7arduinoL39__pinctrl_dev_config__device_dts_ord_72E)
        *(.rodata._ZN6zephyr7arduinoL39__pinctrl_dev_config__device_dts_ord_80E)
        *(.rodata._ZN6zephyr7arduinoL39__pinctrl_dev_config__device_dts_ord_85E)
        *(.rodata._ZN6zephyr7arduinoL39__pinctrl_dev_config__device_dts_ord_97E)
        *(.rodata._ZN6zephyr7arduinoL40__pinctrl_dev_config__device_dts_ord_102E)
        *(.rodata._ZN6zephyr7arduinoL40__pinctrl_dev_config__device_dts_ord_106E)
        *(.rodata._ZN6zephyr7arduinoL40__pinctrl_dev_config__device_dts_ord_111E)
        *(.rodata._ZN6zephyr7arduinoL40__pinctrl_dev_config__device_dts_ord_117E)
        *(.rodata._ZN6zephyr7arduinoL40__pinctrl_dev_config__device_dts_ord_120E)
        *(.rodata._ZTV12ModulinoKnob)
        *(.rodata._ZTV13BridgeMonitorILj512EE)
        *(.rodata._ZTV15SerialTransport)
        *(.rodata._ZTV18RpcFunctionWrapperISt8functionIFbvEEE)
        *(.rodata._ZTVN7arduino12ZephyrSerialE)
        *(.rodata._ZTVN7arduino9ZephyrI2CE)
        *(.rodata._ZTVN7arduino9ZephyrSPIE)
    }

    /* Read-only data WITHOUT relocations - kept in flash by LLEXT */
    .llext.rodata.noreloc : {
        *(.rodata)
        *(.rodata._GLOBAL__sub_I_knob.str1.1)
        *(.rodata._Z13onDoubleClickR7Button2.str1.1)
        *(.rodata._Z7onPressR7Button2.str1.1)
        *(.rodata._Z9onReleaseR7Button2.str1.1)
        *(.rodata._ZN10RpcDecoderILj1024EE12get_responseIN7arduino7msgpack6object5nil_tEEEbjRT_R8RpcError.str1.1)
        *(.rodata._ZN10RpcDecoderILj1024EE12get_responseIbEEbjRT_R8RpcError.str1.1)
        *(.rodata._ZN11BridgeClass11update_safeEv.str1.1)
        *(.rodata._ZN13BridgeMonitorILj512EE5_readEj.str1.1)
        *(.rodata._ZN13BridgeMonitorILj512EE5writeEPKhj.str1.1)
        *(.rodata._ZN13BridgeMonitorILj512EEcvbEv.str1.1)
        *(.rodata._ZN18RpcFunctionWrapperISt8functionIFbvEEEclERN7arduino7msgpack8UnpackerERNS5_6PackerE.str1.1)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_0__device_dts_ord_17E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_0__device_dts_ord_25E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_0__device_dts_ord_29E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_0__device_dts_ord_35E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_0__device_dts_ord_55E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_0__device_dts_ord_64E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_0__device_dts_ord_67E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_0__device_dts_ord_72E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_0__device_dts_ord_80E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_0__device_dts_ord_85E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_0__device_dts_ord_97E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_1__device_dts_ord_17E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_1__device_dts_ord_35E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_1__device_dts_ord_80E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_1__device_dts_ord_97E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_2__device_dts_ord_17E)
        *(.rodata._ZN6zephyr7arduinoL41__pinctrl_state_pins_2__device_dts_ord_97E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_0__device_dts_ord_102E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_0__device_dts_ord_106E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_0__device_dts_ord_111E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_0__device_dts_ord_117E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_0__device_dts_ord_120E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_1__device_dts_ord_102E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_1__device_dts_ord_106E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_1__device_dts_ord_111E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_1__device_dts_ord_117E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_1__device_dts_ord_120E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_2__device_dts_ord_102E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_2__device_dts_ord_106E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_2__device_dts_ord_111E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_2__device_dts_ord_117E)
        *(.rodata._ZN6zephyr7arduinoL42__pinctrl_state_pins_2__device_dts_ord_120E)
        *(.rodata._ZN7RpcCallIJEE6resultIbEEbRT_.str1.1)
        *(.rodata._ZN7arduino7msgpack6object3extC2EaPKhj.str1.1)
        *(.rodata._ZN8RpcErrorC2Ev.str1.1)
        *(.rodata._ZNSt6vectorIjSaIjEE17_M_realloc_insertIJRjEEEvN9__gnu_cxx17__normal_iteratorIPjS1_EEDpOT_.str1.1)
        *(.rodata.loop.str1.1)
        *(.rodata.setup.str1.1)
        *(.rodata.str1.1)
    }

    /* Merge all .rel.rodata.* sections into .rel.rodata */
    .rel.rodata : {
        *(.rel.rodata)
        *(.rel.rodata.*)
    }

    /* Merge all .rela.rodata.* sections into .rela.rodata */
    .rela.rodata : {
        *(.rela.rodata)
        *(.rela.rodata.*)
    }

}
