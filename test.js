import LCD from "raspberrypi-liquid-crystal";
import Gpio from "onoff";
import si from "systeminformation";

const gpio = Gpio.Gpio;
const lcd = new LCD( 1, 0x3f, 16, 2 );
lcd.beginSync();

const segmentDisplay = new Map();
segmentDisplay.set(0, new gpio(18, 'out')); // G
segmentDisplay.set(1, new gpio(23, 'out')); // F
segmentDisplay.set(2, new gpio(24, 'out')); // A
segmentDisplay.set(3, new gpio(25, 'out')); // B
segmentDisplay.set(4, new gpio(4, 'out')); // E
segmentDisplay.set(5, new gpio(17, 'out')); // D
segmentDisplay.set(6, new gpio(27, 'out')); // 27
segmentDisplay.set(7, new gpio(19, 'out')); // 19

const nums = new Map();
nums.set(1, [0, 1, 0, 0, 1, 0, 0, 0]);
nums.set(2, [1, 0, 1, 1, 1, 1, 0, 0])
nums.set(3, [1, 1, 1, 0, 1, 1, 0, 0]);
nums.set(4, [1, 1, 0, 1, 0, 0, 1, 0]);
nums.set(5, [1, 1, 1, 0, 0, 1, 1, 0]);
nums.set(6, [1, 1, 1, 0, 1, 1, 1, 0]);
nums.set(7, [0, 0, 1, 1, 0, 0, 1, 0]);
nums.set(8, [1, 1, 1, 1, 1, 1, 1, 0]);
nums.set(9, [1, 1, 1, 1, 0, 1, 1, 0]);

function setSegment(number) {
    const binary = nums.get(number);
    binary.forEach((item, index) => {
        let valueWrite = item;
        if(item == 1) {
            valueWrite = 0;
        } else {
            valueWrite = 1;
        }
        segmentDisplay.get(index).writeSync(valueWrite);
    })
}

setSegment(9);

// Dates
const endDate = new Date("12/25/2024 7:00 AM").getTime();
const button = new gpio(5, "in", 'both');
let isDeving = false;

const red_led = new gpio(6, 'out');
const green_led = new gpio(13, "out");
const blue_led = new gpio(26, "out");

button.watch(async (err, value) => {
  if(value == 0) {
    const cpu = await si.cpu();

    isDeving = true;
    clearLcd();
    writeLcd("System Info:", 0);
    writeLcd(`V:${cpu.vendor}, S:${cpu.speed}`, 1);
    red_led.writeSync(1);
  } else {
    clearLcd();
    writeLcd("Christmas In:", 0);
    writeLcd("00d, 00h, 00m 00s", 1)
   red_led.writeSync(0);  
   isDeving = false;
}
})

function start() {
    clearLcd();
    writeLcd("Christmas In:", 0);
    writeLcd("00d, 00h, 00m, 00s", 1)
}
start();

setInterval(() => {
    if(!isDeving) {
        const currentDate = new Date().getTime();

        const distance = endDate - currentDate;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        if(days <= 0 && minutes <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
            clearLcd();
            writeLcd("Christmas Day!", 0);
            writeLcd("Happy Christmas!")
            return;
        }
        if(days <= 3) {
            red_led.writeSync(1);
        } else {
            red_led.writeSync(0);
        }
        if(days <= 2) {
            blue_led.writeSync(1);
        } else {
            blue_led.writeSync(0);
        }
        if(days <= 1) {
            green_led.writeSync(1);
        } else {
            green_led.writeSync(0);
        }
        if(days <= 9 && days >= 0) {
            setSegment(days);
        }

        clearLcd();
        writeLcd("Christmas In:", 0);
        writeLcd(`${days}d, ${hours}h, ${minutes}m, ${seconds}s`, 1);
    }
}, 1000)

function writeLcd(text, line) {
  lcd.setCursorSync(0, line);
  lcd.printSync(text);
}

function clearLcd() {
  lcd.clearSync();
}
