/**
 * Web Serial：读取编码器数值 (mm)，供 sketch 使用全局对象 YarnSerial。
 * 需在 p5 sketch 之前加载。
 */
(function (global) {
    let port = null;
    let reader = null;

    function clamp(v, lo, hi) {
        return Math.min(hi, Math.max(lo, v));
    }

    function setStatus(text, color) {
        const statusEl = document.getElementById("status");
        if (statusEl) {
            statusEl.innerText = text;
            statusEl.style.color = color;
        }
    }

    const YarnSerial = {
        connected: false,
        targetValue: 0,

        async autoConnect() {
            if (!navigator.serial) return;
            try {
                const ports = await navigator.serial.getPorts();
                if (ports.length === 0) return;

                port = ports[0];
                await port.open({ baudRate: 115200 });
                const decoder = new TextDecoderStream();
                port.readable.pipeTo(decoder.writable);
                reader = decoder.readable.getReader();
                this.connected = true;

                setStatus("Status: Serial Auto-Connected!", "green");
                this._readLoop();
            } catch (e) {
                console.error("Auto-connect error: ", e);
            }
        },

        async connectFromUserGesture() {
            if (this.connected) return;
            if (!navigator.serial) return;
            try {
                port = await navigator.serial.requestPort();
                await port.open({ baudRate: 115200 });
                const decoder = new TextDecoderStream();
                port.readable.pipeTo(decoder.writable);
                reader = decoder.readable.getReader();
                this.connected = true;

                setStatus("Status: Serial Connected!", "green");
                this._readLoop();
            } catch (e) {
                console.log("User cancelled or error: ", e);
            }
        },

        async _readLoop() {
            let buffer = "";
            while (true) {
                try {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += value;
                    const lines = buffer.split(/\r?\n/);
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const v = parseFloat(line.trim());
                        if (!isNaN(v)) {
                            YarnSerial.targetValue = clamp(v, 0, 500);
                        }
                    }
                } catch (e) {
                    break;
                }
            }

            YarnSerial.connected = false;
            setStatus("Status: Serial Disconnected", "red");
        }
    };

    global.YarnSerial = YarnSerial;
})(typeof window !== "undefined" ? window : globalThis);
