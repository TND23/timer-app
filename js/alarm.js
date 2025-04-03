const roosterAlarm = new Audio('./resources/mixkit-rooster-crowing-in-the-morning-2462.wav');
const slotAlarm = new Audio('./resources/mixkit-slot-machine-win-alarm-1995.wav');

function resetAudio(){
    this.currentTime = 0;
}

export function initAudioModule(elements){
    roosterAlarm.addEventListener("ended", resetAudio);
    slotAlarm.addEventListener("ended", resetAudio);
}
export function play(audioEl){
    if(audioEl == "rooster"){
        roosterAlarm.play();
    } else {
        slotAlarm.play();
    }
}

export default {
    initAudioModule,
    play
}
