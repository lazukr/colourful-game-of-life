export const hexToRgb = (hex) => {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [(c>>16)&255, (c>>8)&255, c&255];
    }
    throw new Error('Bad Hex');
}

const _rgbToHex = (rgb) => {
    let hex = rgb.toString(16);
    if (hex.length < 2) {
         hex = "0" + hex;
    }
    return hex;
}

export const rgbToHex = (rgb) => {
    return `#${rgb.map(x => _rgbToHex(x)).join('')}`;
}

export const colourAverage = (list) => {
    const num = list.length;
    const rgb = list.map(x => hexToRgb(x));
    const result = rgb.reduce((acc, cur) => {
        acc[0] += cur[0];
        acc[1] += cur[1];
        acc[2] += cur[2];
        return acc;
    }, [0, 0, 0]);

    return result.map(x => Math.ceil(x / num));
}

export const colourDeviate = (value, deviation) => {
    if (!deviation) {
        return value;
    }

    const low = value > deviation 
        ? value - deviation 
        : 0;
    const high = value < maxrgbValue - deviation 
        ? value + deviation 
        : maxrgbValue;
    return  Math.floor((high - low) * Math.random()) + low;
}