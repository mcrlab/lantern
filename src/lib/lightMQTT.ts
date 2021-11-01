
const LightMQTT = (color: string, easing: string, time: number, delay: number) => {
    const data = {
        color,
        easing: easing || "SineEaseInOut",
        time: time || 0,
        delay: delay || 0
    };
    return JSON.stringify(data);
}

export default  LightMQTT;